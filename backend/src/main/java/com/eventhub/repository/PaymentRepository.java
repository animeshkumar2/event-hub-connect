package com.eventhub.repository;

import com.eventhub.model.Payment;
import com.eventhub.model.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    // Find payments by order
    List<Payment> findByOrderIdOrderByCreatedAtDesc(UUID orderId);
    
    // Find payments by user
    Page<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    // Find payments by status
    List<Payment> findByStatus(Payment.PaymentStatus status);
    
    // Find payments by type
    List<Payment> findByPaymentType(PaymentType paymentType);
    
    // Find payment by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);
    
    // Find completed payments for an order
    @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId AND p.status = 'COMPLETED'")
    List<Payment> findCompletedPaymentsByOrderId(@Param("orderId") UUID orderId);
    
    // Calculate total paid amount for an order
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.order.id = :orderId AND p.status = 'COMPLETED'")
    BigDecimal calculateTotalPaidForOrder(@Param("orderId") UUID orderId);
    
    // Find token payment for an order
    @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId AND p.paymentType = 'TOKEN' AND p.status = 'COMPLETED'")
    Optional<Payment> findTokenPaymentByOrderId(@Param("orderId") UUID orderId);
    
    // Find pending payments older than specified time
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :cutoffTime")
    List<Payment> findPendingPaymentsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find payments by order and type
    List<Payment> findByOrderIdAndPaymentType(UUID orderId, PaymentType paymentType);
    
    // Find payments by user and status
    List<Payment> findByUserIdAndStatus(UUID userId, Payment.PaymentStatus status);
    
    // Check if order has token payment
    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.order.id = :orderId AND p.paymentType = 'TOKEN' AND p.status = 'COMPLETED'")
    boolean hasTokenPayment(@Param("orderId") UUID orderId);
    
    // Find refunds for an order
    @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId AND p.paymentType = 'REFUND'")
    List<Payment> findRefundsByOrderId(@Param("orderId") UUID orderId);
    
    // Find payments within date range
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<Payment> findPaymentsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    // Count payments by status for analytics
    @Query("SELECT p.status, COUNT(p) FROM Payment p GROUP BY p.status")
    List<Object[]> countPaymentsByStatus();
    
    // Find failed payments for retry
    @Query("SELECT p FROM Payment p WHERE p.status = 'FAILED' AND p.createdAt > :since ORDER BY p.createdAt DESC")
    List<Payment> findRecentFailedPayments(@Param("since") LocalDateTime since);
    
    // Find by order
    List<Payment> findByOrder(com.eventhub.model.Order order);
}
