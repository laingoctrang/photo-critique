package com.photo_critique_be.model.embedded;

import com.photo_critique_be.enums.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reaction {
    @Field("user_id")
    private String userId;

    @Field("reaction_type")
    private ReactionType reactionType;

    @Field("created_at")
    private LocalDateTime createdAt;
}