package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "callback_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CallbackRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 10)
    private String mobile;
    
    private LocalDate eventDate;
    
    @Column(name = "date_flexible")
    @Builder.Default
    private Boolean dateFlexible = false;
    
    @Column(columnDefinition = "TEXT")
    private String requirement;
    
    private String listingId;
    private String listingName;
    
    @Column(name = "vendor_id")
    private UUID vendorId;
    
    private String vendorName;
    
    private String category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CallbackStatus status = CallbackStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "called_at")
    private LocalDateTime calledAt;
    
    @Column(name = "called_by")
    private String calledBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum CallbackStatus {
        PENDING,      // New request, not yet called
        CALLED,       // Called the customer
        CONNECTED,    // Connected customer with vendor
        NOT_REACHABLE,// Customer not reachable
        NOT_INTERESTED,// Customer not interested
        CONVERTED     // Lead converted to booking
    }
}
