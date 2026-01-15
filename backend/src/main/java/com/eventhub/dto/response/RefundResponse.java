package com.eventhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {
    private UUID orderId;
    private UUID paymentId;
    private BigDecimal refundAmount;
    private BigDecimal originalAmount;
    private String status;
    private String message;
}
