package com.photo_critique_be.service;

import com.photo_critique_be.enums.NotificationType;

public interface NotificationService {
    void createNotification(String userId, NotificationType type, String relatedUserId, 
                           String relatedPostId, String relatedCommentId, String message);
    void markAsRead(String notificationId);
    void markAllAsRead(String userId);
}

