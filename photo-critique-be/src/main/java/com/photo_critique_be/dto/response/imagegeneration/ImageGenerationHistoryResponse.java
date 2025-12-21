package com.photo_critique_be.dto.response.imagegeneration;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ImageGenerationHistoryResponse {
    private String id;
    private String userId;
    private String prompt;
    private String inputImageUrl;
    private String outImageUrl;
    private LocalDateTime createdAt;
}

