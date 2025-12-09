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
            String searchQuery,
            String eventDate,
            String sortBy) {
        
        List<Listing> listings;
        
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
            // Convert list to comma-separated string for native query
            String categoryIdsStr = String.join(",", allowedCategoryIds);
            listings = listingRepository.findWithStrictFilters(
                    eventTypeId,
                    categoryIdsStr,
                    listingType != null ? listingType.name().toLowerCase() : null,
                    categoryId,
                    cityName,
                    minPrice,
                    maxPrice,
                    searchQuery
            );
        } else {
            // If no event type, return all active listings with basic filters
            listings = listingRepository.findWithFilters(null, categoryId, listingType != null ? listingType.name().toLowerCase() : null, cityName, minPrice, maxPrice, searchQuery);
        }
        
        // Apply sorting
        return applySorting(listings, sortBy);
    }
    
    /**
     * Search vendors with filters
     */
    public List<Vendor> searchVendors(
            String categoryId,
            String cityName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String searchQuery,
            Integer eventType,
            String eventDate,
            String sortBy) {
        
        List<Vendor> vendors = vendorRepository.searchVendors(categoryId, cityName, minPrice, maxPrice, searchQuery);
        
        // Apply sorting
        return applyVendorSorting(vendors, sortBy);
    }
    
    /**
     * Apply sorting to listings
     */
    private List<Listing> applySorting(List<Listing> listings, String sortBy) {
        if (sortBy == null || sortBy.equals("relevance")) {
            // Default: Popular first, then by rating
            return listings.stream()
                    .sorted((a, b) -> {
                        if (a.getIsPopular() != b.getIsPopular()) {
                            return Boolean.compare(b.getIsPopular(), a.getIsPopular());
                        }
                        return Integer.compare(
                                b.getIsTrending() ? 1 : 0,
                                a.getIsTrending() ? 1 : 0
                        );
                    })
                    .collect(Collectors.toList());
        }
        
        switch (sortBy.toLowerCase()) {
            case "price_low":
                return listings.stream()
                        .sorted((a, b) -> a.getPrice().compareTo(b.getPrice()))
                        .collect(Collectors.toList());
            case "price_high":
                return listings.stream()
                        .sorted((a, b) -> b.getPrice().compareTo(a.getPrice()))
                        .collect(Collectors.toList());
            case "rating":
                return listings.stream()
                        .sorted((a, b) -> {
                            // Sort by vendor rating if available
                            BigDecimal ratingA = a.getVendor() != null && a.getVendor().getRating() != null 
                                    ? a.getVendor().getRating() : BigDecimal.ZERO;
                            BigDecimal ratingB = b.getVendor() != null && b.getVendor().getRating() != null 
                                    ? b.getVendor().getRating() : BigDecimal.ZERO;
                            return ratingB.compareTo(ratingA);
                        })
                        .collect(Collectors.toList());
            case "newest":
                return listings.stream()
                        .sorted((a, b) -> {
                            if (a.getCreatedAt() != null && b.getCreatedAt() != null) {
                                return b.getCreatedAt().compareTo(a.getCreatedAt());
                            }
                            return 0;
                        })
                        .collect(Collectors.toList());
            default:
                return listings;
        }
    }
    
    /**
     * Apply sorting to vendors
     */
    private List<Vendor> applyVendorSorting(List<Vendor> vendors, String sortBy) {
        if (sortBy == null || sortBy.equals("relevance")) {
            // Default: Verified first, then by rating
            return vendors.stream()
                    .sorted((a, b) -> {
                        if (a.getIsVerified() != b.getIsVerified()) {
                            return Boolean.compare(b.getIsVerified(), a.getIsVerified());
                        }
                        if (a.getRating() != null && b.getRating() != null) {
                            return b.getRating().compareTo(a.getRating());
                        }
                        return 0;
                    })
                    .collect(Collectors.toList());
        }
        
        switch (sortBy.toLowerCase()) {
            case "price_low":
                return vendors.stream()
                        .sorted((a, b) -> {
                            BigDecimal priceA = a.getStartingPrice() != null ? a.getStartingPrice() : BigDecimal.ZERO;
                            BigDecimal priceB = b.getStartingPrice() != null ? b.getStartingPrice() : BigDecimal.ZERO;
                            return priceA.compareTo(priceB);
                        })
                        .collect(Collectors.toList());
            case "price_high":
                return vendors.stream()
                        .sorted((a, b) -> {
                            BigDecimal priceA = a.getStartingPrice() != null ? a.getStartingPrice() : BigDecimal.ZERO;
                            BigDecimal priceB = b.getStartingPrice() != null ? b.getStartingPrice() : BigDecimal.ZERO;
                            return priceB.compareTo(priceA);
                        })
                        .collect(Collectors.toList());
            case "rating":
                return vendors.stream()
                        .sorted((a, b) -> {
                            if (a.getRating() != null && b.getRating() != null) {
                                return b.getRating().compareTo(a.getRating());
                            }
                            return 0;
                        })
                        .collect(Collectors.toList());
            case "reviews":
                return vendors.stream()
                        .sorted((a, b) -> {
                            Integer reviewsA = a.getReviewCount() != null ? a.getReviewCount() : 0;
                            Integer reviewsB = b.getReviewCount() != null ? b.getReviewCount() : 0;
                            return reviewsB.compareTo(reviewsA);
                        })
                        .collect(Collectors.toList());
            default:
                return vendors;
        }
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

