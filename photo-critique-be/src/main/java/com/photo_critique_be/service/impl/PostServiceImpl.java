package com.photo_critique_be.service.impl;

import com.photo_critique_be.constant.XPEventConstant;
import com.photo_critique_be.dto.request.post.AddReactionRequest;
import com.photo_critique_be.dto.request.post.CreatePostRequest;
import com.photo_critique_be.dto.request.post.SharePostRequest;
import com.photo_critique_be.dto.request.post.UpdatePostRequest;
import com.photo_critique_be.dto.response.post.PostListItemResponse;
import com.photo_critique_be.dto.response.post.PostResponse;
import com.photo_critique_be.dto.response.user.UserPostResponse;
import com.photo_critique_be.enums.*;
import com.photo_critique_be.event.PostDeletedEvent;
import com.photo_critique_be.exception.AuthorizationException;
import com.photo_critique_be.exception.BusinessException;
import com.photo_critique_be.exception.ConflictException;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.model.*;
import com.photo_critique_be.model.Reaction;
import com.photo_critique_be.repository.*;
import com.photo_critique_be.service.*;
import com.photo_critique_be.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SavedPostRepository savedPostRepository;
    private final ShareRepository shareRepository;
    private final FollowService followService;
    private final NotificationService notificationService;
    private final LanguageService languageService;
    private final XPEventService xpEventService;
    private final MongoTemplate mongoTemplate;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;
    private final ReactionRepository reactionRepository;

    @Override
    @Transactional
    public PostResponse createPost(CreatePostRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        User user = userService.getUserById(currentUserId);

        Post post = new Post();
        post.setUserId(currentUserId);
        post.setCaption(request.getCaption());
        post.setImageUrls(request.getImageUrls());
        post.setPrivacy(request.getPrivacy());
        post.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());
        // Set status from request, default to POSTED
        post.setStatus(request.getStatus() != null ? request.getStatus() : PostStatus.POSTED);

        post = postRepository.save(post);

        // Award XP for public posts that are POSTED (not drafts)
        if (request.getPrivacy() == PrivacyType.PUBLIC && post.getStatus() == PostStatus.POSTED) {
            xpEventService.awardXP(currentUserId, XPEventConstant.POST_CREATED, post.getId(), null);
        }

        // Notify followers about new post (only if POSTED)
        if (post.getStatus() == PostStatus.POSTED) {
            notifyFollowersAboutNewPost(user, post);
        }

        return buildPostResponse(post, currentUserId);
    }

    @Override
    @Transactional
    public PostResponse updatePost(String postId, UpdatePostRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Post post = postRepository.findByIdAndStatusIn(postId, 
                List.of(PostStatus.DRAFTED, PostStatus.POSTED, PostStatus.PENDING_APPROVAL, PostStatus.PENDING))
                .orElseGet(() -> postRepository.findByIdAndIsDeletedFalse(postId)
                        .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND))));

        if (!post.getUserId().equals(currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.POST_UPDATE_UNAUTHORIZED));
        }

        if (request.getCaption() != null) {
            post.setCaption(request.getCaption());
        }
        if (request.getPrivacy() != null) {
            post.setPrivacy(request.getPrivacy());
        }
        if (request.getTags() != null) {
            post.setTags(request.getTags());
        }
        if (request.getStatus() != null) {
            PostStatus oldStatus = post.getStatus();
            post.setStatus(request.getStatus());
            
            // Award XP if status changed from DRAFTED/PENDING to POSTED and is public
            if (oldStatus != PostStatus.POSTED && request.getStatus() == PostStatus.POSTED 
                    && post.getPrivacy() == PrivacyType.PUBLIC) {
                xpEventService.awardXP(currentUserId, XPEventConstant.POST_CREATED, post.getId(), null);
            }
            
            // Notify followers if status changed to POSTED
            if (oldStatus != PostStatus.POSTED && request.getStatus() == PostStatus.POSTED) {
                User user = userService.getUserById(currentUserId);
                notifyFollowersAboutNewPost(user, post);
            }
        }
        post.setUpdatedAt(LocalDateTime.now());

        post = postRepository.save(post);
        return buildPostResponse(post, currentUserId);
    }

    @Override
    public PostResponse getPostById(String postId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        // Allow getting draft posts if user is the owner
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND)));
        
        // Check if post is deleted
        if (post.getIsDeleted() != null && post.getIsDeleted()) {
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND));
        }
        
        // Allow owner to view their own drafts
        if (post.getStatus() == PostStatus.DRAFTED && !post.getUserId().equals(currentUserId)) {
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND));
        }
        
        // Check if user can view this post (for non-draft posts)
        if (post.getStatus() != PostStatus.DRAFTED && !canViewPost(post, currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.POST_VIEW_UNAUTHORIZED));
        }

        return buildPostResponse(post, currentUserId);
    }

    @Override
    public List<PostListItemResponse> getFeed(Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        List<Follow> follows = followService.getFollowingList(currentUserId);
        List<String> followingIds = follows.stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());
        followingIds.add(currentUserId); // add current user

        List<String> allowedPrivacy = List.of(PrivacyType.PUBLIC.name(), PrivacyType.FOLLOWER_ONLY.name());
        
        // Only show POSTED posts in feed
        List<PostStatus> allowedStatuses = List.of(PostStatus.POSTED);

        return postRepository.findFeedWithAggregation(currentUserId, followingIds, allowedPrivacy, allowedStatuses, pageable);
    }

    @Override
    public Page<PostListItemResponse> getPostsByUserId(String userId, Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        // Check if current user can view this user's posts
        userService.getUserById(userId);

        List<PrivacyType> privacyTypes;
        List<PostStatus> allowedStatuses;
        
        if (userId.equals(currentUserId)) {
            // User can see all their own posts (including DRAFTED)
            privacyTypes = List.of(PrivacyType.PUBLIC, PrivacyType.PRIVATE, PrivacyType.FOLLOWER_ONLY);
            allowedStatuses = List.of(PostStatus.POSTED, PostStatus.PENDING_APPROVAL, PostStatus.PENDING);
        } else {
            // Check follow status
            Optional<Follow> follow = followService.existingFollow(currentUserId, userId);
            if (follow.isPresent() && follow.get().getStatus() == FollowStatus.ACCEPTED) {
                privacyTypes = List.of(PrivacyType.PUBLIC, PrivacyType.FOLLOWER_ONLY);
            } else {
                privacyTypes = List.of(PrivacyType.PUBLIC);
            }
            // Only show POSTED posts for other users
            allowedStatuses = List.of(PostStatus.POSTED);
        }

        Page<Post> posts = postRepository.findByUserIdAndStatusInOrderByCreatedAtDesc(
                userId, allowedStatuses, pageable);
        
        // Filter by privacy if needed
        List<Post> filteredPosts = posts.getContent().stream()
                .filter(post -> privacyTypes.contains(post.getPrivacy()))
                .collect(Collectors.toList());

        List<PostListItemResponse> responses = filteredPosts.stream()
                .map(post -> buildPostListItemResponse(post, currentUserId))
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, posts.getTotalElements());
    }

    @Override
    public Page<PostListItemResponse> getMyPosts(Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        return getPostsByUserId(currentUserId, pageable);
    }

    @Override
    public Page<PostListItemResponse> getDraftPosts(Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Page<Post> draftPosts = postRepository.findByUserIdAndStatusOrderByCreatedAtDesc(
                currentUserId, PostStatus.DRAFTED, pageable);
        
        List<PostListItemResponse> responses = draftPosts.getContent().stream()
                .map(post -> buildPostListItemResponse(post, currentUserId))
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, draftPosts.getTotalElements());
    }

    @Override
    public Page<PostListItemResponse> getSavedPosts(Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Page<SavedPost> savedPosts = savedPostRepository.findByUserIdOrderBySavedAtDesc(
                currentUserId, pageable);

        List<String> postIds = savedPosts.getContent().stream()
                .map(SavedPost::getPostId)
                .collect(Collectors.toList());

        // Get saved posts, only POSTED status (exclude drafts)
        List<Post> allPosts = postRepository.findAllById(postIds);
        List<Post> posts = allPosts.stream()
                .filter(post -> post.getIsDeleted() == null || !post.getIsDeleted())
                .filter(post -> post.getStatus() == PostStatus.POSTED || 
                               post.getStatus() == PostStatus.PENDING || 
                               post.getStatus() == PostStatus.PENDING_APPROVAL)
                .collect(Collectors.toList());
        
        // Sort by savedAt order
        posts.sort((p1, p2) -> {
            SavedPost sp1 = savedPosts.getContent().stream()
                    .filter(sp -> sp.getPostId().equals(p1.getId()))
                    .findFirst().orElse(null);
            SavedPost sp2 = savedPosts.getContent().stream()
                    .filter(sp -> sp.getPostId().equals(p2.getId()))
                    .findFirst().orElse(null);
            if (sp1 == null || sp2 == null) return 0;
            return sp2.getSavedAt().compareTo(sp1.getSavedAt());
        });

        List<PostListItemResponse> responses = posts.stream()
                .map(post -> buildPostListItemResponse(post, currentUserId))
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, savedPosts.getTotalElements());
    }

    @Override
    @Transactional
    public void savePost(String postId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Post post = getUndeletedPostById(postId);

        if (!canViewPost(post, currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.POST_VIEW_UNAUTHORIZED));
        }

        if (savedPostRepository.existsByUserIdAndPostId(currentUserId, postId)) {
            throw new ConflictException(languageService.getMessage(MessageCode.POST_ALREADY_SAVED));
        }

        SavedPost savedPost = new SavedPost();
        savedPost.setUserId(currentUserId);
        savedPost.setPostId(postId);
        savedPost.setSavedAt(LocalDateTime.now());
        savedPostRepository.save(savedPost);
    }

    @Override
    @Transactional
    public void unsavePost(String postId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        if (!savedPostRepository.existsByUserIdAndPostId(currentUserId, postId)) {
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_SAVED));
        }
        savedPostRepository.deleteByUserIdAndPostId(currentUserId, postId);
    }

    @Override
    @Transactional
    public void addReaction(String postId, AddReactionRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Post post = getUndeletedPostById(postId);

        if (!canViewPost(post, currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.POST_VIEW_UNAUTHORIZED));
        }

        // Check if user already has a reaction
        Optional<Reaction> oldReactionOpt = reactionRepository.findByUserIdAndTargetIdAndTargetType(currentUserId, postId, ReactionTargetType.POST);

        // If old reaction exists, delete it (to allow changing reaction type)
        if (oldReactionOpt.isPresent()) {
            Reaction oldReaction = oldReactionOpt.get();
            // If same reaction type, no need to update
            if (oldReaction.getReactionType() == request.getReactionType()) {
                return; // Already has the same reaction, no need to update
            }
            reactionRepository.delete(oldReaction);
        }

        // Add new reaction (or update if same type was already handled above)
        Reaction reaction = new Reaction();
        reaction.setUserId(currentUserId);
        reaction.setTargetId(postId);
        reaction.setTargetType(ReactionTargetType.POST);
        reaction.setReactionType(request.getReactionType());

        reactionRepository.save(reaction);
        updatePostLikesCount(postId);

        // Notify post owner (if not own post and this is a new reaction)
        if (!post.getUserId().equals(currentUserId) && oldReactionOpt.isEmpty()) {
            User currentUser = userService.getUserById(currentUserId);
            String message = String.format("%s reacted to your post", currentUser.getUsername());
            notificationService.createNotification(
                    post.getUserId(),
                    NotificationType.LIKE,
                    currentUserId,
                    postId,
                    null,
                    message
            );
        }
    }

    @Override
    @Transactional
    public void removeReaction(String postId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        getUndeletedPostById(postId);

        Reaction reaction = reactionRepository.findByUserIdAndTargetIdAndTargetType(currentUserId, postId, ReactionTargetType.POST)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.REACTION_NOT_FOUND)));
        reactionRepository.delete(reaction);

        updatePostLikesCount(postId);
    }

    @Override
    @Transactional
    public PostResponse sharePost(String postId, SharePostRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        Post originalPost = getUndeletedPostById(postId);

        if (!canViewPost(originalPost, currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.POST_VIEW_UNAUTHORIZED));
        }

        // Create a new post as a share
        Post sharedPost = new Post();
        sharedPost.setUserId(currentUserId);
        sharedPost.setCaption(request.getCaption());
        sharedPost.setImageUrls(originalPost.getImageUrls());
        sharedPost.setPrivacy(PrivacyType.PUBLIC); // Shares are always public
        sharedPost.setLikesCount(0);
        sharedPost.setCommentsCount(0);
        sharedPost.setSharesCount(0);
        sharedPost.setOriginalPostId(originalPost.getId());

        sharedPost = postRepository.save(sharedPost);

        // Create share record
        Share share = new Share();
        share.setUserId(currentUserId);
        share.setPostId(sharedPost.getId());
        share.setOriginalPostId(postId);
        share.setCaption(request.getCaption());
        shareRepository.save(share);

        // Update original post shares count
        originalPost.setSharesCount(originalPost.getSharesCount() + 1);
        postRepository.save(originalPost);

        // Notify original post owner
        if (!originalPost.getUserId().equals(currentUserId)) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                String message = String.format("%s shared your post", currentUser.getUsername());
                notificationService.createNotification(
                        originalPost.getUserId(),
                        NotificationType.SHARE,
                        currentUserId,
                        postId,
                        null,
                        message
                );
            }
        }

        return buildPostResponse(sharedPost, currentUserId);
    }

    @Override
    @Transactional
    public void softDeletePost(String postId) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        languageService.getMessage(MessageCode.POST_NOT_FOUND)));

        if (!post.getUserId().equals(currentUserId)) {
            throw new AuthorizationException(
                    languageService.getMessage(MessageCode.POST_DELETE_UNAUTHORIZED));
        }

        // Soft delete
        post.setIsDeleted(true);
        post.setDeletedAt(LocalDateTime.now());
        post.setDeletedBy(currentUserId);
        postRepository.save(post);

        // Publish event để cleanup các dữ liệu liên quan
        PostDeletedEvent event = PostDeletedEvent.builder()
                .postId(postId)
                .userId(post.getUserId())
                .deletedByUserId(currentUserId)
                .deletedAt(LocalDateTime.now())
                .build();

        eventPublisher.publishEvent(event);

        log.info("Post {} soft deleted by user {}", postId, currentUserId);
    }

    // Hard delete post
    @Override
    @Transactional
    public void hardDeletePost(String postId) {
        postRepository.deleteById(postId);
        log.info("Post {} permanently deleted", postId);
    }

    public Post getUndeletedPostById(String postId) {
        // Get post, allowing drafts only for owner
        String currentUserId = SecurityUtil.getCurrentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND)));
        
        if (post.getIsDeleted() != null && post.getIsDeleted()) {
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND));
        }
        
        // Allow owner to access their drafts
        if (post.getStatus() == PostStatus.DRAFTED && !post.getUserId().equals(currentUserId)) {
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND));
        }
        
        return post;
    }

    /**
     * Lấy posts đã bị soft delete (cho admin)
     */
    public Page<Post> getDeletedPosts(Pageable pageable) {
        return postRepository.findByIsDeletedTrue(pageable);
    }

    /**
     * Khôi phục post đã bị soft delete
     */
    @Transactional
    public void restorePost(String postId) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND)));

        if (!post.getIsDeleted()) {
            throw new BusinessException(languageService.getMessage(MessageCode.POST_NOT_DELETED));
        }

        // Chỉ cho phép chủ post hoặc admin khôi phục
        if (!post.getUserId().equals(currentUserId) && !SecurityUtil.isAdmin()) {
            throw new AuthorizationException("Not authorized to restore this post");
        }

        post.setIsDeleted(false);
        post.setDeletedAt(null);
        post.setDeletedBy(null);
        postRepository.save(post);

        log.info("Post {} restored by user {}", postId, currentUserId);
    }

    /**
     * Lấy các post đã bị soft delete quá 30 ngày
     */
    public List<Post> getPostsDeletedBefore(LocalDateTime dateTime) {
        Query query = new Query();
        query.addCriteria(Criteria.where("is_deleted").is(true)
                .and("deleted_at").lt(dateTime));

        return mongoTemplate.find(query, Post.class);
    }

    @Async
    @Override
    public void updatePostLikesCount(String postId) {
        long likesCount = reactionRepository.countByTargetIdAndTargetType(postId, ReactionTargetType.POST);
        
        // Update likes count using MongoTemplate
        Query query = new Query(Criteria.where("_id").is(postId));
        Update update = new Update();
        update.set("likes_count", (int) likesCount);
        mongoTemplate.updateFirst(query, update, Post.class);
    }

    // Helper methods

    private boolean canViewPost(Post post, String currentUserId) {
        // User can always view their own posts
        if (post.getUserId().equals(currentUserId)) {
            return true;
        }

        if (post.getPrivacy() == PrivacyType.PUBLIC) {
            return true;
        }

        if (post.getPrivacy() == PrivacyType.PRIVATE) {
            return false;
        }

        // FOLLOWER_ONLY: check if current user follows post owner
        if (post.getPrivacy() == PrivacyType.FOLLOWER_ONLY) {
            Optional<Follow> follow = followService.existingFollow(currentUserId, post.getUserId());
            return follow.isPresent() && follow.get().getStatus() == FollowStatus.ACCEPTED;
        }

        return false;
    }

    private PostResponse buildPostResponse(Post post, String currentUserId) {
        UserPostResponse postUser = userService.getUserPostById(post.getUserId());

        // Get user's reaction
        Reaction userReaction = reactionRepository.findByUserIdAndTargetIdAndTargetType(currentUserId, post.getId(), ReactionTargetType.POST)
                .orElse(null);

        boolean isSaved = savedPostRepository.existsByUserIdAndPostId(currentUserId, post.getId());

        boolean isShared = false;
        String originalPostId = null;
        UserPostResponse originalAuthor = null;
        if (post.getOriginalPostId() != null) {
            isShared = true;
            originalPostId = post.getOriginalPostId();

            // Get original post info
            Post originalPost = postRepository.findById(post.getOriginalPostId()).orElse(null);
            if (originalPost != null) {
                originalAuthor = userService.getUserPostById(originalPost.getUserId());
            }
        }

        return PostResponse.builder()
                .id(post.getId())
                .user(postUser)
                .caption(post.getCaption())
                .imageUrls(post.getImageUrls())
                .privacy(post.getPrivacy())
                .status(post.getStatus())
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .sharesCount(post.getSharesCount())
                .tags(post.getTags())
                .isLiked(userReaction != null)
                .userReaction(userReaction != null ? userReaction.getReactionType() : null)
                .isSaved(isSaved)
                .isShared(isShared)
                .originalPostId(originalPostId)
                .originalPostAuthor(originalAuthor)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private PostListItemResponse buildPostListItemResponse(Post post, String currentUserId) {
        UserPostResponse postUser = userService.getUserPostById(post.getUserId());

        Reaction userReaction = reactionRepository.findByUserIdAndTargetIdAndTargetType(currentUserId, post.getId(), ReactionTargetType.POST)
                .orElse(null);

        boolean isSaved = savedPostRepository.existsByUserIdAndPostId(currentUserId, post.getId());

        return PostListItemResponse.builder()
                .id(post.getId())
                .user(postUser)
                .caption(post.getCaption())
                .imageUrls(post.getImageUrls())
                .privacy(post.getPrivacy())
                .status(post.getStatus())
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .sharesCount(post.getSharesCount())
                .isLiked(userReaction != null)
                .userReaction(userReaction != null ? userReaction.getReactionType() : null)
                .isSaved(isSaved)
                .createdAt(post.getCreatedAt())
                .build();
    }

    private void notifyFollowersAboutNewPost(User user, Post post) {
        Pageable unpaged = Pageable.unpaged();
        // Get all followers
        List<Follow> followers = followService.getFollowers(user.getId(), unpaged).getContent();

        String message = String.format("%s posted a new photo", user.getUsername());
        for (Follow follow : followers) {
            notificationService.createNotification(
                    follow.getFollowerId(),
                    NotificationType.NEW_POST,
                    user.getId(),
                    post.getId(),
                    null,
                    message
            );
        }
    }


}

