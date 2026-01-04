package com.photo_critique_be.dto.response.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverviewStatistics {
    private Long totalUsers;
    private Long totalPosts;
    private Long totalComments;
    private Long totalReactions;
    private Long activeUsers; // Users active in last 30 days
    private Long newUsersThisMonth;
    private Long newPostsThisMonth;
    private Double averagePostsPerUser;
}

