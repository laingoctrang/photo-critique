package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.comment.CreateCommentRequest;
import com.photo_critique_be.dto.request.comment.UpdateCommentRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.comment.CommentResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.service.CommentService;
import com.photo_critique_be.service.LanguageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final LanguageService languageService;

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable String postId,
            @Valid @RequestBody CreateCommentRequest request) {
        CommentResponse response = commentService.createComment(postId, request);
        return ResponseEntity.ok(ApiResponse.created(response, 
                languageService.getMessage(MessageCode.COMMENT_CREATED_SUCCESS)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getComments(
            @PathVariable String postId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<CommentResponse> response = commentService.getCommentsByPostId(postId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, 
                languageService.getMessage(MessageCode.COMMENT_GET_SUCCESS)));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @Valid @RequestBody UpdateCommentRequest request) {
        CommentResponse response = commentService.updateComment(commentId, request);
        return ResponseEntity.ok(ApiResponse.success(response, 
                languageService.getMessage(MessageCode.COMMENT_UPDATED_SUCCESS)));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok(ApiResponse.success(
                languageService.getMessage(MessageCode.COMMENT_DELETED_SUCCESS)));
    }

    @PostMapping("/{commentId}/helpful")
    public ResponseEntity<ApiResponse<Void>> markCommentAsHelpful(
            @PathVariable String postId,
            @PathVariable String commentId) {
        commentService.markCommentAsHelpful(commentId);
        return ResponseEntity.ok(ApiResponse.success(
                languageService.getMessage(MessageCode.COMMENT_MARKED_HELPFUL)));
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<ApiResponse<Void>> likeComment(
            @PathVariable String postId,
            @PathVariable String commentId) {
        commentService.likeComment(commentId);
        return ResponseEntity.ok(ApiResponse.success(
                languageService.getMessage(MessageCode.COMMENT_LIKED)));
    }

    @DeleteMapping("/{commentId}/like")
    public ResponseEntity<ApiResponse<Void>> unlikeComment(
            @PathVariable String postId,
            @PathVariable String commentId) {
        commentService.unlikeComment(commentId);
        return ResponseEntity.ok(ApiResponse.success(
                languageService.getMessage(MessageCode.COMMENT_UNLIKED)));
    }
}

