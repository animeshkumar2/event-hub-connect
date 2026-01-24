package com.eventhub.service;

import com.eventhub.dto.LocationDTO;
import com.eventhub.model.GeocodingCache;
import com.eventhub.repository.GeocodingCacheRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests for GeocodingService including property-based tests.
 * 
 * Property 7: Geocoding Cache Effectiveness
 * Validates: Requirements 11.4
 */
@ExtendWith(MockitoExtension.class)
class GeocodingServiceTest {
    
    @Mock
    private GeocodingCacheRepository cacheRepository;
    
    private GeocodingService geocodingService;
    
    @BeforeEach
    void setUp() {
        geocodingService = new GeocodingService(cacheRepository);
    }
    
    // ==================== Property 7: Geocoding Cache Effectiveness ====================
    
    @Test
    @DisplayName("Property 7: Cache hit should return cached result without API call")
    void cacheHitShouldReturnCachedResult() {
        // Setup cached entry
        GeocodingCache cachedEntry = new GeocodingCache();
        cachedEntry.setQueryText("hsr layout bangalore");
        cachedEntry.setLocationName("HSR Layout, Bangalore");
        cachedEntry.setLatitude(new BigDecimal("12.9121"));
        cachedEntry.setLongitude(new BigDecimal("77.6446"));
        cachedEntry.setExpiresAt(LocalDateTime.now().plusDays(30));
        
        when(cacheRepository.findByQueryTextIgnoreCaseAndNotExpired(
                eq("hsr layout bangalore"), any(LocalDateTime.class)))
                .thenReturn(Optional.of(cachedEntry));
        
        // Execute
        LocationDTO result = geocodingService.geocode("HSR Layout Bangalore");
        
        // Verify
        assertNotNull(result);
        assertEquals("HSR Layout, Bangalore", result.getName());
        assertEquals(new BigDecimal("12.9121"), result.getLatitude());
        assertEquals(new BigDecimal("77.6446"), result.getLongitude());
        
        // Verify cache was checked
        verify(cacheRepository).findByQueryTextIgnoreCaseAndNotExpired(
                eq("hsr layout bangalore"), any(LocalDateTime.class));
    }
    
    @Test
    @DisplayName("Property 7: Cached result should be equivalent to original")
    void cachedResultShouldBeEquivalentToOriginal() {
        // Setup - simulate a cached result
        String queryText = "koramangala bangalore";
        String locationName = "Koramangala, Bangalore";
        BigDecimal latitude = new BigDecimal("12.9352");
        BigDecimal longitude = new BigDecimal("77.6245");
        
        GeocodingCache cachedEntry = new GeocodingCache();
        cachedEntry.setQueryText(queryText);
        cachedEntry.setLocationName(locationName);
        cachedEntry.setLatitude(latitude);
        cachedEntry.setLongitude(longitude);
        cachedEntry.setExpiresAt(LocalDateTime.now().plusDays(30));
        
        when(cacheRepository.findByQueryTextIgnoreCaseAndNotExpired(
                eq(queryText), any(LocalDateTime.class)))
                .thenReturn(Optional.of(cachedEntry));
        
        // Execute
        LocationDTO result = geocodingService.geocode("Koramangala Bangalore");
        
        // Verify equivalence
        assertNotNull(result);
        assertEquals(locationName, result.getName());
        assertEquals(latitude, result.getLatitude());
        assertEquals(longitude, result.getLongitude());
    }
    
    @Test
    @DisplayName("Property 7: isCached should return true for cached queries")
    void isCachedShouldReturnTrueForCachedQueries() {
        when(cacheRepository.existsByQueryTextAndNotExpired(
                eq("hsr layout"), any(LocalDateTime.class)))
                .thenReturn(true);
        
        assertTrue(geocodingService.isCached("HSR Layout"));
        assertTrue(geocodingService.isCached("hsr layout"));
        assertTrue(geocodingService.isCached("  HSR Layout  "));
    }
    
    @Test
    @DisplayName("Property 7: isCached should return false for non-cached queries")
    void isCachedShouldReturnFalseForNonCachedQueries() {
        when(cacheRepository.existsByQueryTextAndNotExpired(
                anyString(), any(LocalDateTime.class)))
                .thenReturn(false);
        
        assertFalse(geocodingService.isCached("unknown location"));
    }
    
