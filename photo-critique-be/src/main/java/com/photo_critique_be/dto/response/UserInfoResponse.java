package com.photo_critique_be.dto.response;

import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.enums.Role;
import com.photo_critique_be.model.embedded.BadgeEarned;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private String id;
    private String username;
    private String email;
    private String profilePicture;
    private String bio;
    private String fullName;
    private Boolean isOnline;
    private LocalDateTime lastSeen;
    private String privacySetting;
    private Integer xpPoints;
    private Integer level;
    private List<BadgeEarned> badges;

    private List<Role> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Integer followersCount;
    private Integer followingCount;
}
