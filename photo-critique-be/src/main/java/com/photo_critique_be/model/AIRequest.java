package com.photo_critique_be.model;

import com.photo_critique_be.enums.AIRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ai_requests")
public class AIRequest {
    @Id
    private String id;

    @Field("comment_id")
    private String commentId;

    @Field("user_id")
    private String userId;

    @Field("post_id")
    private String postId;

    @Field("prompt")
    private String prompt;

    @Field("original_image")
    private String originalImage;

    @Field("generated_image")
    private String generatedImage;

    @Field("status")
    private AIRequestStatus status;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
