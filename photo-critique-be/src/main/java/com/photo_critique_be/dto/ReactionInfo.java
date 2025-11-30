package com.photo_critique_be.dto;

import com.photo_critique_be.enums.ReactionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReactionInfo {
    private String userId;
    private String username;
    private String profilePicture;
    private ReactionType reactionType;
    private LocalDateTime createdAt;
}

