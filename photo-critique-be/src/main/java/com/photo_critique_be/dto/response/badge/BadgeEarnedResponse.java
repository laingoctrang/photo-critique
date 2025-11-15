package com.photo_critique_be.dto.response.badge;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BadgeEarnedResponse {
    private String id;
    private String name;
    private String description;
    private String iconUrl;
    private LocalDateTime earnedAt;
}
