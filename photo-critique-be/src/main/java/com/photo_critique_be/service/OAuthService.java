package com.photo_critique_be.service;

public interface OAuthService {
    /**
     * Get OAuth authorization URL for the specified provider
     * @param provider OAuth provider (google, facebook)
     * @return Authorization URL
     */
    String getAuthorizationUrl(String provider);

    /**
     * Handle OAuth callback and authenticate/register user
     * @param provider OAuth provider (google, facebook)
     * @param code Authorization code from OAuth provider (optional if error is present)
     * @param state Optional state parameter
     * @param error Error code from OAuth provider (e.g., access_denied)
     * @param errorDescription Optional error description
     * @param errorReason Optional error reason
     * @return Redirect URL to frontend with token and message, or error message
     */
    String handleOAuthCallback(String provider, String code, String state, String error, String errorDescription, String errorReason);
}
