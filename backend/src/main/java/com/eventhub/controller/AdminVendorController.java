package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Vendor;
import com.eventhub.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/vendors")
@RequiredArgsConstructor
public class AdminVendorController {
    
    private final VendorRepository vendorRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Vendor>>> getAllVendors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Vendor> vendors = vendorRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(vendors));
    }
    
    @GetMapping("/{vendorId}")
    public ResponseEntity<ApiResponse<Vendor>> getVendor(@PathVariable UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Vendor not found"));
        return ResponseEntity.ok(ApiResponse.success(vendor));
    }
    
    @PutMapping("/{vendorId}/verify")
    public ResponseEntity<ApiResponse<Vendor>> verifyVendor(@PathVariable UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Vendor not found"));
        vendor.setIsVerified(true);
        vendor = vendorRepository.save(vendor);
        return ResponseEntity.ok(ApiResponse.success("Vendor verified", vendor));
    }
    
    @PutMapping("/{vendorId}/status")
    public ResponseEntity<ApiResponse<Vendor>> updateVendorStatus(
            @PathVariable UUID vendorId,
            @RequestBody UpdateStatusRequest request) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Vendor not found"));
        vendor.setIsActive(Boolean.parseBoolean(request.getStatus()));
        vendor = vendorRepository.save(vendor);
        return ResponseEntity.ok(ApiResponse.success("Vendor status updated", vendor));
    }
    
    @lombok.Data
    public static class UpdateStatusRequest {
        private String status; // "true" or "false"
    }
}


