package com.photo_critique_be.dto.request.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCommentRequest {
    @NotBlank(message = "Content is required")
    private String content;

    private String parentCommentId;

    private String aiGeneratedImage;
}

