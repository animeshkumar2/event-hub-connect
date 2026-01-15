package com.eventhub.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenPaymentRequest {
    private String paymentMethod; // CARD, UPI, WALLET, NET_BANKING
    private String paymentGateway; // razorpay, stripe
    private String returnUrl; // URL to redirect after payment
    private Map<String, String> paymentDetails; // Additional payment details
}
