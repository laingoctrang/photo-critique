package com.photo_critique_be.dto.request.tag;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TagRequest {
    @NotBlank(message = "Tag name is required")
    private String name;

    private String description;
}