package com.eventhub.service;

import com.eventhub.dto.response.StatsDTO;
import com.eventhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsService {
    
    private final VendorRepository vendorRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    
    @Cacheable(value = "publicPlatformStats", unless = "#result == null")
    public StatsDTO getPlatformStats() {
        StatsDTO stats = new StatsDTO();
        
        // Total verified vendors - optimized COUNT query
        long totalVendors = vendorRepository.countVerifiedVendors();
        stats.setTotalVendors(totalVendors);
        
        // Total vendors (all, including unverified) - for spots calculation - optimized COUNT
        long vendorCount = vendorRepository.count();
        stats.setVendorCount(vendorCount);
        
        // Total events completed - optimized COUNT query
        long totalEvents = orderRepository.countCompletedOrders();
        stats.setTotalEventsCompleted(totalEvents);
        
        // Average rating - optimized AVG query
        Double avgRatingResult = vendorRepository.getAverageRating();
        double avgRating = avgRatingResult != null ? avgRatingResult : 0.0;
        stats.setAverageRating(avgRating);
        
        // Satisfaction rate - optimized COUNT queries
        long totalReviews = reviewRepository.count();
        long satisfiedReviews = reviewRepository.countSatisfiedReviews();
        double satisfactionRate = totalReviews > 0 ? (double) satisfiedReviews / totalReviews * 100 : 0.0;
        stats.setSatisfactionRate(satisfactionRate);
        
        return stats;
    }
}


