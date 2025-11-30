package com.photo_critique_be.service;

import com.photo_critique_be.dto.FollowInfo;
import com.photo_critique_be.enums.FollowStatus;
import com.photo_critique_be.model.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface FollowService {

    FollowInfo resolveFollowInfo(String userId, String currentUserId);

    Optional<Follow> existingFollow(String currentUserId, String userId);

    Page<Follow> getFollowers(String userId, Pageable pageable);

    Page<Follow> getFollowing(String userId, Pageable pageable);

    // Requests sent by the user
    Page<Follow> getSentFollowRequests(String userId, FollowStatus status, Pageable pageable);

    // Requests received by the user
    Page<Follow> getReceivedFollowRequests(String userId, FollowStatus status, Pageable pageable);

    List<Follow> getFollowingList(String userId);
}
