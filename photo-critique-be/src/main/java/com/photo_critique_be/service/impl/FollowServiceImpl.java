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

import java.util.Optional;

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
}
