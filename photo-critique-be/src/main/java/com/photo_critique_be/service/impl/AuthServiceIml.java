package com.photo_critique_be.service.impl;

import com.photo_critique_be.config.security.user.CustomUserDetails;
import com.photo_critique_be.config.security.user.UserDetailsServiceImpl;
import com.photo_critique_be.constant.ExternalServiceConstant;
import com.photo_critique_be.dto.request.auth.*;
import com.photo_critique_be.dto.response.AuthResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.OtpRequestType;
import com.photo_critique_be.exception.*;
import com.photo_critique_be.mapper.UserMapper;
import com.photo_critique_be.model.User;
import com.photo_critique_be.repository.UserRepository;
import com.photo_critique_be.service.AuthService;
import com.photo_critique_be.config.security.jwt.JwtService;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceIml implements AuthService {

    private final UserRepository userRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LanguageService languageService;
    private final OtpService otpService;

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        // Get user info for response
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new AuthenticationException(languageService.getMessage(MessageCode.AUTH_INVALID_CREDENTIALS)));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new AuthenticationException(languageService.getMessage(MessageCode.AUTH_INVALID_CREDENTIALS));
        }

        // Load user details and generate token
        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(loginRequest.getEmail());
        String token = jwtService.generateAccessToken(userDetails);

        return AuthResponse.builder()
                .accessToken(token)
                .userInfo(userMapper.toResponse(user))
                .build();
    }

    @Override
    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new ConflictException(languageService.getMessage(MessageCode.AUTH_EMAIL_EXISTS));
        }

        if (registerRequest.getUsername() != null &&
                !registerRequest.getUsername().trim().isEmpty() &&
                userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new ConflictException(languageService.getMessage(MessageCode.AUTH_USERNAME_EXISTS));
        }

        boolean isSentOtp = otpService.sendOtp(
                registerRequest.getEmail(),
                OtpRequestType.REGISTER,
                LocaleContextHolder.getLocale()
        );

        if (!isSentOtp) {
            throw new ExternalServiceException(ExternalServiceConstant.SMTP_SERVICE, languageService.getMessage(MessageCode.OTP_SEND_FAILED));
        }
    }

    @Override
    public AuthResponse verifyRegistration(VerifyRegisterRequest registerRequest) {
        boolean verified = otpService.verifyOtp(registerRequest.getEmail(), OtpRequestType.REGISTER, registerRequest.getOtp());
        if (!verified) throw new AuthenticationException(languageService.getMessage(MessageCode.OTP_REGISTER_VERIFY_FAILED));

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        String username = registerRequest.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = generateUsernameFromEmail(registerRequest.getEmail());
        }
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());

        // Save user
        User savedUser = userRepository.save(user);

        // Generate JWT token
        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtService.generateAccessToken(userDetails);

        return AuthResponse.builder()
                .accessToken(token)
                .userInfo(userMapper.toResponse(savedUser))
                .build();
    }

    private String generateUsernameFromEmail(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        boolean isSentOtp = otpService.sendOtp(
                email,
                OtpRequestType.FORGOT_PASSWORD,
                LocaleContextHolder.getLocale()
        );

        if (!isSentOtp) {
            throw new ExternalServiceException(ExternalServiceConstant.SMTP_SERVICE, languageService.getMessage(MessageCode.OTP_SEND_FAILED));
        }
    }

    public String verifyResetOtp(VerifyOtpRequest request) {
        boolean verified = otpService.verifyOtp(request.getEmail(), OtpRequestType.FORGOT_PASSWORD, request.getOtp());
        if (!verified) throw new AuthenticationException(languageService.getMessage(MessageCode.OTP_FORGOT_PASSWORD_VERIFY_FAILED));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        return jwtService.generateResetToken(user.getId());
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!jwtService.validateResetToken(request.getResetToken())) {
            throw new AuthenticationException(languageService.getMessage(MessageCode.AUTH_RESET_TOKEN_INVALID));
        }

        String userId = jwtService.extractUserIdFromResetToken(request.getResetToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        try {
            userRepository.save(user);
        } catch (Exception e) {
            log.error("Update user password failed {}", e.getMessage(), e);
        }
    }

    public void resendOtp(ResendOtpRequest request) {
        String email = request.getEmail();
        if (request.getOtpRequestType().equals(OtpRequestType.FORGOT_PASSWORD.name())) {
            if (!userRepository.existsByEmail(email)) {
                throw new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND));
            }
        }

         boolean isSentOtp = otpService.resendOtp(
                 email,
                 OtpRequestType.valueOf(request.getOtpRequestType()),
                 LocaleContextHolder.getLocale()
         );

        if (!isSentOtp) {
            throw new ExternalServiceException(ExternalServiceConstant.SMTP_SERVICE, languageService.getMessage(MessageCode.OTP_SEND_FAILED));
        }
    }

}
