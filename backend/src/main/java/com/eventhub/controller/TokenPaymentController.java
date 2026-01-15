package com.eventhub.controller;

import com.eventhub.dto.request.TokenPaymentRequest;
import com.eventhub.dto.request.PaymentWebhookRequest;
import com.eventhub.dto.response.PaymentInitiationResponse;
import com.eventhub.dto.response.PaymentStatusResponse;
import com.eventhub.service.TokenPaymentService;
import com.eventhub.exception.PaymentException;
import com.eventhub.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments/token")
public class TokenPaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(TokenPaymentController.class);
    
    @Autowired
    private TokenPaymentService tokenPaymentService;
    
    /**
     * Initiate token payment for an order
     */
    @PostMapping("/orders/{orderId}")
    public ResponseEntity<?> initiateTokenPayment(
            @PathVariable UUID orderId,
            @Valid @RequestBody TokenPaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            logger.info("Initiating token payment for order: {} by user: {}", orderId, userId);
            
            PaymentInitiationResponse response = tokenPaymentService.processTokenPayment(orderId, userId, request);
            return ResponseEntity.ok(response);
            
        } catch (PaymentException e) {
            logger.error("Payment error for order {}: {}", orderId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "code", "PAYMENT_ERROR"
            ));
        } catch (ResourceNotFoundException e) {
            logger.error("Order not found: {}", orderId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", e.getMessage(),
                "code", "ORDER_NOT_FOUND"
            ));
        } catch (Exception e) {
            logger.error("Unexpected error processing token payment for order {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "An unexpected error occurred",
                "code", "INTERNAL_ERROR"
            ));
        }
    }
    
    /**
     * Get payment status
     */
    @GetMapping("/{paymentId}/status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable UUID paymentId) {
        try {
            PaymentStatusResponse response = tokenPaymentService.getPaymentStatus(paymentId);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", e.getMessage(),
                "code", "PAYMENT_NOT_FOUND"
            ));
        }
    }
    
    /**
     * Handle payment webhook from gateway
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handlePaymentWebhook(
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestBody PaymentWebhookRequest request) {
        
        try {
            logger.info("Received payment webhook for transaction: {}", request.getTransactionId());
            
            // Validate webhook signature
            if (!tokenPaymentService.validatePaymentWebhook(signature, request.getRawPayload())) {
                logger.warn("Invalid webhook signature for transaction: {}", request.getTransactionId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Invalid webhook signature",
                    "code", "INVALID_SIGNATURE"
                ));
            }
            
            // Process webhook
            tokenPaymentService.handlePaymentWebhook(
                request.getTransactionId(),
                request.getStatus(),
                request.getRawPayload()
            );
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Webhook processed successfully"
            ));
            
        } catch (ResourceNotFoundException e) {
            logger.error("Payment not found for webhook: {}", request.getTransactionId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", e.getMessage(),
                "code", "PAYMENT_NOT_FOUND"
            ));
        } catch (Exception e) {
            logger.error("Error processing webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to process webhook",
                "code", "WEBHOOK_ERROR"
            ));
        }
    }
    
    /**
     * Get token percentage configuration
     */
    @GetMapping("/config")
    public ResponseEntity<?> getTokenConfig() {
        return ResponseEntity.ok(Map.of(
            "tokenPercentage", tokenPaymentService.getTokenPercentage(),
            "currency", "INR"
        ));
    }
    
    /**
     * Check if order has token payment
     */
    @GetMapping("/orders/{orderId}/status")
    public ResponseEntity<?> checkOrderTokenPayment(@PathVariable UUID orderId) {
        boolean hasTokenPayment = tokenPaymentService.hasCompletedTokenPayment(orderId);
        return ResponseEntity.ok(Map.of(
            "orderId", orderId,
            "hasTokenPayment", hasTokenPayment
        ));
    }
    
    /**
     * Initiate token payment for an offer (after offer is accepted)
     */
    @PostMapping("/offers/{offerId}")
    public ResponseEntity<?> initiateTokenPaymentForOffer(
            @PathVariable UUID offerId,
            @Valid @RequestBody TokenPaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            logger.info("Initiating token payment for offer: {} by user: {}", offerId, userId);
            
            PaymentInitiationResponse response = tokenPaymentService.processTokenPaymentForOffer(offerId, userId, request);
            return ResponseEntity.ok(response);
            
        } catch (PaymentException e) {
            logger.error("Payment error for offer {}: {}", offerId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "code", "PAYMENT_ERROR"
            ));
        } catch (ResourceNotFoundException e) {
            logger.error("Offer not found: {}", offerId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", e.getMessage(),
                "code", "OFFER_NOT_FOUND"
            ));
        } catch (Exception e) {
            logger.error("Unexpected error processing token payment for offer {}: {}", offerId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "An unexpected error occurred",
                "code", "INTERNAL_ERROR"
            ));
        }
    }
}
