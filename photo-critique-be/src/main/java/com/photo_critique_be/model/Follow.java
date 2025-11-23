package com.photo_critique_be.model;

import com.photo_critique_be.enums.FollowStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "follows")
@CompoundIndexes({
    @CompoundIndex(name = "follower_following_unique", def = "{'follower_id': 1, 'following_id': 1}", unique = true),
    @CompoundIndex(name = "follower_status", def = "{'follower_id': 1, 'status': 1}"),
    @CompoundIndex(name = "following_status", def = "{'following_id': 1, 'status': 1}")
})
public class Follow {
    @Id
    private String id;

    @Field("follower_id")
    private String followerId;

    @Field("following_id")
    private String followingId;

    @Field("status")
    private FollowStatus status;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
