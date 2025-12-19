package com.photo_critique_be.service;

import com.photo_critique_be.dto.response.xp.XPEventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface XPEventService {
    void awardXP(String userId, String eventType, String postId, String commentId);
    Integer getUserTotalXP(String userId);
    List<XPEventResponse> getRecentXPEvents(String userId, int limit);
    Page<XPEventResponse> getAllXPEvents(String userId, Pageable pageable);
}
