package com.eventhub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemAddOnId implements Serializable {
    private UUID cartItem;
    private UUID addOn;
}











