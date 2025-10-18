package com.photo_critique_be.model.embedded;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadgeEarned {
    @Field("badge_id")
    private String badgeId;

    @Field("earned_at")
    private LocalDateTime earnedAt;
}
