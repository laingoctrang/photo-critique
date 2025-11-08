package com.photo_critique_be.enums;

import lombok.Getter;

@Getter
public enum MessageCode {
    // AUTH
    AUTH_REGISTER_SUCCESS("auth.register.success"),
    AUTH_LOGIN_SUCCESS("auth.login.success"),
    AUTH_LOGOUT_SUCCESS("auth.logout.success"),
    AUTH_PASSWORD_RESET_SUCCESS("auth.password.reset.success"),
    AUTH_PROFILE_UPDATED("auth.profile.updated"),

    AUTH_INVALID_CREDENTIALS("auth.invalid.credentials"),
    AUTH_ACCOUNT_DEACTIVATED("auth.account.deactivated"),
    AUTH_EMAIL_EXISTS("auth.email.exists"),
    AUTH_USERNAME_EXISTS("auth.username.exists"),
    AUTH_TOKEN_EXPIRED("auth.token.expired"),
    AUTH_RESET_TOKEN_INVALID("auth.reset.token.invalid"),
    AUTH_INSUFFICIENT_PERMISSIONS("auth.insufficient.permissions"),
    AUTH_UNAUTHORIZED("auth.unauthorized"),

    OTP_REGISTER_SEND_SUCCESS("otp.register.send.success"),
    OTP_REGISTER_VERIFY_SUCCESS("otp.register.verify.success"),
    OTP_REGISTER_VERIFY_FAILED("otp.register.verify.failed"),
    OTP_FORGOT_PASSWORD_SEND_SUCCESS("otp.forgotpassword.send.success"),
    OTP_FORGOT_PASSWORD_VERIFY_SUCCESS("otp.forgotpassword.verify.success"),
    OTP_FORGOT_PASSWORD_VERIFY_FAILED("otp.forgotpassword.verify.failed"),

    // VALIDATION
    VALIDATION_EMAIL_REQUIRED("validation.email.required"),
    VALIDATION_EMAIL_INVALID("validation.email.invalid"),
    VALIDATION_PASSWORD_REQUIRED("validation.password.required"),
    VALIDATION_PASSWORD_MIN_LENGTH("validation.password.min.length"),
    VALIDATION_FULLNAME_REQUIRED("validation.fullname.required"),
    VALIDATION_USERNAME_INVALID("validation.username.invalid"),

    // OTP
    OTP_SEND_SUCCESS("otp.send.success"),
    OTP_SEND_FAILED("otp.send.failed"),
    OTP_EMAIL_SUBJECT("otp.email.subject"),
    OTP_RESEND_SUCCESS("otp.resend.success"),
    OTP_VERIFICATION_SUCCESS("otp.verification.success"),
    OTP_VERIFICATION_FAILED("otp.verification.failed"),
    OTP_INVALID("otp.invalid"),
    OTP_EXPIRED("otp.expired"),
    OTP_NOT_FOUND("otp.not.found"),
    OTP_RATE_LIMIT_EXCEEDED("otp.rate.limit.exceeded"),
    OTP_MAX_ATTEMPTS_EXCEEDED("otp.max.attempts.exceeded"),

    // USER
    USER_NOT_FOUND("user.not.found");

    private final String code;

    MessageCode(String code) {
        this.code = code;
    }
}
