package com.photo_critique_be.repository;

import com.photo_critique_be.enums.FollowStatus;
import com.photo_critique_be.model.Follow;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FollowRepository extends MongoRepository<Follow, String> {
    long countByFollowingIdAndStatus(String followingId, FollowStatus status);
    long countByFollowerIdAndStatus(String followerId, FollowStatus status);
}
