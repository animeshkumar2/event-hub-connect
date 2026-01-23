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
public class VendorDTO {
    private UUID id;
    private String businessName;
    private String categoryId;
    private String categoryName;
    private String customCategoryName; // Custom category name when categoryId is "other"
    private String cityName;
    private String bio;
    private BigDecimal rating;
    private Integer reviewCount;
    private BigDecimal startingPrice;
    private String coverImage;
    private String profileImage;
    private List<String> portfolioImages;
    private Integer coverageRadius;
    private Boolean isVerified;
    
    // Location System Fields
    private String locationName;
    private BigDecimal locationLat;
    private BigDecimal locationLng;
    private Integer serviceRadiusKm;
    private Double distanceKm; // Calculated distance from customer (for search results)
}


