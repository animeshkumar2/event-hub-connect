package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Review;
import com.eventhub.service.ReviewRequestService;
import com.eventhub.service.VendorReviewService;
import com.eventhub.util.VendorIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/reviews")
@RequiredArgsConstructor
public class VendorReviewController {
    
    private final VendorReviewService reviewService;
    private final ReviewRequestService reviewRequestService;
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
    
    @GetMapping("/eligible-orders")
    public ResponseEntity<ApiResponse<List<ReviewRequestService.EligibleOrder>>> getEligibleOrders(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<ReviewRequestService.EligibleOrder> eligibleOrders = reviewRequestService.getEligibleOrders(vendorId);
        return ResponseEntity.ok(ApiResponse.success(eligibleOrders));
    }
    
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<ReviewRequestService.ReviewRequestResult>> requestReview(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody RequestReviewRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        ReviewRequestService.ReviewRequestResult result = reviewRequestService.sendReviewRequest(vendorId, request.getOrderId());
        return ResponseEntity.ok(ApiResponse.success("Review request sent to " + result.getCustomerName(), result));
    }
    
    // Request DTO
    @lombok.Data
    public static class RequestReviewRequest {
        private UUID orderId;
    }
}


