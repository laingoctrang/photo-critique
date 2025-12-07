package com.photo_critique_be.event.listener;

import com.photo_critique_be.event.PostDeletedEvent;
import com.photo_critique_be.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostDeletionEventListener {

    private final CommentRepository commentRepository;
    private final SavedPostRepository savedPostRepository;
    private final XPEventRepository xpEventRepository;
    private final NotificationRepository notificationRepository;

    @EventListener
    @Async("taskExecutor")
    @Transactional
    public void handlePostDeletedEvent(PostDeletedEvent event) {
        String postId = event.getPostId();

        log.info("Processing post deletion cleanup for post: {}", postId);

        try {
            // delete comments
            int deletedComments = commentRepository.deleteByPostId(postId);
            log.info("Soft deleted {} comments for post: {}", deletedComments, postId);

            // delete saved posts references
            int deletedSavedPosts = savedPostRepository.deleteByPostId(postId);
            log.info("Deleted {} saved post references for post: {}", deletedSavedPosts, postId);

            // 3. Xóa notifications về post này
            int deletedNotifications = notificationRepository.deleteByRelatedPostId(postId);
            log.info("Deleted {} notifications for post: {}", deletedNotifications, postId);

            // keep XP events to tracking
            log.info("XP events preserved for post: {} for analytics", postId);

            log.info("Successfully cleaned up related data for post: {}", postId);

        } catch (Exception e) {
            log.error("Failed to clean up related data for post {}: {}", postId, e.getMessage());
            // Có thể gửi notification cho admin hoặc retry logic
        }
    }
}