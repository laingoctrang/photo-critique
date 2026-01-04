package com.photo_critique_be.dto.request.post;

import com.photo_critique_be.enums.PostStatus;
import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.model.embedded.ImageInfo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePostRequest {
    private String caption;
    private PrivacyType privacy;
    private List<String> tags;
    private PostStatus status; // Allow changing status (e.g., from DRAFTED to POSTED)

    @NotNull(message = "Images are required")
    @Size(min = 1, message = "At least one image is required")
    private List<ImageInfo> imageUrls;
}

