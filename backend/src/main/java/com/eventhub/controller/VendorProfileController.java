package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Vendor;
import com.eventhub.service.VendorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/profile")
@RequiredArgsConstructor
public class VendorProfileController {
    
    private final VendorProfileService profileService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Vendor>> getProfile(@RequestHeader("X-Vendor-Id") UUID vendorId) {
        Vendor vendor = profileService.getVendorProfile(vendorId);
        return ResponseEntity.ok(ApiResponse.success(vendor));
    }
    
    @PutMapping
    public ResponseEntity<ApiResponse<Vendor>> updateProfile(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestBody Vendor vendor) {
        Vendor updated = profileService.updateVendorProfile(vendorId, vendor);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }
}

