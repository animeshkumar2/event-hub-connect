package com.eventhub.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;

/**
 * Service for calculating distances between geographic coordinates
 * using the Haversine formula for great-circle distance.
 */
@Service
public class DistanceService {
    
    // Earth's radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;
    
    /**
     * Calculate the distance between two points using the Haversine formula.
     * 
     * @param lat1 Latitude of point 1 in degrees
     * @param lng1 Longitude of point 1 in degrees
     * @param lat2 Latitude of point 2 in degrees
     * @param lng2 Longitude of point 2 in degrees
     * @return Distance in kilometers
     */
    public double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        // Convert degrees to radians
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLng = Math.toRadians(lng2 - lng1);
        
        // Haversine formula
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }
    
    /**
     * Calculate distance using BigDecimal coordinates.
     */
    public double calculateDistance(BigDecimal lat1, BigDecimal lng1, BigDecimal lat2, BigDecimal lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return Double.MAX_VALUE; // Return max value if coordinates are missing
        }
        return calculateDistance(
            lat1.doubleValue(), 
            lng1.doubleValue(), 
            lat2.doubleValue(), 
            lng2.doubleValue()
        );
    }
    
    /**
     * Check if two points are within a given radius.
     * 
     * @param lat1 Latitude of point 1
     * @param lng1 Longitude of point 1
     * @param lat2 Latitude of point 2
     * @param lng2 Longitude of point 2
     * @param radiusKm Maximum distance in kilometers
     * @return true if distance is within radius
     */
    public boolean isWithinRadius(double lat1, double lng1, double lat2, double lng2, double radiusKm) {
        double distance = calculateDistance(lat1, lng1, lat2, lng2);
        return distance <= radiusKm;
    }
    
    /**
     * Check if two points are within a given radius using BigDecimal coordinates.
     */
    public boolean isWithinRadius(BigDecimal lat1, BigDecimal lng1, BigDecimal lat2, BigDecimal lng2, int radiusKm) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return false;
        }
        return isWithinRadius(
            lat1.doubleValue(), 
            lng1.doubleValue(), 
            lat2.doubleValue(), 
            lng2.doubleValue(), 
            (double) radiusKm
        );
    }
    
    /**
     * Bidirectional check - both parties must be within each other's radius.
     * A vendor is shown to a customer only if:
     * - The customer is within the vendor's service radius
     * - The vendor is within the customer's search radius
     * 
     * @param vendorLat Vendor's latitude
     * @param vendorLng Vendor's longitude
     * @param vendorRadiusKm Vendor's service radius in km
     * @param customerLat Customer's latitude
     * @param customerLng Customer's longitude
     * @param customerRadiusKm Customer's search radius in km
     * @return true if both conditions are met
     */
    public boolean isBidirectionalMatch(
            double vendorLat, double vendorLng, int vendorRadiusKm,
            double customerLat, double customerLng, int customerRadiusKm) {
        
        double distance = calculateDistance(vendorLat, vendorLng, customerLat, customerLng);
        
        // Both conditions must be true:
        // 1. Customer is within vendor's service radius
        // 2. Vendor is within customer's search radius
        return distance <= vendorRadiusKm && distance <= customerRadiusKm;
    }
    
    /**
     * Bidirectional check using BigDecimal coordinates.
     */
    public boolean isBidirectionalMatch(
            BigDecimal vendorLat, BigDecimal vendorLng, Integer vendorRadiusKm,
            BigDecimal customerLat, BigDecimal customerLng, Integer customerRadiusKm) {
        
        if (vendorLat == null || vendorLng == null || customerLat == null || customerLng == null) {
            return false;
        }
        
        // Use default radii if not specified
        int vRadius = vendorRadiusKm != null ? vendorRadiusKm : 25;
        int cRadius = customerRadiusKm != null ? customerRadiusKm : 20;
        
        return isBidirectionalMatch(
            vendorLat.doubleValue(), vendorLng.doubleValue(), vRadius,
            customerLat.doubleValue(), customerLng.doubleValue(), cRadius
        );
    }
    
    /**
     * Format distance for display (e.g., "7 km away").
     * 
     * @param distanceKm Distance in kilometers
     * @return Formatted string
     */
    public String formatDistance(double distanceKm) {
        if (distanceKm < 0) {
            return "Unknown";
        }
        long roundedDistance = Math.round(distanceKm);
        return roundedDistance + " km";
    }
    
    /**
     * Format distance with "away" suffix for display.
     */
    public String formatDistanceAway(double distanceKm) {
        if (distanceKm < 0) {
            return "Distance unknown";
        }
        return formatDistance(distanceKm) + " away";
    }
}
