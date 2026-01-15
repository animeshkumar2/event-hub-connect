package com.eventhub.model;

public enum PaymentType {
    TOKEN("Token Payment"),
    FULL("Full Payment"),
    PARTIAL("Partial Payment"),
    REFUND("Refund");
    
    private final String displayName;
    
    PaymentType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isTokenPayment() {
        return this == TOKEN;
    }
    
    public boolean isRefund() {
        return this == REFUND;
    }
    
    public boolean isRegularPayment() {
        return this == FULL || this == PARTIAL;
    }
}
