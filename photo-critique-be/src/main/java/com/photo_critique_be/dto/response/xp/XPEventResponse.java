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
public class XPEventResponse {
    private String id;
    private String eventType;
    private Integer points;
    private String relatedPostId;
    private String relatedCommentId;
    private LocalDateTime createdAt;
}