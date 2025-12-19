package com.photo_critique_be.controller;

import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.xp.XPEventResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.XPEventService;
import com.photo_critique_be.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/xp-events")
@RequiredArgsConstructor
public class XPEventController {

    private final XPEventService xpEventService;
    private final LanguageService languageService;

    @GetMapping("/recent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<XPEventResponse>>> getRecentXPEvents(
            @RequestParam(defaultValue = "10") int limit) {
        String userId = SecurityUtil.getCurrentUserId();
        List<XPEventResponse> events = xpEventService.getRecentXPEvents(userId, limit);
        return ResponseEntity.ok(ApiResponse.success(events, languageService.getMessage(MessageCode.XP_EVENT_RETRIEVED)));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<XPEventResponse>>> getAllXPEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userId = SecurityUtil.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<XPEventResponse> events = xpEventService.getAllXPEvents(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(events, languageService.getMessage(MessageCode.XP_EVENT_RETRIEVED)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<XPEventResponse>>> getUserXPEvents(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {
        List<XPEventResponse> events = xpEventService.getRecentXPEvents(userId, limit);
        return ResponseEntity.ok(ApiResponse.success(events, languageService.getMessage(MessageCode.XP_EVENT_RETRIEVED)));
    }
}

