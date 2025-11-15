package com.photo_critique_be.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FollowInfo {
    private Boolean isFollowing;
    private Boolean isFollowedBy;
    private String followStatus;

    public static FollowInfo ownProfile() {
        return new FollowInfo(null, null, null);
    }
}
