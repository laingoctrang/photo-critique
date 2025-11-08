package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.*;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.AuthResponse;
import com.photo_critique_be.enums.OtpRequestType;
import com.photo_critique_be.service.AuthService;
import com.photo_critique_be.service.LanguageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final LanguageService languageService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.AUTH_LOGIN_SUCCESS)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success(null, languageService.getMessage(MessageCode.OTP_REGISTER_SEND_SUCCESS)));
    }

    @PostMapping("/verify-registration")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyRegistration(@Valid @RequestBody VerifyRegisterRequest request) {
        AuthResponse response = authService.verifyRegistration(request);
        return ResponseEntity.ok(ApiResponse.created(response, languageService.getMessage(MessageCode.OTP_REGISTER_VERIFY_SUCCESS)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, languageService.getMessage(MessageCode.OTP_FORGOT_PASSWORD_SEND_SUCCESS)));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse<String>> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String resetToken = authService.verifyResetOtp(request);
        return ResponseEntity.ok(ApiResponse.success(resetToken, languageService.getMessage(MessageCode.OTP_FORGOT_PASSWORD_VERIFY_SUCCESS)));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, languageService.getMessage(MessageCode.AUTH_PASSWORD_RESET_SUCCESS)));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);

        MessageCode messageCode = request.getOtpRequestType().equals(OtpRequestType.REGISTER.name())
                ? MessageCode.OTP_REGISTER_SEND_SUCCESS
                : MessageCode.OTP_FORGOT_PASSWORD_SEND_SUCCESS;

        return ResponseEntity.ok(ApiResponse.success(null, languageService.getMessage(messageCode)));
    }

}
