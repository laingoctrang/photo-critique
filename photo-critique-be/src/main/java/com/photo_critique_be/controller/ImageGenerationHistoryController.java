package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.imagegeneration.CreateImageGenerationHistoryRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.imagegeneration.ImageGenerationHistoryResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.service.ImageGenerationHistoryService;
import com.photo_critique_be.service.LanguageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/image-generation-history")
@RequiredArgsConstructor
public class ImageGenerationHistoryController {

    private final ImageGenerationHistoryService imageGenerationHistoryService;
    private final LanguageService languageService;

    @PostMapping
    public ResponseEntity<ApiResponse<ImageGenerationHistoryResponse>> create(
            @Valid @RequestBody CreateImageGenerationHistoryRequest request) {
        ImageGenerationHistoryResponse response = imageGenerationHistoryService.create(request);
        return ResponseEntity.ok(ApiResponse.created(response, languageService.getMessage(MessageCode.IMAGE_GENERATION_HISTORY_CREATED_SUCCESS)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImageGenerationHistoryResponse>> getById(@PathVariable String id) {
        ImageGenerationHistoryResponse response = imageGenerationHistoryService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.IMAGE_GENERATION_HISTORY_GET_SUCCESS)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<ImageGenerationHistoryResponse>>> getMyHistory(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ImageGenerationHistoryResponse> response = imageGenerationHistoryService.getMyHistory(pageable);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.IMAGE_GENERATION_HISTORY_GET_SUCCESS)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        imageGenerationHistoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.IMAGE_GENERATION_HISTORY_DELETED_SUCCESS)));
    }
}

