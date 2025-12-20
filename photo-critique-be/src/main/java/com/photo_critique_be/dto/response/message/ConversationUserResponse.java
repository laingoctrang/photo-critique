package com.photo_critique_be.dto.response.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationUserResponse {
    private String id;
    private String username;
    private String fullName;
    private String profilePicture;
    private Boolean isOnline;
}

