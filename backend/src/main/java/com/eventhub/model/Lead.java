package com.eventhub.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false, insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Vendor vendor;
    
    @Column(name = "vendor_id", nullable = false)
    private UUID vendorId;
    
    @Column(name = "user_id")
    private UUID userId; // Can be null for anonymous leads
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(nullable = false, length = 255)
    private String email;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "event_type", length = 50)
    private String eventType;
    
    @Column(name = "event_date")
    private LocalDate eventDate;
    
    @Column(name = "venue_address", columnDefinition = "TEXT")
    private String venueAddress;
    
    @Column(name = "guest_count")
    private Integer guestCount;
    
    @Column(length = 100)
    private String budget; // e.g., "50,000 - 1,00,000"
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LeadStatus status = LeadStatus.NEW;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 20)
    private LeadSource source = LeadSource.INQUIRY; // Source of the lead
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order; // Reference to order if lead was created from direct order
    
    @Column(name = "order_id")
    private UUID orderId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Listing listing; // Reference to listing
    
    @Column(name = "listing_id")
    private UUID listingId;
    
    @Column(name = "token_amount", precision = 10, scale = 2)
    private BigDecimal tokenAmount; // Token amount paid for this lead
    
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
    
    public enum LeadStatus {
        NEW, OPEN, DECLINED, WITHDRAWN, CONVERTED
    }
    
    public enum LeadSource {
        INQUIRY,        // Manual inquiry from user
        DIRECT_ORDER,   // Created from direct order with token payment
        CHAT,           // Created from chat/negotiation
        OFFER           // Created from offer acceptance
    }
}











