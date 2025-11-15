package com.photo_critique_be.dto.response.user;

import com.photo_critique_be.dto.response.badge.BadgeEarnedResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String username;
    private String profilePicture;
    private String bio;
    private String fullName;
    private Boolean isOnline;
    private LocalDateTime lastSeen;
    private String privacySetting;
    private Integer xpPoints;
    private Integer level;
    private List<BadgeEarnedResponse> badges;
    private Integer followersCount;
    private Integer followingCount;
    private LocalDateTime createdAt;
    private Boolean isFollowing; // Whether current user is following this user
    private Boolean isFollowedBy; // Whether this user is following current user
    private String followStatus; // PENDING, ACCEPTED, etc. if there's a follow relationship
}

