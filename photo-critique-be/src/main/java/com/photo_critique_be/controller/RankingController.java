package com.photo_critique_be.controller;

import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.ranking.RankingResponse;
import com.photo_critique_be.dto.response.ranking.UserRankingResponse;
import com.photo_critique_be.enums.RankingPeriod;
import com.photo_critique_be.enums.RankingType;
import com.photo_critique_be.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    /**
     * Lấy ranking người dùng theo XP
     * GET /api/rankings/users/xp?period=WEEK&limit=10&page=0
     */
    @GetMapping("/users/xp")
    public ResponseEntity<ApiResponse<RankingResponse>> getUserXPRanking(
            @RequestParam(defaultValue = "WEEK") RankingPeriod period,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer page
    ) {
        RankingResponse response = rankingService.getRanking(RankingType.USER_XP, period, limit, page);
        return ResponseEntity.ok(ApiResponse.success(response, 
                "Ranking retrieved successfully"));
    }

    /**
     * Lấy ranking posts theo số lượt reactions
     * GET /api/rankings/posts/reactions?period=MONTH&limit=50&page=0
     */
    @GetMapping("/posts/reactions")
    public ResponseEntity<ApiResponse<RankingResponse>> getPostReactionsRanking(
            @RequestParam(defaultValue = "WEEK") RankingPeriod period,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer page
    ) {
        RankingResponse response = rankingService.getRanking(RankingType.POST_REACTIONS, period, limit, page);
        return ResponseEntity.ok(ApiResponse.success(response, 
                "Ranking retrieved successfully"));
    }

    /**
     * Lấy ranking posts theo số lượt comments
     * GET /api/rankings/posts/comments?period=YEAR&limit=100&page=0
     */
    @GetMapping("/posts/comments")
    public ResponseEntity<ApiResponse<RankingResponse>> getPostCommentsRanking(
            @RequestParam(defaultValue = "WEEK") RankingPeriod period,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer page
    ) {
        RankingResponse response = rankingService.getRanking(RankingType.POST_COMMENTS, period, limit, page);
        return ResponseEntity.ok(ApiResponse.success(response, 
                "Ranking retrieved successfully"));
    }

    /**
     * Force refresh ranking
     * POST /api/rankings/refresh?type=USER_XP&period=WEEK
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshRanking(
            @RequestParam RankingType type,
            @RequestParam RankingPeriod period
    ) {
        rankingService.calculateAndSaveRanking(type, period);
        return ResponseEntity.ok(ApiResponse.success("Ranking refreshed successfully", 
                "Ranking refreshed successfully"));
    }

    /**
     * Force refresh all rankings (tất cả types và periods)
     * POST /api/rankings/refresh-all
     */
    @PostMapping("/refresh-all")
    public ResponseEntity<ApiResponse<String>> refreshAllRankings() {
        String result = rankingService.refreshAllRankings();
        return ResponseEntity.ok(ApiResponse.success("Ranking refresh completed", result));
    }

    /**
     * Lấy ranking của một user cụ thể theo user ID
     * GET /api/rankings/users/{userId}/xp?period=WEEK
     */
    @GetMapping("/users/{userId}/xp")
    public ResponseEntity<ApiResponse<UserRankingResponse>> getUserRankingByUserId(
            @PathVariable String userId,
            @RequestParam(defaultValue = "WEEK") RankingPeriod period
    ) {
        UserRankingResponse response = rankingService.getUserRankingByUserId(userId, RankingType.USER_XP, period);
        if (response == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "User not found in ranking"));
        }
        return ResponseEntity.ok(ApiResponse.success(response, "User ranking retrieved successfully"));
    }
}

