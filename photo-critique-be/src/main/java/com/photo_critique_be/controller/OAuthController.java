package com.photo_critique_be.controller;

import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.OAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/oauth")
@RequiredArgsConstructor
public class OAuthController {

    private final OAuthService oAuthService;
    private final LanguageService languageService;

    /**
     * Get OAuth authorization URL
     * @param provider OAuth provider (google, facebook)
     * @return Authorization URL
     */
    @GetMapping("/authorize/{provider}")
    public ResponseEntity<ApiResponse<Map<String, String>>> getAuthorizationUrl(@PathVariable String provider) {
        String url = oAuthService.getAuthorizationUrl(provider);
        Map<String, String> response = new HashMap<>();
        response.put("authorizationUrl", url);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.AUTH_OAUTH_URL_GENERATED)));
    }

    /**
     * Handle OAuth callback via GET
     * All logic is handled in service layer
     * @param provider OAuth provider (google, facebook)
     * @param code Authorization code
     * @param state Optional state parameter
     * @return Redirect to frontend with token and message
     */
    @GetMapping("/callback/{provider}")
    public ResponseEntity<?> handleCallback(
            @PathVariable String provider,
            @RequestParam String code,
            @RequestParam(required = false) String state) {
        String redirectUrl = oAuthService.handleOAuthCallback(provider, code, state);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirectUrl)
                    .build();
    }
}
