package com.photo_critique_be.dto.response.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private String id;
    private ConversationUserResponse otherUser;
    private LastMessageResponse lastMessage;
    private Integer unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

