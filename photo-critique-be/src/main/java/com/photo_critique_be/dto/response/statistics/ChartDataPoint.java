package com.photo_critique_be.dto.response.statistics;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChartDataPoint {
    private String label;
    private Long count;
}

