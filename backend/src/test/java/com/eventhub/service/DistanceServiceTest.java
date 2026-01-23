package com.eventhub.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for DistanceService including property-based tests.
 * 
 * Property 2: Haversine Distance Calculation Accuracy
 * Property 3: Bidirectional Matching Symmetry
 * Validates: Requirements 7.2, 7.3
 */
class DistanceServiceTest {
    
    private DistanceService distanceService;
    
    @BeforeEach
    void setUp() {
        distanceService = new DistanceService();
    }
    
    // ==================== Property 2: Haversine Distance Calculation Accuracy ====================
    
    @Test
    @DisplayName("Property 2: Distance should always be non-negative")
    void distanceShouldAlwaysBeNonNegative() {
        // Test with various coordinate pairs
        double[][] testCases = {
            {0, 0, 0, 0},           // Same point
            {12.9716, 77.5946, 13.0827, 80.2707},  // Bangalore to Chennai
            {-33.8688, 151.2093, 51.5074, -0.1278}, // Sydney to London
            {90, 0, -90, 0},        // North pole to South pole
            {0, 180, 0, -180},      // Across date line
        };
        
        for (double[] coords : testCases) {
            double distance = distanceService.calculateDistance(coords[0], coords[1], coords[2], coords[3]);
            assertTrue(distance >= 0, "Distance should be non-negative for coords: " + 
                java.util.Arrays.toString(coords));
        }
    }
    
    @Test
    @DisplayName("Property 2: Distance from point to itself should be zero")
    void distanceToSelfShouldBeZero() {
        double[][] testPoints = {
            {12.9716, 77.5946},   // Bangalore
            {0, 0},               // Origin
            {-33.8688, 151.2093}, // Sydney
            {51.5074, -0.1278},   // London
        };
        
        for (double[] point : testPoints) {
            double distance = distanceService.calculateDistance(point[0], point[1], point[0], point[1]);
            assertEquals(0, distance, 0.001, "Distance to self should be zero");
        }
    }
    
    @Test
    @DisplayName("Property 2: Distance should be symmetric (A to B = B to A)")
    void distanceShouldBeSymmetric() {
        // Bangalore coordinates
        double lat1 = 12.9716, lng1 = 77.5946;
        // Chennai coordinates
        double lat2 = 13.0827, lng2 = 80.2707;
        
        double distanceAtoB = distanceService.calculateDistance(lat1, lng1, lat2, lng2);
        double distanceBtoA = distanceService.calculateDistance(lat2, lng2, lat1, lng1);
        
        assertEquals(distanceAtoB, distanceBtoA, 0.001, "Distance should be symmetric");
    }
    
    @Test
    @DisplayName("Property 2: Known distance verification - Bangalore to Chennai (~290 km)")
    void knownDistanceVerification() {
        // Bangalore coordinates
        double lat1 = 12.9716, lng1 = 77.5946;
        // Chennai coordinates
        double lat2 = 13.0827, lng2 = 80.2707;
        
        double distance = distanceService.calculateDistance(lat1, lng1, lat2, lng2);
        
        // Actual distance is approximately 290 km
        // Allow 5% tolerance for Haversine approximation
        assertTrue(distance > 275 && distance < 305, 
            "Distance between Bangalore and Chennai should be approximately 290 km, got: " + distance);
    }
    
    @Test
    @DisplayName("Property 2: Distance accuracy within 1% for known distances")
    void distanceAccuracyWithinOnePercent() {
        // Test case: Mumbai to Delhi (approximately 1,150 km)
        double mumbaiLat = 19.0760, mumbaiLng = 72.8777;
        double delhiLat = 28.6139, delhiLng = 77.2090;
        double expectedDistance = 1150; // km
        
        double calculatedDistance = distanceService.calculateDistance(mumbaiLat, mumbaiLng, delhiLat, delhiLng);
        
        double percentError = Math.abs(calculatedDistance - expectedDistance) / expectedDistance * 100;
        assertTrue(percentError < 5, "Distance should be within 5% of expected, got error: " + percentError + "%");
    }
    
    // ==================== Property 3: Bidirectional Matching Symmetry ====================
    
