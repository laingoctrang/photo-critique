package com.photo_critique_be.service.impl;

import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.model.User;
import com.photo_critique_be.model.XPConfig;
import com.photo_critique_be.model.XPEvent;
import com.photo_critique_be.repository.UserRepository;
import com.photo_critique_be.repository.XPEventRepository;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.XPConfigService;
import com.photo_critique_be.service.XPEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class XPEventServiceImpl implements XPEventService {

    private final XPConfigService xpConfigService;
    private final XPEventRepository xpEventRepository;
    private final UserRepository userRepository;
    private final LanguageService languageService;

    @Transactional
    public void awardXP(String userId, String eventType, String postId, String commentId) {
        try {
            // Get points from config
            XPConfig config = xpConfigService.getConfig(eventType);
            int points = config.getPoints();

            // Create XP event
            XPEvent xpEvent = new XPEvent();
            xpEvent.setUserId(userId);
            xpEvent.setEventType(eventType);
            xpEvent.setPoints(points);
            xpEvent.setRelatedPostId(postId);
            xpEvent.setRelatedCommentId(commentId);

            xpEventRepository.save(xpEvent);

            // Update user's total XP and level
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

            int newXp = user.getXpPoints() + points;
            user.setXpPoints(newXp);
            user.setLevel(calculateLevel(newXp));
            userRepository.save(user);

            log.info("Awarded {} XP to user {} for {}", points, userId, eventType);

        } catch (Exception e) {
            log.error("Failed to award XP to user {} for {}: {}", userId, eventType, e.getMessage());
            throw new RuntimeException("Failed to award XP", e);
        }
    }

    public Integer getUserTotalXP(String userId) {
        return 0;
//        return xpEventRepository.sumPointsByUserId(userId).intValue();
    }

    private int calculateLevel(int xpPoints) {
        // Simple formula: level = sqrt(xp / 100)
        return Math.max(1, (int) Math.sqrt(xpPoints / 100.0));
    }
}