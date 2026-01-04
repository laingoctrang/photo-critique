package com.photo_critique_be.dto.response.statistics;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ActivityChartResponse {
    private List<ChartDataPoint> posts;
    private List<ChartDataPoint> comments;
    private List<ChartDataPoint> aiToolUsage;
}

