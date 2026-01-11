package com.eventhub.service;

import com.eventhub.model.PasswordResetToken;
import com.eventhub.model.UserProfile;
import com.eventhub.repository.PasswordResetTokenRepository;
import com.eventhub.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PasswordResetService {
    
    private final PasswordResetTokenRepository tokenRepository;
    private final UserProfileRepository userProfileRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    private static final int TOKEN_EXPIRY_HOURS = 1;
    
    /**
     * Initiate password reset process
     */
    public void initiatePasswordReset(String email) {
        Optional<UserProfile> userOpt = userProfileRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists or not (security best practice)
            log.info("Password reset requested for non-existent email: {}", email);
            return;
        }
        
        UserProfile user = userOpt.get();
        
        // Delete any existing tokens for this user (find and delete manually to avoid @Transactional issues)
        try {
            tokenRepository.findByUserIdAndUsedFalseAndExpiresAtAfter(user.getId(), LocalDateTime.now())
                .ifPresent(token -> tokenRepository.delete(token));
        } catch (Exception e) {
            log.warn("Error deleting old tokens: {}", e.getMessage());
        }
        
        // Generate new token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS);
        
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setToken(token);
        resetToken.setExpiresAt(expiresAt);
        resetToken.setUsed(false);
        
        tokenRepository.save(resetToken);
        
        // Send email
        emailService.sendPasswordResetEmail(email, token);
        
        log.info("Password reset token generated for user: {}", email);
    }
    
    /**
     * Validate reset token
     */
    public boolean validateToken(String token) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        return resetToken.isValid();
    }
    
    /**
     * Reset password using token
     */
    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        
        if (!resetToken.isValid()) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }
        
        // Get user
        Optional<UserProfile> userOpt = userProfileRepository.findById(resetToken.getUserId());
        
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        UserProfile user = userOpt.get();
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userProfileRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        
        log.info("Password reset successful for user: {}", user.getEmail());
    }
    
    /**
     * Clean up expired tokens (can be called by scheduled job)
     */
    public void cleanupExpiredTokens() {
        try {
            // Find and delete expired tokens manually
            tokenRepository.findAll().stream()
                .filter(token -> token.getExpiresAt().isBefore(LocalDateTime.now()))
                .forEach(token -> tokenRepository.delete(token));
            log.info("Cleaned up expired password reset tokens");
        } catch (Exception e) {
            log.error("Error cleaning up expired tokens: {}", e.getMessage());
        }
    }
}
