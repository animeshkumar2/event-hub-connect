package com.eventhub.util;

import com.eventhub.dto.VendorDTO;
import com.eventhub.model.Vendor;
import org.springframework.stereotype.Component;

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
        dto.setPortfolioImages(vendor.getPortfolioImages());
        dto.setCoverageRadius(vendor.getCoverageRadius());
        dto.setIsVerified(vendor.getIsVerified());
        
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
}


