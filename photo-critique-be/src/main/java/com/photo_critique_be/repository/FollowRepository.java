package com.photo_critique_be.repository;

import com.photo_critique_be.enums.FollowStatus;
import com.photo_critique_be.model.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends MongoRepository<Follow, String> {
    long countByFollowingIdAndStatus(String followingId, FollowStatus status);
    long countByFollowerIdAndStatus(String followerId, FollowStatus status);
    
    Optional<Follow> findByFollowerIdAndFollowingId(String followerId, String followingId);
    
    Page<Follow> findByFollowerIdAndStatus(String followerId, FollowStatus status, Pageable pageable);
    Page<Follow> findByFollowingIdAndStatus(String followingId, FollowStatus status, Pageable pageable);
    
    boolean existsByFollowerIdAndFollowingIdAndStatus(String followerId, String followingId, FollowStatus status);

    List<Follow> findByFollowerIdOrFollowingIdIn(String followerId, List<String> followingIds);

    List<Follow> findByFollowerIdAndStatus(String followerId, FollowStatus status);
    List<Follow> findByFollowingIdAndStatus(String followingId, FollowStatus status);

    List<Follow> findByFollowerIdAndFollowingIdIn(String followerId, List<String> followingIds);
    List<Follow> findByFollowingIdAndFollowerIdIn(String followingId, List<String> followerIds);
}
