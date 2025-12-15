package com.photo_critique_be.dto.response.oauth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthUserInfo {
    private String providerId;
    private String email;
    private String username;
    private String fullName;
    private String profilePicture;
    private String firstName;
    private String lastName;
}

