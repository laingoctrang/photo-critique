package com.photo_critique_be.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.photo_critique_be.constant.RedisPrefixKeyConstant;
import com.photo_critique_be.dto.response.ranking.PostRankingResponse;
import com.photo_critique_be.dto.response.ranking.RankingResponse;
import com.photo_critique_be.dto.response.ranking.UserRankingResponse;
import com.photo_critique_be.enums.ReactionTargetType;
import com.photo_critique_be.enums.RankingPeriod;
import com.photo_critique_be.enums.RankingType;
import com.photo_critique_be.model.*;
import com.photo_critique_be.model.embedded.ImageInfo;
import com.photo_critique_be.repository.*;
import com.photo_critique_be.service.RankingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final RankingSnapshotRepository rankingSnapshotRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public RankingResponse getRanking(RankingType type, RankingPeriod period, Integer limit) {
        // Thử lấy từ Redis cache trước
        String cacheKey = generateRedisKey(type, period);
        try {
            String cachedData = (String) redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                log.debug("Cache hit for ranking: {} - {}", type, period);
                RankingResponse response = objectMapper.readValue(cachedData, RankingResponse.class);
                return limitRankings(response, limit);
            }
        } catch (Exception e) {
            log.warn("Error reading from cache: {}", e.getMessage());
        }

        // Nếu không có trong cache, lấy từ MongoDB snapshot mới nhất
        log.debug("Cache miss, fetching from MongoDB: {} - {}", type, period);
        Optional<RankingSnapshot> snapshot = rankingSnapshotRepository
                .findTopByTypeAndPeriodOrderBySnapshotDateDesc(type, period);

        RankingResponse response;
        if (snapshot.isPresent()) {
            response = convertSnapshotToResponse(snapshot.get());
            // Cache lại vào Redis (TTL 1 ngày)
            cacheRanking(cacheKey, response);
        } else {
            // Nếu chưa có snapshot, tính toán ngay
            log.info("No snapshot found, calculating ranking on demand: {} - {}", type, period);
            calculateAndSaveRanking(type, period);
            snapshot = rankingSnapshotRepository
                    .findTopByTypeAndPeriodOrderBySnapshotDateDesc(type, period);
            response = snapshot.map(this::convertSnapshotToResponse)
                    .orElse(createEmptyResponse(type, period));
        }

        return limitRankings(response, limit);
    }

    @Override
    @Transactional
    public void calculateAndSaveRanking(RankingType type, RankingPeriod period) {
        log.info("Calculating ranking: {} - {}", type, period);
        LocalDate snapshotDate = LocalDate.now();
        RankingSnapshot snapshot = new RankingSnapshot();
        snapshot.setType(type);
        snapshot.setPeriod(period);
        snapshot.setSnapshotDate(snapshotDate);

        switch (type) {
            case USER_XP -> {
                List<RankingSnapshot.UserRankingItem> userRankings = calculateUserXPRanking(period);
                snapshot.setUserRankings(userRankings);
            }
            case POST_REACTIONS -> {
                List<RankingSnapshot.PostRankingItem> postRankings = calculatePostReactionsRanking(period);
                snapshot.setPostRankings(postRankings);
            }
            case POST_COMMENTS -> {
                List<RankingSnapshot.PostRankingItem> postRankings = calculatePostCommentsRanking(period);
                snapshot.setPostRankings(postRankings);
            }
        }

        // Lưu vào MongoDB
        rankingSnapshotRepository.save(snapshot);

        // Cache vào Redis
        RankingResponse response = convertSnapshotToResponse(snapshot);
        String cacheKey = generateRedisKey(type, period);
        cacheRanking(cacheKey, response);

        log.info("Ranking calculated and saved: {} - {}, items: {}", type, period,
                type == RankingType.USER_XP ? snapshot.getUserRankings().size() : snapshot.getPostRankings().size());
    }

    private List<RankingSnapshot.UserRankingItem> calculateUserXPRanking(RankingPeriod period) {
        LocalDateTime startDate = getStartDate(period);

        // Aggregate XP events theo user_id
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("created_at").gte(startDate)),
                Aggregation.group("user_id")
                        .sum("points").as("totalXp"),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "totalXp"),
                Aggregation.limit(1000) // Lấy top 1000 để đảm bảo đủ
        );

        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> results = (AggregationResults<Map<String, Object>>) 
                (AggregationResults<?>) mongoTemplate.aggregate(aggregation, "xp_events", Map.class);

        List<Map<String, Object>> xpResults = results.getMappedResults();
        List<String> userIds = xpResults.stream()
                .map(r -> (String) r.get("_id"))
                .collect(Collectors.toList());

        if (userIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Lấy thông tin user
        List<User> users = userRepository.findByIdIn(userIds);
        Map<String, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // Tạo ranking items
        List<RankingSnapshot.UserRankingItem> rankings = new ArrayList<>();
        int rank = 1;
        for (Map<String, Object> result : xpResults) {
            String userId = (String) result.get("_id");
            User user = userMap.get(userId);
            if (user == null) continue;

            RankingSnapshot.UserRankingItem item = new RankingSnapshot.UserRankingItem();
            item.setUserId(userId);
            item.setUsername(user.getUsername());
            item.setProfilePicture(user.getProfilePicture());
            item.setXpPoints(((Number) result.get("totalXp")).intValue());
            item.setLevel(user.getLevel());
            item.setRank(rank++);
            rankings.add(item);
        }

        return rankings;
    }

    private List<RankingSnapshot.PostRankingItem> calculatePostReactionsRanking(RankingPeriod period) {
        LocalDateTime startDate = getStartDate(period);

        // Aggregate reactions theo post
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("target_type").is(ReactionTargetType.POST.name())
                        .and("created_at").gte(startDate)),
                Aggregation.group("target_id")
                        .count().as("reactionsCount"),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "reactionsCount"),
                Aggregation.limit(1000)
        );

        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> results = (AggregationResults<Map<String, Object>>) 
                (AggregationResults<?>) mongoTemplate.aggregate(aggregation, "reactions", Map.class);

        List<Map<String, Object>> reactionResults = results.getMappedResults();
        List<String> postIds = reactionResults.stream()
                .map(r -> (String) r.get("_id"))
                .collect(Collectors.toList());

        if (postIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Lấy thông tin posts
        List<Post> posts = postRepository.findAllByIdInAndIsDeletedFalse(postIds);
        Map<String, Post> postMap = posts.stream()
                .collect(Collectors.toMap(Post::getId, p -> p));

        // Lấy thông tin users
        List<String> userIds = posts.stream()
                .map(Post::getUserId)
                .distinct()
                .collect(Collectors.toList());
        List<User> users = userRepository.findByIdIn(userIds);
        Map<String, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // Tạo ranking items
        List<RankingSnapshot.PostRankingItem> rankings = new ArrayList<>();
        int rank = 1;
        for (Map<String, Object> result : reactionResults) {
            String postId = (String) result.get("_id");
            Post post = postMap.get(postId);
            if (post == null || post.getIsDeleted()) continue;

            User user = userMap.get(post.getUserId());
            if (user == null) continue;

            RankingSnapshot.PostRankingItem item = new RankingSnapshot.PostRankingItem();
            item.setPostId(postId);
            item.setUserId(post.getUserId());
            item.setUsername(user.getUsername());
            item.setCaption(post.getCaption());
            item.setImageUrls(post.getImageUrls() != null ?
                    post.getImageUrls().stream()
                            .map(ImageInfo::getUrl)
                            .collect(Collectors.toList()) : Collections.emptyList());
            item.setReactionsCount(((Number) result.get("reactionsCount")).intValue());
            item.setCommentsCount(post.getCommentsCount() != null ? post.getCommentsCount() : 0);
            item.setRank(rank++);
            rankings.add(item);
        }

        return rankings;
    }

    private List<RankingSnapshot.PostRankingItem> calculatePostCommentsRanking(RankingPeriod period) {
        LocalDateTime startDate = getStartDate(period);

        // Aggregate comments theo post
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("created_at").gte(startDate)),
                Aggregation.group("post_id")
                        .count().as("commentsCount"),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "commentsCount"),
                Aggregation.limit(1000)
        );

        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> results = (AggregationResults<Map<String, Object>>) 
                (AggregationResults<?>) mongoTemplate.aggregate(aggregation, "comments", Map.class);

        List<Map<String, Object>> commentResults = results.getMappedResults();
        List<String> postIds = commentResults.stream()
                .map(r -> (String) r.get("_id"))
                .collect(Collectors.toList());

        if (postIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Lấy thông tin posts
        List<Post> posts = postRepository.findAllByIdInAndIsDeletedFalse(postIds);
        Map<String, Post> postMap = posts.stream()
                .collect(Collectors.toMap(Post::getId, p -> p));

        // Lấy thông tin users
        List<String> userIds = posts.stream()
                .map(Post::getUserId)
                .distinct()
                .collect(Collectors.toList());
        List<User> users = userRepository.findByIdIn(userIds);
        Map<String, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // Tạo ranking items
        List<RankingSnapshot.PostRankingItem> rankings = new ArrayList<>();
        int rank = 1;
        for (Map<String, Object> result : commentResults) {
            String postId = (String) result.get("_id");
            Post post = postMap.get(postId);
            if (post == null || post.getIsDeleted()) continue;

            User user = userMap.get(post.getUserId());
            if (user == null) continue;

            RankingSnapshot.PostRankingItem item = new RankingSnapshot.PostRankingItem();
            item.setPostId(postId);
            item.setUserId(post.getUserId());
            item.setUsername(user.getUsername());
            item.setCaption(post.getCaption());
            item.setImageUrls(post.getImageUrls() != null ?
                    post.getImageUrls().stream()
                            .map(ImageInfo::getUrl)
                            .collect(Collectors.toList()) : Collections.emptyList());
            item.setCommentsCount(((Number) result.get("commentsCount")).intValue());
            item.setReactionsCount(post.getLikesCount() != null ? post.getLikesCount() : 0);
            item.setRank(rank++);
            rankings.add(item);
        }

        return rankings;
    }

    private LocalDateTime getStartDate(RankingPeriod period) {
        LocalDateTime now = LocalDateTime.now();
        return switch (period) {
            case WEEK -> now.minusWeeks(1);
            case MONTH -> now.minusMonths(1);
            case YEAR -> now.minusYears(1);
            case ALL -> LocalDateTime.of(2000, 1, 1, 0, 0); // Lấy tất cả
        };
    }

    private RankingResponse convertSnapshotToResponse(RankingSnapshot snapshot) {
        List<UserRankingResponse> userRankings = null;
        if (snapshot.getUserRankings() != null) {
            userRankings = snapshot.getUserRankings().stream()
                    .map(item -> UserRankingResponse.builder()
                            .userId(item.getUserId())
                            .username(item.getUsername())
                            .profilePicture(item.getProfilePicture())
                            .xpPoints(item.getXpPoints())
                            .level(item.getLevel())
                            .rank(item.getRank())
                            .build())
                    .collect(Collectors.toList());
        }

        List<PostRankingResponse> postRankings = null;
        if (snapshot.getPostRankings() != null) {
            postRankings = snapshot.getPostRankings().stream()
                    .map(item -> PostRankingResponse.builder()
                            .postId(item.getPostId())
                            .userId(item.getUserId())
                            .username(item.getUsername())
                            .caption(item.getCaption())
                            .imageUrls(item.getImageUrls())
                            .reactionsCount(item.getReactionsCount())
                            .commentsCount(item.getCommentsCount())
                            .rank(item.getRank())
                            .build())
                    .collect(Collectors.toList());
        }

        return RankingResponse.builder()
                .type(snapshot.getType())
                .period(snapshot.getPeriod())
                .snapshotDate(snapshot.getSnapshotDate())
                .userRankings(userRankings)
                .postRankings(postRankings)
                .totalCount(userRankings != null ? userRankings.size() :
                        postRankings != null ? postRankings.size() : 0)
                .build();
    }

    private RankingResponse limitRankings(RankingResponse response, Integer limit) {
        if (limit == null || limit <= 0) {
            return response;
        }

        if (response.getUserRankings() != null && response.getUserRankings().size() > limit) {
            response.setUserRankings(response.getUserRankings().subList(0, limit));
            response.setTotalCount(limit);
        }

        if (response.getPostRankings() != null && response.getPostRankings().size() > limit) {
            response.setPostRankings(response.getPostRankings().subList(0, limit));
            response.setTotalCount(limit);
        }

        return response;
    }

    private RankingResponse createEmptyResponse(RankingType type, RankingPeriod period) {
        return RankingResponse.builder()
                .type(type)
                .period(period)
                .snapshotDate(LocalDate.now())
                .userRankings(Collections.emptyList())
                .postRankings(Collections.emptyList())
                .totalCount(0)
                .build();
    }

    private String generateRedisKey(RankingType type, RankingPeriod period) {
        return String.format("%s:%s:%s:%s", 
                RedisPrefixKeyConstant.RANKING, 
                type.name(), 
                period.name(),
                LocalDate.now().toString());
    }

    private void cacheRanking(String key, RankingResponse response) {
        try {
            String json = objectMapper.writeValueAsString(response);
            // Cache 24 giờ (cho đến khi update vào 0h ngày mai)
            redisTemplate.opsForValue().set(key, json, 25, TimeUnit.HOURS);
        } catch (Exception e) {
            log.error("Error caching ranking: {}", e.getMessage());
        }
    }
}

