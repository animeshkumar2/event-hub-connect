package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.CreatePackageRequest;
import com.eventhub.dto.request.CreateItemRequest;
import com.eventhub.model.Listing;
import com.eventhub.service.VendorListingService;
import com.eventhub.util.VendorIdResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/listings")
@RequiredArgsConstructor
public class VendorListingController {
    
    private final VendorListingService vendorListingService;
    private final VendorIdResolver vendorIdResolver;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Listing>>> getListings(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<Listing> listings = vendorListingService.getVendorListings(vendorId);
        return ResponseEntity.ok(ApiResponse.success(listings));
    }
    
    @PostMapping("/packages")
    public ResponseEntity<ApiResponse<Listing>> createPackage(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @Valid @RequestBody CreatePackageRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Listing listing = vendorListingService.createPackage(vendorId, request);
        return ResponseEntity.ok(ApiResponse.success("Package created successfully", listing));
    }
    
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<Listing>> createItem(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @Valid @RequestBody CreateItemRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Listing listing = vendorListingService.createItem(vendorId, request);
        return ResponseEntity.ok(ApiResponse.success("Item created successfully", listing));
    }
    
    @PutMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Listing>> updateListing(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID listingId,
            @RequestBody Listing listing) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Listing updated = vendorListingService.updateListing(listingId, vendorId, listing);
        return ResponseEntity.ok(ApiResponse.success("Listing updated successfully", updated));
    }
    
    @GetMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Listing>> getListing(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID listingId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        
        // Get the listing
        Listing listing = vendorListingService.getVendorListings(vendorId).stream()
                .filter(l -> l.getId().equals(listingId))
                .findFirst()
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Listing not found"));
        
        return ResponseEntity.ok(ApiResponse.success(listing));
    }
  
  @DeleteMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID listingId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        vendorListingService.deleteListing(listingId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully", null));
    }
}

