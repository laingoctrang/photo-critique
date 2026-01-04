package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.user.UpdateOnlineStatusRequest;
import com.photo_critique_be.dto.request.user.UpdateProfileRequest;
import com.photo_critique_be.dto.response.user.AdminUserResponse;
import com.photo_critique_be.dto.response.user.UserListItemResponse;
import com.photo_critique_be.dto.response.user.UserPostResponse;
import com.photo_critique_be.dto.response.user.UserProfileResponse;
import com.photo_critique_be.enums.Role;
import com.photo_critique_be.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface UserService {
    User getUserById(String userId);
    User getUserByUsername(String username);
    User getUserByEmail(String email);

    UserProfileResponse getCurrentUserProfile();
    
    UserProfileResponse getUserProfileByUsername(String username);
    
    UserProfileResponse getUserProfileById(String userId);
    
    UserProfileResponse updateProfile(UpdateProfileRequest request);
    
    void followUser(String userId);
    
    void unfollowUser(String userId);
    
    void acceptFollowRequest(String followerId);
    
    void rejectFollowRequest(String followerId);
    
    Page<UserListItemResponse> getFollowers(String userId, Pageable pageable);
    
    Page<UserListItemResponse> getFollowing(String userId, Pageable pageable);
    
    Page<UserListItemResponse> getFollowRequests(Pageable pageable);
    
    void updateOnlineStatus(UpdateOnlineStatusRequest request);

    UserPostResponse getUserPostById(String userId);

    Map<String, UserPostResponse> getUsersByUserIds(List<String> userIds, String currentUserId);

    // Admin methods
    Page<AdminUserResponse> getAllUsersForAdmin(String search, Boolean enabled, Role role, Pageable pageable);
    
    AdminUserResponse getAdminUserById(String userId);
    
    void enableUser(String userId);
    
    void disableUser(String userId);
    
    void changeUserRole(String userId, String role);
    
    void deleteUser(String userId);
}

