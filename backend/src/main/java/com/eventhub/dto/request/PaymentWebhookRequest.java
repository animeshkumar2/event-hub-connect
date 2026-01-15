package com.eventhub.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PaymentWebhookRequest {
    
    @JsonProperty("transaction_id")
    private String transactionId;
    
    private String status;
    
    @JsonProperty("razorpay_payment_id")
    private String razorpayPaymentId;
    
    @JsonProperty("razorpay_order_id")
    private String razorpayOrderId;
    
    @JsonProperty("razorpay_signature")
    private String razorpaySignature;
    
    private String rawPayload;
    
    // Constructors
    public PaymentWebhookRequest() {}
    
    // Getters and Setters
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }
    
    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }
    
    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }
    
    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }
    
    public String getRazorpaySignature() {
        return razorpaySignature;
    }
    
    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }
    
    public String getRawPayload() {
        return rawPayload;
    }
    
    public void setRawPayload(String rawPayload) {
        this.rawPayload = rawPayload;
    }
}
