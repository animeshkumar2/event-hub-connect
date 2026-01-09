package com.eventhub.service;

import com.eventhub.model.Order;
import com.eventhub.model.Vendor;
import com.eventhub.model.VendorPastEvent;
import com.eventhub.repository.OrderRepository;
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
    
    /**
     * Get all bookings for a vendor
     */
    @Transactional(readOnly = true)
    public Page<Order> getAllBookings(UUID vendorId, Pageable pageable) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        return orderRepository.findByVendor(vendor, pageable);
    }
    
    /**
     * Get upcoming bookings (event date >= today, status CONFIRMED or IN_PROGRESS)
     */
    @Transactional(readOnly = true)
    public List<Order> getUpcomingBookings(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        LocalDate today = LocalDate.now();
        List<Order> allOrders = orderRepository.findByVendor(vendor, Pageable.unpaged()).getContent();
        
        return allOrders.stream()
                .filter(order -> order.getEventDate() != null && !order.getEventDate().isBefore(today))
                .filter(order -> order.getStatus() == Order.OrderStatus.CONFIRMED 
                        || order.getStatus() == Order.OrderStatus.IN_PROGRESS)
                .sorted((o1, o2) -> {
                    if (o1.getEventDate() == null || o2.getEventDate() == null) return 0;
                    return o1.getEventDate().compareTo(o2.getEventDate());
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get past bookings (event date < today OR status COMPLETED)
     */
    @Transactional(readOnly = true)
    public List<Order> getPastBookings(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        LocalDate today = LocalDate.now();
        List<Order> allOrders = orderRepository.findByVendor(vendor, Pageable.unpaged()).getContent();
        
        return allOrders.stream()
                .filter(order -> {
                    if (order.getStatus() == Order.OrderStatus.COMPLETED) {
                        return true;
                    }
                    return order.getEventDate() != null && order.getEventDate().isBefore(today);
                })
                .sorted((o1, o2) -> {
                    if (o1.getEventDate() == null || o2.getEventDate() == null) return 0;
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
