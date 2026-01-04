package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.FollowInfo;
import com.photo_critique_be.dto.request.user.UpdateOnlineStatusRequest;
import com.photo_critique_be.dto.request.user.UpdateProfileRequest;
import com.photo_critique_be.dto.response.user.AdminUserResponse;
import com.photo_critique_be.dto.response.user.UserListItemResponse;
import com.photo_critique_be.dto.response.user.UserPostResponse;
import com.photo_critique_be.dto.response.user.UserProfileResponse;
import com.photo_critique_be.enums.FollowStatus;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.enums.Role;
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
import java.util.Map;
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
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));
    }

    @Override
    public UserProfileResponse getCurrentUserProfile() {
        String currentUserId = SecurityUtil.getCurrentUserId();
        User user = getUserById(currentUserId);

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
        User user = getUserByUsername(username);

        FollowInfo followInfo = followService.resolveFollowInfo(user.getId(), currentUserId);

        // Check privacy and follow status
        boolean canViewFullProfile = canViewProfile(user, currentUserId);
        
        if (!canViewFullProfile) {
            // Return basic profile information only
            UserProfileResponse userProfileResponse = UserProfileResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .profilePicture(user.getProfilePicture())
                    .fullName(user.getFullName())
                    .bio(null) // Hide bio for private profiles
                    .isOnline(null)
                    .lastSeen(null)
                    .privacySetting(user.getPrivacySetting().name())
                    .xpPoints(null)
                    .level(null)
                    .badges(null) // Hide badges
                    .followersCount(null)
                    .followingCount(null)
                    .createdAt(null)
                    .isFollowing(followInfo.getIsFollowing())
                    .isFollowedBy(followInfo.getIsFollowedBy())
                    .followStatus(followInfo.getFollowStatus())
                    .build();
            return userProfileResponse;
        }

        // Return full profile information
        UserProfileResponse userProfileResponse = userMapper.toUserProfileResponse(user, followInfo);
        if (user.getBadges() != null && !user.getBadges().isEmpty()) {
            userProfileResponse.setBadges(badgeService.getBadgesEarned(user.getBadges()));
        }

        return userProfileResponse;
    }

    @Override
    public UserProfileResponse getUserProfileById(String userId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        User user = getUserById(userId);

        FollowInfo followInfo = followService.resolveFollowInfo(user.getId(), currentUserId);

        // Check privacy and follow status
        boolean canViewFullProfile = canViewProfile(user, currentUserId);
        
        if (!canViewFullProfile) {
            // Return basic profile information only
            UserProfileResponse userProfileResponse = UserProfileResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .profilePicture(user.getProfilePicture())
                    .fullName(user.getFullName())
                    .bio(null) // Hide bio for private profiles
                    .isOnline(null)
                    .lastSeen(null)
                    .privacySetting(user.getPrivacySetting().name())
                    .xpPoints(null)
                    .level(null)
                    .badges(null) // Hide badges
                    .followersCount(null)
                    .followingCount(null)
                    .createdAt(null)
                    .isFollowing(followInfo.getIsFollowing())
                    .isFollowedBy(followInfo.getIsFollowedBy())
                    .followStatus(followInfo.getFollowStatus())
                    .build();
            return userProfileResponse;
        }

        // Return full profile information
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
        User user = getUserById(currentUserId);

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

        User targetUser = getUserById(userId);

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
        boolean isNewFollow = false;
        FollowStatus oldStatus = null;
        
        if (existingFollow.isPresent()) {
            follow = existingFollow.get();
            oldStatus = follow.getStatus();
            
            if (follow.getStatus() == FollowStatus.ACCEPTED) {
                throw new ConflictException(languageService.getMessage(MessageCode.USER_ALREADY_FOLLOWING));
            } else if (follow.getStatus() == FollowStatus.PENDING) {
                // Cancel pending request (unfollow)
                followRepository.delete(follow);
                // Update follower counts if needed (though for PENDING, counts shouldn't have changed)
                return; // Exit early after canceling
            } else if (follow.getStatus() == FollowStatus.BLOCKED) {
                throw new AuthorizationException(languageService.getMessage(MessageCode.USER_BLOCKED));
            } else if (follow.getStatus() == FollowStatus.REJECTED) {
                // Allow re-following if previously rejected
                follow.setStatus(status);
            }
        } else {
            // Create new follow relationship
            isNewFollow = true;
            follow = new Follow();
            follow.setFollowerId(currentUserId);
            follow.setFollowingId(userId);
            follow.setStatus(status);
        }

        // Update follower counts if status is ACCEPTED
        if (status == FollowStatus.ACCEPTED) {
            // Update counts if this is a new follow or status changed from REJECTED
            if (isNewFollow || (oldStatus != null && oldStatus == FollowStatus.REJECTED)) {
                targetUser.setFollowersCount((targetUser.getFollowersCount() != null ? targetUser.getFollowersCount() : 0) + 1);
                User currentUser = userRepository.findById(currentUserId).orElseThrow();
                currentUser.setFollowingCount((currentUser.getFollowingCount() != null ? currentUser.getFollowingCount() : 0) + 1);
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
        User user = getUserById(userId);

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
        User user = getUserById(userId);

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
        User user = getUserById(currentUserId);

        if (request.getIsOnline() != null) {
            user.setIsOnline(request.getIsOnline());
            if (!request.getIsOnline()) {
                user.setLastSeen(LocalDateTime.now());
            }
        }

        userRepository.save(user);
    }

    @Override
    public UserPostResponse getUserPostById(String userId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        User user = getUserById(userId);

        // Hidden private infomation
        if (!canViewProfile(user, currentUserId)) {
            user.setIsOnline(null);
            user.setLevel(null);
            user.setXpPoints(null);
            user.setFollowersCount(null);
            user.setFollowingCount(null);
        }

        FollowInfo followInfo = followService.resolveFollowInfo(user.getId(), currentUserId);

        return userMapper.toUserPostResponse(user, followInfo);
    }

    @Override
    public Map<String, UserPostResponse> getUsersByUserIds(List<String> userIds, String currentUserId) {
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(
                        User::getId,
                        user -> {
                            // Hidden private infomation
                            if (!canViewProfile(user, currentUserId)) {
                                user.setIsOnline(null);
                                user.setLevel(null);
                                user.setXpPoints(null);
                                user.setFollowersCount(null);
                                user.setFollowingCount(null);
                            }
                            FollowInfo followInfo = followService.resolveFollowInfo(user.getId(), currentUserId);
                            return userMapper.toUserPostResponse(user, followInfo);
                        }
                ));
    }

    // Admin methods

    @Override
    public Page<AdminUserResponse> getAllUsersForAdmin(String search, Boolean enabled, Role role, Pageable pageable) {
        List<User> allUsers = userRepository.findAll();
        
        // Apply filters
        List<User> filteredUsers = allUsers.stream()
                .filter(user -> {
                    // Search filter
                    if (search != null && !search.trim().isEmpty()) {
                        String searchLower = search.toLowerCase();
                        boolean matchesSearch = (user.getUsername() != null && user.getUsername().toLowerCase().contains(searchLower)) ||
                                (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchLower)) ||
                                (user.getFullName() != null && user.getFullName().toLowerCase().contains(searchLower));
                        if (!matchesSearch) return false;
                    }
                    
                    // Enabled filter
                    if (enabled != null && user.isEnabled() != enabled) {
                        return false;
                    }
                    
                    // Role filter
                    if (role != null && (user.getRoles() == null || !user.getRoles().contains(role))) {
                        return false;
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
        
        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filteredUsers.size());
        List<User> pagedUsers = start < filteredUsers.size() ? filteredUsers.subList(start, end) : List.of();
        
        // Convert to AdminUserResponse
        List<AdminUserResponse> responses = pagedUsers.stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(responses, pageable, filteredUsers.size());
    }

    @Override
    public AdminUserResponse getAdminUserById(String userId) {
        User user = getUserById(userId);
        return toAdminUserResponse(user);
    }

    @Override
    @Transactional
    public void enableUser(String userId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        if (userId.equals(currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.USER_CANNOT_MODIFY_SELF));
        }
        
        User user = getUserById(userId);
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void disableUser(String userId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        if (userId.equals(currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.USER_CANNOT_MODIFY_SELF));
        }
        
        User user = getUserById(userId);
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changeUserRole(String userId, String role) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        if (userId.equals(currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.USER_CANNOT_MODIFY_SELF));
        }
        
        User user = getUserById(userId);
        try {
            Role newRole = Role.valueOf(role.toUpperCase());
            user.setRoles(List.of(newRole));
            userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
    }

    @Override
    @Transactional
    public void deleteUser(String userId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        if (userId.equals(currentUserId)) {
            throw new AuthorizationException(languageService.getMessage(MessageCode.USER_CANNOT_MODIFY_SELF));
        }
        
        User user = getUserById(userId);
        userRepository.delete(user);
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        List<String> roleStrings = user.getRoles() != null 
                ? user.getRoles().stream().map(r -> r.name()).collect(Collectors.toList())
                : List.of();
        
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .profilePicture(user.getProfilePicture())
                .roles(roleStrings)
                .enabled(user.isEnabled())
                .xpPoints(user.getXpPoints() != null ? user.getXpPoints() : 0)
                .level(user.getLevel() != null ? user.getLevel() : 1)
                .followersCount(user.getFollowersCount() != null ? user.getFollowersCount() : 0)
                .followingCount(user.getFollowingCount() != null ? user.getFollowingCount() : 0)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastSeen(user.getLastSeen())
                .isOnline(user.getIsOnline())
                .build();
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


