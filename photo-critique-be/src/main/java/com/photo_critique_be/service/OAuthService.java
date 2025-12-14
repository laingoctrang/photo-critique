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
     * @param code Authorization code from OAuth provider
     * @param state Optional state parameter
     * @return Redirect URL to frontend with token and message
     */
    String handleOAuthCallback(String provider, String code, String state);
}
