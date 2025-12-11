package com.photo_critique_be.dto.request.post;

import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.model.embedded.ImageInfo;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreatePostRequest {
    @NotEmpty(message = "At least one image is required")
    private List<ImageInfo> imageUrls;

    private String caption;

    @NotNull(message = "Privacy type is required")
    private PrivacyType privacy;

    private List<String> tags;
}

