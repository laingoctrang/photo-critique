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
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;

    @Field("post_id")
    private String postId;

    @Field("user_id")
    private String userId;

    @Field("content")
    private String content;

    @Field("ai_generated_image")
    private String aiGeneratedImage;

    @Field("parent_comment_id")
    private String parentCommentId;

    @Field("is_helpful")
    private Boolean isHelpful = false;

    @Field("likes_count")
    private Integer likesCount = 0;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

}