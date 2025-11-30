package com.photo_critique_be.dto.response.badge;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BadgeResponse {
    private String id;
    private String name;
    private String description;
    private String iconUrl;
    private Integer xpThreshold;
    private Integer level;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
