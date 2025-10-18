package com.photo_critique_be.model;

import com.photo_critique_be.enums.MessageType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {
    @Id
    private String id;

    @Field("conversation_id")
    private String conversationId;

    @Field("sender_id")
    private String senderId;

    @Field("receiver_id")
    private String receiverId;

    @Field("content")
    private String content;

    @Field("image_url")
    private String imageUrl;

    @Field("message_type")
    private MessageType messageType;

    @Field("is_read")
    private Boolean isRead = false;

    @Field("read_at")
    private LocalDateTime readAt;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
