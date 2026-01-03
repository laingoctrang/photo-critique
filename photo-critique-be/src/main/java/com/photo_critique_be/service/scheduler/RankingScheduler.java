package com.photo_critique_be.service.scheduler;

import com.photo_critique_be.enums.RankingPeriod;
import com.photo_critique_be.enums.RankingType;
import com.photo_critique_be.service.RankingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ranking Batch Jobs Scheduler
 * 
 * Implements calendar-based ranking calculations with three separate batch jobs:
 * 1. Daily Job: Recomputes WEEK and MONTH rankings (current week/month)
 * 2. Weekly Job: Recomputes YEAR rankings (current year)
 * 3. Monthly Job: Recomputes ALL-TIME rankings
 * 
 * All jobs are designed to be:
 * - Deterministic: Same input produces same output
 * - Idempotent: Safe to re-run multiple times
 * - Scalable: Handles large datasets efficiently
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RankingScheduler {

    private final RankingService rankingService;

    /**
     * Daily Job - Runs every day at 02:00 AM
     * Purpose: Keep short-term rankings (WEEK, MONTH) fresh
     * 
     * Recomputes:
     * - WEEK: Current week (Monday to Sunday)
     * - MONTH: Current month (1st to last day)
     * 
     * Cron expression format: second minute hour day month day-of-week
     * 0 0 2 * * ? = Every day at 02:00:00
     */
    @Scheduled(cron = "0 0 2 * * ?") // Daily at 02:00 AM
    @Transactional
    public void dailyRankingUpdate() {
        log.info("Starting daily ranking update job (WEEK, MONTH)...");

        try {
            int successCount = 0;
            int errorCount = 0;

            // Recompute WEEK and MONTH for all ranking types
            for (RankingType type : RankingType.values()) {
                // Update WEEK ranking (current week)
                try {
                    log.info("Calculating WEEK ranking: {}", type);
                    rankingService.calculateAndSaveRanking(type, RankingPeriod.WEEK);
                    successCount++;
                    log.info("Successfully calculated WEEK ranking: {}", type);
                } catch (Exception e) {
                    errorCount++;
                    log.error("Error calculating WEEK ranking {}: {}", type, e.getMessage(), e);
                }

                // Update MONTH ranking (current month)
                try {
                    log.info("Calculating MONTH ranking: {}", type);
                    rankingService.calculateAndSaveRanking(type, RankingPeriod.MONTH);
                    successCount++;
                    log.info("Successfully calculated MONTH ranking: {}", type);
                } catch (Exception e) {
                    errorCount++;
                    log.error("Error calculating MONTH ranking {}: {}", type, e.getMessage(), e);
                }
            }

            log.info("Daily ranking update job completed. Success: {}, Errors: {}", successCount, errorCount);
        } catch (Exception e) {
            log.error("Fatal error in daily ranking update job: {}", e.getMessage(), e);
        }
    }

    /**
     * Weekly Job - Runs every Sunday at 03:00 AM
     * Purpose: Maintain long-term accuracy for YEAR rankings with low cost
     * 
     * Recomputes:
     * - YEAR: Current year (January 1st to December 31st)
     * 
     * Cron expression: 0 0 3 ? * SUN = Every Sunday at 03:00:00
     */
    @Scheduled(cron = "0 0 3 ? * SUN") // Every Sunday at 03:00 AM
    @Transactional
    public void weeklyRankingUpdate() {
        log.info("Starting weekly ranking update job (YEAR)...");

        try {
            int successCount = 0;
            int errorCount = 0;

            // Recompute YEAR for all ranking types
            for (RankingType type : RankingType.values()) {
                try {
                    log.info("Calculating YEAR ranking: {}", type);
                    rankingService.calculateAndSaveRanking(type, RankingPeriod.YEAR);
                    successCount++;
                    log.info("Successfully calculated YEAR ranking: {}", type);
                } catch (Exception e) {
                    errorCount++;
                    log.error("Error calculating YEAR ranking {}: {}", type, e.getMessage(), e);
                }
            }

            log.info("Weekly ranking update job completed. Success: {}, Errors: {}", successCount, errorCount);
        } catch (Exception e) {
            log.error("Fatal error in weekly ranking update job: {}", e.getMessage(), e);
        }
    }

    /**
     * Monthly Job - Runs on the 1st day of each month at 04:00 AM
     * Purpose: Handle very slow-moving ALL-TIME rankings
     * 
     * Recomputes:
     * - ALL: All-time rankings (from 2000-01-01 to present)
     * 
     * Cron expression: 0 0 4 1 * ? = 1st day of every month at 04:00:00
     */
    @Scheduled(cron = "0 0 4 1 * ?") // 1st day of every month at 04:00 AM
    @Transactional
    public void monthlyRankingUpdate() {
        log.info("Starting monthly ranking update job (ALL-TIME)...");

        try {
            int successCount = 0;
            int errorCount = 0;

            // Recompute ALL-TIME for all ranking types
            for (RankingType type : RankingType.values()) {
                try {
                    log.info("Calculating ALL-TIME ranking: {}", type);
                    rankingService.calculateAndSaveRanking(type, RankingPeriod.ALL);
                    successCount++;
                    log.info("Successfully calculated ALL-TIME ranking: {}", type);
                } catch (Exception e) {
                    errorCount++;
                    log.error("Error calculating ALL-TIME ranking {}: {}", type, e.getMessage(), e);
                }
            }

            log.info("Monthly ranking update job completed. Success: {}, Errors: {}", successCount, errorCount);
        } catch (Exception e) {
            log.error("Fatal error in monthly ranking update job: {}", e.getMessage(), e);
        }
    }
}

