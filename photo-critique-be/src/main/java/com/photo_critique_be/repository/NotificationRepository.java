package com.photo_critique_be.repository;

import com.photo_critique_be.enums.NotificationType;
import com.photo_critique_be.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUserIdAndIsReadFalse(String userId);
    void deleteByUserId(String userId);
    boolean existsByUserIdAndTypeAndRelatedPostIdAndRelatedUserId(String userId, NotificationType type, String postId, String relatedUserId);
    int deleteByRelatedPostId(String postId);
}

