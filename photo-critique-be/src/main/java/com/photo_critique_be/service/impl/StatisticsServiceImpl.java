package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.response.statistics.*;
import com.photo_critique_be.enums.PostStatus;
import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.enums.Role;
import com.photo_critique_be.repository.*;
import com.photo_critique_be.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.bson.Document;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReactionRepository reactionRepository;
    private final ImageGenerationHistoryRepository imageGenerationHistoryRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public StatisticsResponse getStatistics(String period) {
        // Default to YEAR if period is null
        if (period == null || period.isEmpty()) {
            period = "YEAR";
        }

        LocalDateTime startDate = getStartDate(period);
        LocalDateTime now = LocalDateTime.now();

        // Overview Statistics
        OverviewStatistics overview = buildOverviewStatistics(startDate, now);

        // Time Series Data
        List<TimeSeriesData> userGrowth = getUserGrowth(period, startDate, now);
        List<TimeSeriesData> postGrowth = getPostGrowth(period, startDate, now);

        // Status and Privacy Counts
        List<StatusCount> postStatusCounts = getPostStatusCounts();
        List<PrivacyCount> postPrivacyCounts = getPostPrivacyCounts();
        List<RoleCount> userRoleCounts = getUserRoleCounts();

        // Activity Statistics
        ActivityStatistics activity = buildActivityStatistics();

        return StatisticsResponse.builder()
                .overview(overview)
                .userGrowth(userGrowth)
                .postGrowth(postGrowth)
                .postStatusCounts(postStatusCounts)
                .postPrivacyCounts(postPrivacyCounts)
                .userRoleCounts(userRoleCounts)
                .activity(activity)
                .build();
    }

    private LocalDateTime getStartDate(String period) {
        LocalDateTime now = LocalDateTime.now();
        return switch (period.toUpperCase()) {
            case "WEEK" -> now.minusDays(7);
            case "MONTH" -> now.minusDays(30);
            case "QUARTER" -> now.minusMonths(3);
            case "YEAR" -> now.minusMonths(12);
            default -> now.minusMonths(12);
        };
    }

    private OverviewStatistics buildOverviewStatistics(LocalDateTime startDate, LocalDateTime now) {
        // Total users with role USER
        long totalUsers = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(Role.USER))
                .count();

        // Total posts with status POSTED
        long totalPosts = postRepository.findAll().stream()
                .filter(post -> post.getStatus() == PostStatus.POSTED)
                .count();

        // Total comments
        long totalComments = commentRepository.count();

        // Total reactions
        long totalReactions = reactionRepository.count();

        // Active users (last 30 days)
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        long activeUsers = userRepository.findAll().stream()
                .filter(user -> user.getLastSeen() != null && 
                        user.getLastSeen().isAfter(thirtyDaysAgo))
                .filter(user -> user.getRoles().contains(Role.USER))
                .count();

        // New users this month
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newUsersThisMonth = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null && 
                        user.getCreatedAt().isAfter(monthStart))
                .filter(user -> user.getRoles().contains(Role.USER))
                .count();

        // New posts this month
        long newPostsThisMonth = postRepository.findAll().stream()
                .filter(post -> post.getCreatedAt() != null && 
                        post.getCreatedAt().isAfter(monthStart))
                .filter(post -> post.getStatus() == PostStatus.POSTED)
                .count();

        // Average posts per user
        double averagePostsPerUser = totalUsers > 0 ? (double) totalPosts / totalUsers : 0.0;

        return OverviewStatistics.builder()
                .totalUsers(totalUsers)
                .totalPosts(totalPosts)
                .totalComments(totalComments)
                .totalReactions(totalReactions)
                .activeUsers(activeUsers)
                .newUsersThisMonth(newUsersThisMonth)
                .newPostsThisMonth(newPostsThisMonth)
                .averagePostsPerUser(Math.round(averagePostsPerUser * 100.0) / 100.0)
                .build();
    }

    private List<TimeSeriesData> getUserGrowth(String period, LocalDateTime startDate, LocalDateTime endDate) {
        List<TimeSeriesData> result = new ArrayList<>();
        
        // Use MongoDB aggregation for better performance
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("created_at").gte(startDate).lte(endDate)
                        .and("roles").in(List.of("USER"))),
                getGroupByExpression(period),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.ASC, "_id")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(
                aggregation, "users", Map.class);

        for (Map doc : results.getMappedResults()) {
            Object idObj = doc.get("_id");
            String periodKey;
            
            // Handle different _id formats (string for MONTH/YEAR, object for WEEK/QUARTER)
            if (idObj instanceof Map) {
                Map idMap = (Map) idObj;
                if (idMap.containsKey("year") && idMap.containsKey("week")) {
                    periodKey = idMap.get("year") + "-W" + idMap.get("week");
                } else if (idMap.containsKey("year") && idMap.containsKey("quarter")) {
                    periodKey = idMap.get("year") + "-Q" + idMap.get("quarter");
                } else {
                    periodKey = idObj.toString();
                }
            } else {
                periodKey = idObj != null ? idObj.toString() : "";
            }
            
            Long count = doc.get("count") != null ? ((Number) doc.get("count")).longValue() : 0L;
            String label = formatPeriodLabel(periodKey, period);
            
            result.add(TimeSeriesData.builder()
                    .period(periodKey)
                    .count(count)
                    .label(label)
                    .build());
        }

        return result;
    }

    private List<TimeSeriesData> getPostGrowth(String period, LocalDateTime startDate, LocalDateTime endDate) {
        List<TimeSeriesData> result = new ArrayList<>();
        
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("created_at").gte(startDate).lte(endDate)
                        .and("status").is("POSTED")),
                getGroupByExpression(period),
                Aggregation.sort(Sort.Direction.ASC, "_id")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(
                aggregation, "posts", Map.class);

        for (Map doc : results.getMappedResults()) {
            Object idObj = doc.get("_id");
            String periodKey;
            
            // Handle different _id formats (string for MONTH/YEAR, object for WEEK/QUARTER)
            if (idObj instanceof Map) {
                Map idMap = (Map) idObj;
                if (idMap.containsKey("year") && idMap.containsKey("week")) {
                    periodKey = idMap.get("year") + "-W" + idMap.get("week");
                } else if (idMap.containsKey("year") && idMap.containsKey("quarter")) {
                    periodKey = idMap.get("year") + "-Q" + idMap.get("quarter");
                } else {
                    periodKey = idObj.toString();
                }
            } else {
                periodKey = idObj != null ? idObj.toString() : "";
            }
            
            Long count = doc.get("count") != null ? ((Number) doc.get("count")).longValue() : 0L;
            String label = formatPeriodLabel(periodKey, period);
            
            result.add(TimeSeriesData.builder()
                    .period(periodKey)
                    .count(count)
                    .label(label)
                    .build());
        }

        return result;
    }

    private AggregationOperation getGroupByExpression(String period) {
        String groupExpression = switch (period.toUpperCase()) {
            case "WEEK" -> "{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, count: { $sum: 1 } } }";
            case "MONTH" -> "{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, count: { $sum: 1 } } }";
            case "QUARTER" -> "{ $group: { _id: { year: { $dateToString: { format: '%Y', date: '$created_at' } }, quarter: { $ceil: { $divide: [{ $month: '$created_at' }, 3] } } }, count: { $sum: 1 } } }";
            case "YEAR" -> "{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$created_at' } }, count: { $sum: 1 } } }";
            default -> "{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, count: { $sum: 1 } } }";
        };
        
        return context -> Document.parse(groupExpression);
    }

    private String formatPeriodLabel(String periodKey, String periodType) {
        // Simple formatting - can be enhanced
        return periodKey;
    }

    private List<StatusCount> getPostStatusCounts() {
        Map<String, Long> counts = new HashMap<>();
        for (PostStatus status : PostStatus.values()) {
            long count = postRepository.findAll().stream()
                    .filter(post -> post.getStatus() == status)
                    .count();
            counts.put(status.name(), count);
        }

        return counts.entrySet().stream()
                .map(entry -> StatusCount.builder()
                        .status(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<PrivacyCount> getPostPrivacyCounts() {
        Map<String, Long> counts = new HashMap<>();
        for (PrivacyType privacy : PrivacyType.values()) {
            long count = postRepository.findAll().stream()
                    .filter(post -> post.getPrivacy() == privacy)
                    .filter(post -> post.getStatus() == PostStatus.POSTED)
                    .count();
            counts.put(privacy.name(), count);
        }

        return counts.entrySet().stream()
                .map(entry -> PrivacyCount.builder()
                        .privacy(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<RoleCount> getUserRoleCounts() {
        Map<String, Long> counts = new HashMap<>();
        for (Role role : Role.values()) {
            long count = userRepository.findAll().stream()
                    .filter(user -> user.getRoles().contains(role))
                    .count();
            counts.put(role.name(), count);
        }

        return counts.entrySet().stream()
                .map(entry -> RoleCount.builder()
                        .role(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private ActivityStatistics buildActivityStatistics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime weekStart = now.minusDays(7);
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        long postsToday = postRepository.findAll().stream()
                .filter(post -> post.getCreatedAt() != null && 
                        post.getCreatedAt().isAfter(todayStart))
                .filter(post -> post.getStatus() == PostStatus.POSTED)
                .count();

        long postsThisWeek = postRepository.findAll().stream()
                .filter(post -> post.getCreatedAt() != null && 
                        post.getCreatedAt().isAfter(weekStart))
                .filter(post -> post.getStatus() == PostStatus.POSTED)
                .count();

        long postsThisMonth = postRepository.findAll().stream()
                .filter(post -> post.getCreatedAt() != null && 
                        post.getCreatedAt().isAfter(monthStart))
                .filter(post -> post.getStatus() == PostStatus.POSTED)
                .count();

        long usersToday = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null && 
                        user.getCreatedAt().isAfter(todayStart))
                .filter(user -> user.getRoles().contains(Role.USER))
                .count();

        long usersThisWeek = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null && 
                        user.getCreatedAt().isAfter(weekStart))
                .filter(user -> user.getRoles().contains(Role.USER))
                .count();

        long usersThisMonth = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null && 
                        user.getCreatedAt().isAfter(monthStart))
                .filter(user -> user.getRoles().contains(Role.USER))
                .count();

        long commentsToday = commentRepository.findAll().stream()
                .filter(comment -> comment.getCreatedAt() != null && 
                        comment.getCreatedAt().isAfter(todayStart))
                .count();

        long reactionsToday = reactionRepository.findAll().stream()
                .filter(reaction -> reaction.getCreatedAt() != null && 
                        reaction.getCreatedAt().isAfter(todayStart))
                .count();

        return ActivityStatistics.builder()
                .postsToday(postsToday)
                .postsThisWeek(postsThisWeek)
                .postsThisMonth(postsThisMonth)
                .usersToday(usersToday)
                .usersThisWeek(usersThisWeek)
                .usersThisMonth(usersThisMonth)
                .commentsToday(commentsToday)
                .reactionsToday(reactionsToday)
                .build();
    }

    @Override
    public OverviewStatisticsResponse getOverviewStatistics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thisMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime lastMonthStart = thisMonthStart.minusMonths(1);

        long totalUsers = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(Role.USER))
                .count();

        long totalPosts = postRepository.findAll().stream()
                .filter(post -> post.getStatus() == PostStatus.POSTED)
                .count();

        long totalComments = commentRepository.count();

        long totalAiToolUsage = imageGenerationHistoryRepository.count();

        // Count items in current month (this month)
        long thisMonthPosts = postRepository.findAll().stream()
                .filter(post -> post.getStatus() == PostStatus.POSTED)
                .filter(post -> post.getCreatedAt() != null 
                        && post.getCreatedAt().isAfter(thisMonthStart))
                .count();

        long thisMonthComments = commentRepository.findAll().stream()
                .filter(comment -> comment.getCreatedAt() != null 
                        && comment.getCreatedAt().isAfter(thisMonthStart))
                .count();

        long thisMonthAiToolUsage = imageGenerationHistoryRepository.findAll().stream()
                .filter(history -> history.getCreatedAt() != null 
                        && history.getCreatedAt().isAfter(thisMonthStart))
                .count();

        // Count items in previous month (last month)
        long lastMonthPosts = postRepository.findAll().stream()
                .filter(post -> post.getStatus() == PostStatus.POSTED)
                .filter(post -> post.getCreatedAt() != null 
                        && post.getCreatedAt().isAfter(lastMonthStart)
                        && post.getCreatedAt().isBefore(thisMonthStart))
                .count();

        long lastMonthComments = commentRepository.findAll().stream()
                .filter(comment -> comment.getCreatedAt() != null 
                        && comment.getCreatedAt().isAfter(lastMonthStart)
                        && comment.getCreatedAt().isBefore(thisMonthStart))
                .count();

        long lastMonthAiToolUsage = imageGenerationHistoryRepository.findAll().stream()
                .filter(history -> history.getCreatedAt() != null 
                        && history.getCreatedAt().isAfter(lastMonthStart)
                        && history.getCreatedAt().isBefore(thisMonthStart))
                .count();

        return OverviewStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalPosts(totalPosts)
                .totalComments(totalComments)
                .totalAiToolUsage(totalAiToolUsage)
                .thisMonthPosts(thisMonthPosts)
                .thisMonthComments(thisMonthComments)
                .thisMonthAiToolUsage(thisMonthAiToolUsage)
                .lastMonthPosts(lastMonthPosts)
                .lastMonthComments(lastMonthComments)
                .lastMonthAiToolUsage(lastMonthAiToolUsage)
                .fetchedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public ActivityChartResponse getActivityChart(String period) {
        LocalDateTime now = LocalDateTime.now();
        List<String> labels = generateLabels(period, now);

        List<ChartDataPoint> posts = getActivityChartDataWithLabels("posts", period, now, labels);
        List<ChartDataPoint> comments = getActivityChartDataWithLabels("comments", period, now, labels);
        List<ChartDataPoint> aiToolUsage = getActivityChartDataWithLabels("image_generation_history", period, now, labels);

        return ActivityChartResponse.builder()
                .posts(posts)
                .comments(comments)
                .aiToolUsage(aiToolUsage)
                .build();
    }

    private List<String> generateLabels(String period, LocalDateTime now) {
        List<String> labels = new ArrayList<>();
        
        switch (period.toUpperCase()) {
            case "WEEK":
                // 7 ngày gần nhất
                for (int i = 6; i >= 0; i--) {
                    LocalDateTime date = now.minusDays(i);
                    labels.add(date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM")));
                }
                break;
            case "MONTH":
                // 30 ngày gần nhất
                for (int i = 29; i >= 0; i--) {
                    LocalDateTime date = now.minusDays(i);
                    labels.add(date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM")));
                }
                break;
            case "YEAR":
                // 12 tháng gần nhất
                for (int i = 11; i >= 0; i--) {
                    LocalDateTime date = now.minusMonths(i);
                    labels.add(getMonthName(date.getMonthValue()));
                }
                break;
            default:
                // Default to MONTH
                for (int i = 29; i >= 0; i--) {
                    LocalDateTime date = now.minusDays(i);
                    labels.add(date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM")));
                }
        }
        
        return labels;
    }

    private List<ChartDataPoint> getActivityChartDataWithLabels(String collection, String period, LocalDateTime now, List<String> labels) {
        // Tạo map để lưu count theo label
        Map<String, Long> dataMap = new HashMap<>();
        
        // Khởi tạo tất cả labels với count = 0
        for (String label : labels) {
            dataMap.put(label, 0L);
        }
        
        // Tính startDate dựa trên period
        LocalDateTime startDate;
        switch (period.toUpperCase()) {
            case "WEEK":
                startDate = now.minusDays(6).withHour(0).withMinute(0).withSecond(0);
                break;
            case "MONTH":
                startDate = now.minusDays(29).withHour(0).withMinute(0).withSecond(0);
                break;
            case "YEAR":
                startDate = now.minusMonths(11).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                break;
            default:
                startDate = now.minusDays(29).withHour(0).withMinute(0).withSecond(0);
        }

        // Query data từ database
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("created_at").gte(startDate).lte(now)),
                getGroupByExpression(period),
                Aggregation.sort(Sort.Direction.ASC, "_id")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, collection, Map.class);

        // Fill data vào map
        for (Map doc : results.getMappedResults()) {
            Object idObj = doc.get("_id");
            String label = formatPeriodLabelForChart(idObj, period);
            Long count = doc.get("count") != null ? ((Number) doc.get("count")).longValue() : 0L;
            
            if (dataMap.containsKey(label)) {
                dataMap.put(label, count);
            }
        }

        // Tạo result list theo đúng thứ tự labels
        List<ChartDataPoint> result = new ArrayList<>();
        for (String label : labels) {
            result.add(ChartDataPoint.builder()
                    .label(label)
                    .count(dataMap.getOrDefault(label, 0L))
                    .build());
        }

        return result;
    }

    private String formatPeriodLabelForChart(Object idObj, String period) {
        if (idObj instanceof String) {
            String str = (String) idObj;
            if ((period.equals("WEEK") || period.equals("MONTH")) && str.matches("\\d{4}-\\d{2}-\\d{2}")) {
                // Format: YYYY-MM-DD -> DD/MM
                String[] parts = str.split("-");
                return parts[2] + "/" + parts[1];
            } else if (period.equals("YEAR") && str.matches("\\d{4}-\\d{2}")) {
                // Format: YYYY-MM -> Month name
                String[] parts = str.split("-");
                int month = Integer.parseInt(parts[1]);
                return getMonthName(month);
            }
        } else if (idObj instanceof Map) {
            Map idMap = (Map) idObj;
            if (period.equals("QUARTER") && idMap.containsKey("year") && idMap.containsKey("quarter")) {
                return "Q" + idMap.get("quarter") + " " + idMap.get("year");
            } else if (period.equals("YEAR") && idMap.containsKey("year")) {
                return idMap.get("year").toString();
            }
        }
        return idObj != null ? idObj.toString() : "";
    }

    private String getMonthName(int month) {
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        return month >= 1 && month <= 12 ? months[month - 1] : String.valueOf(month);
    }

    @Override
    public UserEngagementResponse getUserEngagement() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        long activeUsers = userRepository.findAll().stream()
                .filter(user -> user.getLastSeen() != null && user.getLastSeen().isAfter(thirtyDaysAgo))
                .filter(user -> user.getRoles().contains(Role.USER))
                .count();

        long totalUsers = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(Role.USER))
                .count();

        long inactiveUsers = totalUsers - activeUsers;
        double activePercentage = totalUsers > 0 ? (double) activeUsers / totalUsers * 100 : 0.0;

        return UserEngagementResponse.builder()
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .activePercentage(Math.round(activePercentage * 100.0) / 100.0)
                .build();
    }
}

