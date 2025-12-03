package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wallet_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private VendorWallet wallet;
    
    @Column(name = "order_id")
    private UUID orderId; // Reference to order (for earnings)
    
    @Column(name = "payout_id")
    private UUID payoutId; // Reference to payout (for withdrawals)
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceAfter; // Balance after this transaction
    
    @Column(length = 255)
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum TransactionType {
        EARNING, WITHDRAWAL, REFUND, ADJUSTMENT
    }
}

