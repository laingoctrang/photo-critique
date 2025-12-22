package com.photo_critique_be.dto.request.xp;

import com.photo_critique_be.enums.XPConfigStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class XPConfigRequest {
    private String eventType; // Auto-generated from name, readonly for create

    @NotNull
    private String name;

    @NotNull
    @Positive
    private Integer points;

    private String description;
    private String category;
    private XPConfigStatus status;
}