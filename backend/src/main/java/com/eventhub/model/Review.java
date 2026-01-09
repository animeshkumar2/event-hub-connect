package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "order_id")
    private UUID orderId; // Optional reference to order
    
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating; // 1.0 to 5.0
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "event_type", length = 50)
    private String eventType;
    
    @Column(columnDefinition = "TEXT[]")
    private List<String> images;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "is_visible")
    private Boolean isVisible = true;
    
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
}











