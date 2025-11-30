package com.photo_critique_be.dto.response.xp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class XPConfigResponse {
    private String id;
    private String eventType;
    private String name;
    private Integer points;
    private String description;
    private String category;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}