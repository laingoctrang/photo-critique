package com.photo_critique_be.model;

import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.model.embedded.Reaction;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
public class Post {
    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("caption")
    private String caption;

    @Field("image_url")
    private String imageUrl;

    @Field("privacy")
    private PrivacyType privacy;

    @Field("likes_count")
    private Integer likesCount = 0;

    @Field("comments_count")
    private Integer commentsCount = 0;

    @Field("reactions")
    private List<Reaction> reactions;

    @Field("tags")
    private List<String> tags;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