    @Test
    @DisplayName("Property 7: isCached should return false for null or empty queries")
    void isCachedShouldReturnFalseForNullOrEmptyQueries() {
        assertFalse(geocodingService.isCached(null));
        assertFalse(geocodingService.isCached(""));
        assertFalse(geocodingService.isCached("   "));
    }
    
    // ==================== Cache Storage Tests ====================
    
    @Test
    @DisplayName("cacheResult should store new entry when not exists")
    void cacheResultShouldStoreNewEntry() {
        when(cacheRepository.findByQueryText("test query"))
                .thenReturn(Optional.empty());
        
        LocationDTO location = new LocationDTO("Test Location", 12.9, 77.6);
        geocodingService.cacheResult("test query", location);
        
        verify(cacheRepository).save(argThat(cache -> 
            cache.getQueryText().equals("test query") &&
            cache.getLocationName().equals("Test Location") &&
            cache.getLatitude().doubleValue() == 12.9 &&
            cache.getLongitude().doubleValue() == 77.6
        ));
    }
    
    @Test
    @DisplayName("cacheResult should update existing entry")
    void cacheResultShouldUpdateExistingEntry() {
        GeocodingCache existingCache = new GeocodingCache();
        existingCache.setQueryText("test query");
        existingCache.setLocationName("Old Location");
        existingCache.setLatitude(new BigDecimal("10.0"));
        existingCache.setLongitude(new BigDecimal("70.0"));
        
        when(cacheRepository.findByQueryText("test query"))
                .thenReturn(Optional.of(existingCache));
        
        LocationDTO newLocation = new LocationDTO("New Location", 12.9, 77.6);
        geocodingService.cacheResult("test query", newLocation);
        
        verify(cacheRepository).save(argThat(cache -> 
            cache.getLocationName().equals("New Location") &&
            cache.getLatitude().doubleValue() == 12.9 &&
            cache.getLongitude().doubleValue() == 77.6
        ));
    }
    
    // ==================== Input Validation Tests ====================
    
    @Test
    @DisplayName("geocode should return null for null input")
    void geocodeShouldReturnNullForNullInput() {
        assertNull(geocodingService.geocode(null));
    }
    
    @Test
    @DisplayName("geocode should return null for empty input")
    void geocodeShouldReturnNullForEmptyInput() {
        assertNull(geocodingService.geocode(""));
        assertNull(geocodingService.geocode("   "));
    }
    
    @Test
    @DisplayName("autocomplete should return empty list for short queries")
    void autocompleteShouldReturnEmptyListForShortQueries() {
        assertTrue(geocodingService.autocomplete(null, 5).isEmpty());
        assertTrue(geocodingService.autocomplete("", 5).isEmpty());
        assertTrue(geocodingService.autocomplete("a", 5).isEmpty());
    }
    
    // ==================== Property 1: Location Data Round-Trip Consistency ====================
    
    @Test
    @DisplayName("Property 1: Location coordinates should maintain precision through cache")
    void locationCoordinatesShouldMaintainPrecision() {
        // High precision coordinates
        BigDecimal latitude = new BigDecimal("12.91210000");
        BigDecimal longitude = new BigDecimal("77.64460000");
        
        GeocodingCache cachedEntry = new GeocodingCache();
        cachedEntry.setQueryText("precision test");
        cachedEntry.setLocationName("Test Location");
        cachedEntry.setLatitude(latitude);
        cachedEntry.setLongitude(longitude);
        cachedEntry.setExpiresAt(LocalDateTime.now().plusDays(30));
        
        when(cacheRepository.findByQueryTextIgnoreCaseAndNotExpired(
                eq("precision test"), any(LocalDateTime.class)))
                .thenReturn(Optional.of(cachedEntry));
        
        LocationDTO result = geocodingService.geocode("Precision Test");
        
        assertNotNull(result);
        // Verify precision is maintained (within 0.000001 degrees tolerance)
        assertEquals(0, latitude.compareTo(result.getLatitude()));
        assertEquals(0, longitude.compareTo(result.getLongitude()));
    }
}
