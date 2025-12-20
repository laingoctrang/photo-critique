package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.badge.BadgeRequest;
import com.photo_critique_be.dto.request.common.FilterRequest;
import com.photo_critique_be.dto.response.badge.BadgeEarnedResponse;
import com.photo_critique_be.dto.response.badge.BadgeResponse;
import com.photo_critique_be.dto.response.common.PageResponse;
import com.photo_critique_be.model.embedded.BadgeEarned;

import java.util.List;

public interface BadgeService {
    BadgeEarnedResponse getBadgeEarned(BadgeEarned badgeEarned);
    List<BadgeEarnedResponse> getBadgesEarned(List<BadgeEarned> badgesEarned);
    
    // CRUD operations
    List<BadgeResponse> getAllBadges();
    PageResponse<BadgeResponse> getBadgesFiltered(FilterRequest filterRequest);
    BadgeResponse getBadgeById(String id);
    BadgeResponse createBadge(BadgeRequest request);
    BadgeResponse updateBadge(String id, BadgeRequest request);
    void deleteBadge(String id);
}
