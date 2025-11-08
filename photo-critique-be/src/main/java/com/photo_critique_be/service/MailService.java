package com.photo_critique_be.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;
    private final EmailContentService emailContentService;

    @Value("${spring.mail.from}")
    private String fromEmail;

    /**
     * Send OTP email for registration
     */
    public boolean sendOtpForRegister(String toEmail, String otp, Locale locale) {
        String username = extractUsername(toEmail);

        return sendEmail(
                toEmail,
                "Verify Your Account", // Subject cho register
                emailContentService.getRegistrationOtpContent(username, otp, locale),
                "OTP Register"
        );
    }

    /**
     * Send OTP email for forgot password
     */
    public boolean sendOtpForForgotPassword(String toEmail, String otp, Locale locale) {
        String username = extractUsername(toEmail);

        return sendEmail(
                toEmail,
                "Reset Your Password", // Subject cho forgot password
                emailContentService.getForgotPasswordOtpContent(username, otp, locale),
                "OTP Forgot Password"
        );
    }

    /**
     * Send welcome email when user registers successfully
     */
    public boolean sendWelcomeMail(String toEmail, String loginUrl, Locale locale) {
        String username = extractUsername(toEmail);

        return sendEmail(
                toEmail,
                "Welcome to Photo Critique!",
                emailContentService.getWelcomeContent(username, loginUrl, locale),
                "Welcome"
        );
    }

    /**
     * Generic email sending method
     */
    private boolean sendEmail(String toEmail, String subject, String content, String emailType) {
        log.info("Sending {} email to: {}", emailType, toEmail);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            message.setContent(content, "text/html;charset=UTF-8");

            mailSender.send(message);
            log.info("Successfully sent {} email to: {}", emailType, toEmail);
            return true;

        } catch (MessagingException e) {
            log.error("Failed to send {} email to {}: {}", emailType, toEmail, e.getMessage(), e);
            return false;
        }
    }

    private String extractUsername(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        return email.substring(0, email.indexOf("@"));
    }
}