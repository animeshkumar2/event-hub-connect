package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.response.VendorDetailDTO;
import com.eventhub.model.Vendor;
import com.eventhub.repository.VendorRepository;
import com.eventhub.service.AdminVendorService;
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
    private final AdminVendorService adminVendorService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Vendor>>> getAllVendors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean isVerified,
            @RequestParam(required = false) Boolean isActive) {
        Pageable pageable = PageRequest.of(page, size);
        // Use optimized query with filters and JOIN FETCH to avoid N+1 queries
        // Note: Search is case-sensitive in JPQL to avoid bytea casting issues
        // For case-insensitive search, we'd need to filter in application layer or use native query
        Page<Vendor> vendors = vendorRepository.findAllWithFilters(
            search, category, city, isVerified, isActive, pageable);
        return ResponseEntity.ok(ApiResponse.success(vendors));
    }
    
    @GetMapping("/{vendorId}")
    public ResponseEntity<ApiResponse<Vendor>> getVendor(@PathVariable UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Vendor not found"));
        return ResponseEntity.ok(ApiResponse.success(vendor));
    }
    
    @GetMapping("/{vendorId}/details")
    public ResponseEntity<ApiResponse<VendorDetailDTO>> getVendorDetails(@PathVariable UUID vendorId) {
        VendorDetailDTO details = adminVendorService.getVendorDetails(vendorId);
        return ResponseEntity.ok(ApiResponse.success("Vendor details retrieved", details));
    }
    
    @PutMapping("/{vendorId}/verify")
    public ResponseEntity<ApiResponse<Vendor>> verifyVendor(@PathVariable UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Vendor not found"));
        vendor.setIsVerified(true);
        vendor = vendorRepository.save(vendor);
        adminVendorService.evictVendorCache(vendorId);
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
        adminVendorService.evictVendorCache(vendorId);
        return ResponseEntity.ok(ApiResponse.success("Vendor status updated", vendor));
    }
    
    @lombok.Data
    public static class UpdateStatusRequest {
        private String status; // "true" or "false"
    }
}




