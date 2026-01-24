package com.eventhub.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request DTO for updating vendor location settings.
 */
@Data
public class VendorLocationUpdateRequest {
    
    @NotBlank(message = "Location name is required")
    private String locationName;
    
    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;
    
    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;
    
    @NotNull(message = "Service radius is required")
    @Min(value = 10, message = "Service radius must be at least 10 km")
    @Max(value = 100, message = "Service radius cannot exceed 100 km")
    private Integer serviceRadiusKm;
}
