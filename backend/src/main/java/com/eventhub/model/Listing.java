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
    @JoinColumn(name = "vendor_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Vendor vendor;
    
    // Expose vendor ID for JSON serialization
    @com.fasterxml.jackson.annotation.JsonProperty("vendorId")
    public UUID getVendorId() {
        return vendor != null ? vendor.getId() : null;
    }
    
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
    @JoinColumn(name = "listing_category_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Category listingCategory;
    
    // Expose category ID for JSON serialization
    @com.fasterxml.jackson.annotation.JsonProperty("categoryId")
    public String getCategoryId() {
        return listingCategory != null ? listingCategory.getId() : null;
    }
    
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
    
    // Category-specific data (stored as JSON for flexibility)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "category_specific_data", columnDefinition = "JSONB")
    private String categorySpecificData;  // JSON format: category-specific fields like serviceType, pricingType, etc.
    
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
    
    @Column(name = "custom_notes", columnDefinition = "TEXT")
    private String customNotes;  // Additional notes, terms, customization options, etc.
    
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
    
    // Transient field to hold event type IDs for JSON serialization
    @Transient
    private List<Integer> eventTypeIds;
    
    // Expose event type IDs for JSON serialization
    @com.fasterxml.jackson.annotation.JsonProperty("eventTypeIds")
    public List<Integer> getEventTypeIds() {
        // If already set (by service layer), return it
        if (eventTypeIds != null) {
            return eventTypeIds;
        }
        // Otherwise, try to get from eventTypes if available
        if (eventTypes != null) {
            try {
                return eventTypes.stream()
                        .map(EventType::getId)
                        .toList();
            } catch (Exception e) {
                // If lazy loading fails, return empty list
                return List.of();
            }
        }
        return List.of();
    }
    
    public void setEventTypeIds(List<Integer> eventTypeIds) {
        this.eventTypeIds = eventTypeIds;
    }
    
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

