package com.photo_critique_be.dto.request.imagegeneration;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateImageGenerationHistoryRequest {

    @NotBlank(message = "Prompt is required")
    private String prompt;

    @NotBlank(message = "Input image URL is required")
    private String inputImageUrl;

    @NotBlank(message = "Output image URL is required")
    private String outImageUrl;
}

