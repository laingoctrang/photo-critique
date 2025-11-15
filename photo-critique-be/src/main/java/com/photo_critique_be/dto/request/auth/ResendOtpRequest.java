package com.photo_critique_be.dto.request.auth;

import lombok.Data;

@Data
public class ResendOtpRequest {
    private String email;
    private String otpRequestType;
}
