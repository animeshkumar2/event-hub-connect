package com.eventhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartSummaryDTO {
    private BigDecimal subtotal;
    private BigDecimal platformFee;
    private BigDecimal gst;
    private BigDecimal total;
}


