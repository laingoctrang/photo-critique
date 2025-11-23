package com.photo_critique_be.model;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "saved_posts")
@CompoundIndex(name = "user_id_post_id", def = "{'user_id': 1, 'post_id': 1}", unique = true)
public class SavedPost {
    @Id
    private String id;

    @Field("user_id")
    @Indexed
    private String userId;

    @Field("post_id")
    @Indexed
    private String postId;

    @Field("saved_at")
    private LocalDateTime savedAt;
}
