package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.imagegeneration.CreateImageGenerationHistoryRequest;
import com.photo_critique_be.dto.response.imagegeneration.ImageGenerationHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ImageGenerationHistoryService {
    ImageGenerationHistoryResponse create(CreateImageGenerationHistoryRequest request);
    ImageGenerationHistoryResponse getById(String id);
    Page<ImageGenerationHistoryResponse> getMyHistory(Pageable pageable);
    void delete(String id);
}

