package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Review;
import com.eventhub.service.ReviewService;
import com.eventhub.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/customers/orders")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    private final OrderService orderService;
    
    @PostMapping("/{orderId}/review")
    public ResponseEntity<ApiResponse<Review>> submitReview(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID orderId,
            @RequestBody ReviewService.CreateReviewRequest request) {
        // Get vendor from order
        com.eventhub.model.Order order = orderService.getOrderById(orderId);
        request.setOrderId(orderId);
        
        Review review = reviewService.createReview(userId, order.getVendor().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review submitted", review));
    }
}

