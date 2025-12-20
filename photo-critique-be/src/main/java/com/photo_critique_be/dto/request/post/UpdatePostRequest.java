package com.photo_critique_be.dto.request.post;

import com.photo_critique_be.enums.PostStatus;
import com.photo_critique_be.enums.PrivacyType;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePostRequest {
    private String caption;
    private PrivacyType privacy;
    private List<String> tags;
    private PostStatus status; // Allow changing status (e.g., from DRAFTED to POSTED)
}

