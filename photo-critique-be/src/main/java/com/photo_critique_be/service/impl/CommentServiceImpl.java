package com.photo_critique_be.service.impl;

import com.photo_critique_be.constant.XPEventConstant;
import com.photo_critique_be.dto.FollowInfo;
import com.photo_critique_be.dto.request.comment.CreateCommentRequest;
import com.photo_critique_be.dto.request.comment.UpdateCommentRequest;
import com.photo_critique_be.dto.response.comment.CommentResponse;
import com.photo_critique_be.dto.response.user.UserPostResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.NotificationType;
import com.photo_critique_be.enums.ReactionTargetType;
import com.photo_critique_be.enums.ReactionType;
import com.photo_critique_be.exception.AuthorizationException;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.exception.ValidationException;
import com.photo_critique_be.mapper.UserMapper;
import com.photo_critique_be.model.Comment;
import com.photo_critique_be.model.Post;
import com.photo_critique_be.model.Reaction;
import com.photo_critique_be.model.User;
import com.photo_critique_be.repository.CommentRepository;
import com.photo_critique_be.repository.PostRepository;
import com.photo_critique_be.repository.ReactionRepository;
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
    private final ReactionRepository reactionRepository;
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
        comment.setAiGeneratedImage(request.getAiGeneratedImage());
        comment.setOriginalImage(request.getOriginalImage());
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

        // Check if comment has replies (not deleted ones)
        List<Comment> replies = commentRepository.findByParentCommentIdAndIsDeleteFalse(commentId);
        
        if (comment.getIsHelpful()) {
            xpEventService.deductXP(comment.getUserId(), XPEventConstant.COMMENT_HELPFUL, "", commentId);
        }

        if (!replies.isEmpty()) {
            // Soft delete: has replies, only mark as deleted
            comment.setIsDelete(true);
            comment.setContent("[Comment has been deleted]");
            comment.setAiGeneratedImage(null);
            comment.setOriginalImage(null);
            comment.setLikesCount(0);
            comment.setIsHelpful(false);
            comment.setUserId(null);
            comment.setUpdatedAt(LocalDateTime.now());
            commentRepository.save(comment);
        } else {
            // Hard delete: no replies, delete completely
            commentRepository.delete(comment);
            
            // Cascade delete: Check if parent comment should be deleted
            if (comment.getParentCommentId() != null) {
                cascadeDeleteParentIfNeeded(comment.getParentCommentId());
            }
        }

        // Update post comments count
        Post post = postRepository.findById(comment.getPostId()).orElse(null);
        if (post != null) {
            post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
            postRepository.save(post);
        }
    }
    
    /**
     * Cascade delete parent comment if it's soft-deleted and has no more replies
     */
    private void cascadeDeleteParentIfNeeded(String parentCommentId) {
        Comment parentComment = commentRepository.findById(parentCommentId).orElse(null);
        
        if (parentComment != null && parentComment.getIsDelete()) {
            // Check if parent has any remaining replies
            List<Comment> remainingReplies = commentRepository.findByParentCommentIdAndIsDeleteFalse(parentCommentId);
            
            if (remainingReplies.isEmpty()) {
                // No more replies, hard delete the parent
                commentRepository.delete(parentComment);
                log.info("Cascade deleted parent comment {} (was soft-deleted with no remaining replies)", parentCommentId);
                
                // Continue cascade if this parent also has a parent
                if (parentComment.getParentCommentId() != null) {
                    cascadeDeleteParentIfNeeded(parentComment.getParentCommentId());
                }
            }
        }
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
                    // Load all replies recursively
                    loadRepliesRecursively(response, currentUserId);
                    return response;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, topLevelComments.getTotalElements());
    }

    /**
     * Recursively load all replies for a comment at all nested levels
     */
    private void loadRepliesRecursively(CommentResponse comment, String currentUserId) {
        List<Comment> replies = commentRepository.findByParentCommentId(comment.getId());
        List<CommentResponse> replyResponses = replies.stream()
                .map(reply -> {
                    CommentResponse replyResponse = buildCommentResponse(reply, currentUserId);
                    // Recursively load replies for this reply
                    loadRepliesRecursively(replyResponse, currentUserId);
                    return replyResponse;
                })
                .collect(Collectors.toList());
        comment.setReplies(replyResponses);
    }

    @Override
    public Page<CommentResponse> getCommentsByPostIdAndOriginalImage(String postId, String originalImage, Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND)));

        // Get top-level comments (no parent) filtered by original_image - exclude deleted ones
        Page<Comment> topLevelComments = commentRepository.findByPostIdAndOriginalImageAndParentCommentIdIsNullAndIsDeleteFalseOrderByCreatedAtDesc(
                postId, originalImage, pageable);

        List<CommentResponse> responses = topLevelComments.getContent().stream()
                .map(comment -> {
                    CommentResponse response = buildCommentResponse(comment, currentUserId);
                    // Load all replies recursively - include all (deleted replies will be shown with special UI)
                    loadRepliesRecursively(response, currentUserId);
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

        // Toggle helpful status
        if (comment.getIsHelpful()) {
            // Unmark as helpful
            comment.setIsHelpful(false);
            commentRepository.save(comment);
            
            // Deduct XP from comment author
            xpEventService.deductXP(comment.getUserId(), XPEventConstant.COMMENT_HELPFUL, "", commentId);
        } else {
            // Mark as helpful
            comment.setIsHelpful(true);
            commentRepository.save(comment);

            // Award XP to comment author
            xpEventService.awardXP(comment.getUserId(), XPEventConstant.COMMENT_HELPFUL, null, commentId);

            // Notify comment author (marked)
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
    }

    @Override
    @Transactional
    public void likeComment(String commentId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.COMMENT_NOT_FOUND)));

        Reaction reaction = new Reaction();
        reaction.setUserId(currentUserId);
        reaction.setTargetId(commentId);
        reaction.setTargetType(ReactionTargetType.COMMENT);
        reaction.setReactionType(ReactionType.LIKE);
        reactionRepository.save(reaction);

        // Increase likes count
        comment.setLikesCount(comment.getLikesCount() + 1);
        commentRepository.save(comment);

        if (!currentUserId.equals(comment.getUserId())) {
            xpEventService.awardXP(comment.getUserId(), XPEventConstant.COMMENT_LIKED, null, commentId);
        }
    }

    @Override
    @Transactional
    public void unlikeComment(String commentId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.COMMENT_NOT_FOUND)));

        Reaction reaction = reactionRepository.findByUserIdAndTargetIdAndTargetType(currentUserId, commentId, ReactionTargetType.COMMENT)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.REACTION_NOT_FOUND)));
        reactionRepository.delete(reaction);

        if (comment.getLikesCount() > 0) {
            comment.setLikesCount(comment.getLikesCount() - 1);
            commentRepository.save(comment);
        }

        if (!currentUserId.equals(comment.getUserId())) {
            xpEventService.deductXP(comment.getUserId(), XPEventConstant.COMMENT_LIKED, "", commentId);
        }
    }

    // Helper methods

    private CommentResponse buildCommentResponse(Comment comment, String currentUserId) {
        User commentUser = null;
        if (!comment.getIsDelete()) {
            commentUser = userService.getUserById(comment.getUserId());
        }

        FollowInfo followInfo = null;
        if (commentUser != null) {
            followInfo = followService.resolveFollowInfo(commentUser.getId(), currentUserId);
        }
        
        UserPostResponse userResponse = null;
        if (commentUser != null) {
            userResponse = userMapper.toUserPostResponse(commentUser, followInfo);
        }

        // Check if current user liked this comment
        boolean isLiked = false;
        if (currentUserId != null) {
            isLiked = reactionRepository.findByUserIdAndTargetIdAndTargetType(
                    currentUserId, 
                    comment.getId(), 
                    ReactionTargetType.COMMENT
            ).isPresent();
        }

        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .user(userResponse)
                .content(comment.getContent())
                .aiGeneratedImage(comment.getAiGeneratedImage())
                .originalImage(comment.getOriginalImage())
                .parentCommentId(comment.getParentCommentId())
                .isHelpful(comment.getIsHelpful())
                .isDelete(comment.getIsDelete() != null ? comment.getIsDelete() : false)
                .likesCount(comment.getLikesCount())
                .isLiked(isLiked)
                .replies(new ArrayList<>())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

}

