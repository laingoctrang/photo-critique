package com.photo_critique_be.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailContentService {
    private final TemplateEngine templateEngine;

    private static final String REGISTER_OTP_TEMPLATE = "register-otp-template";
    private static final String FORGOT_PASSWORD_OTP_TEMPLATE = "forgot-password-otp-template";
    private static final String WELCOME_TEMPLATE = "welcome-template";

    /**
     * OTP Email for registration
     */
    public String getRegistrationOtpContent(String username, String otp, Locale locale) {
        return processTemplate(REGISTER_OTP_TEMPLATE, locale, Map.of(
                "username", username,
                "otp", otp
        ));
    }

    /**
     * OTP Email for forgot password
     */
    public String getForgotPasswordOtpContent(String username, String otp, Locale locale) {
        return processTemplate(FORGOT_PASSWORD_OTP_TEMPLATE, locale, Map.of(
                "username", username,
                "otp", otp
        ));
    }

    /**
     * Welcome Email - when user registers new account
     */
    public String getWelcomeContent(String username, String loginUrl, Locale locale) {
        return processTemplate(WELCOME_TEMPLATE, locale, Map.of(
                "username", username,
                "loginUrl", loginUrl,
                "supportEmail", "support@photo-verse.com",
                "currentYear", java.time.Year.now().getValue()
        ));
    }

    /**
     * Generic template processor
     */
    private String processTemplate(String templateName, Locale locale, Map<String, Object> variables) {
        Context context = new Context(locale);
        variables.forEach(context::setVariable);
        return templateEngine.process(templateName, context);
    }
}