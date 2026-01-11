package com.eventhub.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {
    
    @Value("${app.frontend.url:http://localhost:8080}")
    private String frontendUrl;
    
    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;
    
    /**
     * Send password reset email
     * For now, logs to console. Can be extended to use SMTP later.
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        
        if (emailEnabled) {
            // TODO: Implement actual email sending with SMTP
            log.info("Email sending is enabled but not yet implemented");
            logPasswordResetEmail(toEmail, resetLink);
        } else {
            // Log to console for development
            logPasswordResetEmail(toEmail, resetLink);
        }
    }
    
    private void logPasswordResetEmail(String toEmail, String resetLink) {
        log.info("=".repeat(80));
        log.info("PASSWORD RESET EMAIL");
        log.info("=".repeat(80));
        log.info("To: {}", toEmail);
        log.info("Subject: Reset Your Password - CartEvent");
        log.info("");
        log.info("Hi,");
        log.info("");
        log.info("You requested to reset your password. Click the link below to reset it:");
        log.info("");
        log.info("Reset Link: {}", resetLink);
        log.info("");
        log.info("This link will expire in 1 hour.");
        log.info("");
        log.info("If you didn't request this, please ignore this email.");
        log.info("");
        log.info("Thanks,");
        log.info("CartEvent Team");
        log.info("=".repeat(80));
    }
}
