package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.response.VendorDetailDTO;
import com.eventhub.model.UserProfile;
import com.eventhub.model.Vendor;
import com.eventhub.repository.UserProfileRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.service.AdminVendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/vendors")
@RequiredArgsConstructor
public class AdminVendorController {
    
    private final VendorRepository vendorRepository;
    private final UserProfileRepository userProfileRepository;
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
        
        // Get all vendors with eager loading to avoid LazyInitializationException
        List<Vendor> allVendors = vendorRepository.findAllWithFiltersNoSearch(
            category, city, isVerified, isActive);
        
        // Apply search filter in Java (to avoid bytea casting issues in PostgreSQL)
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allVendors = allVendors.stream()
                .filter(v -> v.getBusinessName() != null && 
                            v.getBusinessName().toLowerCase().contains(searchLower))
                .collect(Collectors.toList());
        }
        
        // Manual pagination
        int totalElements = allVendors.size();
        int start = page * size;
        int end = Math.min(start + size, totalElements);
        
        List<Vendor> pageContent = start < totalElements 
            ? allVendors.subList(start, end) 
            : List.of();
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Vendor> vendorPage = new PageImpl<>(pageContent, pageable, totalElements);
        
        return ResponseEntity.ok(ApiResponse.success(vendorPage));
    }
    
    // DTO for vendor users who haven't completed onboarding
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class PendingVendorDTO {
        private UUID userId;
        private String fullName;
        private String email;
        private String phone;
        private String createdAt;
    }
    
    @GetMapping("/pending-onboarding")
    public ResponseEntity<ApiResponse<List<PendingVendorDTO>>> getPendingOnboardingVendors() {
        List<UserProfile> pendingUsers = userProfileRepository.findVendorUsersWithoutVendorProfile();
        
        List<PendingVendorDTO> result = pendingUsers.stream()
            .map(u -> new PendingVendorDTO(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getPhone(),
                u.getCreatedAt() != null ? u.getCreatedAt().toString() : null
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    @GetMapping("/{vendorId:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<ApiResponse<Vendor>> getVendor(@PathVariable UUID vendorId) {
        Vendor vendor = vendorRepository.findByIdWithDetails(vendorId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Vendor not found"));
        return ResponseEntity.ok(ApiResponse.success(vendor));
    }
    
    @GetMapping("/{vendorId:[0-9a-fA-F\\-]{36}}/details")
    public ResponseEntity<ApiResponse<VendorDetailDTO>> getVendorDetails(
            @PathVariable UUID vendorId,
            @RequestParam(required = false, defaultValue = "false") boolean refresh) {
        // If refresh is requested, evict cache first
        if (refresh) {
            adminVendorService.evictVendorCache(vendorId);
        }
        VendorDetailDTO details = adminVendorService.getVendorDetails(vendorId);
        return ResponseEntity.ok(ApiResponse.success("Vendor details retrieved", details));
    }
    
    @PostMapping("/{vendorId:[0-9a-fA-F\\-]{36}}/refresh-cache")
    public ResponseEntity<ApiResponse<String>> refreshVendorCache(@PathVariable UUID vendorId) {
        adminVendorService.evictVendorCache(vendorId);
        return ResponseEntity.ok(ApiResponse.success("Cache cleared for vendor", "Cache evicted"));
    }
    
    @PutMapping("/{vendorId:[0-9a-fA-F\\-]{36}}/verify")
    public ResponseEntity<ApiResponse<Vendor>> verifyVendor(@PathVariable UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Vendor not found"));
        vendor.setIsVerified(true);
        vendor = vendorRepository.save(vendor);
        adminVendorService.evictVendorCache(vendorId);
        return ResponseEntity.ok(ApiResponse.success("Vendor verified", vendor));
    }
    
    @PutMapping("/{vendorId:[0-9a-fA-F\\-]{36}}/status")
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











