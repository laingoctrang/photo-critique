package com.photo_critique_be.service;

public interface XPEventService {
    void awardXP(String userId, String eventType, String postId, String commentId);
    Integer getUserTotalXP(String userId);
}
