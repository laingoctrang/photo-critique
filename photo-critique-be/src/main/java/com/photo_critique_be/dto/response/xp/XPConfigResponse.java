package com.photo_critique_be.dto.response.xp;

import com.photo_critique_be.enums.XPConfigStatus;
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
    private XPConfigStatus status;
    private Boolean isActive; // Deprecated, use status instead. Kept for backward compatibility
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}