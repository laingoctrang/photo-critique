package com.photo_critique_be.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.photo_critique_be.model.embedded.ImageInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;
    
    @Value("${app.upload.max-file-size}") // Default: 25MB (25 * 1024 * 1024)
    private long maxFileSize;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload single file
     */
    public ImageInfo uploadFile(MultipartFile file) throws IOException {
        log.info("Uploading file: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        // Validate file
        validateFile(file);

        // Upload to Cloudinary
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "photocritique", // Tạo folder trên Cloudinary
                        "resource_type", "auto", // Tự động detect ảnh/video/file
                        "public_id", generatePublicId(file.getOriginalFilename())
                )
        );

        // Map result to ImageInfo
        ImageInfo imageInfo = new ImageInfo();
        imageInfo.setUrl(uploadResult.get("secure_url").toString());
        imageInfo.setName(file.getOriginalFilename());
        imageInfo.setSize(file.getSize());
        imageInfo.setContentType(file.getContentType());

        log.info("File uploaded successfully: {}", imageInfo.getUrl());
        return imageInfo;
    }

    /**
     * Upload multiple files
     * Continues processing other files even if one fails
     */
    public List<ImageInfo> uploadFiles(List<MultipartFile> files) {
        List<ImageInfo> uploadedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                ImageInfo imageInfo = uploadFile(file);
                uploadedFiles.add(imageInfo);
            } catch (Exception e) {
                log.error("Failed to upload file: {} ({} bytes). Continuing with other files...", file.getOriginalFilename(), file.getSize(), e);
            }
        }

        log.info("Upload completed: {}/{} files uploaded successfully", uploadedFiles.size(), files.size());
        return uploadedFiles;
    }

    /**
     * Upload file for chat (with optimized settings)
     */
    public ImageInfo uploadChatFile(MultipartFile file) throws IOException {
        log.info("Uploading chat file: {}", file.getOriginalFilename());

        validateFile(file);

        // Compress image if it's too large (only for images)
        if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
            return uploadImageWithCompression(file);
        }

        // For other files, use standard upload
        return uploadFile(file);
    }

    /**
     * Upload image with compression for better performance
     */
    private ImageInfo uploadImageWithCompression(MultipartFile file) throws IOException {
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "photocritique/chat",
                        "resource_type", "image",
                        "quality", "auto:good", // Auto optimize quality
                        "fetch_format", "auto", // Auto choose format (webp if supported)
                        "width", 1200, // Resize if larger
                        "height", 1200,
                        "crop", "limit" // Don't crop, just resize
                )
        );

        ImageInfo imageInfo = new ImageInfo();
        imageInfo.setUrl(uploadResult.get("secure_url").toString());
        imageInfo.setName(file.getOriginalFilename());
        imageInfo.setSize(file.getSize());
        imageInfo.setContentType(file.getContentType());

        return imageInfo;
    }

    /**
     * Delete file from Cloudinary
     */
    public void deleteFile(String publicId) throws IOException {
        log.info("Deleting file with publicId: {}", publicId);

        // If publicId doesn't contain folder, add it
        String fullPublicId = publicId;
        if (!publicId.contains("/")) {
            fullPublicId = "photocritique/" + publicId;
        }

        Map<String, Object> result = cloudinary.uploader().destroy(fullPublicId, ObjectUtils.emptyMap());

        if (!"ok".equals(result.get("result"))) {
            log.error("Failed to delete file: {} - Result: {}", fullPublicId, result);
            throw new RuntimeException("Failed to delete file: " + fullPublicId);
        }

        log.info("File deleted successfully: {}", fullPublicId);
    }

    /**
     * Validate file before upload
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Check file size (from environment variable, default 25MB)
        if (file.getSize() > maxFileSize) {
            long maxFileSizeMB = maxFileSize / (1024 * 1024);
            throw new IllegalArgumentException(String.format("File size exceeds %dMB limit", maxFileSizeMB));
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("File type not detected");
        }

        // Allowed file types
        List<String> allowedTypes = Arrays.asList(
                "image/jpeg", "image/png", "image/gif", "image/webp",
                "video/mp4", "video/quicktime",
                "application/pdf", "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        if (!allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }
    }

    /**
     * Generate unique public ID for file
     */
    private String generatePublicId(String originalFilename) {
        String fileName = UUID.randomUUID().toString();
        return fileName;
    }
}