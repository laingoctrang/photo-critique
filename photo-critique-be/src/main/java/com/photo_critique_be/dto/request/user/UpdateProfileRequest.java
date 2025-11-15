package com.photo_critique_be.dto.request.user;

import com.photo_critique_be.enums.PrivacyType;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String bio;
    private String fullName;
    private String profilePicture;
    private String privacySetting;
    private String badgeId;
}

