package com.photo_critique_be.repository;

import com.photo_critique_be.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    // Original methods for backward compatibility
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
    
    // New methods with isDelete filter
    Page<Comment> findByPostIdAndParentCommentIdIsNullAndIsDeleteFalseOrderByCreatedAtDesc(String postId, Pageable pageable);
    Page<Comment> findByPostIdAndOriginalImageAndParentCommentIdIsNullAndIsDeleteFalseOrderByCreatedAtDesc(
        String postId, 
        String originalImage, 
        Pageable pageable
    );
    List<Comment> findByParentCommentIdAndIsDeleteFalse(String parentCommentId);
}

