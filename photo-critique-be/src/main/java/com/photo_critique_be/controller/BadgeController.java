package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.badge.BadgeRequest;
import com.photo_critique_be.dto.request.common.FilterRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.badge.BadgeResponse;
import com.photo_critique_be.dto.response.common.PageResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.service.BadgeService;
import com.photo_critique_be.service.LanguageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;
    private final LanguageService languageService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<BadgeResponse>>> getBadges(
            @ModelAttribute FilterRequest filterRequest) {
        PageResponse<BadgeResponse> response = badgeService.getBadgesFiltered(filterRequest);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.BADGE_RETRIEVED)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getAllBadges() {
        List<BadgeResponse> response = badgeService.getAllBadges();
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.BADGE_RETRIEVED)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BadgeResponse>> getBadgeById(@PathVariable String id) {
        BadgeResponse response = badgeService.getBadgeById(id);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.BADGE_RETRIEVED)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BadgeResponse>> createBadge(@Valid @RequestBody BadgeRequest request) {
        BadgeResponse response = badgeService.createBadge(request);
        return ResponseEntity.ok(ApiResponse.created(response, languageService.getMessage(MessageCode.BADGE_CREATED)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BadgeResponse>> updateBadge(
            @PathVariable String id,
            @Valid @RequestBody BadgeRequest request) {
        BadgeResponse response = badgeService.updateBadge(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.BADGE_UPDATED)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBadge(@PathVariable String id) {
        badgeService.deleteBadge(id);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.BADGE_DELETED)));
    }
}

