package com.photo_critique_be.model;

import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.model.embedded.ImageInfo;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
@CompoundIndexes({
    @CompoundIndex(name = "feed_query", def = "{'user_id': 1, 'is_deleted': 1, 'privacy': 1, 'created_at': -1}"),
    @CompoundIndex(name = "user_posts", def = "{'user_id': 1, 'is_deleted': 1, 'created_at': -1}")
})
public class Post {
    @Id
    private String id;

    @Field("user_id")
    @Indexed
    private String userId;

    @Field("caption")
    private String caption;

    @Field("image_urls")
    private List<ImageInfo> imageUrls;

    @Field("privacy")
    private PrivacyType privacy;

    @Field("likes_count")
    private Integer likesCount = 0;

    @Field("comments_count")
    private Integer commentsCount = 0;

    @Field("shares_count")
    private Integer sharesCount = 0;

    @Field("tags")
    private List<String> tags;

    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    @Field("original_post_id")
    private String originalPostId = null;

    @Field("is_deleted")
    @Indexed
    private Boolean isDeleted = false;

    @Field("deleted_at")
    private LocalDateTime deletedAt;

    @Field("deleted_by")
    private String deletedBy;
}
