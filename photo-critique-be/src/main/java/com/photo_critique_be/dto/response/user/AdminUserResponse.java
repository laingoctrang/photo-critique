package com.photo_critique_be.dto.response.user;

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
public class AdminUserResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String profilePicture;
    private List<String> roles;
    private Boolean enabled;
    private Integer xpPoints;
    private Integer level;
    private Integer followersCount;
    private Integer followingCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastSeen;
    private Boolean isOnline;
}

