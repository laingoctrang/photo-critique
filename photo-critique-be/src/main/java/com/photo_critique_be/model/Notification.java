package com.photo_critique_be.model;

import com.photo_critique_be.enums.NotificationType;
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
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("type")
    private NotificationType type;

    @Field("related_user_id")
    private String relatedUserId;

    @Field("related_post_id")
    private String relatedPostId;

    @Field("related_comment_id")
    private String relatedCommentId;

    @Field("message")
    private String message;

    @Field("is_read")
    private Boolean isRead = false;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
