package com.eventhub.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateOfferRequest {
    @NotNull(message = "Thread ID is required")
    private UUID threadId;
    
    @NotNull(message = "Listing ID is required")
    private UUID listingId;
    
    @NotNull(message = "Offered price is required")
    @DecimalMin(value = "0.01", message = "Offered price must be greater than 0")
    private BigDecimal offeredPrice;
    
    private BigDecimal customizedPrice; // Optional: Price after customization (if customized)
    private String customization; // Optional: JSON string with customization details
    
    private String message; // Optional message with the offer
    
    // Optional event details
    private String eventType;
    private LocalDate eventDate;
    private String eventTime;
    private String venueAddress;
    private Integer guestCount;
}



