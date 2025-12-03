package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Listing;
import com.eventhub.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicListingController {
    
    private final ListingRepository listingRepository;
    
    @GetMapping("/packages/{packageId}")
    public ResponseEntity<ApiResponse<Listing>> getPackage(@PathVariable UUID packageId) {
        Listing listing = listingRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        return ResponseEntity.ok(ApiResponse.success(listing));
    }
    
    @GetMapping("/listings/{listingId}")
    public ResponseEntity<ApiResponse<Listing>> getListing(@PathVariable UUID listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        return ResponseEntity.ok(ApiResponse.success(listing));
    }
}

