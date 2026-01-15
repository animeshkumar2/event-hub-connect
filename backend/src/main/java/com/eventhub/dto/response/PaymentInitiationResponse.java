package com.eventhub.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public class PaymentInitiationResponse {
    
    private UUID paymentId;
    private String paymentUrl;
    private BigDecimal amount;
    private String transactionId;
    private String message;
    private String status;
    
    // Constructors
    public PaymentInitiationResponse() {}
    
    public PaymentInitiationResponse(UUID paymentId, String paymentUrl, BigDecimal amount, 
                                   String transactionId, String message) {
        this.paymentId = paymentId;
        this.paymentUrl = paymentUrl;
        this.amount = amount;
        this.transactionId = transactionId;
        this.message = message;
        this.status = "initiated";
    }
    
    // Getters and Setters
    public UUID getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(UUID paymentId) {
        this.paymentId = paymentId;
    }
    
    public String getPaymentUrl() {
        return paymentUrl;
    }
    
    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
