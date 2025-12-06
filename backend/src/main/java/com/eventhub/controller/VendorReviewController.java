package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Review;
import com.eventhub.service.VendorReviewService;
import com.eventhub.util.VendorIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/reviews")
@RequiredArgsConstructor
public class VendorReviewController {
    
    private final VendorReviewService reviewService;
    private final VendorIdResolver vendorIdResolver;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Review>>> getReviews(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewService.getVendorReviews(vendorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<VendorReviewService.ReviewStatistics>> getReviewStatistics(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        VendorReviewService.ReviewStatistics stats = reviewService.getReviewStatistics(vendorId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

