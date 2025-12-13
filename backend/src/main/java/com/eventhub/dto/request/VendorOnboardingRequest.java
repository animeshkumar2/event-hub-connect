package com.eventhub.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    
    private String phone;
    private String email;
    private String instagram;
    private String bio;
    
    // Listing details - now optional
    private String listingName;
    private BigDecimal price;
    private String description;
    private List<String> images;
    private List<String> includedItemsText; // For package listings
    private Boolean isActive;
}

