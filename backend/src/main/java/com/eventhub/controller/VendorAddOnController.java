package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.AddOn;
import com.eventhub.service.AddOnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/listings")
@RequiredArgsConstructor
public class VendorAddOnController {
    
    private final AddOnService addOnService;
    
    @GetMapping("/{packageId}/add-ons")
    public ResponseEntity<ApiResponse<List<AddOn>>> getPackageAddOns(@PathVariable UUID packageId) {
        List<AddOn> addOns = addOnService.getPackageAddOns(packageId);
        return ResponseEntity.ok(ApiResponse.success(addOns));
    }
    
    @PostMapping("/{packageId}/add-ons")
    public ResponseEntity<ApiResponse<AddOn>> createAddOn(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID packageId,
            @RequestBody AddOn addOn) {
        AddOn created = addOnService.createAddOn(packageId, vendorId, addOn);
        return ResponseEntity.ok(ApiResponse.success("Add-on created", created));
    }
    
    @PutMapping("/{packageId}/add-ons/{addOnId}")
    public ResponseEntity<ApiResponse<AddOn>> updateAddOn(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID addOnId,
            @RequestBody AddOn addOn) {
        AddOn updated = addOnService.updateAddOn(addOnId, vendorId, addOn);
        return ResponseEntity.ok(ApiResponse.success("Add-on updated", updated));
    }
    
    @DeleteMapping("/{packageId}/add-ons/{addOnId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddOn(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID addOnId) {
        addOnService.deleteAddOn(addOnId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Add-on deleted", null));
    }
}





