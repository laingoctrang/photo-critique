package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.user.UpdateOnlineStatusRequest;
import com.photo_critique_be.dto.request.user.UpdateProfileRequest;
import com.photo_critique_be.dto.response.user.UserListItemResponse;
import com.photo_critique_be.dto.response.user.UserProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
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
}

