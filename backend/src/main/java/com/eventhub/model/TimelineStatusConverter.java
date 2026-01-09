package com.eventhub.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.stereotype.Component;

@Component
@Converter(autoApply = false)
public class TimelineStatusConverter implements AttributeConverter<OrderTimeline.TimelineStatus, String> {
    
    @Override
    public String convertToDatabaseColumn(OrderTimeline.TimelineStatus attribute) {
        if (attribute == null) {
            return null;
        }
        // Convert to lowercase for database constraint
        return attribute.name().toLowerCase();
    }
    
    @Override
    public OrderTimeline.TimelineStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Convert from lowercase database value to enum
        try {
            return OrderTimeline.TimelineStatus.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}










