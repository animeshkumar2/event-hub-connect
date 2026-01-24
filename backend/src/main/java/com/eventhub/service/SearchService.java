package com.eventhub.service;

import com.eventhub.model.*;
import com.eventhub.repository.*;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final DistanceService distanceService;
    
    /**
     * Search listings with optimized JPQL queries (JOIN FETCH to avoid N+1)
     * Uses pagination for performance
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
            String sortBy,
            Integer limit,
            Integer offset) {
        
        // Defensive default to cap result set and improve performance
        int effectiveLimit = (limit != null && limit > 0) ? Math.min(limit, 50) : 12;
        int effectiveOffset = (offset != null && offset >= 0) ? offset : 0;
        int pageNumber = effectiveOffset / effectiveLimit;
        
        Pageable pageable = PageRequest.of(pageNumber, effectiveLimit);
        
        List<Listing> listings;
        
        if (eventTypeId != null) {
            // Query with eventType filter - uses JOIN FETCH for vendor and category
            listings = listingRepository.findByEventTypeWithFilters(
                    eventTypeId,
                    categoryId,
                    listingType,
                    minPrice,
                    maxPrice,
                    pageable
            );
        } else {
            // Query without eventType - uses JOIN FETCH for vendor and category
            listings = listingRepository.findActiveListingsSimple(
                    categoryId,
                    listingType,
                    minPrice,
                    maxPrice,
                    pageable
            );
        }
        
        // Batch fetch eventTypes to avoid N+1 for eventTypes collection
        if (!listings.isEmpty()) {
            listings = listingRepository.fetchEventTypes(listings);
        }
        
        // Filter out drafts: must have images (SIZE() doesn't work on PostgreSQL arrays in JPQL)
        listings = listings.stream()
                .filter(l -> l.getImages() != null && !l.getImages().isEmpty())
                .collect(Collectors.toList());
        
        // Apply text search filter in memory (for simplicity; can be moved to DB later)
        if (searchQuery != null && !searchQuery.isBlank()) {
            String query = searchQuery.toLowerCase();
            listings = listings.stream()
                    .filter(l -> (l.getName() != null && l.getName().toLowerCase().contains(query)) ||
                                 (l.getDescription() != null && l.getDescription().toLowerCase().contains(query)))
                    .collect(Collectors.toList());
        }
        
        // Apply city filter in memory (vendor relationship already fetched)
        if (cityName != null && !cityName.isBlank()) {
            listings = listings.stream()
                    .filter(l -> l.getVendor() != null && 
                                 cityName.equalsIgnoreCase(l.getVendor().getCityName()))
                    .collect(Collectors.toList());
        }
        
        // Sorting is already done in the query (ORDER BY), but apply custom sort if needed
        return applySorting(listings, sortBy);
    }
    
    /**
     * Search vendors with optimized JPQL query
     */
    public List<Vendor> searchVendors(
            String categoryId,
            String cityName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String searchQuery,
            Integer eventType,
            String eventDate,
            String sortBy,
            Integer limit,
            Integer offset) {
        
        // Defensive defaults
        int effectiveLimit = (limit != null && limit > 0) ? Math.min(limit, 50) : 12;
        int effectiveOffset = (offset != null && offset >= 0) ? offset : 0;
        int pageNumber = effectiveOffset / effectiveLimit;
        
        Pageable pageable = PageRequest.of(pageNumber, effectiveLimit);
        
        List<Vendor> vendors = vendorRepository.searchVendorsOptimized(
                categoryId, cityName, minPrice, maxPrice, pageable);
        
        // Apply text search filter in memory (for simplicity)
        if (searchQuery != null && !searchQuery.isBlank()) {
            String query = searchQuery.toLowerCase();
            vendors = vendors.stream()
                    .filter(v -> v.getBusinessName() != null && 
                                 v.getBusinessName().toLowerCase().contains(query))
                    .collect(Collectors.toList());
        }
        
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
    
    /**
     * Search listings with location-based filtering.
     * Implements bidirectional matching: both customer and vendor must be within each other's radius.
     */
    public List<Listing> searchListingsWithLocation(
            Integer eventTypeId,
            String categoryId,
            Listing.ListingType listingType,
            String cityName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String searchQuery,
            String eventDate,
            String sortBy,
            Integer limit,
            Integer offset,
            BigDecimal customerLat,
            BigDecimal customerLng,
            Integer searchRadiusKm) {
        
        // First get listings without location filter
        List<Listing> listings = searchListings(
                eventTypeId, categoryId, listingType, cityName,
                minPrice, maxPrice, searchQuery, eventDate, sortBy,
                limit != null ? limit * 3 : 36, // Fetch more to account for location filtering
                offset);
        
        // If no location provided, return as-is
        if (customerLat == null || customerLng == null) {
            return listings.stream().limit(limit != null ? limit : 12).collect(Collectors.toList());
        }
        
        int effectiveSearchRadius = searchRadiusKm != null ? searchRadiusKm : 20;
        
        // Filter by bidirectional location matching
        return listings.stream()
                .filter(listing -> {
                    Vendor vendor = listing.getVendor();
                    if (vendor == null || vendor.getLocationLat() == null || vendor.getLocationLng() == null) {
                        return false; // Exclude vendors without location
                    }
                    
                    return distanceService.isBidirectionalMatch(
                            vendor.getLocationLat(), vendor.getLocationLng(), vendor.getServiceRadiusKm(),
                            customerLat, customerLng, effectiveSearchRadius);
                })
                .limit(limit != null ? limit : 12)
                .collect(Collectors.toList());
    }
    
    /**
     * Search vendors with location-based filtering.
     * Implements bidirectional matching: both customer and vendor must be within each other's radius.
     */
    public List<Vendor> searchVendorsWithLocation(
            String categoryId,
            String cityName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String searchQuery,
            Integer eventType,
            String eventDate,
            String sortBy,
            Integer limit,
            Integer offset,
            BigDecimal customerLat,
            BigDecimal customerLng,
            Integer searchRadiusKm) {
        
        // First get vendors without location filter
        List<Vendor> vendors = searchVendors(
                categoryId, cityName, minPrice, maxPrice, searchQuery,
                eventType, eventDate, sortBy,
                limit != null ? limit * 3 : 36, // Fetch more to account for location filtering
                offset);
        
        // If no location provided, return as-is
        if (customerLat == null || customerLng == null) {
            return vendors.stream().limit(limit != null ? limit : 12).collect(Collectors.toList());
        }
        
        int effectiveSearchRadius = searchRadiusKm != null ? searchRadiusKm : 20;
        
        // Filter by bidirectional location matching
        return vendors.stream()
                .filter(vendor -> {
                    if (vendor.getLocationLat() == null || vendor.getLocationLng() == null) {
                        return false; // Exclude vendors without location
                    }
                    
                    return distanceService.isBidirectionalMatch(
                            vendor.getLocationLat(), vendor.getLocationLng(), vendor.getServiceRadiusKm(),
                            customerLat, customerLng, effectiveSearchRadius);
                })
                .limit(limit != null ? limit : 12)
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate distance from customer to vendor.
     */
    public double calculateDistanceToVendor(Vendor vendor, BigDecimal customerLat, BigDecimal customerLng) {
        if (vendor.getLocationLat() == null || vendor.getLocationLng() == null ||
            customerLat == null || customerLng == null) {
            return -1; // Unknown distance
        }
        
        return distanceService.calculateDistance(
                vendor.getLocationLat(), vendor.getLocationLng(),
                customerLat, customerLng);
    }
}

