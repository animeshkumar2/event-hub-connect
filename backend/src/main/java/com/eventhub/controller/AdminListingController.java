package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Listing;
import com.eventhub.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/listings")
@RequiredArgsConstructor
public class AdminListingController {
    
    private final ListingRepository listingRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Listing>>> getAllListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean isActive) {
        
        // Fetch all listings first (for filtering - can be optimized with custom query later)
        List<Listing> allListings = listingRepository.findAll();
        
        // Apply filters in memory
        List<Listing> filteredListings = allListings.stream()
            .filter(listing -> {
                // Search filter
                if (search != null && !search.trim().isEmpty()) {
                    String searchLower = search.toLowerCase();
                    boolean matchesSearch = (listing.getName() != null && listing.getName().toLowerCase().contains(searchLower)) ||
                        (listing.getDescription() != null && listing.getDescription().toLowerCase().contains(searchLower));
                    if (!matchesSearch) return false;
                }
                
                // Category filter
                if (category != null && !category.trim().isEmpty()) {
                    if (listing.getListingCategory() == null || !listing.getListingCategory().getId().equals(category)) {
                        return false;
                    }
                }
                
                // Type filter
                if (type != null && !type.trim().isEmpty()) {
                    if (listing.getType() == null || !listing.getType().name().equalsIgnoreCase(type)) {
                        return false;
                    }
                }
                
                // Active status filter
                if (isActive != null) {
                    if (listing.getIsActive() == null || !listing.getIsActive().equals(isActive)) {
                        return false;
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
        
        // Apply pagination manually
        int totalElements = filteredListings.size();
        int start = page * size;
        int end = Math.min(start + size, totalElements);
        List<Listing> paginatedListings = start < totalElements ? 
            filteredListings.subList(start, end) : 
            List.of();
        
        // Create Page object
        Pageable pageable = PageRequest.of(page, size);
        Page<Listing> result = new PageImpl<>(paginatedListings, pageable, totalElements);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    @GetMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Listing>> getListing(@PathVariable UUID listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Listing not found"));
        return ResponseEntity.ok(ApiResponse.success(listing));
    }
    
    @PutMapping("/{listingId}/status")
    public ResponseEntity<ApiResponse<Listing>> updateListingStatus(
            @PathVariable UUID listingId,
            @RequestBody UpdateStatusRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Listing not found"));
        listing.setIsActive(Boolean.parseBoolean(request.getStatus()));
        listing = listingRepository.save(listing);
        return ResponseEntity.ok(ApiResponse.success("Listing status updated", listing));
    }
    
    @PutMapping("/{listingId}/popular")
    public ResponseEntity<ApiResponse<Listing>> togglePopular(
            @PathVariable UUID listingId,
            @RequestBody ToggleRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Listing not found"));
        listing.setIsPopular(Boolean.parseBoolean(request.getValue()));
        listing = listingRepository.save(listing);
        return ResponseEntity.ok(ApiResponse.success("Listing popularity updated", listing));
    }
    
    @PutMapping("/{listingId}/trending")
    public ResponseEntity<ApiResponse<Listing>> toggleTrending(
            @PathVariable UUID listingId,
            @RequestBody ToggleRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Listing not found"));
        listing.setIsTrending(Boolean.parseBoolean(request.getValue()));
        listing = listingRepository.save(listing);
        return ResponseEntity.ok(ApiResponse.success("Listing trending status updated", listing));
    }
    
    @DeleteMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(@PathVariable UUID listingId) {
        if (!listingRepository.existsById(listingId)) {
            throw new com.eventhub.exception.NotFoundException("Listing not found");
        }
        listingRepository.deleteById(listingId);
        return ResponseEntity.ok(ApiResponse.success("Listing deleted", null));
    }
    
    @lombok.Data
    public static class UpdateStatusRequest {
        private String status; // "true" or "false"
    }
    
    @lombok.Data
    public static class ToggleRequest {
        private String value; // "true" or "false"
    }
}


