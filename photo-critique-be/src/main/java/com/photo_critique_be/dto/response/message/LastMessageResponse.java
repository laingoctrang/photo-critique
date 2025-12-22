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
public class LastMessageResponse {
    private String content;
    private LocalDateTime sentAt;
    private String senderId;
}

