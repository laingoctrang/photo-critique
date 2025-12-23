package com.photo_critique_be.dto.request.post;

import com.photo_critique_be.enums.PostStatus;
import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.model.embedded.ImageInfo;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreatePostRequest {

    @NotNull(message = "Images are required")
    @Size(min = 1, message = "At least one image is required")
    private List<ImageInfo> imageUrls;

    private String caption;

    @NotNull(message = "Privacy type is required")
    private PrivacyType privacy;

    private List<String> tags;

    private PostStatus status;
}

