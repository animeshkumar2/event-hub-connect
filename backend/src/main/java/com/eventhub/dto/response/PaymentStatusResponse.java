package com.eventhub.dto.response;

import com.eventhub.model.Payment;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class PaymentStatusResponse {
    
    private UUID paymentId;
    private Payment.PaymentStatus status;
    private BigDecimal amount;
    private LocalDateTime completedAt;
    private String message;
    private String failureReason;
    
    // Constructors
    public PaymentStatusResponse() {}
    
    public PaymentStatusResponse(UUID paymentId, Payment.PaymentStatus status, BigDecimal amount, 
                               LocalDateTime completedAt, String failureReason) {
        this.paymentId = paymentId;
        this.status = status;
        this.amount = amount;
        this.completedAt = completedAt;
        this.failureReason = failureReason;
        this.message = generateMessage();
    }
    
    // Getters and Setters
    public UUID getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(UUID paymentId) {
        this.paymentId = paymentId;
    }
    
    public Payment.PaymentStatus getStatus() {
        return status;
    }
    
    public void setStatus(Payment.PaymentStatus status) {
        this.status = status;
        this.message = generateMessage();
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getFailureReason() {
        return failureReason;
    }
    
    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }
    
    private String generateMessage() {
        if (status == null) return null;
        
        switch (status) {
            case PENDING:
                return "Payment is being processed";
            case COMPLETED:
                return "Payment completed successfully";
            case FAILED:
                return "Payment failed";
            case REFUNDED:
                return "Payment has been refunded";
            case CANCELLED:
                return "Payment was cancelled";
            default:
                return "Unknown payment status";
        }
    }
}
