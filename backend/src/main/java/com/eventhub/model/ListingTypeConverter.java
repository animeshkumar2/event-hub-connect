package com.eventhub.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ListingTypeConverter implements AttributeConverter<Listing.ListingType, String> {
    
    @Override
    public String convertToDatabaseColumn(Listing.ListingType attribute) {
        if (attribute == null) {
            return null;
        }
        // Convert enum to lowercase for database
        return attribute.name().toLowerCase();
    }
    
    @Override
    public Listing.ListingType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Convert database lowercase to enum (uppercase)
        try {
            return Listing.ListingType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown listing type: " + dbData, e);
        }
    }
}

