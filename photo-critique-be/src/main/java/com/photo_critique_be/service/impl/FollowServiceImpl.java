package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.FollowInfo;
import com.photo_critique_be.enums.FollowStatus;
import com.photo_critique_be.model.Follow;
import com.photo_critique_be.repository.FollowRepository;
import com.photo_critique_be.service.FollowService;
import com.photo_critique_be.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;
    private final LanguageService languageService;

    @Override
    public Optional<Follow> existingFollow(String currentUserId, String userId) {
        return followRepository.findByFollowerIdAndFollowingId(currentUserId, userId);
    }

    @Override
    public FollowInfo resolveFollowInfo(String userId, String currentUserId) {
        if (userId.equals(currentUserId)) {
            return FollowInfo.ownProfile();
        }

        Optional<Follow> followRelation = existingFollow(currentUserId, userId);
        Optional<Follow> reverseFollowRelation = existingFollow(userId, currentUserId);

        return FollowInfo.builder()
                .isFollowing(followRelation.isPresent() && followRelation.get().getStatus() == FollowStatus.ACCEPTED)
                .isFollowedBy(reverseFollowRelation.isPresent() && reverseFollowRelation.get().getStatus() == FollowStatus.ACCEPTED)
                .followStatus(followRelation.map(f -> f.getStatus().name()).orElse(null))
                .build();
    }

    @Override
    public Page<Follow> getFollowers(String userId, Pageable pageable) {
        return followRepository.findByFollowingIdAndStatus(userId, FollowStatus.ACCEPTED, pageable);
    }

    @Override
    public Page<Follow> getFollowing(String userId, Pageable pageable) {
        return followRepository.findByFollowerIdAndStatus(userId, FollowStatus.ACCEPTED, pageable);
    }

    @Override
    public Page<Follow> getSentFollowRequests(String userId, FollowStatus status, Pageable pageable) {
        return followRepository.findByFollowerIdAndStatus(userId, status, pageable);
    }

    @Override
    public Page<Follow> getReceivedFollowRequests(String userId, FollowStatus status, Pageable pageable) {
        return followRepository.findByFollowingIdAndStatus(userId, status, pageable);
    }

    public List<Follow> getFollowingList(String followerId) {
        return followRepository.findByFollowerIdAndStatus(followerId, FollowStatus.ACCEPTED);
    }

    public List<String> getFollowingUserIds(String currentUserId) {
        // list user that current user is following
        List<Follow> follows = followRepository.findByFollowerIdAndStatus(currentUserId, FollowStatus.ACCEPTED);
        return follows.stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());
    }

    public Map<String, FollowInfo> getFollowInfoBatch(String currentUserId, List<String> targetUserIds) {
        if (targetUserIds.isEmpty()) {
            return Map.of();
        }

        // get follow from current user to target users
        List<Follow> followingRelations = followRepository.findByFollowerIdAndFollowingIdIn(currentUserId, targetUserIds);
        // get follow from target users to current user
        List<Follow> followerRelations = followRepository.findByFollowingIdAndFollowerIdIn(currentUserId, targetUserIds);

        Map<String, FollowInfo> result = new HashMap<>();
        for (String targetUserId : targetUserIds) {
            // is current user following target user
            boolean isFollowing = followingRelations.stream()
                    .anyMatch(f -> f.getFollowingId().equals(targetUserId) && f.getStatus() == FollowStatus.ACCEPTED);

            // is target user following current user
            boolean isFollowedBy = followerRelations.stream()
                    .anyMatch(f -> f.getFollowerId().equals(targetUserId) && f.getStatus() == FollowStatus.ACCEPTED);

            String status = followingRelations.stream()
                    .filter(f -> f.getFollowingId().equals(targetUserId))
                    .map(f -> f.getStatus().name())
                    .findFirst()
                    .orElse(null);

            result.put(targetUserId, new FollowInfo(isFollowing, isFollowedBy, status));
        }

        return result;
    }
}
