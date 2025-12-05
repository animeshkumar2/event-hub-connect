package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.service.VendorAnalyticsService;
import com.eventhub.util.VendorIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/dashboard")
@RequiredArgsConstructor
public class VendorAnalyticsController {
    
    private final VendorAnalyticsService analyticsService;
    private final VendorIdResolver vendorIdResolver;
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<VendorAnalyticsService.DashboardStats>> getDashboardStats(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        VendorAnalyticsService.DashboardStats stats = analyticsService.getDashboardStats(vendorId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

