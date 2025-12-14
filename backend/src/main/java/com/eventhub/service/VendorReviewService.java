package com.eventhub.service;

import com.eventhub.model.Review;
import com.eventhub.model.Vendor;
import com.eventhub.repository.ReviewRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorReviewService {
    
    private final ReviewRepository reviewRepository;
    private final VendorRepository vendorRepository;
    
    @Transactional(readOnly = true)
    public Page<Review> getVendorReviews(UUID vendorId, Pageable pageable) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        return reviewRepository.findByVendorAndIsVisibleTrue(vendor, pageable);
    }
    
    @Transactional(readOnly = true)
    public ReviewStatistics getReviewStatistics(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        BigDecimal avgRating = reviewRepository.findAverageRatingByVendor(vendor);
        Long totalReviews = reviewRepository.countByVendor(vendor);
        
        return new ReviewStatistics(
                avgRating != null ? avgRating.doubleValue() : 0.0,
                totalReviews != null ? totalReviews : 0L
        );
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ReviewStatistics {
        private Double averageRating;
        private Long totalReviews;
    }
}




