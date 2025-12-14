package com.photo_critique_be.service;

import com.photo_critique_be.model.embedded.ImageInfo;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileUploadService {
    /**
     * Upload multiple files with purpose (post or chat)
     */
    List<ImageInfo> uploadFiles(List<MultipartFile> files, String purpose) throws IOException;

    /**
     * Upload single file
     */
    ImageInfo uploadSingleFile(MultipartFile file) throws IOException;

    /**
     * Delete file by publicId
     */
    void deleteFile(String publicId) throws IOException;
}

