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
@Table(name = "cart_items")
@EntityListeners(CartItemListener.class)
@Data
@NoArgsConstructor
@lombok.EqualsAndHashCode(exclude = {"vendor", "listing"})
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    @ManyToOne
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;
    
    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType; // Store as lowercase: 'package' or 'item' to match database constraint
    
    // Override Lombok's setter to ensure lowercase - CRITICAL for database constraint
    public void setItemType(String itemType) {
        if (itemType != null) {
            this.itemType = itemType.toLowerCase();
        } else {
            this.itemType = null;
        }
    }
    
    public String getItemType() {
        return itemType;
    }
    
    // Getter that returns enum
    public Listing.ListingType getItemTypeEnum() {
        if (itemType == null) return null;
        try {
            return Listing.ListingType.valueOf(itemType.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    // Setter that accepts enum and converts to lowercase string
    public void setItemTypeEnum(Listing.ListingType type) {
        if (type == null) {
            this.itemType = null;
        } else {
            // Directly set to lowercase - @PrePersist will also ensure it's lowercase
            this.itemType = type.name().toLowerCase();
        }
    }
    
    @Column(nullable = false)
    private Integer quantity = 1;
    
    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;
    
    @Column(name = "final_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalPrice; // After add-ons and customizations
    
    @Column(name = "event_date")
    private LocalDate eventDate;
    
    @Column(name = "event_time", length = 10)
    private String eventTime; // HH:MM format
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> customizations; // Flexible JSON for custom options
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Ensure itemType is set from listing if not already set
        if (itemType == null && listing != null && listing.getType() != null) {
            // Set directly to lowercase - bypass setter to ensure it's set correctly
            this.itemType = listing.getType().name().toLowerCase();
        }
        // CRITICAL: Force lowercase by directly setting field - Hibernate uses field access
        // This ensures the value is lowercase before database insertion
        if (itemType != null) {
            this.itemType = itemType.toLowerCase();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

