package com.eventhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingDTO {
    private UUID id;
    private UUID vendorId;
    private String vendorName;
    private String vendorCity;
    private Double vendorRating;
    private Integer vendorReviewCount;
    private String type; // 'package' or 'item'
    private String name;
    private String description;
    private BigDecimal price;
    private String categoryId;
    private String categoryName;
    private String customCategoryName; // Custom category name when categoryId is "other"
    private List<String> images;
    private List<String> includedItemsText;
    private List<String> excludedItemsText;
    private String deliveryTime;
    private List<String> extraCharges;
    private String unit;
    private Integer minimumQuantity;
    private List<Integer> eventTypeIds;
    private List<Object> eventTypes; // For backward compatibility with frontend
    private Boolean isActive;
    private Boolean isDraft;
    private Boolean isPopular;
    private Boolean isTrending;
    private Boolean openForNegotiation;    // If true, customers can make offers on this listing
    private String customNotes;            // Additional notes, terms, customization options
    
    // New fields for enhanced package features
    private List<String> highlights;        // Key features shown at top of listing
    private List<UUID> includedItemIds;     // UUIDs of item listings included in package
    private String extraChargesJson;        // JSON array: [{"name": "...", "price": 10000}]
    private String categorySpecificData;    // JSON object with category-specific fields
    
    // Location System - Service Mode
    private String serviceMode;             // CUSTOMER_VISITS, VENDOR_TRAVELS, BOTH
    private String serviceModeLabel;        // Human-readable label
    
    // Location System - Vendor location info for display
    private String vendorLocationName;      // Vendor's base area
    private Double distanceKm;              // Distance from customer (for search results)
}

