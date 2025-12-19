package com.photo_critique_be.dto.request.badge;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BadgeRequest {
    @NotBlank(message = "Badge name is required")
    private String name;

    private String description;

    @NotBlank(message = "Badge icon is required")
    private String iconUrl;

    @NotNull(message = "XP threshold is required")
    @Positive(message = "XP threshold must be positive")
    private Integer xpThreshold;

    @NotNull(message = "Level is required")
    @Positive(message = "Level must be positive")
    private Integer level;
}

