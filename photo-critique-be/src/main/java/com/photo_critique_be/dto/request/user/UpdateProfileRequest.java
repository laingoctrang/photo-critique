package com.photo_critique_be.dto.request.user;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String bio;
    private String fullName;
    private String profilePicture;
    private String privacySetting;
    private String badgeId;
}

