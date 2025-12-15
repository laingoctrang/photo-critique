package com.photo_critique_be.service.impl;

import com.photo_critique_be.model.embedded.ImageInfo;
import com.photo_critique_be.service.CloudinaryService;
import com.photo_critique_be.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {

    private final CloudinaryService cloudinaryService;

    @Override
    public List<ImageInfo> uploadFiles(List<MultipartFile> files, String purpose) throws IOException {
        List<ImageInfo> uploadedFiles = new ArrayList<>();

        if ("chat".equals(purpose)) {
            // Upload for chat (with compression)
            for (MultipartFile file : files) {
                try {
                    ImageInfo imageInfo = cloudinaryService.uploadChatFile(file);
                    uploadedFiles.add(imageInfo);
                } catch (IOException e) {
                    log.error("Failed to upload chat file: {}", file.getOriginalFilename(), e);
                    throw new IOException("Failed to upload chat file: " + file.getOriginalFilename(), e);
                }
            }
        } else {
            // Upload for post (original quality)
            uploadedFiles = cloudinaryService.uploadFiles(files);
        }

        return uploadedFiles;
    }

    @Override
    public ImageInfo uploadSingleFile(MultipartFile file) throws IOException {
        return cloudinaryService.uploadFile(file);
    }

    @Override
    public void deleteFile(String publicId) throws IOException {
        cloudinaryService.deleteFile(publicId);
    }
}

