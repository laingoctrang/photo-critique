package com.photo_critique_be.repository;

import com.photo_critique_be.dto.response.post.PostListItemResponse;
import com.photo_critique_be.enums.PostStatus;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.ProjectionOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public List<PostListItemResponse> findFeedWithAggregation(String currentUserId,
                                                              List<String> userIds,
                                                              List<String> privacyValues,
                                                              List<PostStatus> allowedStatuses,
                                                              Pageable pageable) {

        long skip = pageable.getOffset();
        int limit = pageable.getPageSize();

        List<AggregationOperation> ops = new ArrayList<>();

        // Match criteria:
        // 1. Posts from users that current user follows (with allowed privacy: PUBLIC, FOLLOWER_ONLY)
        // 2. OR all PUBLIC posts from any user (to show public posts from users not followed)
        // 3. Filter by status (e.g., only POSTED)
        // 4. Exclude deleted posts
        List<String> statusStrings = allowedStatuses.stream()
                .map(Enum::name)
                .collect(Collectors.toList());
        
        Criteria matchCriteria = new Criteria()
            .and("is_deleted").ne(true)
            .and("status").in(statusStrings)
            .orOperator(
                // Posts from followed users (or self) with allowed privacy
                Criteria.where("user_id").in(userIds)
                    .and("privacy").in(privacyValues),
                // All PUBLIC posts from any user (including users not followed)
                Criteria.where("privacy").is("PUBLIC")
            );
        ops.add(Aggregation.match(matchCriteria));

        // Sort newest first
        ops.add(Aggregation.sort(Sort.by(Sort.Direction.DESC, "created_at").and(Sort.by(Sort.Direction.DESC, "_id"))));

        // Pagination via Pageable -> skip + limit
        if (skip > 0) ops.add(Aggregation.skip(skip));
        ops.add(Aggregation.limit(limit));

        // Lookup user info
        String lookupUser = String.format(
            "{ $lookup: { " +
                "from: 'users', " +
                "let: { uid: '$user_id' }, " +
                "pipeline: [ " +
                    "{ $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$uid'] } } } " +
                    "{ $addFields: { idString: { $toString: '$_id' } } }" +
                "], " +
                "as: 'userInfo' " +
            "} }"
        );
        ops.add(context -> Document.parse(lookupUser));
        ops.add(Aggregation.unwind("userInfo", true));

        // Lookup follow relationship where currentUser -> postUser
        String lookupFollow = String.format(
            "{ $lookup: { from: 'follows', let: { uid: '$user_id' }, pipeline: [ " +
            "{ $match: { $expr: { $and: [ { $eq: ['$follower_id', '%s'] }, { $eq: ['$following_id', '$$uid'] } ] } } } ], " +
            "as: 'followingLookup' } }",
            currentUserId
        );
        ops.add(context -> Document.parse(lookupFollow));

        // Lookup follow relationship where postUser -> currentUser
        String lookupFollowedBy = String.format(
            "{ $lookup: { from: 'follows', let: { uid: '$user_id' }, pipeline: [ " +
            "{ $match: { $expr: { $and: [ { $eq: ['$follower_id', '$$uid'] }, { $eq: ['$following_id', '%s'] } ] } } } ], " +
            "as: 'followedByLookup' } }",
            currentUserId
        );
        ops.add(context -> Document.parse(lookupFollowedBy));

        // Lookup saved posts by current user (to set isSaved) - pipeline style to limit cost
        String lookupSaved = String.format(
            "{ $lookup: " +
                "{ from: 'saved_posts', " +
                "let: { pid: { $toString: '$_id' } }, " +
                "pipeline: [ " +
                    "{ $match: { $expr: { $and: [ " +
                        "{ $eq: ['$post_id','$$pid'] }, " +
                        "{ $eq: ['$user_id','%s'] } " +
                    "] } } }, " +
                    "{ $limit: 1 } " +
                "], " +
                "as: 'savedLookup' " +
            "} }",
            currentUserId
        );
        ops.add(context -> Document.parse(lookupSaved));

        // Lookup user's reaction to post
        String lookupUserReaction = String.format(
            "{ $lookup: { " +
                "from: 'reactions', " +
                "let: { pid: { $toString: '$_id' } }, " +
                "pipeline: [ " +
                    "{ $match: { $expr: { $and: [ " +
                        "{ $eq: ['$target_id', '$$pid'] }, " +
                        "{ $eq: ['$user_id', '%s'] } " +
                    "] } } }, " +
                    "{ $limit: 1 } " +
                "], " +
                "as: 'userReactionLookup' " +
            "} }",
            currentUserId
        );
        ops.add(context -> Document.parse(lookupUserReaction));

        // Project fields and compute flags
        // - userReaction = first reaction.reaction_type where user_id == currentUserId (or null)
        // - isSaved = size(savedLookup) > 0
        // - isSaved = userReaction ? null
        ProjectionOperation project = Aggregation.project()
                .andExpression("toString(_id)").as("id")
                .andExpression("toString(userInfo._id)").as("user.id")
                .and("userInfo.username").as("user.username")
                .and("userInfo.profile_picture").as("user.profilePicture")
                .and("userInfo.full_name").as("user.fullName")
                .and("userInfo.is_online").as("user.isOnline")
                .and("userInfo.xp_points").as("user.xpPoints")
                .and("userInfo.level").as("user.level")
                .and("userInfo.followers_count").as("user.followersCount")
                .and("userInfo.following_count").as("user.followingCount")
                .and(ctx -> new Document("$gt", Arrays.asList(new Document("$size", "$followingLookup"), 0)))
                .as("user.isFollowing")
                .and(ctx -> new Document("$gt", Arrays.asList(new Document("$size", "$followedByLookup"), 0)))
                .as("user.isFollowedBy")
                .and(ctx -> new Document("$arrayElemAt", Arrays.asList("$followingLookup.status", 0)))
                .as("user.followStatus")

                .and("caption").as("caption")
                .and("image_urls").as("imageUrls")
                .and("privacy").as("privacy")
                .and("status").as("status")
                .and("likes_count").as("likesCount")
                .and("comments_count").as("commentsCount")
                .and("shares_count").as("sharesCount")
                .and("created_at").as("createdAt")

                // isSaved: savedLookup length > 0
                .and(ctx -> new Document("$gt", Arrays.asList(new Document("$size", "$savedLookup"), 0)))
                .as("isSaved")

                // userReaction
                .and(ctx -> new Document("$arrayElemAt", Arrays.asList("$userReactionLookup.reaction_type", 0)))
                .as("userReaction")

                // isLiked: whether userReaction != null
                .and(ctx -> new Document("$ne", Arrays.asList("$userReaction", null)))
                .as("isLiked");

        ops.add(project);

        Aggregation aggregation = Aggregation.newAggregation(ops);

        // Execute and map to DTO
        List<PostListItemResponse> results = mongoTemplate.aggregate(aggregation, "posts", PostListItemResponse.class)
                .getMappedResults();

        return results;
    }
}
