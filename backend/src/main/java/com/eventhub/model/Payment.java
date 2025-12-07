package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod; // 'razorpay', 'stripe', 'cash', etc.
    
    @Column(name = "payment_gateway", length = 50)
    private String paymentGateway; // 'razorpay', 'stripe'
    
    @Column(name = "transaction_id", length = 255)
    private String transactionId; // Payment gateway transaction ID
    
    @Convert(converter = PaymentStatusConverterForPayment.class)
    @Column(length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payment_data", columnDefinition = "jsonb")
    private Map<String, Object> paymentData; // Store gateway response
    
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    
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
    
    public enum PaymentStatus {
        PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
    }
}

