package com.photo_critique_be.service;

import com.photo_critique_be.dto.response.ranking.RankingResponse;
import com.photo_critique_be.enums.RankingPeriod;
import com.photo_critique_be.enums.RankingType;

public interface RankingService {
    /**
     * Lấy ranking từ cache hoặc tính toán mới
     */
    RankingResponse getRanking(RankingType type, RankingPeriod period, Integer limit);

    /**
     * Tính toán và lưu ranking vào Redis và MongoDB
     */
    void calculateAndSaveRanking(RankingType type, RankingPeriod period);

    /**
     * Refresh all rankings (all types and periods)
     * @return Summary message with success and error counts
     */
    String refreshAllRankings();
}

