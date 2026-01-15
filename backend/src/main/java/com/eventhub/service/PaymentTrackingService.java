package com.eventhub.service;

import com.eventhub.dto.response.PaymentHistoryResponse;
import com.eventhub.exception.NotFoundException;
import com.eventhub.model.Order;
import com.eventhub.model.Payment;
import com.eventhub.model.PaymentType;
import com.eventhub.repository.OrderRepository;
import com.eventhub.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentTrackingService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    
    /**
     * Create a payment record
     */
    public Payment createPaymentRecord(Order order, UUID userId, BigDecimal amount, 
            PaymentType paymentType, String paymentMethod) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUserId(userId);
        payment.setVendor(order.getVendor());
        payment.setAmount(amount);
        payment.setPaymentType(paymentType);
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Get payment history for an order
     */
    @Transactional(readOnly = true)
    public PaymentHistoryResponse getPaymentHistory(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        
        List<Payment> payments = paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
        
        BigDecimal totalPaid = calculateTotalPaid(orderId);
        BigDecimal balanceDue = order.getTotalAmount().subtract(totalPaid);
        
        return PaymentHistoryResponse.builder()
                .orderId(orderId)
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .tokenAmount(order.getTokenAmount())
                .totalPaid(totalPaid)
                .balanceDue(balanceDue.max(BigDecimal.ZERO))
                .paymentStatus(order.getPaymentStatus().name())
                .payments(payments.stream()
                        .map(this::toPaymentDetail)
                        .collect(Collectors.toList()))
                .build();
    }
    
    /**
     * Update payment status
     */
    public Payment updatePaymentStatus(UUID paymentId, Payment.PaymentStatus status, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + paymentId));
        
        payment.setStatus(status);
        if (status == Payment.PaymentStatus.COMPLETED) {
            payment.markCompleted();
        } else if (status == Payment.PaymentStatus.FAILED) {
            payment.markFailed(reason);
        }
        
        // Update order payment status
        updateOrderPaymentStatus(payment.getOrder());
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Calculate total paid amount for an order
     */
    public BigDecimal calculateTotalPaid(UUID orderId) {
        return paymentRepository.calculateTotalPaidForOrder(orderId);
    }
    
    /**
     * Calculate balance due for an order
     */
    public BigDecimal calculateBalanceDue(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        
        BigDecimal totalPaid = calculateTotalPaid(orderId);
        return order.getTotalAmount().subtract(totalPaid).max(BigDecimal.ZERO);
    }
    
    /**
     * Update order payment status based on payments
     */
    private void updateOrderPaymentStatus(Order order) {
        BigDecimal totalPaid = calculateTotalPaid(order.getId());
        BigDecimal totalAmount = order.getTotalAmount();
        
        if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            order.setPaymentStatus(Order.PaymentStatus.PENDING);
        } else if (totalPaid.compareTo(totalAmount) >= 0) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
        } else {
            order.setPaymentStatus(Order.PaymentStatus.PARTIAL);
        }
        
        order.setTokenPaid(totalPaid);
        order.setBalanceAmount(totalAmount.subtract(totalPaid).max(BigDecimal.ZERO));
        
        orderRepository.save(order);
    }
    
    /**
     * Convert Payment to PaymentDetail DTO
     */
    private PaymentHistoryResponse.PaymentDetail toPaymentDetail(Payment payment) {
        return PaymentHistoryResponse.PaymentDetail.builder()
                .paymentId(payment.getId())
                .amount(payment.getAmount())
                .paymentType(payment.getPaymentType() != null ? payment.getPaymentType().name() : "UNKNOWN")
                .status(payment.getStatus().name())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .createdAt(payment.getCreatedAt())
                .completedAt(payment.getCompletedAt())
                .failureReason(payment.getFailureReason())
                .build();
    }
}
