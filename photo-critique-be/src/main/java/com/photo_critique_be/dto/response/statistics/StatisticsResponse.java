package com.photo_critique_be.dto.response.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {
    private OverviewStatistics overview;
    private List<TimeSeriesData> userGrowth;
    private List<TimeSeriesData> postGrowth;
    private List<StatusCount> postStatusCounts;
    private List<PrivacyCount> postPrivacyCounts;
    private List<RoleCount> userRoleCounts;
    private ActivityStatistics activity;
}

