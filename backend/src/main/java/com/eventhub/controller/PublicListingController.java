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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicListingController {
    
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    
    @GetMapping("/packages/{packageId}")
    public ResponseEntity<ApiResponse<ListingDTO>> getPackage(@PathVariable UUID packageId) {
        Listing listing = listingRepository.findByIdWithVendorAndCategory(packageId)
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
        Listing listing = listingRepository.findByIdWithVendorAndCategory(listingId)
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
    
    /**
     * Batch fetch listings by IDs - useful for fetching bundled items in packages
     * POST is used instead of GET to avoid URL length limitations with many IDs
     */
    @PostMapping("/listings/batch")
    public ResponseEntity<ApiResponse<List<ListingDTO>>> getListingsByIds(@RequestBody List<UUID> listingIds) {
        if (listingIds == null || listingIds.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        
        // Use custom query with JOIN FETCH to avoid lazy loading issues
        List<Listing> listings = listingRepository.findByIdInWithRelations(listingIds);
        
        // Filter out drafts (same logic as single listing endpoint)
        List<Listing> activeListings = listings.stream()
                .filter(l -> l.getIsActive() != null && l.getIsActive())
                .filter(l -> l.getPrice() != null && l.getPrice().compareTo(new java.math.BigDecimal("0.01")) > 0)
                .filter(l -> l.getImages() != null && !l.getImages().isEmpty())
                .collect(Collectors.toList());
        
        List<ListingDTO> dtos = listingMapper.toDTOList(activeListings);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
}

