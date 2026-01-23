package com.eventhub.util;

import com.eventhub.dto.VendorDTO;
import com.eventhub.model.Vendor;
import com.eventhub.service.DistanceService;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class VendorMapper {
    
    public VendorDTO toDTO(Vendor vendor) {
        if (vendor == null) {
            return null;
        }
        
        VendorDTO dto = new VendorDTO();
        dto.setId(vendor.getId());
        dto.setBusinessName(vendor.getBusinessName());
        dto.setCategoryId(vendor.getVendorCategory() != null ? vendor.getVendorCategory().getId() : null);
        dto.setCategoryName(vendor.getVendorCategory() != null ? vendor.getVendorCategory().getDisplayName() : null);
        dto.setCustomCategoryName(vendor.getCustomCategoryName());
        dto.setCityName(vendor.getCityName());
        dto.setBio(vendor.getBio());
        dto.setRating(vendor.getRating());
        dto.setReviewCount(vendor.getReviewCount());
        dto.setStartingPrice(vendor.getStartingPrice());
        dto.setCoverImage(vendor.getCoverImage());
        dto.setProfileImage(vendor.getProfileImage());
        dto.setPortfolioImages(vendor.getPortfolioImages());
        dto.setCoverageRadius(vendor.getCoverageRadius());
        dto.setIsVerified(vendor.getIsVerified());
        
        // Location System Fields
        dto.setLocationName(vendor.getLocationName());
        dto.setLocationLat(vendor.getLocationLat());
        dto.setLocationLng(vendor.getLocationLng());
        dto.setServiceRadiusKm(vendor.getServiceRadiusKm());
        
        return dto;
    }
    
    public VendorDTO toDTO(Vendor vendor, Double distanceKm) {
        VendorDTO dto = toDTO(vendor);
        if (dto != null) {
            dto.setDistanceKm(distanceKm);
        }
        return dto;
    }
    
    public List<VendorDTO> toDTOList(List<Vendor> vendors) {
        if (vendors == null) {
            return null;
        }
        return vendors.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert vendors to DTOs with distance calculation from customer location.
     */
    public List<VendorDTO> toDTOListWithDistance(List<Vendor> vendors, BigDecimal customerLat, BigDecimal customerLng, DistanceService distanceService) {
        if (vendors == null) {
            return null;
        }
        
        return vendors.stream()
                .map(vendor -> {
                    VendorDTO dto = toDTO(vendor);
                    
                    // Calculate distance if customer location is provided
                    if (customerLat != null && customerLng != null && 
                        vendor.getLocationLat() != null && vendor.getLocationLng() != null) {
                        double distance = distanceService.calculateDistance(
                                vendor.getLocationLat(), vendor.getLocationLng(),
                                customerLat, customerLng);
                        dto.setDistanceKm(Math.round(distance * 10.0) / 10.0); // Round to 1 decimal
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
}


