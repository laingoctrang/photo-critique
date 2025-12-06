package com.photo_critique_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class FollowInfo {
    private Boolean isFollowing;
    private Boolean isFollowedBy;
    private String followStatus;

    public static FollowInfo ownProfile() {
        return new FollowInfo(null, null, null);
    }
}
