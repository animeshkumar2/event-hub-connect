package com.eventhub.dto.response;

import com.eventhub.model.Order;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OrderDTO {
    private UUID id;
    private String orderNumber;
    private UUID userId;
    private UUID vendorId;
    private String vendorName;
    private UUID listingId;
    private String listingName;
    private String itemType;
    private String eventType;
    private LocalDate eventDate;
    private String eventTime;
    private String venueAddress;
    private Integer guestCount;
    private BigDecimal baseAmount;
    private BigDecimal addOnsAmount;
    private BigDecimal customizationsAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal tokenPaid;
    private BigDecimal balanceAmount;
    private String paymentStatus;
    private String status;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}









