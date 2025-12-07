package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.post.AddReactionRequest;
import com.photo_critique_be.dto.request.post.CreatePostRequest;
import com.photo_critique_be.dto.request.post.SharePostRequest;
import com.photo_critique_be.dto.request.post.UpdatePostRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.post.PostListItemResponse;
import com.photo_critique_be.dto.response.post.PostResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.model.Post;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final LanguageService languageService;

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@Valid @RequestBody CreatePostRequest request) {
        PostResponse response = postService.createPost(request);
        return ResponseEntity.ok(ApiResponse.created(response, languageService.getMessage(MessageCode.POST_CREATED_SUCCESS)));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable String postId,
            @Valid @RequestBody UpdatePostRequest request) {
        PostResponse response = postService.updatePost(postId, request);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.POST_UPDATED_SUCCESS)));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable String postId) {
        postService.softDeletePost(postId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.POST_SOFT_DELETED_SUCCESS)));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable String postId) {
        PostResponse response = postService.getPostById(postId);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.POST_GET_SUCCESS)));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<PostListItemResponse>>> getFeed(
            @PageableDefault(size = 20) Pageable pageable) {
        List<PostListItemResponse> response = postService.getFeed(pageable);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.POST_FEED_SUCCESS)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<PostListItemResponse>>> getPostsByUserId(
            @PathVariable String userId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PostListItemResponse> response = postService.getPostsByUserId(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.POST_GET_SUCCESS)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<PostListItemResponse>>> getMyPosts(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PostListItemResponse> response = postService.getMyPosts(pageable);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.POST_GET_SUCCESS)));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<Page<PostListItemResponse>>> getSavedPosts(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PostListItemResponse> response = postService.getSavedPosts(pageable);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.POST_SAVED_GET_SUCCESS)));
    }

    @PostMapping("/{postId}/save")
    public ResponseEntity<ApiResponse<Void>> savePost(@PathVariable String postId) {
        postService.savePost(postId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.POST_SAVED_SUCCESS)));
    }

    @DeleteMapping("/{postId}/save")
    public ResponseEntity<ApiResponse<Void>> unsavePost(@PathVariable String postId) {
        postService.unsavePost(postId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.POST_UNSAVED_SUCCESS)));
    }

    @PostMapping("/{postId}/reaction")
    public ResponseEntity<ApiResponse<Void>> addReaction(
            @PathVariable String postId,
            @Valid @RequestBody AddReactionRequest request) {
        postService.addReaction(postId, request);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.POST_REACTION_ADDED)));
    }

    @DeleteMapping("/{postId}/reaction")
    public ResponseEntity<ApiResponse<Void>> removeReaction(@PathVariable String postId) {
        postService.removeReaction(postId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.POST_REACTION_REMOVED)));
    }

    @PostMapping("/{postId}/share")
    public ResponseEntity<ApiResponse<PostResponse>> sharePost(
            @PathVariable String postId,
            @Valid @RequestBody SharePostRequest request) {
        PostResponse response = postService.sharePost(postId, request);
        return ResponseEntity.ok(ApiResponse.created(response, languageService.getMessage(MessageCode.POST_SHARED_SUCCESS)));
    }

    @PostMapping("/{postId}/restore")
    @PreAuthorize("hasRole('ADMIN') or @postService.isPostOwner(#postId, authentication.principal.id)")
    public ResponseEntity<ApiResponse<Void>> restorePost(@PathVariable String postId) {
        postService.restorePost(postId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.POST_RESTORED_SUCCESS)));
    }

    // Admin endpoints
    @GetMapping("/deleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<Post>>> getDeletedPosts(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Post> deletedPosts = postService.getDeletedPosts(pageable);
        return ResponseEntity.ok(ApiResponse.success(deletedPosts, languageService.getMessage(MessageCode.POST_DELETED_GET_SUCCESS)));
    }
}

