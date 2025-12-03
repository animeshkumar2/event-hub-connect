package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vendor_wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorWallet {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false, unique = true)
    private Vendor vendor;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;
    
    @Column(name = "pending_balance", precision = 10, scale = 2)
    private BigDecimal pendingBalance = BigDecimal.ZERO; // Amount in pending orders
    
    @Column(name = "total_earned", precision = 10, scale = 2)
    private BigDecimal totalEarned = BigDecimal.ZERO;
    
    @Column(name = "total_withdrawn", precision = 10, scale = 2)
    private BigDecimal totalWithdrawn = BigDecimal.ZERO;
    
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

