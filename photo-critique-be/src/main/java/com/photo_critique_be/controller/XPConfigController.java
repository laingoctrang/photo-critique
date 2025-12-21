package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.common.FilterRequest;
import com.photo_critique_be.dto.request.xp.XPConfigRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.common.PageResponse;
import com.photo_critique_be.dto.response.xp.XPConfigResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.mapper.XPConfigMapper;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.XPConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/xp-configs")
@RequiredArgsConstructor
public class XPConfigController {

    private final XPConfigService xpConfigService;
    private final XPConfigMapper xpConfigMapper;
    private final LanguageService languageService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<XPConfigResponse>>> getConfigs(
            @ModelAttribute FilterRequest filterRequest) {
        PageResponse<XPConfigResponse> response = xpConfigService.getConfigsFiltered(filterRequest);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.XP_CONFIG_RETRIEVED)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<XPConfigResponse>>> getAllConfigs() {
        List<XPConfigResponse> response = xpConfigService.getAllConfigsResponse();
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.XP_CONFIG_RETRIEVED)));
    }

    @GetMapping("/{eventType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<XPConfigResponse>> getConfigByEventType(@PathVariable String eventType) {
        XPConfigResponse response = xpConfigMapper.toResponse(xpConfigService.getConfig(eventType));
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.XP_CONFIG_RETRIEVED)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<XPConfigResponse>> createOrUpdateConfig(@Valid @RequestBody XPConfigRequest request) {
        XPConfigResponse response = xpConfigService.createOrUpdateConfig(request);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.XP_CONFIG_CREATED)));
    }

    @PutMapping("/{eventType}/points")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<XPConfigResponse>> updatePoints(
            @PathVariable String eventType,
            @RequestBody Integer points) {
        XPConfigResponse response = xpConfigService.updatePoints(eventType, points);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.XP_CONFIG_UPDATED)));
    }

    @DeleteMapping("/{eventType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteConfig(@PathVariable String eventType) {
        xpConfigService.deleteConfig(eventType);
        return ResponseEntity.ok(ApiResponse.success(languageService.getMessage(MessageCode.XP_CONFIG_DELETED)));
    }
}

