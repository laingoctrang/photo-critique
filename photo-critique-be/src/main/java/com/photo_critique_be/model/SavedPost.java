package com.photo_critique_be.model;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "savedposts")
public class SavedPost {
    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("post_id")
    private String postId;

    @Field("saved_at")
    private LocalDateTime savedAt;
}
