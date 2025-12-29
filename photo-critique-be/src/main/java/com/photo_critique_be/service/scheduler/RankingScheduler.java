package com.photo_critique_be.service.scheduler;

import com.photo_critique_be.enums.RankingPeriod;
import com.photo_critique_be.enums.RankingType;
import com.photo_critique_be.service.RankingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class RankingScheduler {

    private final RankingService rankingService;

    /**
     * Chạy mỗi ngày lúc 0h00 để tính toán và cập nhật rankings
     * Cron expression: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 0 3 * * ?") // 0:00 AM every day
    @Transactional
    public void updateRankings() {
        log.info("Starting scheduled ranking update job...");

        try {
            // Tính toán rankings cho tất cả types và periods
            for (RankingType type : RankingType.values()) {
                for (RankingPeriod period : RankingPeriod.values()) {
                    try {
                        log.info("Calculating ranking: {} - {}", type, period);
                        rankingService.calculateAndSaveRanking(type, period);
                        log.info("Successfully calculated ranking: {} - {}", type, period);
                    } catch (Exception e) {
                        log.error("Error calculating ranking {} - {}: {}", type, period, e.getMessage(), e);
                    }
                }
            }

            log.info("Ranking update job completed successfully");
        } catch (Exception e) {
            log.error("Fatal error in ranking update job: {}", e.getMessage(), e);
        }
    }
}

