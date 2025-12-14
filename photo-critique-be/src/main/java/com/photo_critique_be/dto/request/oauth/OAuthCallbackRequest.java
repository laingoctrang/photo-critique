package com.photo_critique_be.dto.request.oauth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthCallbackRequest {
    @NotBlank(message = "Authorization code is required")
    private String code;
    
    private String state; // Optional, for CSRF protection
}

