package com.photo_critique_be.model;

import com.photo_critique_be.enums.ReactionTargetType;
import com.photo_critique_be.enums.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "reactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({
    @CompoundIndex(name = "user_target_unique", def = "{'user_id': 1, 'target_id': 1, 'target_type': 1}", unique = true),
    @CompoundIndex(name = "target_lookup", def = "{'target_id': 1, 'target_type': 1}"),
    @CompoundIndex(name = "target_reaction_stats", def = "{'target_id': 1, 'target_type': 1, 'reaction_type': 1}")
})
public class Reaction {
    @Id
    private String id;

    @Field("user_id")
    @Indexed
    private String userId;

    @Field("target_type") // "POST", "COMMENT", "STORY", etc.
    @Indexed
    private ReactionTargetType targetType;

    @Field("target_id")
    private String targetId;

    @Field("reaction_type")
    @Indexed
    private ReactionType reactionType;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;
}