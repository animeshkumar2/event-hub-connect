package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.AddOn;
import com.eventhub.model.EventType;
import com.eventhub.model.Listing;
import com.eventhub.repository.AddOnRepository;
import com.eventhub.repository.EventTypeRepository;
import com.eventhub.repository.ListingRepository;
import com.eventhub.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    
    private static final Logger logger = LoggerFactory.getLogger(AdminListingController.class);
    
    private final ListingRepository listingRepository;
    private final EventTypeRepository eventTypeRepository;
    private final AddOnRepository addOnRepository;
    private final ImageUploadService imageUploadService;
    
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
        // Use eager loading query to avoid LazyInitializationException
        Listing listing = listingRepository.findByIdWithVendorAndCategory(listingId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Listing not found"));
        
        // Populate eventTypeIds for JSON serialization
        if (listing.getEventTypes() != null) {
            List<Integer> eventTypeIds = listing.getEventTypes().stream()
                    .map(EventType::getId)
                    .toList();
            listing.setEventTypeIds(eventTypeIds);
        }
        
        return ResponseEntity.ok(ApiResponse.success(listing));
    }
    
    @PutMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Listing>> updateListing(
            @PathVariable UUID listingId,
            @RequestBody Listing listingUpdate) {
        Listing existing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Listing not found"));
        
        // Update all editable fields
        if (listingUpdate.getName() != null) existing.setName(listingUpdate.getName());
        if (listingUpdate.getDescription() != null) existing.setDescription(listingUpdate.getDescription());
        if (listingUpdate.getPrice() != null) existing.setPrice(listingUpdate.getPrice());
        if (listingUpdate.getImages() != null) existing.setImages(listingUpdate.getImages());
        if (listingUpdate.getHighlights() != null) existing.setHighlights(listingUpdate.getHighlights());
        if (listingUpdate.getIncludedItemsText() != null) existing.setIncludedItemsText(listingUpdate.getIncludedItemsText());
        if (listingUpdate.getExcludedItemsText() != null) existing.setExcludedItemsText(listingUpdate.getExcludedItemsText());
        if (listingUpdate.getDeliveryTime() != null) existing.setDeliveryTime(listingUpdate.getDeliveryTime());
        if (listingUpdate.getExtraChargesJson() != null) existing.setExtraChargesJson(listingUpdate.getExtraChargesJson());
        if (listingUpdate.getExtraCharges() != null) existing.setExtraCharges(listingUpdate.getExtraCharges());
        if (listingUpdate.getCategorySpecificData() != null) existing.setCategorySpecificData(listingUpdate.getCategorySpecificData());
        if (listingUpdate.getCustomNotes() != null) existing.setCustomNotes(listingUpdate.getCustomNotes());
        if (listingUpdate.getUnit() != null) existing.setUnit(listingUpdate.getUnit());
        if (listingUpdate.getMinimumQuantity() != null) existing.setMinimumQuantity(listingUpdate.getMinimumQuantity());
        if (listingUpdate.getIsActive() != null) existing.setIsActive(listingUpdate.getIsActive());
        if (listingUpdate.getIsDraft() != null) existing.setIsDraft(listingUpdate.getIsDraft());
        if (listingUpdate.getIsPopular() != null) existing.setIsPopular(listingUpdate.getIsPopular());
        if (listingUpdate.getIsTrending() != null) existing.setIsTrending(listingUpdate.getIsTrending());
        if (listingUpdate.getOpenForNegotiation() != null) existing.setOpenForNegotiation(listingUpdate.getOpenForNegotiation());
        if (listingUpdate.getServiceMode() != null) existing.setServiceMode(listingUpdate.getServiceMode());
        
        // Handle event types update
        if (listingUpdate.getEventTypeIds() != null && !listingUpdate.getEventTypeIds().isEmpty()) {
            List<EventType> eventTypes = listingUpdate.getEventTypeIds().stream()
                    .map(id -> eventTypeRepository.findById(id)
                            .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Event type not found: " + id)))
                    .toList();
            existing.setEventTypes(eventTypes);
        }
        
        Listing saved = listingRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("Listing updated successfully", saved));
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
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Listing not found"));
        
        // Clean up add-on images from CDN before cascade delete removes the rows
        List<AddOn> addOns = addOnRepository.findByPackageListing(listing);
        for (AddOn addOn : addOns) {
            if (addOn.getImageUrl() != null && !addOn.getImageUrl().isBlank()) {
                try { imageUploadService.deleteImage(addOn.getImageUrl()); }
                catch (Exception e) { logger.warn("Failed to delete add-on image: {}", e.getMessage()); }
            }
        }
        
        // Clean up listing images from CDN
        if (listing.getImages() != null) {
            for (String imageUrl : listing.getImages()) {
                try { imageUploadService.deleteImage(imageUrl); }
                catch (Exception e) { logger.warn("Failed to delete listing image: {}", e.getMessage()); }
            }
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




