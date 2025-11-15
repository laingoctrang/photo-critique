package com.photo_critique_be.dto.response;

import com.photo_critique_be.dto.response.user.UserInfoResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private UserInfoResponse userInfo;
}
