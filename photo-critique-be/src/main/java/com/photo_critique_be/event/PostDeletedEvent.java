package com.photo_critique_be.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDeletedEvent {
    private String postId;
    private String userId;
    private String deletedByUserId;
    private LocalDateTime deletedAt;
}