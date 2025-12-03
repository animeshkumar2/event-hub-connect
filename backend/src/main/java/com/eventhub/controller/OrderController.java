package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.CreateOrderRequest;
import com.eventhub.model.Order;
import com.eventhub.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateOrderRequest request) {
        
        OrderService.CreateOrderRequest serviceRequest = new OrderService.CreateOrderRequest();
        serviceRequest.setPaymentMethod(request.getPaymentMethod());
        serviceRequest.setCustomerName(request.getCustomerName());
        serviceRequest.setCustomerEmail(request.getCustomerEmail());
        serviceRequest.setCustomerPhone(request.getCustomerPhone());
        serviceRequest.setEventDate(request.getEventDate());
        serviceRequest.setEventTime(request.getEventTime());
        serviceRequest.setVenueAddress(request.getVenueAddress());
        serviceRequest.setGuestCount(request.getGuestCount());
        serviceRequest.setEventType(request.getEventType());
        serviceRequest.setNotes(request.getNotes());
        
        Order order = orderService.createOrderFromCart(userId, serviceRequest);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getCustomerOrders(
            @RequestHeader("X-User-Id") UUID userId) {
        List<Order> orders = orderService.getCustomerOrders(userId);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Order>> getOrder(@PathVariable UUID orderId) {
        Order order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
}

