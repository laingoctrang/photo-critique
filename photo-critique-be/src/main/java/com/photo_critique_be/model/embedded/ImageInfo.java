package com.photo_critique_be.model.embedded;

import lombok.Data;

@Data
public class ImageInfo {
    private String url;
    private String name;
    private Long size;
    private String contentType;
}
