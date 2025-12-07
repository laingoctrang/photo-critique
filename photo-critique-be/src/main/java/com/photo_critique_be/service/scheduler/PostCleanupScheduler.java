package com.photo_critique_be.service.scheduler;

import com.photo_critique_be.model.Post;
import com.photo_critique_be.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostCleanupScheduler {

    private final PostService postService;

    /**
     * Chạy mỗi ngày lúc 2h sáng để xóa vĩnh viễn các post đã bị soft delete quá 30 ngày
     */
    @Scheduled(cron = "0 0 2 * * ?") // 2:00 AM every day
    @Transactional
    public void permanentlyDeleteOldSoftDeletedPosts() {
        log.info("Starting scheduled post cleanup job...");

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Post> postsToDelete = postService.getPostsDeletedBefore(thirtyDaysAgo);

        if (postsToDelete.isEmpty()) {
            log.info("No posts to permanently delete");
            return;
        }

        log.info("Found {} posts to permanently delete", postsToDelete.size());

        int successCount = 0;
        int failureCount = 0;

        for (Post post : postsToDelete) {
            try {
                postService.hardDeletePost(post.getId());
                successCount++;
                log.debug("Successfully permanently deleted post: {}", post.getId());
            } catch (Exception e) {
                failureCount++;
                log.error("Failed to permanently delete post {}: {}", post.getId(), e.getMessage());
            }
        }

        log.info("Post cleanup job completed. Success: {}, Failed: {}", successCount, failureCount);
    }

    /**
     * Health check - log số lượng post đã bị soft delete
     */
    @Scheduled(cron = "0 0 6 * * ?") // 6:00 AM every day
    public void logSoftDeleteStats() {
        // Có thể thêm logic đếm số post soft delete
        log.info("Soft delete stats logging - implement as needed");
    }
}
