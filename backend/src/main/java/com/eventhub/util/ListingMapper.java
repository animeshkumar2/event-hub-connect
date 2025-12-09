package com.eventhub.util;

import com.eventhub.dto.ListingDTO;
import com.eventhub.model.Listing;
import com.eventhub.model.Vendor;
import org.springframework.stereotype.Component;

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
        }
        dto.setType(listing.getType() != null ? listing.getType().name().toLowerCase() : null);
        dto.setName(listing.getName());
        dto.setDescription(listing.getDescription());
        dto.setPrice(listing.getPrice());
        dto.setCategoryId(listing.getListingCategory() != null ? listing.getListingCategory().getId() : null);
        dto.setCategoryName(listing.getListingCategory() != null ? listing.getListingCategory().getDisplayName() : null);
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
        
        dto.setIsPopular(listing.getIsPopular());
        dto.setIsTrending(listing.getIsTrending());
        
        // New fields for enhanced package features
        dto.setHighlights(listing.getHighlights());
        dto.setIncludedItemIds(listing.getIncludedItemIds());
        dto.setExtraChargesJson(listing.getExtraChargesJson());
        
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
}

