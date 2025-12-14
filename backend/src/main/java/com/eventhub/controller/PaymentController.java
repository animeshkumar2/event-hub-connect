package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Payment;
import com.eventhub.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/customers/payments")
@RequiredArgsConstructor
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<PaymentService.PaymentIntent>> initiatePayment(
            @RequestParam UUID orderId,
            @RequestParam String paymentMethod) {
        PaymentService.PaymentIntent intent = paymentService.initiatePayment(orderId, paymentMethod);
        return ResponseEntity.ok(ApiResponse.success("Payment initiated", intent));
    }
    
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Payment>> verifyPayment(
            @RequestParam String transactionId,
            @RequestParam(required = false) String paymentGatewayResponse) {
        Payment payment = paymentService.verifyPayment(transactionId, paymentGatewayResponse);
        return ResponseEntity.ok(ApiResponse.success("Payment verified", payment));
    }
    
    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<Payment>> getPaymentStatus(@PathVariable UUID paymentId) {
        Payment payment = paymentService.getPaymentStatus(paymentId);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }
}





