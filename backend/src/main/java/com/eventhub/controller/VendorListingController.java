package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.CreatePackageRequest;
import com.eventhub.dto.request.CreateItemRequest;
import com.eventhub.model.Listing;
import com.eventhub.service.VendorListingService;
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
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Listing>>> getListings(@RequestHeader("X-Vendor-Id") UUID vendorId) {
        List<Listing> listings = vendorListingService.getVendorListings(vendorId);
        return ResponseEntity.ok(ApiResponse.success(listings));
    }
    
    @PostMapping("/packages")
    public ResponseEntity<ApiResponse<Listing>> createPackage(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @Valid @RequestBody CreatePackageRequest request) {
        Listing listing = vendorListingService.createPackage(vendorId, request);
        return ResponseEntity.ok(ApiResponse.success("Package created successfully", listing));
    }
    
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<Listing>> createItem(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @Valid @RequestBody CreateItemRequest request) {
        Listing listing = vendorListingService.createItem(vendorId, request);
        return ResponseEntity.ok(ApiResponse.success("Item created successfully", listing));
    }
    
    @PutMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Listing>> updateListing(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID listingId,
            @RequestBody Listing listing) {
        Listing updated = vendorListingService.updateListing(listingId, vendorId, listing);
        return ResponseEntity.ok(ApiResponse.success("Listing updated successfully", updated));
    }
    
    @DeleteMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID listingId) {
        vendorListingService.deleteListing(listingId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully", null));
    }
}

