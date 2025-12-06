package com.photo_critique_be.dto.response.user;

import lombok.Data;

@Data
public class UserPostResponse {
    private String id;
    private String username;
    private String profilePicture;
    private String fullName;
    private Boolean isOnline;
    private Integer xpPoints;
    private Integer level;
    private Integer followersCount;
    private Integer followingCount;
    private Boolean isFollowing; // Whether current user is following this user
    private Boolean isFollowedBy; // Whether this user is following current user
    private String followStatus; // PENDING, ACCEPTED, etc. if there's a follow relationship
}
