package com.eventhub.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.math.BigDecimal;
import java.util.List;

@Data
public class VendorOnboardingRequest {
    @NotBlank(message = "Business name is required")
    private String businessName;
    
    @NotBlank(message = "Category ID is required")
    private String categoryId;
    
    private String customCategoryName; // Required when categoryId is "other"
    
    @NotBlank(message = "City name is required")
    private String cityName;
    
    private String phone;  // Optional - can add later
    
    private String email;
    private String instagram;
    private String bio;
    
    // Location System Fields
    private String locationName;        // Human-readable location name (e.g., "HSR Layout, Bangalore")
    private BigDecimal locationLat;     // Latitude
    private BigDecimal locationLng;     // Longitude
    
    @Min(value = 10, message = "Service radius must be at least 10 km")
    @Max(value = 100, message = "Service radius cannot exceed 100 km")
    private Integer serviceRadiusKm = 25;  // Default 25 km
    
    // Listing details - now optional
    private String listingName;
    private BigDecimal price;
    private String description;
    private List<String> images;
    private List<String> includedItemsText; // For package listings
    private Boolean isActive;
}

