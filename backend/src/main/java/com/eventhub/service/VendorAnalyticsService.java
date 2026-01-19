package com.eventhub.service;

import com.eventhub.model.Order;
import com.eventhub.model.Lead;
import com.eventhub.repository.VendorRepository;
import com.eventhub.repository.OrderRepository;
import com.eventhub.repository.LeadRepository;
import com.eventhub.repository.VendorWalletRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VendorAnalyticsService {
    
    private final VendorRepository vendorRepository;
    private final OrderRepository orderRepository;
    private final LeadRepository leadRepository;
    private final VendorWalletRepository vendorWalletRepository;
    
    public DashboardStats getDashboardStats(UUID vendorId) {
        // Verify vendor exists without loading full entity
        if (!vendorRepository.existsById(vendorId)) {
            throw new NotFoundException("Vendor not found");
        }
        
        // Upcoming bookings - use optimized count query
        long upcomingBookings = 0;
        try {
            List<Order.OrderStatus> activeStatuses = Arrays.asList(
                Order.OrderStatus.CONFIRMED, 
                Order.OrderStatus.IN_PROGRESS
            );
            upcomingBookings = orderRepository.countUpcomingBookings(vendorId, LocalDate.now(), activeStatuses);
        } catch (Exception e) {
            upcomingBookings = 0;
        }
        
        // Pending leads - use optimized count query
        long pendingLeads = 0;
        try {
            pendingLeads = leadRepository.countByVendorIdAndStatus(vendorId, Lead.LeadStatus.NEW);
        } catch (Exception e) {
            pendingLeads = 0;
        }
        
        // Wallet balance - use vendor ID directly
        BigDecimal walletBalance = BigDecimal.ZERO;
        try {
            walletBalance = vendorWalletRepository.findByVendorId(vendorId)
                    .map(w -> w.getBalance() != null ? w.getBalance() : BigDecimal.ZERO)
                    .orElse(BigDecimal.ZERO);
        } catch (Exception e) {
            walletBalance = BigDecimal.ZERO;
        }
        
        // Monthly revenue - use optimized query with vendor ID
        BigDecimal monthlyRevenue = BigDecimal.ZERO;
        try {
            LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            monthlyRevenue = orderRepository.calculateRevenueByVendorSince(vendorId, startOfMonth);
            if (monthlyRevenue == null) {
                monthlyRevenue = BigDecimal.ZERO;
            }
        } catch (Exception e) {
            monthlyRevenue = BigDecimal.ZERO;
        }
        
        return new DashboardStats(
                upcomingBookings,
                pendingLeads,
                walletBalance,
                monthlyRevenue
        );
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class DashboardStats {
        private Long upcomingBookings;
        private Long pendingLeads;
        private BigDecimal walletBalance;
        private BigDecimal monthlyRevenue;
    }
}

