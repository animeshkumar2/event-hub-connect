package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.service.VendorAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/dashboard")
@RequiredArgsConstructor
public class VendorAnalyticsController {
    
    private final VendorAnalyticsService analyticsService;
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<VendorAnalyticsService.DashboardStats>> getDashboardStats(
            @RequestHeader("X-Vendor-Id") UUID vendorId) {
        VendorAnalyticsService.DashboardStats stats = analyticsService.getDashboardStats(vendorId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

