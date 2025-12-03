package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Order;
import com.eventhub.service.VendorOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/orders")
@RequiredArgsConstructor
public class VendorOrderController {
    
    private final VendorOrderService orderService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> getOrders(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Order.OrderStatus orderStatus = status != null ? Order.OrderStatus.valueOf(status) : null;
        Page<Order> orders = orderService.getVendorOrders(vendorId, orderStatus, pageable);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Order>> getOrder(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID orderId) {
        Order order = orderService.getOrderById(orderId, vendorId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID orderId,
            @RequestBody UpdateStatusRequest request) {
        Order order = orderService.updateOrderStatus(orderId, vendorId, Order.OrderStatus.valueOf(request.getStatus()));
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }
    
    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<ApiResponse<Order>> confirmOrder(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID orderId) {
        Order order = orderService.confirmOrder(orderId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Order confirmed", order));
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<Order>>> getUpcomingOrders(@RequestHeader("X-Vendor-Id") UUID vendorId) {
        List<Order> orders = orderService.getUpcomingOrders(vendorId);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @lombok.Data
    public static class UpdateStatusRequest {
        private String status;
    }
}

