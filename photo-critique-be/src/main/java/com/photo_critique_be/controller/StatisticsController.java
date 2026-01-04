package com.photo_critique_be.controller;

import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.statistics.*;
import com.photo_critique_be.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping
    public ResponseEntity<ApiResponse<StatisticsResponse>> getStatistics(
            @RequestParam(required = false, defaultValue = "YEAR") String period
    ) {
        StatisticsResponse response = statisticsService.getStatistics(period);
        return ResponseEntity.ok(ApiResponse.success(response, "Statistics retrieved successfully"));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<OverviewStatisticsResponse>> getOverviewStatistics() {
        OverviewStatisticsResponse response = statisticsService.getOverviewStatistics();
        return ResponseEntity.ok(ApiResponse.success(response, "Overview statistics retrieved successfully"));
    }

    @GetMapping("/activity-chart")
    public ResponseEntity<ApiResponse<ActivityChartResponse>> getActivityChart(
            @RequestParam(required = false, defaultValue = "MONTH") String period
    ) {
        ActivityChartResponse response = statisticsService.getActivityChart(period);
        return ResponseEntity.ok(ApiResponse.success(response, "Activity chart data retrieved successfully"));
    }

    @GetMapping("/user-engagement")
    public ResponseEntity<ApiResponse<UserEngagementResponse>> getUserEngagement() {
        UserEngagementResponse response = statisticsService.getUserEngagement();
        return ResponseEntity.ok(ApiResponse.success(response, "User engagement statistics retrieved successfully"));
    }
}

