package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.ListingDTO;
import com.eventhub.dto.VendorDTO;
import com.eventhub.model.Listing;
import com.eventhub.model.Vendor;
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
            @RequestParam(required = false, defaultValue = "0") Integer offset) {
        
        Listing.ListingType type = listingType != null && listingType.equals("packages") 
                ? Listing.ListingType.PACKAGE 
                : null;
        
        List<Listing> listings = searchService.searchListings(
                eventType, category, type, city, minBudget, maxBudget, q, eventDate, sortBy, limit, offset);
        
        List<ListingDTO> listingDTOs = listingMapper.toDTOList(listings);
        
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
            @RequestParam(required = false, defaultValue = "0") Integer offset) {
        
        List<Vendor> vendors = searchService.searchVendors(category, city, minBudget, maxBudget, q, eventType, eventDate, sortBy, limit, offset);
        List<VendorDTO> vendorDTOs = vendorMapper.toDTOList(vendors);
        return ResponseEntity.ok(ApiResponse.success(vendorDTOs));
    }
}

