package com.eventhub.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateLeadRequest {
    @NotBlank(message = "Vendor ID is required")
    private UUID vendorId;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    private String phone;
    private String eventType;
    private LocalDate eventDate;
    private String venueAddress;
    private Integer guestCount;
    private String budget;
    private String message;
}





