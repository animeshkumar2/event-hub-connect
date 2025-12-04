package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.ListingDTO;
import com.eventhub.dto.VendorDTO;
import com.eventhub.model.*;
import com.eventhub.service.VendorProfileService;
import com.eventhub.util.ListingMapper;
import com.eventhub.util.VendorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/vendors")
@RequiredArgsConstructor
public class PublicVendorController {
    
    private final VendorProfileService vendorProfileService;
    private final VendorMapper vendorMapper;
    private final ListingMapper listingMapper;
    
    @GetMapping("/{vendorId}")
    public ResponseEntity<ApiResponse<VendorDTO>> getVendor(@PathVariable UUID vendorId) {
        Vendor vendor = vendorProfileService.getVendorProfile(vendorId);
        VendorDTO dto = vendorMapper.toDTO(vendor);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
    
    @GetMapping("/{vendorId}/packages")
    public ResponseEntity<ApiResponse<List<ListingDTO>>> getVendorPackages(@PathVariable UUID vendorId) {
        List<Listing> packages = vendorProfileService.getVendorPackages(vendorId);
        List<ListingDTO> dtos = listingMapper.toDTOList(packages);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
    
    @GetMapping("/{vendorId}/listings")
    public ResponseEntity<ApiResponse<List<ListingDTO>>> getVendorListings(@PathVariable UUID vendorId) {
        List<Listing> listings = vendorProfileService.getVendorListings(vendorId);
        List<ListingDTO> dtos = listingMapper.toDTOList(listings);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
    
    @GetMapping("/{vendorId}/reviews")
    public ResponseEntity<ApiResponse<List<Review>>> getVendorReviews(
            @PathVariable UUID vendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<Review> reviews = vendorProfileService.getVendorReviews(vendorId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }
    
    @GetMapping("/{vendorId}/faqs")
    public ResponseEntity<ApiResponse<List<VendorFAQ>>> getVendorFAQs(@PathVariable UUID vendorId) {
        List<VendorFAQ> faqs = vendorProfileService.getVendorFAQs(vendorId);
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }
    
    @GetMapping("/{vendorId}/past-events")
    public ResponseEntity<ApiResponse<List<VendorPastEvent>>> getVendorPastEvents(@PathVariable UUID vendorId) {
        List<VendorPastEvent> events = vendorProfileService.getVendorPastEvents(vendorId);
        return ResponseEntity.ok(ApiResponse.success(events));
    }
    
    @GetMapping("/{vendorId}/bookable-setups")
    public ResponseEntity<ApiResponse<List<BookableSetup>>> getVendorBookableSetups(@PathVariable UUID vendorId) {
        List<BookableSetup> setups = vendorProfileService.getVendorBookableSetups(vendorId);
        return ResponseEntity.ok(ApiResponse.success(setups));
    }
    
    @GetMapping("/{vendorId}/availability")
    public ResponseEntity<ApiResponse<List<AvailabilitySlot>>> getVendorAvailability(
            @PathVariable UUID vendorId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (endDate == null) {
            endDate = startDate.plusMonths(3);
        }
        
        List<AvailabilitySlot> slots = vendorProfileService.getVendorAvailability(vendorId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
}

