package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.user.UpdateOnlineStatusRequest;
import com.photo_critique_be.dto.request.user.UpdateProfileRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.user.UserListItemResponse;
import com.photo_critique_be.dto.response.user.UserProfileResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final LanguageService languageService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUserProfile() {
        UserProfileResponse response = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.USER_GET_ME_SUCCESS)));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfileByUsername(@PathVariable String username) {
        UserProfileResponse response = userService.getUserProfileByUsername(username);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.USER_GET_ME_SUCCESS)));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfileById(@PathVariable String userId) {
        UserProfileResponse response = userService.getUserProfileById(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "User profile retrieved successfully"));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.USER_PROFILE_UPDATED)));
    }

    @PostMapping("/follow/{userId}")
    public ResponseEntity<ApiResponse<Void>> followUser(@PathVariable String userId) {
        userService.followUser(userId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.USER_FOLLOWED_SUCCESS)));
    }

    @DeleteMapping("/follow/{userId}")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(@PathVariable String userId) {
        userService.unfollowUser(userId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.USER_UNFOLLOWED_SUCCESS)));
    }

    @PostMapping("/follow-requests/{followerId}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptFollowRequest(@PathVariable String followerId) {
        userService.acceptFollowRequest(followerId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.FOLLOW_REQUEST_ACCEPTED)));
    }

    @PostMapping("/follow-requests/{followerId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectFollowRequest(@PathVariable String followerId) {
        userService.rejectFollowRequest(followerId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.FOLLOW_REQUEST_REJECTED)));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<ApiResponse<Page<UserListItemResponse>>> getFollowers(
            @PathVariable String userId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserListItemResponse> response = userService.getFollowers(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Followers retrieved successfully"));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<ApiResponse<Page<UserListItemResponse>>> getFollowing(
            @PathVariable String userId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserListItemResponse> response = userService.getFollowing(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Following retrieved successfully"));
    }

    @GetMapping("/me/follow-requests")
    public ResponseEntity<ApiResponse<Page<UserListItemResponse>>> getFollowRequests(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserListItemResponse> response = userService.getFollowRequests(pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Follow requests retrieved successfully"));
    }

    @PutMapping("/me/online-status")
    public ResponseEntity<ApiResponse<Void>> updateOnlineStatus(@Valid @RequestBody UpdateOnlineStatusRequest request) {
        userService.updateOnlineStatus(request);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.USER_ONLINE_STATUS_UPDATED)));
    }
}

