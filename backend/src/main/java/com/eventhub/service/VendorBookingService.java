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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorBookingService {
    
    private final OrderRepository orderRepository;
    private final VendorRepository vendorRepository;
    private final VendorPastEventRepository vendorPastEventRepository;
    private final OrderTimelineRepository orderTimelineRepository;
    
    /**
     * Get all bookings for a vendor (only CONFIRMED, IN_PROGRESS, COMPLETED orders)
     * PENDING orders should be in Leads section, not Bookings
     */
    @Transactional(readOnly = true)
    public Page<Order> getAllBookings(UUID vendorId, Pageable pageable) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        // Only return orders that are confirmed or beyond (not PENDING or CANCELLED)
        List<Order.OrderStatus> bookingStatuses = List.of(
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.IN_PROGRESS,
            Order.OrderStatus.COMPLETED
        );
        
        return orderRepository.findByVendorAndStatusIn(vendor, bookingStatuses, pageable);
    }
    
    /**
     * Get upcoming bookings (event date >= today, status CONFIRMED or IN_PROGRESS)
     * Only includes orders that are confirmed or in progress (not PENDING or CANCELLED)
     */
    @Transactional(readOnly = true)
    public List<Order> getUpcomingBookings(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        LocalDate today = LocalDate.now();
        
        // Only get orders that are confirmed or beyond (not PENDING or CANCELLED)
        List<Order.OrderStatus> bookingStatuses = List.of(
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.IN_PROGRESS,
            Order.OrderStatus.COMPLETED
        );
        
        List<Order> bookingOrders = orderRepository.findByVendorAndStatusIn(vendor, bookingStatuses, Pageable.unpaged()).getContent();
        
        return bookingOrders.stream()
                .filter(order -> {
                    // Only include CONFIRMED or IN_PROGRESS (exclude COMPLETED from upcoming)
                    boolean isCorrectStatus = order.getStatus() == Order.OrderStatus.CONFIRMED 
                            || order.getStatus() == Order.OrderStatus.IN_PROGRESS;
                    if (!isCorrectStatus) return false;
                    
                    // If event date is null, include it in upcoming (assume it's a future booking)
                    // This handles cases where event date wasn't set during order creation
                    if (order.getEventDate() == null) {
                        return true; // Include orders without event date in upcoming
                    }
                    
                    // Check if event date is today or in the future
                    // isBefore returns true if date is before today, so we want !isBefore (today or future)
                    boolean isUpcoming = !order.getEventDate().isBefore(today);
                    return isUpcoming;
                })
                .sorted((o1, o2) -> {
                    // Sort: null dates go to end, then by date ascending
                    if (o1.getEventDate() == null && o2.getEventDate() == null) return 0;
                    if (o1.getEventDate() == null) return 1;
                    if (o2.getEventDate() == null) return -1;
                    return o1.getEventDate().compareTo(o2.getEventDate());
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get past bookings (event date < today OR status COMPLETED)
     * Only includes orders that are confirmed or beyond (not PENDING or CANCELLED)
     */
    @Transactional(readOnly = true)
    public List<Order> getPastBookings(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        LocalDate today = LocalDate.now();
        
        // Only get orders that are confirmed or beyond (not PENDING or CANCELLED)
        List<Order.OrderStatus> bookingStatuses = List.of(
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.IN_PROGRESS,
            Order.OrderStatus.COMPLETED
        );
        
        List<Order> bookingOrders = orderRepository.findByVendorAndStatusIn(vendor, bookingStatuses, Pageable.unpaged()).getContent();
        
        return bookingOrders.stream()
                .filter(order -> {
                    // Include if status is COMPLETED (regardless of event date)
                    if (order.getStatus() == Order.OrderStatus.COMPLETED) {
                        return true;
                    }
                    // Include if event date has passed (and status is CONFIRMED or IN_PROGRESS)
                    // If event date is null, don't include in past (keep it in upcoming)
                    if (order.getEventDate() == null) {
                        return false; // Orders without event date should stay in upcoming
                    }
                    return order.getEventDate().isBefore(today);
                })
                .sorted((o1, o2) -> {
                    // Sort: null dates go to end, then by date descending (most recent first)
                    if (o1.getEventDate() == null && o2.getEventDate() == null) return 0;
                    if (o1.getEventDate() == null) return 1;
                    if (o2.getEventDate() == null) return -1;
                    return o2.getEventDate().compareTo(o1.getEventDate()); // Descending
                })
                .collect(Collectors.toList());
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
        Order order = getBookingById(bookingId, vendorId);
        return orderTimelineRepository.findByOrderOrderByCreatedAtAsc(order);
    }
    
    /**
     * Complete an event - creates a past event from the order
     */
    public VendorPastEvent completeEvent(UUID vendorId, UUID orderId, CompleteEventRequest request) {
        Order order = getBookingById(orderId, vendorId);
        
        // Validate that the event date has passed or is today
        if (order.getEventDate() != null && order.getEventDate().isAfter(LocalDate.now())) {
            throw new BusinessRuleException("Cannot complete event before the event date");
        }
        
        // Validate that order is confirmed or in progress
        if (order.getStatus() != Order.OrderStatus.CONFIRMED 
                && order.getStatus() != Order.OrderStatus.IN_PROGRESS) {
            throw new BusinessRuleException("Only confirmed or in-progress bookings can be completed");
        }
        
        // Update order status to completed
        order.setStatus(Order.OrderStatus.COMPLETED);
        orderRepository.save(order);
        
        // Create past event
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
