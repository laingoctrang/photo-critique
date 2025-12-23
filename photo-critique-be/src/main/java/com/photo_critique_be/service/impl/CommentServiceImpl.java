package com.photo_critique_be.service.impl;

import com.photo_critique_be.constant.XPEventConstant;
import com.photo_critique_be.dto.FollowInfo;
import com.photo_critique_be.dto.request.comment.CreateCommentRequest;
import com.photo_critique_be.dto.request.comment.UpdateCommentRequest;
import com.photo_critique_be.dto.response.comment.CommentResponse;
import com.photo_critique_be.dto.response.user.UserPostResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.NotificationType;
import com.photo_critique_be.exception.AuthorizationException;
import com.photo_critique_be.exception.ConflictException;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.exception.ValidationException;
import com.photo_critique_be.mapper.UserMapper;
import com.photo_critique_be.model.Comment;
import com.photo_critique_be.model.Post;
import com.photo_critique_be.model.User;
import com.photo_critique_be.repository.CommentRepository;
import com.photo_critique_be.repository.PostRepository;
import com.photo_critique_be.repository.UserRepository;
import com.photo_critique_be.service.*;
import com.photo_critique_be.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FollowService followService;
    private final NotificationService notificationService;
    private final LanguageService languageService;
    private final UserMapper userMapper;
    private final XPEventService xpEventService;
    private final UserService userService;

    @Override
    @Transactional
    public CommentResponse createComment(String postId, CreateCommentRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.POST_NOT_FOUND)));

        // Validate AI image usage
        if (request.getAiGeneratedImage() != null && request.getParentCommentId() != null) {
            throw new ValidationException(
                    languageService.getMessage(MessageCode.COMMENT_AI_NOT_ALLOWED_FOR_REPLY));
        }

        // If parent comment exists, validate it
        if (request.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            languageService.getMessage(MessageCode.COMMENT_NOT_FOUND)));
            if (!parentComment.getPostId().equals(postId)) {
                throw new ValidationException(
                        languageService.getMessage(MessageCode.COMMENT_PARENT_MISMATCH));
            }
        }

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(currentUserId);
        comment.setContent(request.getContent());
        comment.setParentCommentId(request.getParentCommentId());
        comment.setAiGeneratedImage(request.getAiGeneratedImage());
        comment.setOriginalImage(request.getOriginalImage());
        comment.setIsHelpful(false);
        comment.setLikesCount(0);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        comment = commentRepository.save(comment);

        // Update post comments count
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        // Notify post owner (if not own comment)
        if (!post.getUserId().equals(currentUserId)) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                String message = String.format("%s commented on your post", currentUser.getUsername());
                notificationService.createNotification(
                        post.getUserId(),
                        NotificationType.COMMENT,
                        currentUserId,
                        postId,
                        comment.getId(),
                        message
                );
            }
        }

        // Notify parent comment owner if this is a reply
        if (request.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(request.getParentCommentId()).orElse(null);
            if (parentComment != null && !parentComment.getUserId().equals(currentUserId)) {
                User currentUser = userRepository.findById(currentUserId).orElse(null);
                if (currentUser != null) {
                    String message = String.format("%s replied to your comment", currentUser.getUsername());
                    notificationService.createNotification(
                            parentComment.getUserId(),
                            NotificationType.COMMENT,
                            currentUserId,
                            postId,
                            comment.getId(),
                            message
                    );
                }
            }
        }

        return buildCommentResponse(comment, currentUserId);
    }

    @Override
    @Transactional
    public CommentResponse updateComment(String commentId, UpdateCommentRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.COMMENT_NOT_FOUND)));

        if (!comment.getUserId().equals(currentUserId)) {
            throw new AuthorizationException(
                    languageService.getMessage(MessageCode.COMMENT_UPDATE_UNAUTHORIZED));
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        comment = commentRepository.save(comment);

        return buildCommentResponse(comment, currentUserId);
    }

    @Override
    @Transactional
    public void deleteComment(String commentId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.COMMENT_NOT_FOUND)));

        if (!comment.getUserId().equals(currentUserId)) {
            throw new AuthorizationException(
                    languageService.getMessage(MessageCode.COMMENT_DELETE_UNAUTHORIZED));
        }

        // Update post comments count
        Post post = postRepository.findById(comment.getPostId()).orElse(null);
        if (post != null) {
            post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
            postRepository.save(post);
        }

        // Delete replies if any
        List<Comment> replies = commentRepository.findByParentCommentId(commentId);
        commentRepository.deleteAll(replies);

        commentRepository.delete(comment);
    }

    @Override
    public Page<CommentResponse> getCommentsByPostId(String postId, Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND)));

        // Get top-level comments (no parent)
        Page<Comment> topLevelComments = commentRepository.findByPostIdAndParentCommentIdIsNullOrderByCreatedAtDesc(postId, pageable);

        List<CommentResponse> responses = topLevelComments.getContent().stream()
                .map(comment -> {
                    CommentResponse response = buildCommentResponse(comment, currentUserId);
                    // Get replies
                    List<Comment> replies = commentRepository.findByParentCommentId(comment.getId());
                    List<CommentResponse> replyResponses = replies.stream()
                            .map(reply -> buildCommentResponse(reply, currentUserId))
                            .collect(Collectors.toList());
                    response.setReplies(replyResponses);
                    return response;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, topLevelComments.getTotalElements());
    }

    @Override
    public Page<CommentResponse> getCommentsByPostIdAndOriginalImage(String postId, String originalImage, Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND)));

        // Get top-level comments (no parent) filtered by original_image
        Page<Comment> topLevelComments = commentRepository.findByPostIdAndOriginalImageAndParentCommentIdIsNullOrderByCreatedAtDesc(
                postId, originalImage, pageable);

        List<CommentResponse> responses = topLevelComments.getContent().stream()
                .map(comment -> {
                    CommentResponse response = buildCommentResponse(comment, currentUserId);
                    // Get replies
                    List<Comment> replies = commentRepository.findByParentCommentId(comment.getId());
                    List<CommentResponse> replyResponses = replies.stream()
                            .map(reply -> buildCommentResponse(reply, currentUserId))
                            .collect(Collectors.toList());
                    response.setReplies(replyResponses);
                    return response;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, topLevelComments.getTotalElements());
    }

    @Override
    @Transactional
    public void markCommentAsHelpful(String commentId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.COMMENT_NOT_FOUND)));

        Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.POST_NOT_FOUND)));

        // Only post owner can mark comment as helpful
        if (!post.getUserId().equals(currentUserId)) {
            throw new AuthorizationException(
                    languageService.getMessage(MessageCode.COMMENT_MARK_HELPFUL_UNAUTHORIZED));
        }

        if (comment.getIsHelpful()) {
            throw new ConflictException(
                    languageService.getMessage(MessageCode.COMMENT_ALREADY_HELPFUL));
        }

        comment.setIsHelpful(true);
        commentRepository.save(comment);

        // Award XP to comment author
        xpEventService.awardXP(comment.getUserId(), XPEventConstant.COMMENT_HELPFUL, comment.getPostId(), commentId);

        // Notify comment author
        User postOwner = userRepository.findById(currentUserId).orElse(null);
        if (postOwner != null) {
            String message = String.format("%s marked your comment as helpful", postOwner.getUsername());
            notificationService.createNotification(
                    comment.getUserId(),
                    NotificationType.COMMENT,
                    currentUserId,
                    comment.getPostId(),
                    commentId,
                    message
            );
        }
    }

    @Override
    @Transactional
    public void likeComment(String commentId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.COMMENT_NOT_FOUND)));

        // Increase likes count
        comment.setLikesCount(comment.getLikesCount() + 1);
        commentRepository.save(comment);
    }

    @Override
    @Transactional
    public void unlikeComment(String commentId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.COMMENT_NOT_FOUND)));

        if (comment.getLikesCount() > 0) {
            comment.setLikesCount(comment.getLikesCount() - 1);
            commentRepository.save(comment);
        }
    }

    // Helper methods

    private CommentResponse buildCommentResponse(Comment comment, String currentUserId) {
        User commentUser = userService.getUserById(comment.getUserId());

        FollowInfo followInfo = followService.resolveFollowInfo(comment.getUserId(), currentUserId);
        UserPostResponse userResponse = userMapper.toUserPostResponse(commentUser, followInfo);

        // Track individual likes
        boolean isLiked = false;

        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .user(userResponse)
                .content(comment.getContent())
                .aiGeneratedImage(comment.getAiGeneratedImage())
                .originalImage(comment.getOriginalImage())
                .parentCommentId(comment.getParentCommentId())
                .isHelpful(comment.getIsHelpful())
                .likesCount(comment.getLikesCount())
                .isLiked(isLiked)
                .replies(new ArrayList<>())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

}

