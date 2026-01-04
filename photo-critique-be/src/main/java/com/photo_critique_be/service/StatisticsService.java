package com.photo_critique_be.service;

import com.photo_critique_be.dto.response.statistics.*;

public interface StatisticsService {
    StatisticsResponse getStatistics(String period); // WEEK, MONTH, QUARTER, YEAR
    
    OverviewStatisticsResponse getOverviewStatistics();
    ActivityChartResponse getActivityChart(String period); // WEEK, MONTH, YEAR
    UserEngagementResponse getUserEngagement();
}

