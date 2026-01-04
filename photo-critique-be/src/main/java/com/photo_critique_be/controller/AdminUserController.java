package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.user.ChangeUserRoleRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.user.AdminUserResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.Role;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final LanguageService languageService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) Role role,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<AdminUserResponse> response = userService.getAllUsersForAdmin(search, enabled, role, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.USER_LIST_RETRIEVED)));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getAdminUserById(@PathVariable String userId) {
        AdminUserResponse response = userService.getAdminUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.USER_RETRIEVED)));
    }

    @PutMapping("/{userId}/enable")
    public ResponseEntity<ApiResponse<Void>> enableUser(@PathVariable String userId) {
        userService.enableUser(userId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.USER_ENABLED)));
    }

    @PutMapping("/{userId}/disable")
    public ResponseEntity<ApiResponse<Void>> disableUser(@PathVariable String userId) {
        userService.disableUser(userId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.USER_DISABLED)));
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<Void>> changeUserRole(
            @PathVariable String userId,
            @Valid @RequestBody ChangeUserRoleRequest request) {
        userService.changeUserRole(userId, request.getRole());
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.USER_ROLE_UPDATED)));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.USER_DELETED)));
    }
}

