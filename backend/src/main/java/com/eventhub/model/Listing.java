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
@Table(name = "listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ListingType type; // 'package' or 'item'
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @ManyToOne
    @JoinColumn(name = "listing_category_id", nullable = false)
    private Category listingCategory;
    
    @Column(columnDefinition = "TEXT[]")
    private List<String> images;
    
    // Package-specific fields
    @Column(name = "included_items_text", columnDefinition = "TEXT[]")
    private List<String> includedItemsText;
    
    @Column(name = "excluded_items_text", columnDefinition = "TEXT[]")
    private List<String> excludedItemsText;
    
    @Column(name = "delivery_time", length = 255)
    private String deliveryTime;
    
    @Column(name = "extra_charges", columnDefinition = "TEXT[]")
    private List<String> extraCharges;
    
    // Item-specific fields
    @Column(length = 50)
    private String unit; // e.g., "per piece", "per set"
    
    @Column(name = "minimum_quantity")
    private Integer minimumQuantity = 1;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_popular")
    private Boolean isPopular = false;
    
    @Column(name = "is_trending")
    private Boolean isTrending = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "listing_event_types",
        joinColumns = @JoinColumn(name = "listing_id"),
        inverseJoinColumns = @JoinColumn(name = "event_type_id")
    )
    private List<EventType> eventTypes;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ListingType {
        PACKAGE, ITEM
    }
}

