package com.eventhub.util;

import com.eventhub.dto.ListingDTO;
import com.eventhub.model.Listing;
import com.eventhub.model.Vendor;
import com.eventhub.service.DistanceService;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ListingMapper {
    
    public ListingDTO toDTO(Listing listing) {
        if (listing == null) {
            return null;
        }
        
        ListingDTO dto = new ListingDTO();
        dto.setId(listing.getId());
        if (listing.getVendor() != null) {
            Vendor vendor = listing.getVendor();
            dto.setVendorId(vendor.getId());
            dto.setVendorName(vendor.getBusinessName());
            dto.setVendorCity(vendor.getCity() != null ? vendor.getCity().getName() : vendor.getCityName());
            // Use vendor's stored rating and review count (updated by review service)
            dto.setVendorRating(vendor.getRating() != null ? vendor.getRating().doubleValue() : null);
            dto.setVendorReviewCount(vendor.getReviewCount() != null ? vendor.getReviewCount() : 0);
            // Location System - Vendor location info
            dto.setVendorLocationName(vendor.getLocationName());
        }
        dto.setType(listing.getType() != null ? listing.getType().name().toLowerCase() : null);
        dto.setName(listing.getName());
        dto.setDescription(listing.getDescription());
        dto.setPrice(listing.getPrice());
        dto.setCategoryId(listing.getListingCategory() != null ? listing.getListingCategory().getId() : null);
        dto.setCategoryName(listing.getListingCategory() != null ? listing.getListingCategory().getDisplayName() : null);
        dto.setCustomCategoryName(listing.getCustomCategoryName());
        dto.setImages(listing.getImages());
        dto.setIncludedItemsText(listing.getIncludedItemsText());
        dto.setExcludedItemsText(listing.getExcludedItemsText());
        dto.setDeliveryTime(listing.getDeliveryTime());
        dto.setExtraCharges(listing.getExtraCharges());
        dto.setUnit(listing.getUnit());
        dto.setMinimumQuantity(listing.getMinimumQuantity());
        
        // Map event types
        if (listing.getEventTypes() != null) {
            dto.setEventTypeIds(listing.getEventTypes().stream()
                    .map(et -> et.getId())
                    .collect(Collectors.toList()));
        }
        
        dto.setIsActive(listing.getIsActive());
        dto.setIsDraft(listing.getIsDraft());
        dto.setIsPopular(listing.getIsPopular());
        dto.setIsTrending(listing.getIsTrending());
        dto.setOpenForNegotiation(listing.getOpenForNegotiation());
        
        // New fields for enhanced package features
        dto.setHighlights(listing.getHighlights());
        dto.setIncludedItemIds(listing.getIncludedItemIds());
        dto.setExtraChargesJson(listing.getExtraChargesJson());
        
        // Location System - Service Mode
        if (listing.getServiceMode() != null) {
            dto.setServiceMode(listing.getServiceMode().name());
            dto.setServiceModeLabel(listing.getServiceMode().getLabel());
        } else {
            dto.setServiceMode(Listing.ServiceMode.BOTH.name());
            dto.setServiceModeLabel(Listing.ServiceMode.BOTH.getLabel());
        }
        
        return dto;
    }
    
    public ListingDTO toDTO(Listing listing, Double distanceKm) {
        ListingDTO dto = toDTO(listing);
        if (dto != null) {
            dto.setDistanceKm(distanceKm);
        }
        return dto;
    }
    
    public List<ListingDTO> toDTOList(List<Listing> listings) {
        if (listings == null) {
            return null;
        }
        return listings.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert listings to DTOs with distance calculation from customer location.
     */
    public List<ListingDTO> toDTOListWithDistance(List<Listing> listings, BigDecimal customerLat, BigDecimal customerLng, DistanceService distanceService) {
        if (listings == null) {
            return null;
        }
        
        return listings.stream()
                .map(listing -> {
                    ListingDTO dto = toDTO(listing);
                    
                    // Calculate distance if customer location is provided
                    if (customerLat != null && customerLng != null && listing.getVendor() != null) {
                        Vendor vendor = listing.getVendor();
                        if (vendor.getLocationLat() != null && vendor.getLocationLng() != null) {
                            double distance = distanceService.calculateDistance(
                                    vendor.getLocationLat(), vendor.getLocationLng(),
                                    customerLat, customerLng);
                            dto.setDistanceKm(Math.round(distance * 10.0) / 10.0); // Round to 1 decimal
                        }
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
}

