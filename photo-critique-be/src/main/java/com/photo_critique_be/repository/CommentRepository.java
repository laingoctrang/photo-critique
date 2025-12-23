package com.photo_critique_be.repository;

import com.photo_critique_be.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    Page<Comment> findByPostIdAndParentCommentIdIsNullOrderByCreatedAtDesc(String postId, Pageable pageable);
    Page<Comment> findByPostIdOrderByCreatedAtDesc(String postId, Pageable pageable);
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId);
    List<Comment> findByParentCommentId(String parentCommentId);
    long countByPostId(String postId);
    Optional<Comment> findByIdAndUserId(String id, String userId);
    int deleteByPostId(String postId);
    
    // Find comments by post_id and original_image
    Page<Comment> findByPostIdAndOriginalImageAndParentCommentIdIsNullOrderByCreatedAtDesc(
        String postId, 
        String originalImage, 
        Pageable pageable
    );
}

