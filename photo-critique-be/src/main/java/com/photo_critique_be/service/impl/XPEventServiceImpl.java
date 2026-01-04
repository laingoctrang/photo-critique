package com.photo_critique_be.service.impl;

import com.photo_critique_be.constant.XPEventConstant;
import com.photo_critique_be.dto.response.xp.XPEventResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.mapper.XPEventMapper;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class XPEventServiceImpl implements XPEventService {

    private final XPConfigService xpConfigService;
    private final XPEventRepository xpEventRepository;
    private final UserRepository userRepository;
    private final LanguageService languageService;
    private final XPEventMapper xpEventMapper;

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
            int oldLevel = user.getLevel() != null ? user.getLevel() : 1;
            
            user.setXpPoints(newXp);
            int newLevel = calculateLevel(newXp);
            user.setLevel(newLevel);
            user.setXpToNextLevel(calculateXpToNextLevel(newXp, newLevel));
            
            // Log level up if level changed
            if (newLevel > oldLevel) {
                log.info("User {} leveled up from {} to {}!", userId, oldLevel, newLevel);
            }
            
            userRepository.save(user);

            log.info("Awarded {} XP to user {} for {}", points, userId, eventType);

        } catch (Exception e) {
            log.error("Failed to award XP to user {} for {}: {}", userId, eventType, e.getMessage());
//            throw new RuntimeException("Failed to award XP", e);
        }
    }

    @Transactional
    @Override
    public void deductXP(String userId, String eventType, String postId, String commentId) {
        try {
            // Find the XP event
            XPEvent xpEvent = null;
            if (!commentId.isEmpty()) {
                xpEvent = xpEventRepository.findByUserIdAndEventTypeAndRelatedCommentId(userId, eventType, commentId);
            }

            if (!postId.isEmpty()) {
                xpEvent = xpEventRepository.findByUserIdAndEventTypeAndRelatedPostId(userId, eventType, postId);
            }
            
            if (xpEvent == null) {
                log.warn("No XP event found for user {} with eventType {} and commentId/postId {}", userId, eventType, commentId.isEmpty() ? postId : commentId);
                return;
            }

            int points = xpEvent.getPoints();

            // Delete the XP event
            xpEventRepository.delete(xpEvent);

            // Update user's total XP and level
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

            int newXp = Math.max(0, user.getXpPoints() - points);
            int oldLevel = user.getLevel() != null ? user.getLevel() : 1;
            
            user.setXpPoints(newXp);
            int newLevel = calculateLevel(newXp);
            user.setLevel(newLevel);
            user.setXpToNextLevel(calculateXpToNextLevel(newXp, newLevel));
            
            // Log level down if level changed
            if (newLevel < oldLevel) {
                log.info("User {} leveled down from {} to {}", userId, oldLevel, newLevel);
            }
            
            userRepository.save(user);

            log.info("Deducted {} XP from user {} for {}", points, userId, eventType);

        } catch (Exception e) {
            log.error("Failed to deduct XP from user {} for {}: {}", userId, eventType, e.getMessage());
            throw new RuntimeException("Failed to deduct XP", e);
        }
    }

    public Integer getUserTotalXP(String userId) {
        return 0;
//        return xpEventRepository.sumPointsByUserId(userId).intValue();
    }

    @Override
    public List<XPEventResponse> getRecentXPEvents(String userId, int limit) {
        log.debug("Fetching recent XP events for user: {} with limit: {}", userId, limit);
        List<XPEvent> events = xpEventRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // Limit the results
        if (limit > 0 && events.size() > limit) {
            events = events.subList(0, limit);
        }
        
        return events.stream()
                .map(xpEventMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<XPEventResponse> getAllXPEvents(String userId, Pageable pageable) {
        log.debug("Fetching all XP events for user: {} with page: {}", userId, pageable.getPageNumber());
        Page<XPEvent> events = xpEventRepository.findByUserId(userId, pageable);
        return events.map(xpEventMapper::toResponse);
    }

    private int calculateLevel(int xpPoints) {
        // Progressive formula: Each level requires more XP than the previous
        // Formula: XP required for level N = BASE_XP * N * (N+1) / 2 (triangular numbers)
        // Level 1: 0-99 XP (100 XP total)
        // Level 2: 100-299 XP (200 XP more, 300 total)
        // Level 3: 300-599 XP (300 XP more, 600 total)
        // Level 4: 600-999 XP (400 XP more, 1000 total)
        // Level 5: 1000-1499 XP (500 XP more, 1500 total)
        // etc.
        // Max level is capped at MAX_LEVEL (30)
        if (xpPoints <= 0) {
            return 1;
        }
        
        int level = 1;
        
        while (level < XPEventConstant.MAX_LEVEL) {
            // Calculate XP required for next level
            // XP for level N = BASE_XP * N * (N+1) / 2
            int nextLevelXP = XPEventConstant.XP_PER_LEVEL * level * (level + 1) / 2;
            
            if (xpPoints < nextLevelXP) {
                return level;
            }
            
            level++;
        }
        
        // Return max level if XP exceeds max level requirement
        return XPEventConstant.MAX_LEVEL;
    }

    private Integer calculateXpToNextLevel(int xpPoints, int currentLevel) {
        // If user is at max level, return null (no next level)
        if (currentLevel >= XPEventConstant.MAX_LEVEL) {
            return null;
        }
        
        // Calculate XP required for next level
        int nextLevel = currentLevel + 1;
        int xpRequiredForNextLevel = XPEventConstant.XP_PER_LEVEL * nextLevel * (nextLevel + 1) / 2;
        
        // XP needed = XP required for next level - current XP
        int xpNeeded = xpRequiredForNextLevel - xpPoints;
        
        return Math.max(0, xpNeeded);
    }
}