package com.eventhub.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LeadDTO {
    private UUID id;
    private UUID vendorId;
    private String vendorName;
    private UUID userId;
    private String name;
    private String email;
    private String phone;
    private String eventType;
    private LocalDate eventDate;
    private String venueAddress;
    private Integer guestCount;
    private String budget;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

