package com.photo_critique_be.config.security.jwt;

import com.photo_critique_be.config.security.user.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.access.secret}")
    private String accessTokenSecret;

    @Value("${app.jwt.access.expire}")
    private Long accessTokenExpiration;

    @Value("${app.jwt.reset.secret}")
    private String resetTokenSecret;

    @Value("${app.jwt.reset.expire}")
    private Long resetTokenExpiration;

    private SecretKey getAccessTokenSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(this.accessTokenSecret));
    }

    private SecretKey getResetTokenSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(this.resetTokenSecret));
    }

    public String extractUsername(String token) {
        return extractAccessTokenClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractAccessTokenClaim(token, Claims::getExpiration);
    }

    public <T> T extractAccessTokenClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllAccessTokenClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllAccessTokenClaims(String token) {
        return Jwts.parser()
                .verifyWith(getAccessTokenSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isAccessTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateAccessToken(CustomUserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("userId", userDetails.getId())
                .claim("username", userDetails.getActualUsername())
                .claim("fullName", userDetails.getFullName())
                .claim("profilePicture", userDetails.getProfilePicture())
                .claim("roles", userDetails.getAuthorities())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getAccessTokenSigningKey())
                .compact();
    }

    public Boolean validateAccessToken(String token, UserDetails userDetails) {
        String email = extractUsername(token);
        return (email.equals(userDetails.getUsername()) && !isAccessTokenExpired(token));
    }

    public String generateResetToken(String userId) {
        return Jwts.builder()
                .subject(userId)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + resetTokenExpiration))
                .signWith(getResetTokenSigningKey())
                .compact();
    }

    public String extractUserIdFromResetToken(String resetToken) {
        return extractResetTokenClaim(resetToken, Claims::getSubject);
    }

    public <T> T extractResetTokenClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllResetTokenClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllResetTokenClaims(String token) {
        return Jwts.parser()
                .verifyWith(getResetTokenSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Boolean validateResetToken(String resetToken) {
        try {
            Claims claims = extractAllResetTokenClaims(resetToken);

            Date expiration = claims.getExpiration();
            boolean isExpired = expiration.before(new Date());

            return !isExpired;
        } catch (Exception e) {
            return false;
        }
    }
}
