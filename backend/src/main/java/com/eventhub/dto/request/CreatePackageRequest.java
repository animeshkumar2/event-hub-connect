package com.eventhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreatePackageRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    @NotBlank(message = "Category is required")
    private String categoryId;
    
    @NotNull(message = "At least one event type is required")
    @Size(min = 1, message = "At least one event type is required")
    private List<Integer> eventTypeIds;
    
    // Highlights - key features shown at top
    private List<String> highlights;
    
    // Text-based inclusions (for custom packages)
    private List<String> includedItemsText;
    
    // Link existing items to this package
    private List<UUID> includedItemIds;
    
    private List<String> excludedItemsText;
    private String deliveryTime;
    
    // Extra charges with pricing - JSON format: [{"name": "Additional lighting", "price": 10000}]
    private List<ExtraCharge> extraChargesDetailed;
    
    // Legacy text-based extra charges
    private List<String> extraCharges;
    
    private List<String> images;
    
    @Data
    public static class ExtraCharge {
        private String name;
        private BigDecimal price;
    }
}

