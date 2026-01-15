package com.eventhub.dto.response;

import com.eventhub.model.Lead;
import com.eventhub.model.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadAcceptanceResponse {
    private UUID leadId;
    private UUID orderId;
    private String leadStatus;
    private String orderStatus;
    private String message;
    private Order order;
    private Lead lead;
}
