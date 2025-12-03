package com.eventhub.service;

import com.eventhub.model.*;
import com.eventhub.repository.*;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {
    
    private final ListingRepository listingRepository;
    private final VendorRepository vendorRepository;
    private final EventTypeRepository eventTypeRepository;
    private final EventTypeCategoryRepository eventTypeCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final BookableSetupRepository bookableSetupRepository;
    
    /**
     * Search listings with strict filtering: Event Type → Category → Listing
     * This implements the critical business rule for filtering
     */
    public List<Listing> searchListings(
            Integer eventTypeId,
            String categoryId,
            Listing.ListingType listingType,
            String cityName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String searchQuery) {
        
        // Step 1: Validate event type exists
        if (eventTypeId != null) {
            EventType eventType = eventTypeRepository.findById(eventTypeId)
                    .orElseThrow(() -> new NotFoundException("Event type not found"));
            
            // Step 2: Get allowed categories for this event type
            List<EventTypeCategory> mappings = eventTypeCategoryRepository.findByEventType(eventType);
            List<String> allowedCategoryIds = mappings.stream()
                    .map(etc -> etc.getCategory().getId())
                    .collect(Collectors.toList());
            
            // Step 3: Apply strict filtering
            return listingRepository.findWithStrictFilters(
                    eventTypeId,
                    allowedCategoryIds,
                    listingType,
                    categoryId,
                    minPrice,
                    maxPrice
            );
        }
        
        // If no event type, return all active listings with basic filters
        return listingRepository.findWithFilters(null, categoryId, listingType);
    }
    
    /**
     * Search vendors (no event type filter)
     */
    public List<Vendor> searchVendors(
            String categoryId,
            String cityName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String searchQuery) {
        
        return vendorRepository.searchVendors(categoryId, cityName, minPrice, maxPrice, searchQuery);
    }
    
    /**
     * Get featured vendors for home page
     */
    public List<Vendor> getFeaturedVendors(int limit) {
        return vendorRepository.findFeaturedVendors().stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * Get trending bookable setups
     */
    public List<BookableSetup> getTrendingSetups(int limit) {
        // Implementation would query bookable setups by views/bookings
        // For now, return all active setups (can be enhanced with popularity logic)
        return bookableSetupRepository.findAll().stream()
                .filter(BookableSetup::getIsActive)
                .limit(limit)
                .collect(Collectors.toList());
    }
}

