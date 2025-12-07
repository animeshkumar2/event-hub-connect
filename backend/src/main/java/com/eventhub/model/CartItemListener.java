package com.eventhub.model;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

public class CartItemListener {
    
    @PrePersist
    @PreUpdate
    public void ensureItemTypeLowercase(CartItem cartItem) {
        // Use reflection to directly access and modify the field
        // This ensures it works even if Hibernate uses field access
        try {
            java.lang.reflect.Field field = CartItem.class.getDeclaredField("itemType");
            field.setAccessible(true);
            String currentValue = (String) field.get(cartItem);
            
            // If itemType is null but listing exists, set it from listing
            if (currentValue == null && cartItem.getListing() != null && cartItem.getListing().getType() != null) {
                field.set(cartItem, cartItem.getListing().getType().name().toLowerCase());
                return;
            }
            
            // Force lowercase - CRITICAL for database constraint
            if (currentValue != null && !currentValue.equals(currentValue.toLowerCase())) {
                field.set(cartItem, currentValue.toLowerCase());
            }
        } catch (Exception e) {
            // If reflection fails, try using the setter
            String currentValue = cartItem.getItemType();
            if (currentValue != null) {
                cartItem.setItemType(currentValue);
            } else if (cartItem.getListing() != null && cartItem.getListing().getType() != null) {
                cartItem.setItemTypeEnum(cartItem.getListing().getType());
            }
        }
    }
}

