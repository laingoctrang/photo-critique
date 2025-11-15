package com.photo_critique_be.service;

import com.photo_critique_be.dto.response.badge.BadgeEarnedResponse;
import com.photo_critique_be.model.embedded.BadgeEarned;

import java.util.List;

public interface BadgeService {
    BadgeEarnedResponse getBadgeEarned(BadgeEarned badgeEarned);
    List<BadgeEarnedResponse> getBadgesEarned(List<BadgeEarned> badgesEarned);
}
