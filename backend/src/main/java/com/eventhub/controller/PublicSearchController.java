package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.ListingDTO;
import com.eventhub.dto.VendorDTO;
import com.eventhub.model.Listing;
import com.eventhub.model.Vendor;
import com.eventhub.service.DistanceService;
import com.eventhub.service.SearchService;
import com.eventhub.util.ListingMapper;
import com.eventhub.util.VendorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/public/search")
@RequiredArgsConstructor
public class PublicSearchController {
    
    private final SearchService searchService;
    private final ListingMapper listingMapper;
    private final VendorMapper vendorMapper;
    private final DistanceService distanceService;
    
    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<List<ListingDTO>>> searchListings(
            @RequestParam(required = false) Integer eventType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String listingType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String eventDate,
            @RequestParam(required = false, defaultValue = "relevance") String sortBy,
            @RequestParam(required = false, defaultValue = "12") Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer offset,
            // Location parameters
            @RequestParam(required = false) BigDecimal customerLat,
            @RequestParam(required = false) BigDecimal customerLng,
            @RequestParam(required = false) Integer searchRadiusKm) {
        
        Listing.ListingType type = listingType != null && listingType.equals("packages") 
                ? Listing.ListingType.PACKAGE 
                : null;
        
        List<Listing> listings;
        
        // Use location-aware search if location is provided
        if (customerLat != null && customerLng != null) {
            listings = searchService.searchListingsWithLocation(
                    eventType, category, type, city, minBudget, maxBudget, q, eventDate, sortBy, limit, offset,
                    customerLat, customerLng, searchRadiusKm);
        } else {
            listings = searchService.searchListings(
                    eventType, category, type, city, minBudget, maxBudget, q, eventDate, sortBy, limit, offset);
        }
        
        // Map to DTOs with distance calculation
        List<ListingDTO> listingDTOs = listingMapper.toDTOListWithDistance(listings, customerLat, customerLng, distanceService);
        
        return ResponseEntity.ok(ApiResponse.success(listingDTOs));
    }
    
    @GetMapping("/vendors")
    public ResponseEntity<ApiResponse<List<VendorDTO>>> searchVendors(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer eventType,
            @RequestParam(required = false) String eventDate,
            @RequestParam(required = false, defaultValue = "relevance") String sortBy,
            @RequestParam(required = false, defaultValue = "12") Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer offset,
            // Location parameters
            @RequestParam(required = false) BigDecimal customerLat,
            @RequestParam(required = false) BigDecimal customerLng,
            @RequestParam(required = false) Integer searchRadiusKm) {
        
        List<Vendor> vendors;
        
        // Use location-aware search if location is provided
        if (customerLat != null && customerLng != null) {
            vendors = searchService.searchVendorsWithLocation(
                    category, city, minBudget, maxBudget, q, eventType, eventDate, sortBy, limit, offset,
                    customerLat, customerLng, searchRadiusKm);
        } else {
            vendors = searchService.searchVendors(
                    category, city, minBudget, maxBudget, q, eventType, eventDate, sortBy, limit, offset);
        }
        
        // Map to DTOs with distance calculation
        List<VendorDTO> vendorDTOs = vendorMapper.toDTOListWithDistance(vendors, customerLat, customerLng, distanceService);
        
        return ResponseEntity.ok(ApiResponse.success(vendorDTOs));
    }
}

