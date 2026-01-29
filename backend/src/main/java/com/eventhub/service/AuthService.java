package com.eventhub.service;

import com.eventhub.dto.request.GoogleAuthRequest;
import com.eventhub.dto.request.LoginRequest;
import com.eventhub.dto.request.RegisterRequest;
import com.eventhub.model.UserProfile;
import com.eventhub.repository.UserProfileRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.util.JwtUtil;
import com.eventhub.util.PhoneValidator;
import com.eventhub.exception.ValidationException;
import com.eventhub.exception.AuthException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {
    
    private final UserProfileRepository userProfileRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @Value("${google.client.id:}")
    private String googleClientId;
    
    public AuthResponse register(RegisterRequest request) {
        // Validate and normalize phone number
        PhoneValidator.ValidationResult phoneValidation = PhoneValidator.validate(request.getPhone());
        if (!phoneValidation.isValid()) {
            throw new AuthException(
                AuthException.INVALID_PHONE_FORMAT,
                phoneValidation.getErrorMessage()
            );
        }
        String normalizedPhone = phoneValidation.getNormalizedPhone();
        
        // Check if phone already exists (phone is the primary identifier)
        if (userProfileRepository.existsByPhone(normalizedPhone)) {
            throw new AuthException(
                AuthException.PHONE_ALREADY_EXISTS, 
                "An account with this phone number already exists. Please login instead."
            );
        }
        
        // Check if email already exists
        if (userProfileRepository.existsByEmail(request.getEmail())) {
            throw new AuthException(
                AuthException.EMAIL_ALREADY_EXISTS, 
                "An account with this email already exists. Please login instead."
            );
        }
        
        // Validate password strength
        if (request.getPassword().length() < 8) {
            throw new AuthException(
                AuthException.WEAK_PASSWORD,
                "Password must be at least 8 characters long"
            );
        }
        
        UserProfile user = new UserProfile();
        user.setId(UUID.randomUUID());
        user.setEmail(request.getEmail()); // Can be null
        user.setFullName(request.getFullName());
        user.setPhone(normalizedPhone); // Store normalized phone
        user.setRole(request.getIsVendor() != null && request.getIsVendor() 
                ? UserProfile.Role.VENDOR 
                : UserProfile.Role.CUSTOMER);
        
        // Hash and store password
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        userProfileRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        
        // Fetch vendor ID if user is a vendor
        UUID vendorId = null;
        if (user.getRole() == UserProfile.Role.VENDOR) {
            vendorId = vendorRepository.findByUserId(user.getId())
                    .map(vendor -> vendor.getId())
                    .orElse(null);
        }
        
        return new AuthResponse(token, refreshToken, user.getId(), user.getEmail(), user.getPhone(), user.getFullName(), user.getRole().name(), vendorId, jwtUtil.getExpiresIn());
    }
    
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();
        UserProfile user;
        
        // Detect if identifier is email or phone
        if (isEmail(identifier)) {
            // Login with email
            user = userProfileRepository.findByEmail(identifier)
                    .orElseThrow(() -> new AuthException(
                        AuthException.EMAIL_NOT_FOUND,
                        "No account found with this email. Please check your email or sign up."
                    ));
        } else {
            // Login with phone - validate and normalize
            PhoneValidator.ValidationResult phoneValidation = PhoneValidator.validate(identifier);
            if (!phoneValidation.isValid()) {
                throw new AuthException(
                    AuthException.INVALID_PHONE_FORMAT,
                    phoneValidation.getErrorMessage()
                );
            }
            String normalizedPhone = phoneValidation.getNormalizedPhone();
            
            user = userProfileRepository.findByPhone(normalizedPhone)
                    .orElseThrow(() -> new AuthException(
                        AuthException.PHONE_NOT_FOUND,
                        "No account found with this phone number. Please check your number or sign up."
                    ));
        }
        
        // Verify password
        if (user.getPasswordHash() == null || 
            !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthException(
                AuthException.INVALID_PASSWORD,
                "Incorrect password. Please try again or reset your password."
            );
        }
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        
        // Fetch vendor ID if user is a vendor
        UUID vendorId = null;
        if (user.getRole() == UserProfile.Role.VENDOR) {
            vendorId = vendorRepository.findByUserId(user.getId())
                    .map(vendor -> vendor.getId())
                    .orElse(null);
        }
        
        return new AuthResponse(token, refreshToken, user.getId(), user.getEmail(), user.getPhone(), user.getFullName(), user.getRole().name(), vendorId, jwtUtil.getExpiresIn());
    }
    
    public GoogleAuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        try {
            // Verify the Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            
            GoogleIdToken idToken = verifier.verify(request.getCredential());
            
            if (idToken == null) {
                throw new AuthException(
                    AuthException.GOOGLE_AUTH_FAILED,
                    "Google authentication failed. Please try again."
                );
            }
            
            GoogleIdToken.Payload payload = idToken.getPayload();
            
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String googleUserId = payload.getSubject();
            
            log.info("Google auth for email: {}", email);
            
            // Check if user exists
            Optional<UserProfile> existingUser = userProfileRepository.findByEmail(email);
            
            boolean isNewUser = existingUser.isEmpty();
            UserProfile user;
            
            if (isNewUser) {
                // Create new user
                user = new UserProfile();
                user.setId(UUID.randomUUID());
                user.setEmail(email);
                user.setFullName(name != null ? name : email.split("@")[0]);
                user.setRole(request.isVendor() ? UserProfile.Role.VENDOR : UserProfile.Role.CUSTOMER);
                user.setGoogleId(googleUserId);
                user.setAvatarUrl(pictureUrl);
                // No password for Google users - they authenticate via Google
                user.setPasswordHash(null);
                
                userProfileRepository.save(user);
                log.info("Created new user via Google: {}", email);
            } else {
                user = existingUser.get();
                
                // Update Google ID if not set
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleUserId);
                    userProfileRepository.save(user);
                }
                
                // If existing user is trying to become a vendor
                if (request.isVendor() && user.getRole() == UserProfile.Role.CUSTOMER) {
                    // They'll need to go through vendor onboarding which will upgrade their role
                    log.info("Existing customer signing in as vendor: {}", email);
                }
            }
            
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            String refreshToken = jwtUtil.generateRefreshToken(user.getId());
            
            // Fetch vendor ID if user is a vendor
            UUID vendorId = null;
            if (user.getRole() == UserProfile.Role.VENDOR) {
                vendorId = vendorRepository.findByUserId(user.getId())
                        .map(vendor -> vendor.getId())
                        .orElse(null);
            }
            
            return new GoogleAuthResponse(
                    token,
                    refreshToken,
                    user.getId(), 
                    user.getEmail(),
                    user.getPhone(),
                    user.getFullName(),
                    user.getRole().name(), 
                    isNewUser,
                    vendorId,
                    jwtUtil.getExpiresIn()
            );
            
        } catch (AuthException e) {
            throw e; // Re-throw our custom exceptions
        } catch (Exception e) {
            log.error("Google authentication failed", e);
            throw new AuthException(
                AuthException.GOOGLE_AUTH_FAILED,
                "Google authentication failed. Please try again or use email/password."
            );
        }
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        try {
            // Validate refresh token
            if (!jwtUtil.validateToken(refreshToken)) {
                throw new AuthException(
                    AuthException.INVALID_TOKEN,
                    "Invalid or expired refresh token. Please log in again."
                );
            }
            
            // Get user ID from refresh token
            UUID userId = jwtUtil.getUserIdFromToken(refreshToken);
            
            // Fetch user
            UserProfile user = userProfileRepository.findById(userId)
                    .orElseThrow(() -> new AuthException(
                        AuthException.EMAIL_NOT_FOUND,
                        "User not found. Please log in again."
                    ));
            
            // Generate new tokens
            String newAccessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            String newRefreshToken = jwtUtil.generateRefreshToken(user.getId());
            
            // Fetch vendor ID if user is a vendor
            UUID vendorId = null;
            if (user.getRole() == UserProfile.Role.VENDOR) {
                vendorId = vendorRepository.findByUserId(user.getId())
                        .map(vendor -> vendor.getId())
                        .orElse(null);
            }
            
            return new AuthResponse(
                newAccessToken,
                newRefreshToken,
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getFullName(),
                user.getRole().name(),
                vendorId,
                jwtUtil.getExpiresIn()
            );
            
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            throw new AuthException(
                AuthException.INVALID_TOKEN,
                "Failed to refresh token. Please log in again."
            );
        }
    }
    
    /**
     * Check if the identifier looks like an email address
     */
    private boolean isEmail(String identifier) {
        return identifier != null && identifier.contains("@") && identifier.contains(".");
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private UUID userId;
        private String email;
        private String phone; // User's phone number
        private String fullName; // User's full name
        private String role;
        private UUID vendorId; // Include vendor ID for vendors
        private Long expiresIn; // Seconds until expiration
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class GoogleAuthResponse {
        private String token;
        private String refreshToken;
        private UUID userId;
        private String email;
        private String phone; // User's phone number
        private String fullName; // User's full name
        private String role;
        private boolean isNewUser;
        private UUID vendorId; // Include vendor ID for vendors
        private Long expiresIn; // Seconds until expiration
    }
}

