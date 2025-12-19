package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.BookableSetup;
import com.eventhub.service.BookableSetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/bookable-setups")
@RequiredArgsConstructor
public class VendorBookableSetupController {
    
    private final BookableSetupService setupService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookableSetup>>> getSetups(@RequestHeader("X-Vendor-Id") UUID vendorId) {
        List<BookableSetup> setups = setupService.getVendorSetups(vendorId);
        return ResponseEntity.ok(ApiResponse.success(setups));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<BookableSetup>> createSetup(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestBody BookableSetup setup) {
        BookableSetup created = setupService.createSetup(vendorId, setup);
        return ResponseEntity.ok(ApiResponse.success("Setup created", created));
    }
    
    @PutMapping("/{setupId}")
    public ResponseEntity<ApiResponse<BookableSetup>> updateSetup(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID setupId,
            @RequestBody BookableSetup setup) {
        BookableSetup updated = setupService.updateSetup(setupId, vendorId, setup);
        return ResponseEntity.ok(ApiResponse.success("Setup updated", updated));
    }
    
    @DeleteMapping("/{setupId}")
    public ResponseEntity<ApiResponse<Void>> deleteSetup(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID setupId) {
        setupService.deleteSetup(setupId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Setup deleted", null));
    }
}









