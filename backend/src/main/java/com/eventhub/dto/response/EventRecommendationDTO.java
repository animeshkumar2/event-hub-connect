package com.eventhub.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class EventRecommendationDTO {
    private String category;
    private UUID vendorId;
    private String vendorName;
    private UUID packageId;
    private String packageName;
    private BigDecimal price;
    private String reason;
}

