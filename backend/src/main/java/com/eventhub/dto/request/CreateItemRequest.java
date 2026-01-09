package com.eventhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateItemRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    @NotBlank(message = "Category is required")
    private String categoryId;
    
    private String customCategoryName; // Required when categoryId is "other"
    
    @NotNull(message = "At least one event type is required")
    @Size(min = 1, message = "At least one event type is required")
    private List<Integer> eventTypeIds;
    
    // Highlights - key features
    private List<String> highlights;
    
    private String unit;
    
    @Positive(message = "Minimum quantity must be positive")
    private Integer minimumQuantity = 1;
    
    private String deliveryTime;
    
    // Extra charges with pricing
    private List<CreatePackageRequest.ExtraCharge> extraChargesDetailed;
    
    // Legacy text-based
    private List<String> extraCharges;
    
    private List<String> images;
    
    private Boolean openForNegotiation = true; // Allow customers to make offers on this listing
    
    // Control whether listing is active/visible to customers
    private Boolean isActive;
    
    // Mark as draft (incomplete listing)
    private Boolean isDraft;
}

