package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.response.RefundResponse;
import com.eventhub.exception.PaymentException;
import com.eventhub.exception.NotFoundException;
import com.eventhub.service.TokenPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderCancellationController {
    
    private final TokenPaymentService tokenPaymentService;
    
    /**
     * Cancel an order and process refund
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable UUID orderId,
            @RequestBody(required = false) CancelOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            String reason = request != null && request.getReason() != null 
                    ? request.getReason() 
                    : "User requested cancellation";
            
            log.info("Processing order cancellation for order: {} by user: {}", orderId, userId);
            
            RefundResponse response = tokenPaymentService.initiateRefund(orderId, userId, reason);
            return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
            
        } catch (PaymentException e) {
            log.error("Payment error during cancellation for order {}: {}", orderId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "code", "CANCELLATION_ERROR"
            ));
        } catch (NotFoundException e) {
            log.error("Order not found: {}", orderId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", e.getMessage(),
                "code", "ORDER_NOT_FOUND"
            ));
        } catch (Exception e) {
            log.error("Unexpected error during cancellation for order {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "An unexpected error occurred",
                "code", "INTERNAL_ERROR"
            ));
        }
    }
    
    /**
     * Get refund estimate for an order
     */
    @GetMapping("/{orderId}/refund-estimate")
    public ResponseEntity<?> getRefundEstimate(@PathVariable UUID orderId) {
        try {
            var estimate = tokenPaymentService.getRefundEstimate(orderId);
            return ResponseEntity.ok(estimate);
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", e.getMessage(),
                "code", "ORDER_NOT_FOUND"
            ));
        } catch (PaymentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "code", "REFUND_ERROR"
            ));
        }
    }
    
    @lombok.Data
    public static class CancelOrderRequest {
        private String reason;
    }
}
