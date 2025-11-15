package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.FollowInfo;
import com.photo_critique_be.dto.request.user.UpdateOnlineStatusRequest;
import com.photo_critique_be.dto.request.user.UpdateProfileRequest;
import com.photo_critique_be.dto.response.user.UserListItemResponse;
import com.photo_critique_be.dto.response.user.UserProfileResponse;
import com.photo_critique_be.enums.FollowStatus;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.exception.AuthorizationException;
import com.photo_critique_be.exception.ConflictException;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.mapper.UserMapper;
import com.photo_critique_be.model.Follow;
import com.photo_critique_be.model.User;
import com.photo_critique_be.model.embedded.BadgeEarned;
import com.photo_critique_be.repository.FollowRepository;
import com.photo_critique_be.repository.UserRepository;
import com.photo_critique_be.service.BadgeService;
import com.photo_critique_be.service.FollowService;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.UserService;
import com.photo_critique_be.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final BadgeService badgeService;
    private final FollowService followService;
    private final FollowRepository followRepository;
    private final LanguageService languageService;


    @Override
    public UserProfileResponse getCurrentUserProfile() {
        String currentUserId = SecurityUtil.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        FollowInfo followInfo = followService.resolveFollowInfo(user.getId(), currentUserId);

        UserProfileResponse userProfileResponse = userMapper.toUserProfileResponse(user, followInfo);
        if (user.getBadges() != null && !user.getBadges().isEmpty()) {
            userProfileResponse.setBadges(badgeService.getBadgesEarned(user.getBadges()));
        }

        return userProfileResponse;
    }

    @Override
    public UserProfileResponse getUserProfileByUsername(String username) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        // Check privacy and follow status
        if (!canViewProfile(user, currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.USER_PROFILE_PRIVATE));
        }

        FollowInfo followInfo = followService.resolveFollowInfo(user.getId(), currentUserId);

        UserProfileResponse userProfileResponse = userMapper.toUserProfileResponse(user, followInfo);
        if (user.getBadges() != null && !user.getBadges().isEmpty()) {
            userProfileResponse.setBadges(badgeService.getBadgesEarned(user.getBadges()));
        }

        return userProfileResponse;
    }

    @Override
    public UserProfileResponse getUserProfileById(String userId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        // Check privacy and follow status
        if (!canViewProfile(user, currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.USER_PROFILE_PRIVATE));
        }

        FollowInfo followInfo = followService.resolveFollowInfo(user.getId(), currentUserId);

        UserProfileResponse userProfileResponse = userMapper.toUserProfileResponse(user, followInfo);
        if (user.getBadges() != null && !user.getBadges().isEmpty()) {
            userProfileResponse.setBadges(badgeService.getBadgesEarned(user.getBadges()));
        }

        return userProfileResponse;
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }
        if (request.getPrivacySetting() != null) {
            user.setPrivacySetting(PrivacyType.valueOf(request.getPrivacySetting()));
        }
        if (request.getBadgeId() != null) {
            BadgeEarned newBadgeEarned = new BadgeEarned(request.getBadgeId(), LocalDateTime.now());
            List<BadgeEarned> badges = user.getBadges();
            badges.add(newBadgeEarned);
            user.setBadges(badges);
        }

        user = userRepository.save(user);
        FollowInfo followInfo = followService.resolveFollowInfo(user.getId(), currentUserId);
        UserProfileResponse userProfileResponse = userMapper.toUserProfileResponse(user, followInfo);
        userProfileResponse.setBadges(badgeService.getBadgesEarned(user.getBadges()));

        return userProfileResponse;
    }

    @Override
    @Transactional
    public void followUser(String userId) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        if (currentUserId.equals(userId)) {
            throw new ConflictException(languageService.getMessage(MessageCode.USER_CANNOT_FOLLOW_SELF));
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        // Check if already following
        Optional<Follow> existingFollow = followService.existingFollow(currentUserId, userId);

        // Determine follow status based on privacy setting
        FollowStatus status;
        if (targetUser.getPrivacySetting() == PrivacyType.PUBLIC) {
            status = FollowStatus.ACCEPTED;
        } else {
            status = FollowStatus.PENDING;
        }

        Follow follow;
        if (existingFollow.isPresent()) {
            follow = existingFollow.get();
            if (follow.getStatus() == FollowStatus.ACCEPTED) {
                throw new ConflictException(languageService.getMessage(MessageCode.USER_ALREADY_FOLLOWING));
            } else if (follow.getStatus() == FollowStatus.PENDING) {
                throw new ConflictException(languageService.getMessage(MessageCode.USER_FOLLOW_REQUEST_PENDING));
            } else if (follow.getStatus() == FollowStatus.BLOCKED) {
                throw new AuthorizationException(languageService.getMessage(MessageCode.USER_BLOCKED));
            } else if (follow.getStatus() == FollowStatus.REJECTED) {
                // Allow re-following if previously rejected
                follow.setStatus(status);
            }
        } else {
            // Create new follow relationship
            follow = new Follow();
            follow.setFollowerId(currentUserId);
            follow.setFollowingId(userId);
            follow.setStatus(status);
        }

        // Update follower counts if status is ACCEPTED
        if (status == FollowStatus.ACCEPTED) {
            // Only update counts if this is a new follow or status changed from REJECTED
            if (existingFollow.isPresent() || existingFollow.get().getStatus() == FollowStatus.REJECTED) {
                targetUser.setFollowersCount(targetUser.getFollowersCount() + 1);
                User currentUser = userRepository.findById(currentUserId).orElseThrow();
                currentUser.setFollowingCount(currentUser.getFollowingCount() + 1);
                userRepository.save(targetUser);
                userRepository.save(currentUser);
            }
        }

        followRepository.save(follow);

    }

    @Override
    @Transactional
    public void unfollowUser(String userId) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        Optional<Follow> follow = followService.existingFollow(currentUserId, userId);
        if (follow.isEmpty())
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOLLOWING));

        // Only allow unfollow if status is ACCEPTED
        if (follow.get().getStatus() != FollowStatus.ACCEPTED) {
            throw new ConflictException(languageService.getMessage(MessageCode.USER_CANNOT_UNFOLLOW));
        }

        // Update follower counts
        User targetUser = userRepository.findById(userId).orElseThrow();
        User currentUser = userRepository.findById(currentUserId).orElseThrow();

        if (targetUser.getFollowersCount() > 0) {
            targetUser.setFollowersCount(targetUser.getFollowersCount() - 1);
        }
        if (currentUser.getFollowingCount() > 0) {
            currentUser.setFollowingCount(currentUser.getFollowingCount() - 1);
        }

        userRepository.save(targetUser);
        userRepository.save(currentUser);
        followRepository.delete(follow.get());
    }

    @Override
    @Transactional
    public void acceptFollowRequest(String followerId) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        Optional<Follow> follow = followService.existingFollow(followerId, currentUserId);
        if (follow.isEmpty())
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.FOLLOW_REQUEST_NOT_FOUND));

        if (follow.get().getStatus() != FollowStatus.PENDING) {
            throw new ConflictException(languageService.getMessage(MessageCode.FOLLOW_REQUEST_ALREADY_PROCESSED));
        }

        follow.get().setStatus(FollowStatus.ACCEPTED);
        followRepository.save(follow.get());

        // Update follower counts
        User currentUser = userRepository.findById(currentUserId).orElseThrow();
        User followerUser = userRepository.findById(followerId).orElseThrow();

        currentUser.setFollowersCount(currentUser.getFollowersCount() + 1);
        followerUser.setFollowingCount(followerUser.getFollowingCount() + 1);

        userRepository.save(currentUser);
        userRepository.save(followerUser);

    }

    @Override
    @Transactional
    public void rejectFollowRequest(String followerId) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        Optional<Follow> follow = followService.existingFollow(followerId, currentUserId);
        if (follow.isEmpty())
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.FOLLOW_REQUEST_NOT_FOUND));

        if (follow.get().getStatus() != FollowStatus.PENDING) {
            throw new ConflictException(languageService.getMessage(MessageCode.FOLLOW_REQUEST_ALREADY_PROCESSED));
        }

        follow.get().setStatus(FollowStatus.REJECTED);
        followRepository.save(follow.get());

    }

    @Override
    public Page<UserListItemResponse> getFollowers(String userId, Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        // Check if current user can view followers
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        if (!canViewProfile(user, currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.USER_PROFILE_PRIVATE));
        }

        Page<Follow> follows = followService.getFollowers(userId, pageable);
        List<String> followerIds = follows.getContent().stream()
                .map(Follow::getFollowerId)
                .collect(Collectors.toList());

        List<User> followers = userRepository.findAllById(followerIds);
        List<UserListItemResponse> responses = followers.stream()
                .map(follower -> {
                    FollowInfo followInfo = followService.resolveFollowInfo(follower.getId(), currentUserId);
                    return userMapper.toUserListItemResponse(follower, followInfo);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, follows.getTotalElements());
    }

    @Override
    public Page<UserListItemResponse> getFollowing(String userId, Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        // Check if current user can view following
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        if (!canViewProfile(user, currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.USER_PROFILE_PRIVATE));
        }

        Page<Follow> follows = followService.getFollowing(userId, pageable);
        List<String> followingIds = follows.getContent().stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());

        List<User> following = userRepository.findAllById(followingIds);
        List<UserListItemResponse> responses = following.stream()
                .map(follower -> {
                    FollowInfo followInfo = followService.resolveFollowInfo(follower.getId(), currentUserId);
                    return userMapper.toUserListItemResponse(follower, followInfo);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, follows.getTotalElements());
    }

    @Override
    public Page<UserListItemResponse> getFollowRequests(Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        Page<Follow> follows = followService.getReceivedFollowRequests(currentUserId, FollowStatus.PENDING, pageable);
        List<String> followerIds = follows.getContent().stream()
                .map(Follow::getFollowerId)
                .collect(Collectors.toList());

        List<User> followers = userRepository.findAllById(followerIds);
        List<UserListItemResponse> responses = followers.stream()
                .map(follower -> {
                    FollowInfo followInfo = followService.resolveFollowInfo(follower.getId(), currentUserId);
                    return userMapper.toUserListItemResponse(follower, followInfo);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, follows.getTotalElements());
    }

    @Override
    @Transactional
    public void updateOnlineStatus(UpdateOnlineStatusRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        if (request.getIsOnline() != null) {
            user.setIsOnline(request.getIsOnline());
            if (!request.getIsOnline()) {
                user.setLastSeen(LocalDateTime.now());
            }
        }

        userRepository.save(user);
    }

    // Helper methods

    private boolean canViewProfile(User user, String currentUserId) {
        // User can always view their own profile
        if (user.getId().equals(currentUserId)) {
            return true;
        }

        // Public profiles are always visible
        if (user.getPrivacySetting() == PrivacyType.PUBLIC) {
            return true;
        }

        // For PRIVATE, check if current user is following
        Optional<Follow> follow = followService.existingFollow(currentUserId, user.getId());
        return follow.isPresent() && follow.get().getStatus() == FollowStatus.ACCEPTED;
    }
}


