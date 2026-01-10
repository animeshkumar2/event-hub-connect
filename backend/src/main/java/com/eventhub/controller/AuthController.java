package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.ForgotPasswordRequest;
import com.eventhub.dto.request.GoogleAuthRequest;
import com.eventhub.dto.request.LoginRequest;
import com.eventhub.dto.request.RegisterRequest;
import com.eventhub.dto.request.ResetPasswordRequest;
import com.eventhub.service.AuthService;
import com.eventhub.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthService.AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthService.AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthService.AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthService.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthService.GoogleAuthResponse>> googleAuth(@RequestBody GoogleAuthRequest request) {
        AuthService.GoogleAuthResponse response = authService.authenticateWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.success("Google authentication successful", response));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        passwordResetService.initiatePasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("If the email exists, a password reset link has been sent", null));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/validate-reset-token")
    public ResponseEntity<ApiResponse<Boolean>> validateResetToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token validation result", isValid));
    }
}


