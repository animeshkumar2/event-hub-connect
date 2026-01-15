package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Order;
import com.eventhub.model.OrderTimeline;
import com.eventhub.model.VendorPastEvent;
import com.eventhub.service.VendorBookingService;
import com.eventhub.util.VendorIdResolver;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/bookings")
@RequiredArgsConstructor
public class VendorBookingController {
    
    private final VendorBookingService bookingService;
    private final VendorIdResolver vendorIdResolver;
    
    /**
     * Get all bookings with pagination
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> getAllBookings(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> bookings = bookingService.getAllBookings(vendorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
    
    /**
     * Get upcoming bookings
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<Order>>> getUpcomingBookings(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<Order> bookings = bookingService.getUpcomingBookings(vendorId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
    
    /**
     * Get past bookings
     */
    @GetMapping("/past")
    public ResponseEntity<ApiResponse<List<Order>>> getPastBookings(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<Order> bookings = bookingService.getPastBookings(vendorId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
    
    /**
     * Get booking by ID
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<Order>> getBooking(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID bookingId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Order booking = bookingService.getBookingById(bookingId, vendorId);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }
    
    /**
     * Get booking timeline
     */
    @GetMapping("/{bookingId}/timeline")
    public ResponseEntity<ApiResponse<List<OrderTimeline>>> getBookingTimeline(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID bookingId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<OrderTimeline> timeline = bookingService.getBookingTimeline(bookingId, vendorId);
        return ResponseEntity.ok(ApiResponse.success(timeline));
    }
    
    /**
     * Complete an event (mark booking as completed and create past event)
     */
    @PostMapping("/{bookingId}/complete")
    public ResponseEntity<ApiResponse<VendorPastEvent>> completeEvent(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID bookingId,
            @RequestBody VendorBookingService.CompleteEventRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        VendorPastEvent pastEvent = bookingService.completeEvent(vendorId, bookingId, request);
        return ResponseEntity.ok(ApiResponse.success("Event completed successfully", pastEvent));
    }
}
