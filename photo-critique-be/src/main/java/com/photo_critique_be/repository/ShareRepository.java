package com.photo_critique_be.repository;

import com.photo_critique_be.model.Share;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShareRepository extends MongoRepository<Share, String> {
    boolean existsByUserIdAndPostId(String userId, String postId);
    long countByPostId(String postId);
    long countByOriginalPostId(String originalPostId);
    Page<Share> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
}

