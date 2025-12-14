package com.eventhub.service;

import com.eventhub.dto.request.AdminLoginRequest;
import com.eventhub.dto.response.AdminDashboardStatsDTO;
import com.eventhub.exception.ValidationException;
import com.eventhub.model.UserProfile;
import com.eventhub.model.Vendor;
import com.eventhub.repository.*;
import com.eventhub.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AdminService {
    
    private final JwtUtil jwtUtil;
    
    @Value("${admin.username:admin}")
    private String adminUsername;
    
    @Value("${admin.password:admin123}")
    private String adminPassword;
    
    private final UserProfileRepository userProfileRepository;
    private final VendorRepository vendorRepository;
    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final LeadRepository leadRepository;
    private final AnalyticsService analyticsService;
    
    public AuthResponse adminLogin(AdminLoginRequest request) {
        // Simple hardcoded admin credentials (can be moved to env vars)
        if (!adminUsername.equals(request.getUsername()) || !adminPassword.equals(request.getPassword())) {
            throw new ValidationException("Invalid admin credentials");
        }
        
        // Create or get admin user profile
        UserProfile admin = userProfileRepository.findByEmail("admin@cartevent.com")
                .orElseGet(() -> {
                    UserProfile newAdmin = new UserProfile();
                    newAdmin.setId(UUID.randomUUID());
                    newAdmin.setEmail("admin@cartevent.com");
                    newAdmin.setFullName("Admin");
                    newAdmin.setRole(UserProfile.Role.ADMIN);
                    return userProfileRepository.save(newAdmin);
                });
        
        // Ensure role is ADMIN
        if (admin.getRole() != UserProfile.Role.ADMIN) {
            admin.setRole(UserProfile.Role.ADMIN);
            userProfileRepository.save(admin);
        }
        
        String token = jwtUtil.generateToken(admin.getId(), admin.getEmail(), admin.getRole().name());
        
        return new AuthResponse(token, admin.getId(), admin.getEmail(), admin.getRole().name());
    }
    
    @Cacheable(value = "adminDashboardStats", unless = "#result == null")
    public AdminDashboardStatsDTO getDashboardStats() {
        AdminDashboardStatsDTO stats = new AdminDashboardStatsDTO();
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        // User Stats - optimized with direct queries
        long totalUsers = userProfileRepository.count();
        long totalCustomers = userProfileRepository.countByRole(UserProfile.Role.CUSTOMER);
        long totalVendors = vendorRepository.count();
        
        // New signups (last 30 days) - optimized
        long newUsersLast30Days = userProfileRepository.countByCreatedAtAfter(thirtyDaysAgo);
        long newVendorsLast30Days = vendorRepository.countByCreatedAtAfter(thirtyDaysAgo);
        
        // Listing Stats - optimized
        long totalListings = listingRepository.count();
        long activeListings = listingRepository.countByIsActiveTrue();
        long newListingsLast30Days = listingRepository.countByCreatedAtAfter(thirtyDaysAgo);
        
        // Order Stats - optimized
        long totalOrders = orderRepository.count();
        long completedOrders = orderRepository.countByStatus(com.eventhub.model.Order.OrderStatus.COMPLETED);
        long pendingOrders = orderRepository.countByStatus(com.eventhub.model.Order.OrderStatus.PENDING);
        
        // Revenue Stats - optimized with query
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        BigDecimal monthlyRevenue = orderRepository.calculateRevenueSince(thirtyDaysAgo);
        
        // Review Stats - optimized
        long totalReviews = reviewRepository.count();
        Double avgRating = reviewRepository.getAverageRating();
        double averageRating = avgRating != null ? avgRating : 0.0;
        
        // Lead Stats - optimized
        long totalLeads = leadRepository.count();
        long newLeadsLast30Days = leadRepository.countByCreatedAtAfter(thirtyDaysAgo);
        
        // Category Distribution - native SQL aggregation (much faster)
        Map<String, Long> listingsByCategory = new HashMap<>();
        List<Object[]> categoryResults = listingRepository.getListingsByCategoryNative();
        for (Object[] result : categoryResults) {
            String category = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            listingsByCategory.put(category, count);
        }
        
        // City Distribution - native SQL aggregation (much faster)
        Map<String, Long> vendorsByCity = new HashMap<>();
        List<Object[]> cityResults = vendorRepository.getVendorsByCityNative();
        for (Object[] result : cityResults) {
            String city = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            vendorsByCity.put(city, count);
        }
        
        // Analytics Stats
        long totalPageViews = analyticsService.getTotalPageViews();
        long totalSignups = analyticsService.getTotalSignups();
        long uniqueVisitors30Days = analyticsService.getUniqueVisitorsSince(thirtyDaysAgo);
        long signups30Days = analyticsService.getUniqueSignupsSince(thirtyDaysAgo);
        
        // Set all stats
        stats.setTotalUsers(totalUsers);
        stats.setTotalCustomers(totalCustomers);
        stats.setTotalVendors(totalVendors);
        stats.setNewUsersLast30Days(newUsersLast30Days);
        stats.setNewVendorsLast30Days(newVendorsLast30Days);
        stats.setTotalListings(totalListings);
        stats.setActiveListings(activeListings);
        stats.setNewListingsLast30Days(newListingsLast30Days);
        stats.setTotalOrders(totalOrders);
        stats.setCompletedOrders(completedOrders);
        stats.setPendingOrders(pendingOrders);
        stats.setTotalRevenue(totalRevenue);
        stats.setMonthlyRevenue(monthlyRevenue);
        stats.setTotalReviews(totalReviews);
        stats.setAverageRating(averageRating);
        stats.setTotalLeads(totalLeads);
        stats.setNewLeadsLast30Days(newLeadsLast30Days);
        stats.setListingsByCategory(listingsByCategory);
        stats.setVendorsByCity(vendorsByCity);
        stats.setTotalPageViews(totalPageViews);
        stats.setTotalSignups(totalSignups);
        stats.setUniqueVisitors30Days(uniqueVisitors30Days);
        stats.setSignups30Days(signups30Days);
        
        return stats;
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private UUID userId;
        private String email;
        private String role;
    }
}

