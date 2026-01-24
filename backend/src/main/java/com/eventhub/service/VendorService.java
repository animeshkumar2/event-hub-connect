package com.eventhub.service;

import com.eventhub.dto.VendorDTO;
import com.eventhub.dto.request.VendorLocationUpdateRequest;
import com.eventhub.exception.NotFoundException;
import com.eventhub.exception.ValidationException;
import com.eventhub.model.Vendor;
import com.eventhub.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
        
        // Location fields
        dto.setLocationName(vendor.getLocationName());
        dto.setServiceRadiusKm(vendor.getServiceRadiusKm());
        
        return dto;
    }
    
    /**
     * Get current vendor's location settings.
     */
    public VendorDTO getCurrentVendorLocation() {
        UUID userId = getCurrentUserId();
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new NotFoundException("Vendor not found for current user"));
        return toDTO(vendor);
    }
    
    /**
     * Update current vendor's location settings.
     */
    @Transactional
    public VendorDTO updateVendorLocation(VendorLocationUpdateRequest request) {
        UUID userId = getCurrentUserId();
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new NotFoundException("Vendor not found for current user"));
        
        // Validate coordinates
        if (request.getLatitude().doubleValue() < -90 || request.getLatitude().doubleValue() > 90) {
            throw new ValidationException("Invalid latitude. Must be between -90 and 90.");
        }
        if (request.getLongitude().doubleValue() < -180 || request.getLongitude().doubleValue() > 180) {
            throw new ValidationException("Invalid longitude. Must be between -180 and 180.");
        }
        
        // Update location fields
        vendor.setLocationName(request.getLocationName());
        vendor.setLocationLat(request.getLatitude());
        vendor.setLocationLng(request.getLongitude());
        vendor.setServiceRadiusKm(request.getServiceRadiusKm());
        
        vendor = vendorRepository.save(vendor);
        return toDTO(vendor);
    }
    
    /**
     * Get current authenticated user ID.
     */
    private UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ValidationException("User not authenticated");
        }
        return UUID.fromString(auth.getName());
    }
}

