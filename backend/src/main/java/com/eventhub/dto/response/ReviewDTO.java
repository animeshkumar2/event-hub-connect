package com.eventhub.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ReviewDTO {
    private UUID id;
    private UUID vendorId;
    private UUID userId;
    private String userName;
    private String userAvatar;
    private UUID orderId;
    private BigDecimal rating;
    private String comment;
    private String eventType;
    private List<String> images;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}









