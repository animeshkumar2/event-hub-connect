package com.eventhub.service;

import com.eventhub.dto.VendorDTO;
import com.eventhub.model.Vendor;
import com.eventhub.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorService {
    
    private final VendorRepository vendorRepository;
    
    public List<VendorDTO> getAllVendors(String categoryId, String cityName, BigDecimal minRating) {
        List<Vendor> vendors;
        
        if (categoryId != null && cityName != null) {
            vendors = vendorRepository.findByVendorCategoryIdAndCityNameAndIsActiveTrue(
                categoryId, cityName
            );
        } else if (categoryId != null) {
            vendors = vendorRepository.findByVendorCategoryIdAndIsActiveTrue(categoryId);
        } else if (cityName != null) {
            vendors = vendorRepository.findByCityNameAndIsActiveTrue(cityName);
        } else if (minRating != null) {
            vendors = vendorRepository.findByMinRating(minRating);
        } else {
            vendors = vendorRepository.findByIsActiveTrue();
        }
        
        return vendors.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    public VendorDTO getVendorById(UUID id) {
        Vendor vendor = vendorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor not found: " + id));
        return toDTO(vendor);
    }
    
    public VendorDTO getVendorByUserId(UUID userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Vendor not found for user: " + userId));
        return toDTO(vendor);
    }
    
    private VendorDTO toDTO(Vendor vendor) {
        VendorDTO dto = new VendorDTO();
        dto.setId(vendor.getId());
        dto.setBusinessName(vendor.getBusinessName());
        dto.setCategoryId(vendor.getVendorCategory().getId());
        dto.setCategoryName(vendor.getVendorCategory().getName());
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
}

