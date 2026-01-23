package com.eventhub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
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
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false, insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Vendor vendor;
    
    @Column(name = "vendor_id", nullable = false)
    private UUID vendorId;
    
    @Convert(converter = ListingTypeConverter.class)
    @Column(nullable = false, length = 20)
    private ListingType type; // 'package' or 'item'
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_category_id", nullable = false, insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Category listingCategory;
    
    @Column(name = "listing_category_id", nullable = false)
    private String listingCategoryId;
    
    @Column(name = "custom_category_name", length = 255)
    private String customCategoryName; // Custom category name when listingCategory is "other"
    
    @Column(columnDefinition = "TEXT[]")
    private List<String> images;
    
    // Package-specific fields
    @Column(name = "highlights", columnDefinition = "TEXT[]")
    private List<String> highlights;  // Quick highlights shown at top (e.g., "Mandap decoration", "Stage decoration")
    
    @Column(name = "included_items_text", columnDefinition = "TEXT[]")
    private List<String> includedItemsText;  // Text-based inclusions for packages without linked items
    
    @Column(name = "excluded_items_text", columnDefinition = "TEXT[]")
    private List<String> excludedItemsText;
    
    @Column(name = "included_item_ids", columnDefinition = "UUID[]")
    private List<UUID> includedItemIds;  // References to actual item listings that are part of this package
    
    @Column(name = "delivery_time", length = 255)
    private String deliveryTime;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extra_charges_json", columnDefinition = "JSONB")
    private String extraChargesJson;  // JSON format: [{"name": "Additional lighting", "price": 10000}, ...]
    
    @Column(name = "extra_charges", columnDefinition = "TEXT[]")
    private List<String> extraCharges;  // Legacy text format
    
    // Item-specific fields
    @Column(length = 50)
    private String unit; // e.g., "per piece", "per set"
    
    @Column(name = "minimum_quantity")
    private Integer minimumQuantity = 1;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_draft")
    private Boolean isDraft = false;
    
    @Column(name = "is_popular")
    private Boolean isPopular = false;
    
    @Column(name = "is_trending")
    private Boolean isTrending = false;
    
    @Column(name = "open_for_negotiation")
    private Boolean openForNegotiation = true;
    
    // Location System - Service Mode
    @Enumerated(EnumType.STRING)
    @Column(name = "service_mode", length = 20)
    private ServiceMode serviceMode = ServiceMode.BOTH;
    
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
    @JsonIgnore
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
    
    public enum ServiceMode {
        CUSTOMER_VISITS,
        VENDOR_TRAVELS,
        BOTH;
        
        public String getLabel() {
            switch (this) {
                case CUSTOMER_VISITS:
                    return "Visit their studio";
                case VENDOR_TRAVELS:
                    return "Travels to your venue";
                case BOTH:
                    return "Both options available";
                default:
                    return "Both options available";
            }
        }
    }
}

