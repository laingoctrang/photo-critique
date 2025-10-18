package com.photo_critique_be.model.embedded;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LastMessage {
    @Field("content")
    private String content;

    @Field("sent_at")
    private LocalDateTime sentAt;

    @Field("sender_id")
    private String senderId;
}
