package com.eventhub.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class AdminDashboardStatsDTO {
    // User Stats
    private Long totalUsers;
    private Long totalCustomers;
    private Long totalVendors;
    private Long newUsersLast30Days;
    private Long newVendorsLast30Days;
    
    // Listing Stats
    private Long totalListings;
    private Long activeListings;
    private Long newListingsLast30Days;
    
    // Order Stats
    private Long totalOrders;
    private Long completedOrders;
    private Long pendingOrders;
    
    // Revenue Stats
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    
    // Review Stats
    private Long totalReviews;
    private Double averageRating;
    
    // Lead Stats
    private Long totalLeads;
    private Long newLeadsLast30Days;
    
    // Distribution Stats
    private Map<String, Long> listingsByCategory;
    private Map<String, Long> vendorsByCity;
    
    // Analytics Stats
    private Long totalPageViews;
    private Long totalSignups;
    private Long uniqueVisitors30Days;
    private Long signups30Days;
}



