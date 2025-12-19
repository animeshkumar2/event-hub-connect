package com.eventhub.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.stereotype.Component;

@Component
@Converter(autoApply = false)
public class PaymentStatusConverterForPayment implements AttributeConverter<Payment.PaymentStatus, String> {
    
    @Override
    public String convertToDatabaseColumn(Payment.PaymentStatus attribute) {
        if (attribute == null) {
            return null;
        }
        // Convert to lowercase for database constraint
        return attribute.name().toLowerCase();
    }
    
    @Override
    public Payment.PaymentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Convert from lowercase database value to enum
        try {
            return Payment.PaymentStatus.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}