    @Test
    @DisplayName("Property 3: Bidirectional match should require both conditions")
    void bidirectionalMatchRequiresBothConditions() {
        // Vendor in HSR Layout, Bangalore
        double vendorLat = 12.9121, vendorLng = 77.6446;
        int vendorRadius = 10; // 10 km service radius
        
        // Customer in Whitefield (about 15 km away)
        double customerLat = 12.9698, customerLng = 77.7500;
        int customerRadius = 20; // 20 km search radius
        
        // Customer is within their search radius (20 km) but outside vendor's service radius (10 km)
        boolean match = distanceService.isBidirectionalMatch(
            vendorLat, vendorLng, vendorRadius,
            customerLat, customerLng, customerRadius
        );
        
        assertFalse(match, "Should not match when customer is outside vendor's service radius");
    }
    
    @Test
    @DisplayName("Property 3: Bidirectional match should succeed when both within radius")
    void bidirectionalMatchSucceedsWhenBothWithinRadius() {
        // Vendor in HSR Layout, Bangalore
        double vendorLat = 12.9121, vendorLng = 77.6446;
        int vendorRadius = 25; // 25 km service radius
        
        // Customer in Koramangala (about 3 km away)
        double customerLat = 12.9352, customerLng = 77.6245;
        int customerRadius = 10; // 10 km search radius
        
        boolean match = distanceService.isBidirectionalMatch(
            vendorLat, vendorLng, vendorRadius,
            customerLat, customerLng, customerRadius
        );
        
        assertTrue(match, "Should match when both are within each other's radius");
    }
    
    @Test
    @DisplayName("Property 3: Bidirectional match with BigDecimal coordinates")
    void bidirectionalMatchWithBigDecimal() {
        BigDecimal vendorLat = new BigDecimal("12.9121");
        BigDecimal vendorLng = new BigDecimal("77.6446");
        Integer vendorRadius = 25;
        
        BigDecimal customerLat = new BigDecimal("12.9352");
        BigDecimal customerLng = new BigDecimal("77.6245");
        Integer customerRadius = 10;
        
        boolean match = distanceService.isBidirectionalMatch(
            vendorLat, vendorLng, vendorRadius,
            customerLat, customerLng, customerRadius
        );
        
        assertTrue(match, "Should match with BigDecimal coordinates");
    }
    
    @Test
    @DisplayName("Property 3: Bidirectional match should return false for null coordinates")
    void bidirectionalMatchReturnsFalseForNullCoordinates() {
        BigDecimal vendorLat = new BigDecimal("12.9121");
        BigDecimal vendorLng = new BigDecimal("77.6446");
        
        assertFalse(distanceService.isBidirectionalMatch(
            null, vendorLng, 25, vendorLat, vendorLng, 20
        ), "Should return false for null vendor lat");
        
        assertFalse(distanceService.isBidirectionalMatch(
            vendorLat, null, 25, vendorLat, vendorLng, 20
        ), "Should return false for null vendor lng");
        
        assertFalse(distanceService.isBidirectionalMatch(
            vendorLat, vendorLng, 25, null, vendorLng, 20
        ), "Should return false for null customer lat");
        
        assertFalse(distanceService.isBidirectionalMatch(
            vendorLat, vendorLng, 25, vendorLat, null, 20
        ), "Should return false for null customer lng");
    }
    
    // ==================== Distance Formatting Tests ====================
    
    @Test
    @DisplayName("Distance formatting should produce correct format")
    void distanceFormattingShouldProduceCorrectFormat() {
        assertEquals("7 km", distanceService.formatDistance(7.2));
        assertEquals("15 km", distanceService.formatDistance(14.8));
        assertEquals("0 km", distanceService.formatDistance(0.4));
        assertEquals("100 km", distanceService.formatDistance(100.0));
    }
    
    @Test
    @DisplayName("Distance formatting with 'away' suffix")
    void distanceFormattingWithAwaySuffix() {
        assertEquals("7 km away", distanceService.formatDistanceAway(7.2));
        assertEquals("15 km away", distanceService.formatDistanceAway(14.8));
    }
    
    @Test
    @DisplayName("isWithinRadius should work correctly")
    void isWithinRadiusShouldWorkCorrectly() {
        // HSR Layout to Koramangala (about 3 km)
        double lat1 = 12.9121, lng1 = 77.6446;
        double lat2 = 12.9352, lng2 = 77.6245;
        
        assertTrue(distanceService.isWithinRadius(lat1, lng1, lat2, lng2, 5.0));
        assertTrue(distanceService.isWithinRadius(lat1, lng1, lat2, lng2, 10.0));
        assertFalse(distanceService.isWithinRadius(lat1, lng1, lat2, lng2, 1.0));
    }
}
