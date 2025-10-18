package com.photo_critique_be.model;

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
@Document(collection = "xpevents")
public class XPEvent {
    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("event_type")
    private String eventType;

    @Field("points")
    private Integer points;

    @Field("related_post_id")
    private String relatedPostId;

    @Field("related_comment_id")
    private String relatedCommentId;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}