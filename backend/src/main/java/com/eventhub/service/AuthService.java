package com.eventhub.service;

import com.eventhub.dto.request.LoginRequest;
import com.eventhub.dto.request.RegisterRequest;
import com.eventhub.model.UserProfile;
import com.eventhub.repository.UserProfileRepository;
import com.eventhub.util.JwtUtil;
import com.eventhub.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public AuthResponse register(RegisterRequest request) {
        if (userProfileRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already registered");
        }
        
        UserProfile user = new UserProfile();
        user.setId(UUID.randomUUID()); // In production, this would come from Supabase Auth
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getIsVendor() != null && request.getIsVendor() 
                ? UserProfile.Role.VENDOR 
                : UserProfile.Role.CUSTOMER);
        
        userProfileRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole().name());
    }
    
    public AuthResponse login(LoginRequest request) {
        UserProfile user = userProfileRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ValidationException("Invalid email or password"));
        
        // In production, verify password with Supabase Auth
        // For now, we'll just check if user exists
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole().name());
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private UUID userId;
        private String email;
        private String role;
    }
}

