package com.photo_critique_be.dto.request.oauth;

import lombok.Data;

@Data
public class OAuthRequest {
    private String provider;
    private String token;
}
