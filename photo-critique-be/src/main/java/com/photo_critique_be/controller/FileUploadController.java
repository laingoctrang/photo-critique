package com.photo_critique_be.controller;

import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.model.embedded.ImageInfo;
import com.photo_critique_be.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

// FileUploadController.java
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<List<ImageInfo>>> uploadFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "purpose", defaultValue = "post") String purpose) throws  IOException {

            List<ImageInfo> uploadedFiles;

            if ("chat".equals(purpose)) {
                // Upload for chat (with compression)
                uploadedFiles = files.stream()
                        .map(file -> {
                            try {
                                return cloudinaryService.uploadChatFile(file);
                            } catch (IOException e) {
                                throw new RuntimeException("Failed to upload chat file", e);
                            }
                        })
                        .collect(Collectors.toList());
            } else {
                // Upload for post (original quality)
                uploadedFiles = cloudinaryService.uploadFiles(files);
            }

            return ResponseEntity.ok(ApiResponse.created(uploadedFiles));

    }

    @PostMapping("/upload/single")
    public ResponseEntity<ApiResponse<ImageInfo>> uploadSingleFile(
            @RequestParam("file") MultipartFile file) throws IOException {

        ImageInfo imageInfo = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(ApiResponse.created(imageInfo));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @RequestParam("publicId") String publicId) throws IOException {

        cloudinaryService.deleteFile(publicId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}