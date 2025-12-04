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
            @RequestParam(required = false) String q) {
        
        Listing.ListingType type = listingType != null && listingType.equals("packages") 
                ? Listing.ListingType.PACKAGE 
                : null;
        
        List<Listing> listings = searchService.searchListings(
                eventType, category, type, city, minBudget, maxBudget, q);
        
        List<ListingDTO> listingDTOs = listingMapper.toDTOList(listings);
        
        return ResponseEntity.ok(ApiResponse.success(listingDTOs));
    }
    
    @GetMapping("/vendors")
    public ResponseEntity<ApiResponse<List<VendorDTO>>> searchVendors(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(required = false) String q) {
        
        List<Vendor> vendors = searchService.searchVendors(category, city, minBudget, maxBudget, q);
        List<VendorDTO> vendorDTOs = vendorMapper.toDTOList(vendors);
        return ResponseEntity.ok(ApiResponse.success(vendorDTOs));
    }
}

