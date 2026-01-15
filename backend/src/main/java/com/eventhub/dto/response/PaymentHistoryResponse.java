package com.eventhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryResponse {
    private UUID orderId;
    private String orderNumber;
    private BigDecimal totalAmount;
    private BigDecimal tokenAmount;
    private BigDecimal totalPaid;
    private BigDecimal balanceDue;
    private String paymentStatus;
    private List<PaymentDetail> payments;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDetail {
        private UUID paymentId;
        private BigDecimal amount;
        private String paymentType;
        private String status;
        private String paymentMethod;
        private String transactionId;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;
        private String failureReason;
    }
}
