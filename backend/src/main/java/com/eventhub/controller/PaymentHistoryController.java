package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.response.PaymentHistoryResponse;
import com.eventhub.service.PaymentTrackingService;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class PaymentHistoryController {
    
    private final PaymentTrackingService paymentTrackingService;
    
    /**
     * Get payment history for an order
     */
    @GetMapping("/{orderId}/payments")
    public ResponseEntity<ApiResponse<PaymentHistoryResponse>> getPaymentHistory(
            @PathVariable UUID orderId) {
        try {
            PaymentHistoryResponse response = paymentTrackingService.getPaymentHistory(orderId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get balance due for an order
     */
    @GetMapping("/{orderId}/balance")
    public ResponseEntity<?> getBalanceDue(@PathVariable UUID orderId) {
        try {
            BigDecimal balanceDue = paymentTrackingService.calculateBalanceDue(orderId);
            BigDecimal totalPaid = paymentTrackingService.calculateTotalPaid(orderId);
            return ResponseEntity.ok(Map.of(
                "orderId", orderId,
                "totalPaid", totalPaid,
                "balanceDue", balanceDue
            ));
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
