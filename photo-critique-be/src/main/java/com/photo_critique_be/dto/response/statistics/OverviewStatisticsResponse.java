package com.photo_critique_be.dto.response.statistics;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OverviewStatisticsResponse {
    private Long totalUsers;
    private Long totalPosts;
    private Long totalComments;
    private Long totalAiToolUsage;
    private Long thisMonthPosts;
    private Long thisMonthComments;
    private Long thisMonthAiToolUsage;
    private Long lastMonthPosts;
    private Long lastMonthComments;
    private Long lastMonthAiToolUsage;
    private LocalDateTime fetchedAt;
}

