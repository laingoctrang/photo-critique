package com.photo_critique_be.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FollowRequest {
    @NotBlank(message = "User ID is required")
    private String userId;
}

