package com.eventhub.service;

import com.eventhub.model.Order;
import com.eventhub.model.OrderTimeline;
import com.eventhub.model.Vendor;
import com.eventhub.model.VendorPastEvent;
import com.eventhub.repository.OrderRepository;
import com.eventhub.repository.OrderTimelineRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.repository.VendorPastEventRepository;
import com.eventhub.exception.NotFoundException;
import com.eventhub.exception.BusinessRuleException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorBookingService {
    
    private final OrderRepository orderRepository;
    private final VendorRepository vendorRepository;
    private final VendorPastEventRepository vendorPastEventRepository;
    private final OrderTimelineRepository orderTimelineRepository;
    
    private static final int DEFAULT_PAGE_SIZE = 50;
    
    /**
     * Get all bookings for a vendor (only CONFIRMED, IN_PROGRESS, COMPLETED orders)
     */
    @Transactional(readOnly = true)
    public Page<Order> getAllBookings(UUID vendorId, Pageable pageable) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        List<Order.OrderStatus> bookingStatuses = List.of(
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.IN_PROGRESS,
            Order.OrderStatus.COMPLETED
        );
        
        return orderRepository.findByVendorAndStatusIn(vendor, bookingStatuses, pageable);
    }
    
    /**
     * Get upcoming bookings - optimized with database query
     */
    @Transactional(readOnly = true)
    public List<Order> getUpcomingBookings(UUID vendorId) {
        LocalDate today = LocalDate.now();
        List<Order.OrderStatus> statuses = List.of(
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.IN_PROGRESS
        );
        
        // Use optimized database query with pagination
        return orderRepository.findUpcomingBookingsOptimized(
            vendorId, today, statuses, 
            PageRequest.of(0, DEFAULT_PAGE_SIZE, Sort.by(Sort.Direction.ASC, "eventDate"))
        );
    }
    
    /**
     * Get past bookings - optimized with database query
     */
    @Transactional(readOnly = true)
    public List<Order> getPastBookings(UUID vendorId) {
        LocalDate today = LocalDate.now();
        
        // Use optimized database query with pagination
        return orderRepository.findPastBookingsOptimized(
            vendorId, today,
            PageRequest.of(0, DEFAULT_PAGE_SIZE, Sort.by(Sort.Direction.DESC, "eventDate"))
        );
    }
    
    /**
     * Get booking by ID
     */
    @Transactional(readOnly = true)
    public Order getBookingById(UUID bookingId, UUID vendorId) {
        Order order = orderRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        
        if (!order.getVendor().getId().equals(vendorId)) {
            throw new BusinessRuleException("You don't have permission to view this booking");
        }
        
        return order;
    }
    
    /**
     * Get order timeline for a booking
     */
    @Transactional(readOnly = true)
    public List<OrderTimeline> getBookingTimeline(UUID bookingId, UUID vendorId) {
        // Verify ownership first
        Order order = orderRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        
        if (!order.getVendor().getId().equals(vendorId)) {
            throw new BusinessRuleException("You don't have permission to view this booking");
        }
        
        // Use optimized query with order ID directly
        return orderTimelineRepository.findByOrderIdOrderByCreatedAtAsc(bookingId);
    }
    
    /**
     * Complete an event - creates a past event from the order
     */
    public VendorPastEvent completeEvent(UUID vendorId, UUID orderId, CompleteEventRequest request) {
        Order order = getBookingById(orderId, vendorId);
        
        if (order.getEventDate() != null && order.getEventDate().isAfter(LocalDate.now())) {
            throw new BusinessRuleException("Cannot complete event before the event date");
        }
        
        if (order.getStatus() != Order.OrderStatus.CONFIRMED 
                && order.getStatus() != Order.OrderStatus.IN_PROGRESS) {
            throw new BusinessRuleException("Only confirmed or in-progress bookings can be completed");
        }
        
        order.setStatus(Order.OrderStatus.COMPLETED);
        orderRepository.save(order);
        
        VendorPastEvent pastEvent = new VendorPastEvent();
        pastEvent.setVendor(order.getVendor());
        pastEvent.setOrder(order);
        pastEvent.setImages(request.getImages());
        pastEvent.setEventType(order.getEventType());
        pastEvent.setEventDate(order.getEventDate());
        pastEvent.setDescription(request.getDescription());
        
        return vendorPastEventRepository.save(pastEvent);
    }
    
    @Data
    public static class CompleteEventRequest {
        private List<String> images;
        private String description;
    }
}
