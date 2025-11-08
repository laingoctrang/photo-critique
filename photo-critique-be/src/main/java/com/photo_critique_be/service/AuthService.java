package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.*;
import com.photo_critique_be.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);

    void register(RegisterRequest registerRequest);

    AuthResponse verifyRegistration(VerifyRegisterRequest registerRequest);

    void forgotPassword(ForgotPasswordRequest forgotPasswordRequest);

    String verifyResetOtp(VerifyOtpRequest verifyOtpRequest);

    void resetPassword(ResetPasswordRequest resetPasswordRequest);

    void resendOtp(ResendOtpRequest resendOtpRequest);
}
