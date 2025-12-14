package com.eventhub.service;

import com.eventhub.model.Review;
import com.eventhub.model.Vendor;
import com.eventhub.model.Order;
import com.eventhub.repository.ReviewRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.repository.OrderRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final VendorRepository vendorRepository;
    private final OrderRepository orderRepository;
    
    public Review createReview(UUID userId, UUID vendorId, CreateReviewRequest request) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        Review review = new Review();
        review.setVendor(vendor);
        review.setUserId(userId);
        review.setOrderId(request.getOrderId());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setEventType(request.getEventType());
        review.setImages(request.getImages());
        review.setIsVerified(request.getOrderId() != null);
        review.setIsVisible(true);
        
        review = reviewRepository.save(review);
        
        // Update vendor rating
        updateVendorRating(vendor);
        
        return review;
    }
    
    private void updateVendorRating(Vendor vendor) {
        BigDecimal avgRating = reviewRepository.findAverageRatingByVendor(vendor);
        Long reviewCount = reviewRepository.countByVendor(vendor);
        
        if (avgRating != null) {
            vendor.setRating(avgRating);
        }
        if (reviewCount != null) {
            vendor.setReviewCount(reviewCount.intValue());
        }
        vendorRepository.save(vendor);
    }
    
    @lombok.Data
    public static class CreateReviewRequest {
        private UUID orderId;
        private BigDecimal rating;
        private String comment;
        private String eventType;
        private java.util.List<String> images;
    }
}





