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
    
    @NotNull(message = "At least one event type is required")
    @Size(min = 1, message = "At least one event type is required")
    private List<Integer> eventTypeIds;
    
    private String unit;
    
    @Positive(message = "Minimum quantity must be positive")
    private Integer minimumQuantity = 1;
    
    private String deliveryTime;
    private List<String> extraCharges;
    private List<String> images;
}

