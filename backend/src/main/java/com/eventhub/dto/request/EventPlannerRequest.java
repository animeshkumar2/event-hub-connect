package com.eventhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class EventPlannerRequest {
    @NotNull(message = "Budget is required")
    @Positive(message = "Budget must be positive")
    private Integer budget;
    
    @NotBlank(message = "Event type is required")
    private String eventType;
    
    @NotNull(message = "Guest count is required")
    @Positive(message = "Guest count must be positive")
    private Integer guestCount;
}

