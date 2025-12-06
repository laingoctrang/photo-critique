package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.response.badge.BadgeEarnedResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.mapper.BadgeMapper;
import com.photo_critique_be.model.Badge;
import com.photo_critique_be.model.embedded.BadgeEarned;
import com.photo_critique_be.repository.BadgeRepository;
import com.photo_critique_be.service.BadgeService;
import com.photo_critique_be.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeServiceImpl implements BadgeService {

    private final BadgeRepository badgeRepository;
    private final BadgeMapper badgeMapper;
    private final LanguageService languageService;

    @Override
    public BadgeEarnedResponse getBadgeEarned(BadgeEarned badgeEarned) {
        Badge badge = badgeRepository.findById(badgeEarned.getBadgeId())
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.BADGE_NOT_FOUND)));
        return badgeMapper.toBadgeEarnedResponse(badge, badgeEarned);
    }

    @Override
    public List<BadgeEarnedResponse> getBadgesEarned(List<BadgeEarned> badgesEarned) {
        List<String> ids = badgesEarned.stream()
                .map(BadgeEarned::getBadgeId)
                .toList();
        List<Badge> badges = badgeRepository.findAllById(ids);
        if (badges.isEmpty()) {
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.BADGE_NOT_FOUND));
        }

        List<BadgeEarnedResponse> badgesEarnedResponse = badges.stream()
                .map(badge -> {
                    BadgeEarned badgeEarned = badgesEarned.stream()
                            .filter(be -> be.getBadgeId().equals(badge.getId()))
                            .findFirst()
                            .orElse(null);
                    return badgeMapper.toBadgeEarnedResponse(badge, badgeEarned);
                })
                .toList();

        return badgesEarnedResponse;
    }
}
