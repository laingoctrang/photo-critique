package com.photo_critique_be.dto.response.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSeriesData {
    private String period; // "2024-01", "2024-W01", etc.
    private Long count;
    private String label; // "January 2024", "Week 1, 2024", etc.
}

