package com.photo_critique_be.repository;

import com.photo_critique_be.model.SavedPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedPostRepository extends MongoRepository<SavedPost, String> {
    Page<SavedPost> findByUserIdOrderBySavedAtDesc(String userId, Pageable pageable);
    boolean existsByUserIdAndPostId(String userId, String postId);
    void deleteByUserIdAndPostId(String userId, String postId);
    List<SavedPost> findByUserIdAndPostIdIn(String userId, List<String> postIds);
    int deleteByPostId(String postId);
}

