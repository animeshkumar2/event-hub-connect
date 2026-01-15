package com.eventhub.service;

import com.eventhub.model.*;
import com.eventhub.repository.PaymentRepository;
import com.eventhub.repository.OrderRepository;
import com.eventhub.dto.request.TokenPaymentRequest;
import com.eventhub.dto.response.PaymentInitiationResponse;
import com.eventhub.dto.response.PaymentStatusResponse;
import com.eventhub.exception.PaymentException;
import com.eventhub.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class TokenPaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(TokenPaymentService.class);
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private com.eventhub.repository.OfferRepository offerRepository;
    
    @Autowired
    private com.eventhub.repository.LeadRepository leadRepository;
    
    @Autowired
    @org.springframework.context.annotation.Lazy
    private LeadService leadService;
    
    @Value("${payment.token.percentage:25}")
    private int tokenPercentage;
    
    @Value("${payment.gateway.key:rzp_test_dummy}")
    private String gatewayKey;
    
    @Value("${payment.gateway.secret:dummy_secret}")
    private String gatewaySecret;
    
    @Value("${payment.return.url:http://localhost:3000/payment/callback}")
    private String returnUrl;
    
    @Value("${payment.cancel.url:http://localhost:3000/payment/cancel}")
    private String cancelUrl;
    
    /**
     * Calculate token amount based on order total
     */
    public BigDecimal calculateTokenAmount(BigDecimal orderTotal) {
        if (orderTotal == null || orderTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Order total must be positive");
        }
        
        BigDecimal percentage = new BigDecimal(tokenPercentage);
        BigDecimal tokenAmount = orderTotal
            .multiply(percentage)
            .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
        
        logger.debug("Calculated token amount: {} for order total: {} ({}%)", 
                    tokenAmount, orderTotal, tokenPercentage);
        
        return tokenAmount;
    }
    
    /**
     * Process token payment for an order
     */
    public PaymentInitiationResponse processTokenPayment(UUID orderId, UUID userId, TokenPaymentRequest request) {
        logger.info("Processing token payment for order: {} by user: {}", orderId, userId);
        
        // Validate order
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        if (!order.getUserId().equals(userId)) {
            throw new PaymentException("Order does not belong to user");
        }
        
        if (!Boolean.TRUE.equals(order.getAwaitingTokenPayment())) {
            throw new PaymentException("Order is not awaiting token payment");
        }
        
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new PaymentException("Order is not in pending status");
        }
        
        // Check if token payment already exists
        if (paymentRepository.hasTokenPayment(orderId)) {
            throw new PaymentException("Token payment already exists for this order");
        }
        
        // Get token amount from order
        BigDecimal tokenAmount = order.getTokenAmount();
        if (tokenAmount == null || tokenAmount.compareTo(BigDecimal.ZERO) <= 0) {
            tokenAmount = calculateTokenAmount(order.getTotalAmount());
        }
        
        // Create payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUserId(userId);
        payment.setVendor(order.getVendor());
        payment.setAmount(tokenAmount);
        payment.setPaymentType(PaymentType.TOKEN);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(generateTransactionId());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        payment = paymentRepository.save(payment);
        
        // Integrate with payment gateway (mock implementation)
        PaymentInitiationResponse response = initiatePaymentWithGateway(payment, request);
        
        logger.info("Token payment initiated: {} for order: {}", payment.getId(), orderId);
        
        return response;
    }
    
    /**
     * Handle payment webhook from gateway
     */
    @Transactional
    public void handlePaymentWebhook(String transactionId, String status, String gatewayResponse) {
        logger.info("Processing payment webhook for transaction: {} with status: {}", transactionId, status);
        
        Payment payment = paymentRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found for transaction: " + transactionId));
        
        if (!payment.isPending()) {
            logger.warn("Payment {} is already in final state: {}", payment.getId(), payment.getStatus());
            return;
        }
        
        payment.setGatewayResponse(gatewayResponse);
        
        if ("success".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status)) {
            payment.markCompleted();
            
            // Update order payment status
            Order order = payment.getOrder();
            order.setPaymentStatus(Order.PaymentStatus.PARTIAL);
            order.setTokenPaid(payment.getAmount());
            order.setBalanceAmount(order.getTotalAmount().subtract(payment.getAmount()));
            order.setAwaitingTokenPayment(false);
            // Keep order in PENDING status until vendor accepts
            
            orderRepository.save(order);
            
            // Update lead token amount when payment is completed
            // Leads are now created immediately when orders are created, so we just update them here
            if (payment.getPaymentType() == PaymentType.TOKEN) {
                try {
                    // Find existing lead for this order
                    com.eventhub.model.Lead existingLead = leadRepository.findByOrderId(order.getId()).orElse(null);
                    if (existingLead != null) {
                        // Update token amount (lead was created when order was created)
                        existingLead.setTokenAmount(payment.getAmount());
                        
                        // If this is an offer-based order, convert the lead
                        if (existingLead.getSource() == com.eventhub.model.Lead.LeadSource.OFFER ||
                            existingLead.getSource() == com.eventhub.model.Lead.LeadSource.CHAT) {
                            existingLead.setStatus(com.eventhub.model.Lead.LeadStatus.CONVERTED);
                            // Confirm the order
                            order.setStatus(Order.OrderStatus.CONFIRMED);
                            orderRepository.save(order);
                            logger.info("Lead {} converted and order {} confirmed after token payment", 
                                    existingLead.getId(), order.getId());
                        }
                        // For DIRECT_ORDER leads, keep status as NEW (vendor needs to accept)
                        
                        leadRepository.save(existingLead);
                        logger.info("Lead {} updated with token amount {} for order {}", 
                                existingLead.getId(), payment.getAmount(), order.getId());
                    } else {
                        // Fallback: Create lead if it doesn't exist (shouldn't happen, but just in case)
                        logger.warn("No lead found for order {}, creating one", order.getId());
                        leadService.createLeadFromOrder(order, payment);
                    }
                } catch (Exception e) {
                    logger.error("Failed to process lead for order: {}", order.getId(), e);
                    // Don't fail the payment, but log the error
                }
            }
            
            logger.info("Token payment completed for order: {}", order.getId());
            
        } else if ("failed".equalsIgnoreCase(status) || "error".equalsIgnoreCase(status)) {
            payment.markFailed("Payment failed at gateway");
        } else {
            logger.warn("Unknown payment status received: {}", status);
            return;
        }
        
        paymentRepository.save(payment);
        logger.info("Payment webhook processed successfully for transaction: {}", transactionId);
    }
    
    /**
     * Get payment status
     */
    public PaymentStatusResponse getPaymentStatus(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + paymentId));
        
        return new PaymentStatusResponse(
            payment.getId(),
            payment.getStatus(),
            payment.getAmount(),
            payment.getCompletedAt(),
            payment.getFailureReason()
        );
    }
    
    /**
     * Validate payment webhook signature
     */
    public boolean validatePaymentWebhook(String signature, String payload) {
        logger.debug("Validating webhook signature: {}", signature);
        // Mock implementation - in production, implement proper HMAC validation
        return signature != null && !signature.trim().isEmpty();
    }
    
    /**
     * Initiate payment with gateway (mock implementation)
     */
    private PaymentInitiationResponse initiatePaymentWithGateway(Payment payment, TokenPaymentRequest request) {
        logger.info("Initiating payment with gateway for amount: {}", payment.getAmount());
        
        // Generate mock payment URL
        String paymentUrl = String.format(
            "https://checkout.razorpay.com/v1/checkout.js?key_id=%s&amount=%s&order_id=%s",
            gatewayKey,
            payment.getAmount().multiply(new BigDecimal(100)).intValue(), // Convert to paise
            payment.getTransactionId()
        );
        
        return new PaymentInitiationResponse(
            payment.getId(),
            paymentUrl,
            payment.getAmount(),
            payment.getTransactionId(),
            "Payment initiated successfully"
        );
    }
    
    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId() {
        return "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * Get token percentage configuration
     */
    public int getTokenPercentage() {
        return tokenPercentage;
    }
    
    /**
     * Check if order has completed token payment
     */
    public boolean hasCompletedTokenPayment(UUID orderId) {
        return paymentRepository.hasTokenPayment(orderId);
    }
    
    /**
     * Get completed token payment for order
     */
    public Payment getTokenPayment(UUID orderId) {
        return paymentRepository.findTokenPaymentByOrderId(orderId).orElse(null);
    }
    
    /**
     * Process token payment for an offer (after offer is accepted)
     */
    public PaymentInitiationResponse processTokenPaymentForOffer(UUID offerId, UUID userId, TokenPaymentRequest request) {
        logger.info("Processing token payment for offer: {} by user: {}", offerId, userId);
        
        // Validate offer exists and belongs to user
        com.eventhub.model.Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new ResourceNotFoundException("Offer not found: " + offerId));
        
        if (!offer.getUserId().equals(userId)) {
            throw new PaymentException("Offer does not belong to user");
        }
        
        if (offer.getStatus() != com.eventhub.model.Offer.OfferStatus.ACCEPTED) {
            throw new PaymentException("Offer is not in accepted status");
        }
        
        // Get the order associated with the offer
        UUID orderId = offer.getOrderId();
        if (orderId == null) {
            throw new PaymentException("No order found for this offer");
        }
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found for offer: " + offerId));
        
        if (!Boolean.TRUE.equals(order.getAwaitingTokenPayment())) {
            throw new PaymentException("Order is not awaiting token payment");
        }
        
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new PaymentException("Order is not in pending status");
        }
        
        // Check if token payment already exists
        if (paymentRepository.hasTokenPayment(orderId)) {
            throw new PaymentException("Token payment already exists for this order");
        }
        
        // Get token amount from order
        BigDecimal tokenAmount = order.getTokenAmount();
        if (tokenAmount == null || tokenAmount.compareTo(BigDecimal.ZERO) <= 0) {
            tokenAmount = calculateTokenAmount(order.getTotalAmount());
        }
        
        // Create payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUserId(userId);
        payment.setVendor(order.getVendor());
        payment.setAmount(tokenAmount);
        payment.setPaymentType(PaymentType.TOKEN);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(generateTransactionId());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        payment = paymentRepository.save(payment);
        
        // Integrate with payment gateway (mock implementation)
        PaymentInitiationResponse response = initiatePaymentWithGateway(payment, request);
        
        logger.info("Token payment initiated: {} for offer: {} (order: {})", payment.getId(), offerId, orderId);
        
        return response;
    }
    
    /**
     * Initiate refund for an order
     */
    @Transactional
    public com.eventhub.dto.response.RefundResponse initiateRefund(UUID orderId, UUID userId, String reason) {
        logger.info("Initiating refund for order: {} by user: {} - Reason: {}", orderId, userId, reason);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        // Get token payment
        Payment tokenPayment = paymentRepository.findTokenPaymentByOrderId(orderId)
            .orElseThrow(() -> new PaymentException("No token payment found for order"));
        
        // Calculate refund amount based on event date
        BigDecimal refundAmount = calculateRefundAmount(order, tokenPayment.getAmount());
        
        // Create refund payment record
        Payment refundPayment = new Payment();
        refundPayment.setOrder(order);
        refundPayment.setUserId(userId);
        refundPayment.setVendor(order.getVendor());
        refundPayment.setAmount(refundAmount);
        refundPayment.setPaymentType(PaymentType.REFUND);
        refundPayment.setPaymentMethod(tokenPayment.getPaymentMethod());
        refundPayment.setTransactionId(generateTransactionId());
        refundPayment.setStatus(Payment.PaymentStatus.PENDING);
        
        refundPayment = paymentRepository.save(refundPayment);
        
        // In production, integrate with payment gateway for actual refund
        // For now, mark as completed
        refundPayment.markCompleted();
        paymentRepository.save(refundPayment);
        
        // Update order status
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        orderRepository.save(order);
        
        logger.info("Refund {} initiated for order {} - Amount: {}", 
                refundPayment.getId(), orderId, refundAmount);
        
        return com.eventhub.dto.response.RefundResponse.builder()
                .orderId(orderId)
                .paymentId(refundPayment.getId())
                .refundAmount(refundAmount)
                .originalAmount(tokenPayment.getAmount())
                .status("COMPLETED")
                .message("Refund processed successfully")
                .build();
    }
    
    /**
     * Calculate refund amount based on cancellation date relative to event date
     */
    private BigDecimal calculateRefundAmount(Order order, BigDecimal tokenAmount) {
        if (order.getEventDate() == null) {
            // No event date, full refund
            return tokenAmount;
        }
        
        java.time.LocalDate today = java.time.LocalDate.now();
        long daysUntilEvent = java.time.temporal.ChronoUnit.DAYS.between(today, order.getEventDate());
        
        if (daysUntilEvent > 30) {
            // More than 30 days: 100% refund
            return tokenAmount;
        } else if (daysUntilEvent >= 15) {
            // 15-30 days: 50% refund
            return tokenAmount.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);
        } else {
            // Less than 15 days: 0% refund
            return BigDecimal.ZERO;
        }
    }
    
    /**
     * Get refund estimate for an order (without processing)
     */
    public java.util.Map<String, Object> getRefundEstimate(UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        Payment tokenPayment = paymentRepository.findTokenPaymentByOrderId(orderId)
            .orElseThrow(() -> new PaymentException("No token payment found for order"));
        
        BigDecimal refundAmount = calculateRefundAmount(order, tokenPayment.getAmount());
        
        String refundPolicy;
        int refundPercentage;
        if (order.getEventDate() == null) {
            refundPolicy = "Full refund (no event date)";
            refundPercentage = 100;
        } else {
            java.time.LocalDate today = java.time.LocalDate.now();
            long daysUntilEvent = java.time.temporal.ChronoUnit.DAYS.between(today, order.getEventDate());
            
            if (daysUntilEvent > 30) {
                refundPolicy = "Full refund (more than 30 days before event)";
                refundPercentage = 100;
            } else if (daysUntilEvent >= 15) {
                refundPolicy = "50% refund (15-30 days before event)";
                refundPercentage = 50;
            } else {
                refundPolicy = "No refund (less than 15 days before event)";
                refundPercentage = 0;
            }
        }
        
        return java.util.Map.of(
            "orderId", orderId,
            "originalAmount", tokenPayment.getAmount(),
            "refundAmount", refundAmount,
            "refundPercentage", refundPercentage,
            "refundPolicy", refundPolicy,
            "eventDate", order.getEventDate() != null ? order.getEventDate().toString() : "Not set"
        );
    }
}
