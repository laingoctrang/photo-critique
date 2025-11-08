package com.photo_critique_be.dto.request;

import lombok.Data;

@Data
public class ResendOtpRequest {
    private String email;
    private String otpRequestType;
}
