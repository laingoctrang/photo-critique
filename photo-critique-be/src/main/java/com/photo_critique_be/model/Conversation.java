package com.photo_critique_be.model;

import com.photo_critique_be.model.embedded.LastMessage;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
public class Conversation {
    @Id
    private ObjectId id;

    @Field("participants")
    private List<ObjectId> participants;

    @Field("last_message")
    private LastMessage lastMessage;

    @Field("unread_count")
    private Integer unreadCount = 0;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

}
