package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    @Id
    @Column(name = "id")
    private UUID id; // References auth.users(id)
    
    @Column(unique = true, length = 255)
    private String email; // Optional - can be null for phone-only users
    
    @Column(name = "full_name", length = 255)
    private String fullName;
    
    @Column(nullable = false, unique = true, length = 20)
    private String phone; // Required - primary identifier for login
    
    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;
    
    @Column(name = "google_id", length = 255)
    private String googleId; // Google OAuth user ID
    
    @Column(name = "password_hash", columnDefinition = "TEXT")
    private String passwordHash; // BCrypt hashed password (null for Google-only users)
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role = Role.CUSTOMER;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Role {
        CUSTOMER, VENDOR, ADMIN
    }
}

