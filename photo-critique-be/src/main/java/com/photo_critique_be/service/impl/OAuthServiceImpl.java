package com.photo_critique_be.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.photo_critique_be.config.security.jwt.JwtService;
import com.photo_critique_be.config.security.user.CustomUserDetails;
import com.photo_critique_be.config.security.user.UserDetailsServiceImpl;
import com.photo_critique_be.constant.ExternalServiceConstant;
import com.photo_critique_be.dto.response.oauth.OAuthUserInfo;
import com.photo_critique_be.enums.AuthProvider;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.exception.AuthenticationException;
import com.photo_critique_be.exception.ExternalServiceException;
import com.photo_critique_be.mapper.UserMapper;
import com.photo_critique_be.model.User;
import com.photo_critique_be.repository.UserRepository;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.OAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthServiceImpl implements OAuthService {

    private final UserRepository userRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserMapper userMapper;
    private final JwtService jwtService;
    private final LanguageService languageService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.base-url}")
    private String baseUrl;

    // Google OAuth config
    @Value("${app.security.oauth2.google.client-id}")
    private String googleClientId;

    @Value("${app.security.oauth2.google.client-secret}")
    private String googleClientSecret;

    @Value("${app.security.oauth2.google.authorization-uri}")
    private String googleAuthorizationUri;

    @Value("${app.security.oauth2.google.token-uri}")
    private String googleTokenUri;

    @Value("${app.security.oauth2.google.redirect-uri}")
    private String googleRedirectUri;

    @Value("${app.security.oauth2.google.user-info-uri}")
    private String googleUserInfoUri;

    @Value("${app.security.oauth2.google.scope}")
    private String googleScope;

    // Facebook OAuth config
    @Value("${app.security.oauth2.facebook.client-id}")
    private String facebookClientId;

    @Value("${app.security.oauth2.facebook.client-secret}")
    private String facebookClientSecret;

    @Value("${app.security.oauth2.facebook.authorization-uri}")
    private String facebookAuthorizationUri;

    @Value("${app.security.oauth2.facebook.token-uri}")
    private String facebookTokenUri;

    @Value("${app.security.oauth2.facebook.redirect-uri}")
    private String facebookRedirectUri;

    @Value("${app.security.oauth2.facebook.user-info-uri}")
    private String facebookUserInfoUri;

    @Value("${app.security.oauth2.facebook.scope}")
    private String facebookScope;

    @Override
    public String getAuthorizationUrl(String provider) {
        String state = UUID.randomUUID().toString();
        
        return switch (provider.toLowerCase()) {
            case "google" -> buildGoogleAuthorizationUrl(state);
            case "facebook" -> buildFacebookAuthorizationUrl(state);
            default -> throw new ExternalServiceException(ExternalServiceConstant.OAUTH2_SERVICE, "Unsupported OAuth provider: " + provider);
        };
    }

    @Override
    public String handleOAuthCallback(String provider, String code, String state, String error, String errorDescription, String errorReason) {
        // Check if OAuth provider returned an error (user cancelled or denied access)
        if (error != null && !error.isEmpty()) {
            log.warn("OAuth error from provider {}: error={}, errorDescription={}, errorReason={}", 
                    provider, error, errorDescription, errorReason);
            
            // Handle user cancellation/denial
            if ("access_denied".equals(error) || "user_denied".equals(errorReason)) {
                String message = languageService.getMessage(MessageCode.AUTH_OAUTH_CANCELLED);
                String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
                return String.format("%s/oauth/callback?error=%s", frontendUrl, encodedMessage);
            }
            
            // Handle other OAuth errors
            String errorMsg = errorDescription != null && !errorDescription.isEmpty() 
                    ? errorDescription 
                    : "OAuth authentication was cancelled or denied";
            String encodedErrorMsg = URLEncoder.encode(errorMsg, StandardCharsets.UTF_8);
            return String.format("%s/oauth/callback?error=%s", frontendUrl, encodedErrorMsg);
        }
        
        // If no error but also no code, something went wrong
        if (code == null || code.isEmpty()) {
            log.error("OAuth callback for provider {} missing both code and error parameters", provider);
            String errorMsg = URLEncoder.encode("OAuth authentication failed: missing authorization code", StandardCharsets.UTF_8);
            return String.format("%s/oauth/callback?error=%s", frontendUrl, errorMsg);
        }
        
        try {
            // Exchange authorization code for access token
            String accessToken = exchangeCodeForToken(provider, code);
            
            // Get user info from OAuth provider
            OAuthUserInfo oauthUserInfo = getUserInfoFromProvider(provider, accessToken);
            
            // Check if user exists before creating (for message)
            boolean userExistsByProvider = userRepository.findByProviderId(oauthUserInfo.getProviderId()).isPresent();
            boolean userExistsByEmail = oauthUserInfo.getEmail() != null && 
                    !oauthUserInfo.getEmail().isEmpty() && 
                    userRepository.findByEmail(oauthUserInfo.getEmail()).isPresent();
            boolean isNewUser = !userExistsByProvider && !userExistsByEmail;
            
            // Find or create user
            User user = findOrCreateUser(provider, oauthUserInfo);
            
            CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(user.getEmail());
            String jwtToken = jwtService.generateAccessToken(userDetails);
            
            MessageCode messageCode = isNewUser 
                    ? MessageCode.AUTH_REGISTER_SUCCESS
                    : MessageCode.AUTH_LOGIN_SUCCESS;
            String message = languageService.getMessage(messageCode);
            
            // Build redirect URL with token and message
            String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
            return String.format("%s/oauth/callback?token=%s&message=%s&provider=%s",
                    frontendUrl, jwtToken, encodedMessage, provider);
                    
        } catch (AuthenticationException e) {
            // Handle provider mismatch or other authentication errors
            log.error("OAuth authentication error for provider {}: {}", provider, e.getMessage(), e);
            String errorMessage = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            return String.format("%s/oauth/callback?error=%s", frontendUrl, errorMessage);
        } catch (HttpClientErrorException e) {
            log.error("OAuth callback error for provider {}: {}", provider, e.getMessage(), e);
            String errorMessage = URLEncoder.encode("OAuth authentication failed", StandardCharsets.UTF_8);
            return String.format("%s/oauth/callback?error=%s", frontendUrl, errorMessage);
        } catch (Exception e) {
            log.error("Unexpected error during OAuth callback for provider {}: {}", provider, e.getMessage(), e);
            String errorMessage = URLEncoder.encode("OAuth authentication failed", StandardCharsets.UTF_8);
            return String.format("%s/oauth/callback?error=%s", frontendUrl, errorMessage);
        }
    }

    private String buildGoogleAuthorizationUrl(String state) {
        return UriComponentsBuilder.fromUriString(googleAuthorizationUri)
                .queryParam("client_id", googleClientId)
                .queryParam("redirect_uri", googleRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", googleScope)
                .queryParam("state", state)
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .toUriString();
    }

    private String buildFacebookAuthorizationUrl(String state) {
        return UriComponentsBuilder.fromUriString(facebookAuthorizationUri)
                .queryParam("client_id", facebookClientId)
                .queryParam("redirect_uri", facebookRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", facebookScope)
                .queryParam("state", state)
                .toUriString();
    }

    private String exchangeCodeForToken(String provider, String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        
        if ("google".equalsIgnoreCase(provider)) {
            params.add("client_id", googleClientId);
            params.add("client_secret", googleClientSecret);
            params.add("code", code);
            params.add("redirect_uri", googleRedirectUri);
            params.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(googleTokenUri, request, String.class);
            
            try {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("access_token").asText();
            } catch (Exception e) {
                log.error("Error parsing Google token response: {}", e.getMessage(), e);
                throw new AuthenticationException("Failed to exchange code for token");
            }
        } else if ("facebook".equalsIgnoreCase(provider)) {
            params.add("client_id", facebookClientId);
            params.add("client_secret", facebookClientSecret);
            params.add("code", code);
            params.add("redirect_uri", facebookRedirectUri);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(facebookTokenUri, request, String.class);
            
            try {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("access_token").asText();
            } catch (Exception e) {
                log.error("Error parsing Facebook token response: {}", e.getMessage(), e);
                throw new AuthenticationException("Failed to exchange code for token");
            }
        } else {
            throw new IllegalArgumentException("Unsupported OAuth provider: " + provider);
        }
    }

    private OAuthUserInfo getUserInfoFromProvider(String provider, String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        String userInfoUri = "google".equalsIgnoreCase(provider) ? googleUserInfoUri : facebookUserInfoUri;
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    userInfoUri,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            if ("google".equalsIgnoreCase(provider)) {
                return OAuthUserInfo.builder()
                        .providerId(jsonNode.get("sub").asText())
                        .email(jsonNode.get("email").asText())
                        .fullName(jsonNode.get("name").asText())
                        .firstName(jsonNode.has("given_name") ? jsonNode.get("given_name").asText() : null)
                        .lastName(jsonNode.has("family_name") ? jsonNode.get("family_name").asText() : null)
                        .profilePicture(jsonNode.has("picture") ? jsonNode.get("picture").asText() : null)
                        .build();
            } else if ("facebook".equalsIgnoreCase(provider)) {
                String name = jsonNode.get("name").asText();
                String[] nameParts = name.split(" ", 2);
                
                JsonNode pictureNode = jsonNode.get("picture");
                String pictureUrl = null;
                if (pictureNode != null && pictureNode.has("data")) {
                    pictureUrl = pictureNode.get("data").get("url").asText();
                }
                
                return OAuthUserInfo.builder()
                        .providerId(jsonNode.get("id").asText())
                        .email(jsonNode.has("email") ? jsonNode.get("email").asText() : null)
                        .fullName(name)
                        .firstName(nameParts.length > 0 ? nameParts[0] : null)
                        .lastName(nameParts.length > 1 ? nameParts[1] : null)
                        .profilePicture(pictureUrl)
                        .build();
            } else {
                throw new IllegalArgumentException("Unsupported OAuth provider: " + provider);
            }
        } catch (Exception e) {
            log.error("Error getting user info from {}: {}", provider, e.getMessage(), e);
            throw new AuthenticationException("Failed to get user info from OAuth provider");
        }
    }

    private User findOrCreateUser(String provider, OAuthUserInfo oauthUserInfo) {
        AuthProvider authProvider = AuthProvider.valueOf(provider.toUpperCase());
        
        // Try to find user by provider ID first
        Optional<User> existingUserByProvider = userRepository.findByProviderId(oauthUserInfo.getProviderId());
        if (existingUserByProvider.isPresent()) {
            User user = existingUserByProvider.get();
            // Check if provider matches
            if (user.getAuthProvider() != authProvider) {
                // User exists with different provider
                String providerName = user.getAuthProvider().name().toLowerCase();
                throw new AuthenticationException(
                    languageService.getMessage(MessageCode.AUTH_OAUTH_PROVIDER_MISMATCH, providerName)
                );
            }
            // Provider matches, return user without updating (preserve existing info)
            return user;
        }

        // Try to find user by email
        if (oauthUserInfo.getEmail() != null && !oauthUserInfo.getEmail().isEmpty()) {
            Optional<User> existingUserByEmail = userRepository.findByEmail(oauthUserInfo.getEmail());
            if (existingUserByEmail.isPresent()) {
                User user = existingUserByEmail.get();
                
                // Check if user already has a different OAuth provider
                if (user.getAuthProvider() != AuthProvider.LOCAL && user.getAuthProvider() != authProvider) {
                    // User exists with different OAuth provider
                    String providerName = user.getAuthProvider().name().toLowerCase();
                    throw new AuthenticationException(
                        languageService.getMessage(MessageCode.AUTH_OAUTH_PROVIDER_MISMATCH, providerName)
                    );
                }
                
                // User is LOCAL or same provider - link OAuth provider to existing account
                // Only update if user is LOCAL (first time linking OAuth)
                if (user.getAuthProvider() == AuthProvider.LOCAL) {
                    user.setAuthProvider(authProvider);
                    user.setProviderId(oauthUserInfo.getProviderId());
                    // Don't update user info if they already have an account
                    // Only update if fields are missing
                    if (user.getFullName() == null || user.getFullName().isEmpty()) {
                        user.setFullName(oauthUserInfo.getFullName());
                    }
                    if (user.getProfilePicture() == null || user.getProfilePicture().isEmpty()) {
                        user.setProfilePicture(oauthUserInfo.getProfilePicture());
                    }
                    return userRepository.save(user);
                }
                
                // Same provider, return without updating
                return user;
            }
        }

        // Create new user
        User newUser = new User();
        newUser.setEmail(oauthUserInfo.getEmail());
        newUser.setAuthProvider(authProvider);
        newUser.setProviderId(oauthUserInfo.getProviderId());
        newUser.setFullName(oauthUserInfo.getFullName());
        newUser.setProfilePicture(oauthUserInfo.getProfilePicture());
        
        // Generate unique username
        String username = generateUsernameFromOAuthInfo(oauthUserInfo);
        newUser.setUsername(username);
        
        // OAuth users don't need password, but set a random one for security
        newUser.setPassword(UUID.randomUUID().toString());

        return userRepository.save(newUser);
    }


    private String generateUsernameFromOAuthInfo(OAuthUserInfo oauthUserInfo) {
        String baseUsername;
        
        if (oauthUserInfo.getUsername() != null && !oauthUserInfo.getUsername().isEmpty()) {
            baseUsername = oauthUserInfo.getUsername().toLowerCase().replaceAll("[^a-z0-9_]", "");
        } else if (oauthUserInfo.getEmail() != null && !oauthUserInfo.getEmail().isEmpty()) {
            baseUsername = oauthUserInfo.getEmail().split("@")[0].toLowerCase().replaceAll("[^a-z0-9_]", "");
        } else if (oauthUserInfo.getFirstName() != null && !oauthUserInfo.getFirstName().isEmpty()) {
            baseUsername = oauthUserInfo.getFirstName().toLowerCase().replaceAll("[^a-z0-9_]", "");
        } else {
            baseUsername = "user";
        }

        if (baseUsername.isEmpty()) {
            baseUsername = "user";
        }

        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}
