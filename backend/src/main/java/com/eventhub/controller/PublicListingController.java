package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.ListingDTO;
import com.eventhub.exception.NotFoundException;
import com.eventhub.model.Listing;
import com.eventhub.repository.ListingRepository;
import com.eventhub.util.ListingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicListingController {
    
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    
    @GetMapping("/packages/{packageId}")
    public ResponseEntity<ApiResponse<ListingDTO>> getPackage(@PathVariable UUID packageId) {
        Listing listing = listingRepository.findById(packageId)
                .orElseThrow(() -> new NotFoundException("Package not found"));
        
        // Prevent access to drafts on customer side
        // Drafts are: isActive=false, price<=0.01, or no images
        if (!listing.getIsActive() || 
            listing.getPrice().compareTo(new java.math.BigDecimal("0.01")) <= 0 ||
            listing.getImages() == null || listing.getImages().isEmpty()) {
            throw new NotFoundException("Package not found");
        }
        
        ListingDTO dto = listingMapper.toDTO(listing);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
    
    @GetMapping("/listings/{listingId}")
    public ResponseEntity<ApiResponse<ListingDTO>> getListing(@PathVariable UUID listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));
        
        // Prevent access to drafts on customer side
        // Drafts are: isActive=false, price<=0.01, or no images
        if (!listing.getIsActive() || 
            listing.getPrice().compareTo(new java.math.BigDecimal("0.01")) <= 0 ||
            listing.getImages() == null || listing.getImages().isEmpty()) {
            throw new NotFoundException("Listing not found");
        }
        
        ListingDTO dto = listingMapper.toDTO(listing);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}

