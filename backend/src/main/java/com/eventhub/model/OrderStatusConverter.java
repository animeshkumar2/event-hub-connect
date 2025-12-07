package com.eventhub.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.stereotype.Component;

@Component
@Converter(autoApply = false)
public class OrderStatusConverter implements AttributeConverter<Order.OrderStatus, String> {
    
    @Override
    public String convertToDatabaseColumn(Order.OrderStatus attribute) {
        if (attribute == null) {
            return null;
        }
        // Convert to lowercase and replace underscore with hyphen for database constraint
        // IN_PROGRESS -> in-progress
        String dbValue = attribute.name().toLowerCase().replace("_", "-");
        return dbValue;
    }
    
    @Override
    public Order.OrderStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Convert from database value (with hyphen) to enum (with underscore)
        // in-progress -> IN_PROGRESS
        try {
            String enumName = dbData.toUpperCase().replace("-", "_");
            return Order.OrderStatus.valueOf(enumName);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}

