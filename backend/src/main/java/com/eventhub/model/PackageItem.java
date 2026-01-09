package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "package_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"package_id", "item_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "package_id", nullable = false)
    private Listing packageListing; // Must be type PACKAGE
    
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Listing itemListing; // Must be type ITEM
    
    @Column(nullable = false)
    private Integer quantity = 1;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price; // Snapshot price at time of linking
    
    @Column(name = "display_order")
    private Integer displayOrder = 0; // Order in which items appear in package
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}











