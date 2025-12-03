package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Review;
import com.eventhub.service.VendorReviewService;
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
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Review>>> getReviews(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewService.getVendorReviews(vendorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<VendorReviewService.ReviewStatistics>> getReviewStatistics(
            @RequestHeader("X-Vendor-Id") UUID vendorId) {
        VendorReviewService.ReviewStatistics stats = reviewService.getReviewStatistics(vendorId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

