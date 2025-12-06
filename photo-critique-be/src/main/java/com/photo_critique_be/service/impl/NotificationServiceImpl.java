package com.photo_critique_be.service.impl;

import com.photo_critique_be.enums.NotificationType;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.model.Notification;
import com.photo_critique_be.repository.NotificationRepository;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.NotificationService;
import com.photo_critique_be.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final LanguageService languageService;

    @Override
    @Transactional
    public void createNotification(String userId, NotificationType type, String relatedUserId,
                                   String relatedPostId, String relatedCommentId, String message) {
        // Avoid duplicate notifications (e.g., multiple likes from same user)
        if (relatedPostId != null && relatedUserId != null) {
            boolean exists = notificationRepository.existsByUserIdAndTypeAndRelatedPostIdAndRelatedUserId(
                    userId, type, relatedPostId, relatedUserId);
            if (exists && (type == NotificationType.LIKE || type == NotificationType.COMMENT)) {
                return; // Skip duplicate notification
            }
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setRelatedUserId(relatedUserId);
        notification.setRelatedPostId(relatedPostId);
        notification.setRelatedCommentId(relatedCommentId);
        notification.setMessage(message);
        notification.setIsRead(false);

        notificationRepository.save(notification);
        log.info("Notification created: type={}, userId={}", type, userId);
    }

    @Override
    @Transactional
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(com.photo_critique_be.enums.MessageCode.NOTIFICATION_NOT_FOUND)));
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userId) {
        // This would require a bulk update query in a real implementation
        // For now, we'll fetch and update
        notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, 
                org.springframework.data.domain.Pageable.unpaged())
                .getContent()
                .forEach(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                });
    }
}

