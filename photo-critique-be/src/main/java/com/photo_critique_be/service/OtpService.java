package com.photo_critique_be.service;

import com.photo_critique_be.constant.RedisPrefixKeyConstant;
import com.photo_critique_be.enums.OtpRequestType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {
    private final RedisTemplate<String, String> redisTemplate;
    private final MailService mailService;

    @Value("${app.otp.expire-time.default:300}")
    private int defaultExpireTime;

    @Value("${app.otp.expire-time.forgot-password:900}")
    private int forgotPasswordExpireTime;

    public boolean sendOtp(String email, OtpRequestType requestType, Locale locale) {
        try {
            String otp = generateOtp();
            int expireTime = getExpireTime(requestType);

            // Save to Redis
            String key = generateRedisKey(email, requestType, otp);
            redisTemplate.opsForValue().set(key, otp, expireTime, TimeUnit.SECONDS);

            log.info("Generated OTP for {} ({}): {}", email, requestType, otp);

            // Send email
            boolean emailSent;
            switch (requestType) {
                case FORGOT_PASSWORD ->  emailSent = mailService.sendOtpForForgotPassword(email, otp, locale);
                default -> emailSent = mailService.sendOtpForRegister(email, otp, locale);
            }

            if (!emailSent) {
                // Cleanup if email sending failed
                redisTemplate.delete(key);
                return false;
            }

            return true;

        } catch (Exception e) {
            log.error("Error sending OTP to {} for {}: {}", email, requestType, e.getMessage(), e);
            return false;
        }
    }

    public boolean verifyOtp(String email, OtpRequestType requestType, String otp) {
        try {
            String key = generateRedisKey(email, requestType, otp);
            String storedOtp = redisTemplate.opsForValue().get(key);

            if (otp.equals(storedOtp)) {
                // Delete OTP after successful verification
                deleteOtpAsync(key);
                log.info("OTP verified successfully for {}: {}", email, requestType);
                return true;
            }

            log.warn("Invalid OTP for {}: {}", email, requestType);
            return false;

        } catch (Exception e) {
            log.error("Error verifying OTP for {}: {}", email, e.getMessage(), e);
            return false;
        }
    }

    public boolean isOtpValid(String email, OtpRequestType requestType, String otp) {
        try {
            String key = generateRedisKey(email, requestType, otp);
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            log.error("Error checking OTP validity for {}: {}", email, e.getMessage(), e);
            return false;
        }
    }

    public boolean resendOtp(String email, OtpRequestType requestType, Locale locale) {
        try {
            // Clean up any existing OTPs for this email and request type
            cleanupExistingOtps(email, requestType);
            // Send new OTP
            return sendOtp(email, requestType, locale);
        } catch (Exception e) {
            log.error("Error resending OTP to {}: {}", email, e.getMessage(), e);
            return false;
        }
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

    private String generateRedisKey(String email, OtpRequestType requestType, String otp) {
        return String.format("%s:%s:%s:%s",
                RedisPrefixKeyConstant.OTP,
                requestType.name(),
                email,
                otp
        );
    }

    private int getExpireTime(OtpRequestType requestType) {
        return switch (requestType) {
            case FORGOT_PASSWORD -> forgotPasswordExpireTime;
            default -> defaultExpireTime;
        };
    }

    @Async
    public void deleteOtpAsync(String key) {
        try {
            redisTemplate.delete(key);
            log.debug("Deleted OTP key: {}", key);
        } catch (Exception e) {
            log.error("Error deleting OTP key {}: {}", key, e.getMessage(), e);
        }
    }

    private void cleanupExistingOtps(String email, OtpRequestType requestType) {
        try {
            String pattern = String.format("%s:%s:%s:*",
                    RedisPrefixKeyConstant.OTP,
                    requestType.name(),
                    email
            );

            var keys = redisTemplate.keys(pattern);
            if (!keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("Cleaned up {} existing OTPs for {}: {}", keys.size(), email, requestType);
            }
        } catch (Exception e) {
            log.error("Error cleaning up OTPs for {}: {}", email, e.getMessage(), e);
        }
    }
}