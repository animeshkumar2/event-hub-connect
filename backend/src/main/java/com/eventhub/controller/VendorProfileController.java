package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Vendor;
import com.eventhub.service.VendorProfileService;
import com.eventhub.util.VendorIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/profile")
@RequiredArgsConstructor
public class VendorProfileController {
    
    private final VendorProfileService profileService;
    private final VendorIdResolver vendorIdResolver;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Vendor>> getProfile(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Vendor vendor = profileService.getVendorProfile(vendorId);
        return ResponseEntity.ok(ApiResponse.success(vendor));
    }
    
    @PutMapping
    public ResponseEntity<ApiResponse<Vendor>> updateProfile(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody Vendor vendor) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Vendor updated = profileService.updateVendorProfile(vendorId, vendor);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }
}

