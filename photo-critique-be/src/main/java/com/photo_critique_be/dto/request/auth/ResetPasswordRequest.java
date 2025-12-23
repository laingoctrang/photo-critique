package com.photo_critique_be.dto.request.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ResetPasswordRequest {
    private String resetToken;
    private String newPassword;
}

