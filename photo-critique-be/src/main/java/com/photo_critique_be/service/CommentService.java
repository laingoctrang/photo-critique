package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.comment.CreateCommentRequest;
import com.photo_critique_be.dto.request.comment.UpdateCommentRequest;
import com.photo_critique_be.dto.response.comment.CommentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    CommentResponse createComment(String postId, CreateCommentRequest request);
    CommentResponse updateComment(String commentId, UpdateCommentRequest request);
    void deleteComment(String commentId);
    Page<CommentResponse> getCommentsByPostId(String postId, Pageable pageable);
    void markCommentAsHelpful(String commentId);
    void likeComment(String commentId);
    void unlikeComment(String commentId);
}

