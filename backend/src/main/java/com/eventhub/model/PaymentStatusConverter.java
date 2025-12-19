package com.eventhub.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.stereotype.Component;

@Component
@Converter(autoApply = false)
public class PaymentStatusConverter implements AttributeConverter<Order.PaymentStatus, String> {
    
    @Override
    public String convertToDatabaseColumn(Order.PaymentStatus attribute) {
        if (attribute == null) {
            return null;
        }
        // Convert to lowercase for database constraint
        return attribute.name().toLowerCase();
    }
    
    @Override
    public Order.PaymentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Convert from lowercase database value to enum
        try {
            return Order.PaymentStatus.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}








