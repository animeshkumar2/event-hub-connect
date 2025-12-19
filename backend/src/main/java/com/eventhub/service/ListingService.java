package com.eventhub.service;

import com.eventhub.dto.ListingDTO;
import com.eventhub.model.Listing;
import com.eventhub.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ListingService {
    
    private final ListingRepository listingRepository;
    
    public List<ListingDTO> getListings(
        Integer eventTypeId,
        String categoryId,
        Listing.ListingType type
    ) {
        List<Listing> listings;
        if (eventTypeId != null) {
            listings = listingRepository.findByEventTypeWithFilters(
                eventTypeId, categoryId, type, null, null, PageRequest.of(0, 100)
            );
        } else {
            listings = listingRepository.findActiveListingsSimple(
                categoryId, type, null, null, PageRequest.of(0, 100)
            );
        }
        
        // Fetch event types to avoid N+1
        if (!listings.isEmpty()) {
            listings = listingRepository.fetchEventTypes(listings);
        }
        
        // Filter out drafts: must have images (SIZE() doesn't work on PostgreSQL arrays in JPQL)
        listings = listings.stream()
                .filter(l -> l.getImages() != null && !l.getImages().isEmpty())
                .collect(Collectors.toList());
        
        return listings.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    public ListingDTO getListingById(UUID id) {
        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Listing not found: " + id));
        
        // Prevent access to drafts on customer side
        // Drafts are: isActive=false, price<=0.01, or no images
        if (!listing.getIsActive() || 
            listing.getPrice().compareTo(new BigDecimal("0.01")) <= 0 ||
            listing.getImages() == null || listing.getImages().isEmpty()) {
            throw new RuntimeException("Listing not found: " + id);
        }
        
        return toDTO(listing);
    }
    
    public List<ListingDTO> getVendorListings(UUID vendorId) {
        // Use optimized query that excludes drafts (isActive=true, price>0.01)
        List<Listing> listings = listingRepository.findByVendorIdOptimized(vendorId);
        
        // Filter out drafts: must have images (SIZE() doesn't work on PostgreSQL arrays in JPQL)
        listings = listings.stream()
                .filter(l -> l.getImages() != null && !l.getImages().isEmpty())
                .collect(Collectors.toList());
        
        return listings.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    private ListingDTO toDTO(Listing listing) {
        ListingDTO dto = new ListingDTO();
        dto.setId(listing.getId());
        dto.setVendorId(listing.getVendor().getId());
        dto.setVendorName(listing.getVendor().getBusinessName());
        dto.setType(listing.getType().name().toLowerCase());
        dto.setName(listing.getName());
        dto.setDescription(listing.getDescription());
        dto.setPrice(listing.getPrice());
        dto.setCategoryId(listing.getListingCategory().getId());
        dto.setCategoryName(listing.getListingCategory().getName());
        dto.setImages(listing.getImages());
        dto.setIncludedItemsText(listing.getIncludedItemsText());
        dto.setExcludedItemsText(listing.getExcludedItemsText());
        dto.setDeliveryTime(listing.getDeliveryTime());
        dto.setExtraCharges(listing.getExtraCharges());
        dto.setUnit(listing.getUnit());
        dto.setMinimumQuantity(listing.getMinimumQuantity());
        dto.setEventTypeIds(listing.getEventTypes() != null ? 
            listing.getEventTypes().stream()
                .map(et -> et.getId())
                .collect(Collectors.toList()) : 
            List.of());
        dto.setIsPopular(listing.getIsPopular());
        dto.setIsTrending(listing.getIsTrending());
        return dto;
    }
}

