package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.post.AddReactionRequest;
import com.photo_critique_be.dto.request.post.CreatePostRequest;
import com.photo_critique_be.dto.request.post.SharePostRequest;
import com.photo_critique_be.dto.request.post.UpdatePostRequest;
import com.photo_critique_be.dto.response.post.PostListItemResponse;
import com.photo_critique_be.dto.response.post.PostResponse;
import com.photo_critique_be.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface PostService {
    PostResponse createPost(CreatePostRequest request);
    PostResponse updatePost(String postId, UpdatePostRequest request);
    void softDeletePost(String postId);
    PostResponse getPostById(String postId);
    List<PostListItemResponse> getFeed(Pageable pageable);
    Page<PostListItemResponse> getPostsByUserId(String userId, Pageable pageable);
    Page<PostListItemResponse> getMyPosts(Pageable pageable);
    Page<PostListItemResponse> getDraftPosts(Pageable pageable);
    Page<PostListItemResponse> getSavedPosts(Pageable pageable);
    void savePost(String postId);
    void unsavePost(String postId);
    void addReaction(String postId, AddReactionRequest request);
    void removeReaction(String postId);
    PostResponse sharePost(String postId, SharePostRequest request);
    Page<Post> getDeletedPosts(Pageable pageable);
    void restorePost(String postId);
    List<Post> getPostsDeletedBefore(LocalDateTime dateTime);
    void updatePostLikesCount(String postId);
    void hardDeletePost(String postId);
}

