package com.eventhub.service;

import com.eventhub.model.Vendor;
import com.eventhub.repository.VendorRepository;
import com.eventhub.repository.OrderRepository;
import com.eventhub.repository.LeadRepository;
import com.eventhub.repository.VendorWalletRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        // Upcoming bookings
        long upcomingBookings = 0;
        try {
            upcomingBookings = orderRepository.findByVendor(vendor, PageRequest.of(0, Integer.MAX_VALUE))
                    .getContent().stream()
                    .filter(o -> o != null && o.getEventDate() != null && o.getEventDate().isAfter(LocalDate.now()))
                    .filter(o -> o.getStatus() == com.eventhub.model.Order.OrderStatus.CONFIRMED 
                            || o.getStatus() == com.eventhub.model.Order.OrderStatus.IN_PROGRESS)
                    .count();
        } catch (Exception e) {
            // If orders table has issues, default to 0
            upcomingBookings = 0;
        }
        
        // Pending leads
        long pendingLeads = 0;
        try {
            pendingLeads = leadRepository.findByVendorAndStatus(
                    vendor, com.eventhub.model.Lead.LeadStatus.NEW).size();
        } catch (Exception e) {
            // If leads table doesn't exist or has issues, default to 0
            pendingLeads = 0;
        }
        
        // Wallet balance
        BigDecimal walletBalance = BigDecimal.ZERO;
        try {
            walletBalance = vendorWalletRepository.findByVendor(vendor)
                    .map(w -> w.getBalance() != null ? w.getBalance() : BigDecimal.ZERO)
                    .orElse(BigDecimal.ZERO);
        } catch (Exception e) {
            // If wallet doesn't exist, default to 0
            walletBalance = BigDecimal.ZERO;
        }
        
        // Monthly revenue
        BigDecimal monthlyRevenue = BigDecimal.ZERO;
        try {
            LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
            LocalDate endOfMonth = LocalDate.now();
            Double revenue = orderRepository.calculateRevenue(vendor, startOfMonth, endOfMonth);
            monthlyRevenue = revenue != null ? BigDecimal.valueOf(revenue) : BigDecimal.ZERO;
        } catch (Exception e) {
            // If calculation fails, default to 0
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

