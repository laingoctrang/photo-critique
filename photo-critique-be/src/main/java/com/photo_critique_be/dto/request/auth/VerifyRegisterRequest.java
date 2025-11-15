package com.photo_critique_be.dto.request.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerifyRegisterRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String otp;
}
