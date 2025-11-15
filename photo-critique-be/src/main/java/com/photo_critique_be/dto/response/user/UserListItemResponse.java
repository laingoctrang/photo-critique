package com.photo_critique_be.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserListItemResponse {
    private String id;
    private String username;
    private String profilePicture;
    private String fullName;
    private Boolean isOnline;
    private LocalDateTime lastSeen;
    private Integer followersCount;
    private Integer followingCount;
    private Boolean isFollowing; // current user is following this user
    private Boolean isFollowedBy; // this user is following current user
    private String followStatus;
}

