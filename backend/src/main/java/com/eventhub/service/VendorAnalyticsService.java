package com.eventhub.service;

import com.eventhub.model.Vendor;
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
        long upcomingBookings = orderRepository.findAll().stream()
                .filter(o -> o.getVendor().getId().equals(vendorId))
                .filter(o -> o.getEventDate() != null && o.getEventDate().isAfter(LocalDate.now()))
                .filter(o -> o.getStatus() == com.eventhub.model.Order.OrderStatus.CONFIRMED 
                        || o.getStatus() == com.eventhub.model.Order.OrderStatus.IN_PROGRESS)
                .count();
        
        // Pending leads
        long pendingLeads = leadRepository.findByVendorAndStatus(
                vendor, com.eventhub.model.Lead.LeadStatus.NEW).size();
        
        // Wallet balance
        BigDecimal walletBalance = vendorWalletRepository.findByVendor(vendor)
                .map(w -> w.getBalance())
                .orElse(BigDecimal.ZERO);
        
        // Monthly revenue
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now();
        Double monthlyRevenue = orderRepository.calculateRevenue(vendor, startOfMonth, endOfMonth);
        
        return new DashboardStats(
                upcomingBookings,
                pendingLeads,
                walletBalance,
                monthlyRevenue != null ? BigDecimal.valueOf(monthlyRevenue) : BigDecimal.ZERO
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

