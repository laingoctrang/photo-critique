package com.photo_critique_be.dto.response.statistics;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserEngagementResponse {
    private Long activeUsers;
    private Long inactiveUsers;
    private Double activePercentage;
}

