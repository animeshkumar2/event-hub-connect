package com.eventhub.service;

import com.eventhub.model.Payment;
import com.eventhub.model.Order;
import com.eventhub.repository.PaymentRepository;
import com.eventhub.repository.OrderRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    
    /**
     * Initiate payment (create payment intent)
     * In production, this would integrate with Razorpay/Stripe
     */
    public PaymentIntent initiatePayment(UUID orderId, String paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUserId(order.getUserId());
        payment.setVendor(order.getVendor());
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        payment = paymentRepository.save(payment);
        
        // In production, create payment intent with Razorpay/Stripe
        // For now, return mock payment intent
        return new PaymentIntent(
                payment.getId().toString(),
                payment.getAmount(),
                "mock_payment_intent_id_" + payment.getId()
        );
    }
    
    /**
     * Verify payment (webhook handler)
     * In production, this would verify with payment gateway
     */
    public Payment verifyPayment(String transactionId, String paymentGatewayResponse) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        
        // In production, verify with payment gateway
        // For now, mark as completed
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaidAt(java.time.LocalDateTime.now());
        
        // Update order payment status
        Order order = payment.getOrder();
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setTokenPaid(order.getTotalAmount());
        orderRepository.save(order);
        
        return paymentRepository.save(payment);
    }
    
    @Transactional(readOnly = true)
    public Payment getPaymentStatus(UUID paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class PaymentIntent {
        private String paymentId;
        private BigDecimal amount;
        private String paymentIntentId;
    }
}

