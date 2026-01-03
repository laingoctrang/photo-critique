package com.photo_critique_be.model;

import com.photo_critique_be.enums.RankingPeriod;
import com.photo_critique_be.enums.RankingType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ranking_snapshots")
@CompoundIndexes({
    @CompoundIndex(name = "idx_ranking_lookup", def = "{'type': 1, 'period': 1, 'snapshot_date': -1}"),
    @CompoundIndex(name = "idx_ranking_date", def = "{'snapshot_date': -1}")
})
public class RankingSnapshot {
    @Id
    private String id;

    @Field("type")
    private RankingType type;

    @Field("period")
    private RankingPeriod period;

    @Field("snapshot_date")
    private LocalDateTime snapshotDate;

    @Field("user_rankings")
    private List<UserRankingItem> userRankings;

    @Field("post_rankings")
    private List<PostRankingItem> postRankings;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    // Inner class cho User Ranking
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRankingItem {
        @Field("user_id")
        private String userId;

        @Field("username")
        private String username;

        @Field("profile_picture")
        private String profilePicture;

        @Field("xp_points")
        private Integer xpPoints;

        @Field("level")
        private Integer level;

        @Field("rank")
        private Integer rank;
    }

    // Inner class cho Post Ranking
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostRankingItem {
        @Field("post_id")
        private String postId;

        @Field("user_id")
        private String userId;

        @Field("username")
        private String username;

        @Field("caption")
        private String caption;

        @Field("image_urls")
        private List<String> imageUrls;

        @Field("reactions_count")
        private Integer reactionsCount;

        @Field("comments_count")
        private Integer commentsCount;

        @Field("rank")
        private Integer rank;
    }
}

