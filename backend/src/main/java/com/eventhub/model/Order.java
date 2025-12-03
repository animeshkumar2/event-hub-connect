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
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber; // e.g., "EVT-2024-001"
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    @ManyToOne
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private Listing.ListingType itemType; // Must match listing.type
    
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
    
    // Pricing
    @Column(name = "base_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseAmount;
    
    @Column(name = "add_ons_amount", precision = 10, scale = 2)
    private BigDecimal addOnsAmount = BigDecimal.ZERO;
    
    @Column(name = "customizations_amount", precision = 10, scale = 2)
    private BigDecimal customizationsAmount = BigDecimal.ZERO;
    
    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    // Payment
    @Column(name = "token_paid", precision = 10, scale = 2)
    private BigDecimal tokenPaid = BigDecimal.ZERO; // Advance payment
    
    @Column(name = "balance_amount", precision = 10, scale = 2)
    private BigDecimal balanceAmount; // Remaining amount
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    // Order Status
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OrderStatus status = OrderStatus.PENDING;
    
    // Customer Details
    @Column(name = "customer_name", length = 255)
    private String customerName;
    
    @Column(name = "customer_email", length = 255)
    private String customerEmail;
    
    @Column(name = "customer_phone", length = 20)
    private String customerPhone;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> customizations;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (orderNumber == null) {
            orderNumber = generateOrderNumber();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String generateOrderNumber() {
        return "EVT-" + LocalDateTime.now().getYear() + "-" + String.format("%06d", id.hashCode() % 1000000);
    }
    
    public enum PaymentStatus {
        PENDING, PARTIAL, PAID, REFUNDED
    }
    
    public enum OrderStatus {
        PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED
    }
}

