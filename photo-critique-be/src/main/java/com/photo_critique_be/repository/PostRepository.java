package com.photo_critique_be.repository;

import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    Page<Post> findByUserIdAndPrivacyInOrderByCreatedAtDesc(String userId, List<PrivacyType> privacyTypes, Pageable pageable);
    Page<Post> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUserId(String userId);
}

