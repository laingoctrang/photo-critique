package com.photo_critique_be.controller;

import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.model.embedded.ImageInfo;
import com.photo_critique_be.service.FileUploadService;
import com.photo_critique_be.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadService fileUploadService;
    private final LanguageService languageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<List<ImageInfo>>> uploadFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "purpose", defaultValue = "post") String purpose) throws IOException {
        List<ImageInfo> uploadedFiles = fileUploadService.uploadFiles(files, purpose);
        return ResponseEntity.ok(ApiResponse.created(uploadedFiles, languageService.getMessage(MessageCode.FILE_UPLOAD_SUCCESS)));
    }

    @PostMapping("/upload/single")
    public ResponseEntity<ApiResponse<ImageInfo>> uploadSingleFile(
            @RequestParam("file") MultipartFile file) throws IOException {
        ImageInfo imageInfo = fileUploadService.uploadSingleFile(file);
        return ResponseEntity.ok(ApiResponse.created(imageInfo, languageService.getMessage(MessageCode.FILE_UPLOAD_SUCCESS)));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @RequestParam("publicId") String publicId) throws IOException {
        fileUploadService.deleteFile(publicId);
        return ResponseEntity.ok(ApiResponse.success(null, languageService.getMessage(MessageCode.FILE_DELETE_SUCCESS)));
    }
}