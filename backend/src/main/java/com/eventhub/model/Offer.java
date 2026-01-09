package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "offers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "thread_id", nullable = false)
    private ChatThread thread;
    
    @ManyToOne
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    // Offer details
    @Column(name = "offered_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal offeredPrice;
    
    @Column(name = "original_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;
    
    @Column(name = "customized_price", precision = 10, scale = 2)
    private BigDecimal customizedPrice; // Price after customization, before negotiation
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "customization", columnDefinition = "JSONB")
    private String customization; // JSON storing customization details
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    // Event details (optional)
    @Column(name = "event_type", length = 50)
    private String eventType;
    
    @Column(name = "event_date")
    private LocalDate eventDate;
    
    @Column(name = "event_time", length = 10)
    private String eventTime;
    
    @Column(name = "venue_address", columnDefinition = "TEXT")
    private String venueAddress;
    
    @Column(name = "guest_count")
    private Integer guestCount;
    
    // Offer status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OfferStatus status = OfferStatus.PENDING;
    
    // Counter offer (if vendor counters)
    @Column(name = "counter_price", precision = 10, scale = 2)
    private BigDecimal counterPrice;
    
    @Column(name = "counter_message", columnDefinition = "TEXT")
    private String counterMessage;
    
    // References
    @Column(name = "order_id")
    private UUID orderId;
    
    @Column(name = "lead_id")
    private UUID leadId;
    
    // Timestamps
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
    
    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;
    
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum OfferStatus {
        PENDING,      // Waiting for vendor response
        COUNTERED,    // Vendor made a counter offer
        ACCEPTED,     // Vendor accepted the offer
        REJECTED,     // Vendor rejected the offer
        WITHDRAWN     // User withdrew the offer
    }
}



