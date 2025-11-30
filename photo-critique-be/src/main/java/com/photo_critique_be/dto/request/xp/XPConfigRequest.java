package com.photo_critique_be.dto.request.xp;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class XPConfigRequest {
    @NotNull
    private String eventType;

    @NotNull
    private String name;

    @NotNull
    @Positive
    private Integer points;

    private String description;
    private String category;
}