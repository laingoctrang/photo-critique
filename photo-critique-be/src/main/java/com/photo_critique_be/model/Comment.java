package com.photo_critique_be.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comments")
@CompoundIndexes({
    // loading comments by post
    @CompoundIndex(name = "idx_comments_post_created", def = "{'post_id': 1, 'created_at': 1}"),
    // loading comments by post with helpful sorting
    @CompoundIndex(name = "idx_comments_post_helpful", def = "{'post_id': 1, 'is_helpful': -1, 'created_at': 1}"),
    // loading comments by post with likes sorting
    @CompoundIndex(name = "idx_comments_post_likes", def = "{'post_id': 1, 'likes_count': -1, 'created_at': 1}"),
    // comment threads/replies
    @CompoundIndex(name = "idx_comments_parent", def = "{'parent_comment_id': 1, 'created_at': 1}"),
    // admin/moderation - find helpful comments across all posts
    @CompoundIndex(name = "idx_comments_helpful", def = "{'is_helpful': -1, 'created_at': -1}")
})
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

    @Field("original_image")
    private String originalImage;

    @Field("parent_comment_id")
    private String parentCommentId;

    @Field("is_helpful")
    private Boolean isHelpful = false;

    @Field("is_delete")
    private Boolean isDelete = false;

    @Field("likes_count")
    private Integer likesCount = 0;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

}