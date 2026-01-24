package com.eventhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * DTO for location autocomplete suggestions from geocoding service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationSuggestion {
    private String displayName;    // Full display name with context (e.g., "HSR Layout, Bangalore, Karnataka, India")
    private String shortName;      // Short area name (e.g., "HSR Layout")
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    public LocationSuggestion(String displayName, String shortName, double latitude, double longitude) {
        this.displayName = displayName;
        this.shortName = shortName;
        this.latitude = BigDecimal.valueOf(latitude);
        this.longitude = BigDecimal.valueOf(longitude);
    }
}
