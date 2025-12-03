package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Order;
import com.eventhub.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {
    
    private final OrderRepository orderRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Order>> getOrder(@PathVariable UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Order not found"));
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestBody UpdateStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new com.eventhub.exception.NotFoundException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(request.getStatus()));
        order = orderRepository.save(order);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }
    
    @lombok.Data
    public static class UpdateStatusRequest {
        private String status;
    }
}

