package com.eventhub.controller;

import com.eventhub.dto.ListingDTO;
import com.eventhub.model.Listing;
import com.eventhub.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {
    
    private final ListingService listingService;
    
    @GetMapping
    public ResponseEntity<com.eventhub.dto.ApiResponse<List<com.eventhub.dto.ListingDTO>>> getListings(
        @RequestParam(required = false) Integer eventType,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String type // 'package' or 'item'
    ) {
        Listing.ListingType listingType = null;
        if (type != null) {
            listingType = type.equalsIgnoreCase("package") 
                ? Listing.ListingType.PACKAGE 
                : Listing.ListingType.ITEM;
        }
        
        List<com.eventhub.dto.ListingDTO> listings = listingService.getListings(
            eventType, category, listingType
        );
        return ResponseEntity.ok(com.eventhub.dto.ApiResponse.success(listings));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<com.eventhub.dto.ApiResponse<com.eventhub.dto.ListingDTO>> getListingById(@PathVariable UUID id) {
        com.eventhub.dto.ListingDTO listing = listingService.getListingById(id);
        return ResponseEntity.ok(com.eventhub.dto.ApiResponse.success(listing));
    }
    
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<com.eventhub.dto.ApiResponse<List<com.eventhub.dto.ListingDTO>>> getVendorListings(
        @PathVariable UUID vendorId
    ) {
        List<com.eventhub.dto.ListingDTO> listings = listingService.getVendorListings(vendorId);
        return ResponseEntity.ok(com.eventhub.dto.ApiResponse.success(listings));
    }
}

