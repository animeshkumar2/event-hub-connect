package com.eventhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.util.Map;

@Data
public class CreateOrderRequest {
    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // 'card' or 'upi'
    
    private CardDetails cardDetails;
    private String upiId;
    
    @NotBlank(message = "Customer name is required")
    private String customerName;
    
    @NotBlank(message = "Customer email is required")
    private String customerEmail;
    
    private String customerPhone;
    private LocalDate eventDate;
    private String eventTime;
    private String venueAddress;
    private Integer guestCount;
    private String eventType;
    private String notes;
    
    @Data
    public static class CardDetails {
        private String cardNumber;
        private String cardholderName;
        private String expiryDate;
        private String cvv;
    }
}





