package com.photo_critique_be.controller;


import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.OAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oauth")
@RequiredArgsConstructor
public class OAuthController {

    private final OAuthService oAuthService;
    private final LanguageService languageService;

    public ResponseEntity<ApiResponse<Void>> handleCallback() {
        // TODO: Implement OAuth callback handler
        return ResponseEntity.ok(ApiResponse.success("OAuth callback handled"));
    }
}
