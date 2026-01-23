package com.eventhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * DTO for location data with coordinates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {
    private String name;           // Human-readable location name
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    public LocationDTO(String name, double latitude, double longitude) {
        this.name = name;
        this.latitude = BigDecimal.valueOf(latitude);
        this.longitude = BigDecimal.valueOf(longitude);
    }
}
