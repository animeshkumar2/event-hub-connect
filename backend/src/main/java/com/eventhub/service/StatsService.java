package com.eventhub.service;

import com.eventhub.dto.response.StatsDTO;
import com.eventhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsService {
    
    private final VendorRepository vendorRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    
    public StatsDTO getPlatformStats() {
        StatsDTO stats = new StatsDTO();
        
        // Total verified vendors
        long totalVendors = vendorRepository.findAll().stream()
                .filter(v -> v.getIsVerified() != null && v.getIsVerified())
                .count();
        stats.setTotalVendors(totalVendors);
        
        // Total events completed (orders with status COMPLETED)
        long totalEvents = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == com.eventhub.model.Order.OrderStatus.COMPLETED)
                .count();
        stats.setTotalEventsCompleted(totalEvents);
        
        // Average rating across all vendors
        double avgRating = vendorRepository.findAll().stream()
                .filter(v -> v.getRating() != null && v.getReviewCount() > 0)
                .mapToDouble(v -> v.getRating().doubleValue())
                .average()
                .orElse(0.0);
        stats.setAverageRating(avgRating);
        
        // Satisfaction rate (reviews with rating >= 4)
        long totalReviews = reviewRepository.count();
        long satisfiedReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getRating().doubleValue() >= 4.0)
                .count();
        double satisfactionRate = totalReviews > 0 ? (double) satisfiedReviews / totalReviews * 100 : 0.0;
        stats.setSatisfactionRate(satisfactionRate);
        
        return stats;
    }
}


