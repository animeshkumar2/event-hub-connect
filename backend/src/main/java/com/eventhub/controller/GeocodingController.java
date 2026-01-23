package com.eventhub.controller;

import com.eventhub.dto.LocationDTO;
import com.eventhub.dto.LocationSuggestion;
import com.eventhub.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Public controller for geocoding operations.
 * Provides autocomplete and geocode endpoints for location search.
 */
@RestController
@RequestMapping("/api/public/geocoding")
@RequiredArgsConstructor
@Slf4j
public class GeocodingController {
    
    private final GeocodingService geocodingService;
    
    // Simple rate limiting per IP using sliding window
    private final Map<String, RateLimitEntry> rateLimitMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_SECOND = 10;
    
    private static class RateLimitEntry {
        AtomicInteger count = new AtomicInteger(0);
        AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
    }
    
    /**
     * Autocomplete endpoint for location search.
     * Returns a list of location suggestions based on the query.
     * 
     * @param query Search query (minimum 2 characters)
     * @param limit Maximum number of results (default 5, max 10)
     * @return List of location suggestions
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<?> autocomplete(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "5") int limit,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
        
        // Rate limiting
        String clientIp = getClientIp(forwardedFor, realIp);
        if (!tryConsume(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "success", false,
                            "error", "Rate limit exceeded. Please try again later."
                    ));
        }
        
        // Validate query
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Collections.emptyList()
            ));
        }
        
        try {
            List<LocationSuggestion> suggestions = geocodingService.autocomplete(query, limit);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", suggestions
            ));
        } catch (Exception e) {
            log.error("Autocomplete error for query '{}': {}", query, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "error", "Failed to fetch location suggestions"
                    ));
        }
    }
    
    /**
     * Geocode endpoint for getting coordinates of a location.
     * 
     * @param query Location text to geocode
     * @return Location with coordinates
     */
    @GetMapping("/geocode")
    public ResponseEntity<?> geocode(
            @RequestParam("q") String query,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
        
        // Rate limiting
        String clientIp = getClientIp(forwardedFor, realIp);
        if (!tryConsume(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "success", false,
                            "error", "Rate limit exceeded. Please try again later."
                    ));
        }
        
        // Validate query
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "error", "Query parameter 'q' is required"
                    ));
        }
        
        try {
            LocationDTO location = geocodingService.geocode(query);
            
            if (location == null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", (Object) null,
                        "message", "Location not found"
                ));
            }
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", location
            ));
        } catch (Exception e) {
            log.error("Geocode error for query '{}': {}", query, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "error", "Failed to geocode location"
                    ));
        }
    }
    
    /**
     * Reverse geocode endpoint for getting location name from coordinates.
     * 
     * @param lat Latitude
     * @param lng Longitude
     * @return Location name
     */
    @GetMapping("/reverse")
    public ResponseEntity<?> reverseGeocode(
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
        
        // Rate limiting
        String clientIp = getClientIp(forwardedFor, realIp);
        if (!tryConsume(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "success", false,
                            "error", "Rate limit exceeded. Please try again later."
                    ));
        }
        
        // Validate coordinates
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "error", "Invalid coordinates"
                    ));
        }
        
        try {
            String locationName = geocodingService.reverseGeocode(lat, lng);
            
            if (locationName == null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", (Object) null,
                        "message", "Location not found"
                ));
            }
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of("name", locationName)
            ));
        } catch (Exception e) {
            log.error("Reverse geocode error for ({}, {}): {}", lat, lng, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "error", "Failed to reverse geocode location"
                    ));
        }
    }
    
    /**
     * Get client IP address from headers or default.
     */
    private String getClientIp(String forwardedFor, String realIp) {
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            return forwardedFor.split(",")[0].trim();
        }
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }
        return "unknown";
    }
    
    /**
     * Try to consume a token from the rate limit.
     * Simple sliding window rate limiting.
     */
    private boolean tryConsume(String clientIp) {
        RateLimitEntry entry = rateLimitMap.computeIfAbsent(clientIp, k -> new RateLimitEntry());
        
        long now = System.currentTimeMillis();
        long windowStart = entry.windowStart.get();
        
        // Reset window if more than 1 second has passed
        if (now - windowStart > 1000) {
            entry.windowStart.set(now);
            entry.count.set(1);
            return true;
        }
        
        // Check if under limit
        int currentCount = entry.count.incrementAndGet();
        return currentCount <= MAX_REQUESTS_PER_SECOND;
    }
}
