package com.eventhub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.frontend.url:http://localhost:8080}")
    private String frontendUrl;
    
    @Value("${app.email.from}")
    private String fromEmail;
    
    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Reset Your Password - CartEvent");
            message.setText(buildPasswordResetEmailBody(resetLink));
            
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            // Still log to console as fallback for development
            logPasswordResetEmail(toEmail, resetLink);
        }
    }
    
    private String buildPasswordResetEmailBody(String resetLink) {
        return """
                Hi,
                
                You requested to reset your password. Click the link below to reset it:
                
                %s
                
                This link will expire in 1 hour.
                
                If you didn't request this, please ignore this email.
                
                Thanks,
                CartEvent Team
                """.formatted(resetLink);
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
