package com.photo_critique_be.dto.response.tag;

import lombok.Data;

@Data
public class TagResponse {
    private String id;
    private String name;
    private String slug;
    private String description;
    private Long postCount;
}