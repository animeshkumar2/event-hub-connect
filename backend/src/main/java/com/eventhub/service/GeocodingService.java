package com.eventhub.service;

import com.eventhub.dto.LocationDTO;
import com.eventhub.dto.LocationSuggestion;
import com.eventhub.model.GeocodingCache;
import com.eventhub.repository.GeocodingCacheRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for geocoding operations using Photon (primary) and Nominatim (fallback).
 * Photon provides better autocomplete with partial matching like Uber/Rapido.
 * Implements caching to reduce API calls and respect rate limits.
 */
@Service
@Slf4j
public class GeocodingService {
    
    private static final String NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
    private static final String PHOTON_BASE_URL = "https://photon.komoot.io";
    private static final int CACHE_EXPIRY_DAYS = 30;
    private static final int MAX_AUTOCOMPLETE_RESULTS = 8;
    
    // India bounding box for location bias
    private static final double INDIA_CENTER_LAT = 20.5937;
    private static final double INDIA_CENTER_LON = 78.9629;
    
    // Popular Indian localities for fuzzy matching (prefix search)
    private static final Map<String, LocationSuggestion> POPULAR_LOCALITIES = new LinkedHashMap<>();
    
    static {
        // Bangalore localities
        POPULAR_LOCALITIES.put("whitefield", new LocationSuggestion("Whitefield, Bangalore, Karnataka, India", "Whitefield, Bangalore", 12.9698, 77.7500));
        POPULAR_LOCALITIES.put("koramangala", new LocationSuggestion("Koramangala, Bangalore, Karnataka, India", "Koramangala, Bangalore", 12.9352, 77.6245));
        POPULAR_LOCALITIES.put("indiranagar", new LocationSuggestion("Indiranagar, Bangalore, Karnataka, India", "Indiranagar, Bangalore", 12.9784, 77.6408));
        POPULAR_LOCALITIES.put("hsr layout", new LocationSuggestion("HSR Layout, Bangalore, Karnataka, India", "HSR Layout, Bangalore", 12.9116, 77.6389));
        POPULAR_LOCALITIES.put("hsr", new LocationSuggestion("HSR Layout, Bangalore, Karnataka, India", "HSR Layout, Bangalore", 12.9116, 77.6389));
        POPULAR_LOCALITIES.put("jayanagar", new LocationSuggestion("Jayanagar, Bangalore, Karnataka, India", "Jayanagar, Bangalore", 12.9308, 77.5838));
        POPULAR_LOCALITIES.put("jp nagar", new LocationSuggestion("JP Nagar, Bangalore, Karnataka, India", "JP Nagar, Bangalore", 12.9063, 77.5857));
        POPULAR_LOCALITIES.put("electronic city", new LocationSuggestion("Electronic City, Bangalore, Karnataka, India", "Electronic City, Bangalore", 12.8399, 77.6770));
        POPULAR_LOCALITIES.put("marathahalli", new LocationSuggestion("Marathahalli, Bangalore, Karnataka, India", "Marathahalli, Bangalore", 12.9591, 77.6974));
        POPULAR_LOCALITIES.put("btm layout", new LocationSuggestion("BTM Layout, Bangalore, Karnataka, India", "BTM Layout, Bangalore", 12.9166, 77.6101));
        POPULAR_LOCALITIES.put("btm", new LocationSuggestion("BTM Layout, Bangalore, Karnataka, India", "BTM Layout, Bangalore", 12.9166, 77.6101));
        POPULAR_LOCALITIES.put("hebbal", new LocationSuggestion("Hebbal, Bangalore, Karnataka, India", "Hebbal, Bangalore", 13.0358, 77.5970));
        POPULAR_LOCALITIES.put("yelahanka", new LocationSuggestion("Yelahanka, Bangalore, Karnataka, India", "Yelahanka, Bangalore", 13.1007, 77.5963));
        POPULAR_LOCALITIES.put("malleshwaram", new LocationSuggestion("Malleshwaram, Bangalore, Karnataka, India", "Malleshwaram, Bangalore", 13.0035, 77.5647));
        POPULAR_LOCALITIES.put("rajajinagar", new LocationSuggestion("Rajajinagar, Bangalore, Karnataka, India", "Rajajinagar, Bangalore", 12.9914, 77.5521));
        POPULAR_LOCALITIES.put("banashankari", new LocationSuggestion("Banashankari, Bangalore, Karnataka, India", "Banashankari, Bangalore", 12.9255, 77.5468));
        POPULAR_LOCALITIES.put("sarjapur", new LocationSuggestion("Sarjapur Road, Bangalore, Karnataka, India", "Sarjapur Road, Bangalore", 12.9107, 77.6871));
        POPULAR_LOCALITIES.put("bellandur", new LocationSuggestion("Bellandur, Bangalore, Karnataka, India", "Bellandur, Bangalore", 12.9260, 77.6762));
        POPULAR_LOCALITIES.put("kr puram", new LocationSuggestion("KR Puram, Bangalore, Karnataka, India", "KR Puram, Bangalore", 13.0098, 77.6969));
        POPULAR_LOCALITIES.put("mahadevapura", new LocationSuggestion("Mahadevapura, Bangalore, Karnataka, India", "Mahadevapura, Bangalore", 12.9914, 77.6931));
        
        // Mumbai localities
        POPULAR_LOCALITIES.put("andheri", new LocationSuggestion("Andheri, Mumbai, Maharashtra, India", "Andheri, Mumbai", 19.1136, 72.8697));
        POPULAR_LOCALITIES.put("bandra", new LocationSuggestion("Bandra, Mumbai, Maharashtra, India", "Bandra, Mumbai", 19.0596, 72.8295));
        POPULAR_LOCALITIES.put("powai", new LocationSuggestion("Powai, Mumbai, Maharashtra, India", "Powai, Mumbai", 19.1176, 72.9060));
        POPULAR_LOCALITIES.put("malad", new LocationSuggestion("Malad, Mumbai, Maharashtra, India", "Malad, Mumbai", 19.1874, 72.8484));
        POPULAR_LOCALITIES.put("goregaon", new LocationSuggestion("Goregaon, Mumbai, Maharashtra, India", "Goregaon, Mumbai", 19.1663, 72.8526));
        POPULAR_LOCALITIES.put("borivali", new LocationSuggestion("Borivali, Mumbai, Maharashtra, India", "Borivali, Mumbai", 19.2307, 72.8567));
        POPULAR_LOCALITIES.put("thane", new LocationSuggestion("Thane, Maharashtra, India", "Thane, Mumbai", 19.2183, 72.9781));
        POPULAR_LOCALITIES.put("navi mumbai", new LocationSuggestion("Navi Mumbai, Maharashtra, India", "Navi Mumbai", 19.0330, 73.0297));
        POPULAR_LOCALITIES.put("vashi", new LocationSuggestion("Vashi, Navi Mumbai, Maharashtra, India", "Vashi, Navi Mumbai", 19.0771, 72.9986));
        POPULAR_LOCALITIES.put("juhu", new LocationSuggestion("Juhu, Mumbai, Maharashtra, India", "Juhu, Mumbai", 19.1075, 72.8263));
        POPULAR_LOCALITIES.put("worli", new LocationSuggestion("Worli, Mumbai, Maharashtra, India", "Worli, Mumbai", 19.0176, 72.8152));
        POPULAR_LOCALITIES.put("lower parel", new LocationSuggestion("Lower Parel, Mumbai, Maharashtra, India", "Lower Parel, Mumbai", 18.9982, 72.8264));
        
        // Delhi NCR localities
        POPULAR_LOCALITIES.put("gurgaon", new LocationSuggestion("Gurgaon, Haryana, India", "Gurgaon", 28.4595, 77.0266));
        POPULAR_LOCALITIES.put("gurugram", new LocationSuggestion("Gurugram, Haryana, India", "Gurugram", 28.4595, 77.0266));
        POPULAR_LOCALITIES.put("noida", new LocationSuggestion("Noida, Uttar Pradesh, India", "Noida", 28.5355, 77.3910));
        POPULAR_LOCALITIES.put("greater noida", new LocationSuggestion("Greater Noida, Uttar Pradesh, India", "Greater Noida", 28.4744, 77.5040));
        POPULAR_LOCALITIES.put("dwarka", new LocationSuggestion("Dwarka, Delhi, India", "Dwarka, Delhi", 28.5921, 77.0460));
        POPULAR_LOCALITIES.put("rohini", new LocationSuggestion("Rohini, Delhi, India", "Rohini, Delhi", 28.7495, 77.0565));
        POPULAR_LOCALITIES.put("saket", new LocationSuggestion("Saket, Delhi, India", "Saket, Delhi", 28.5244, 77.2066));
        POPULAR_LOCALITIES.put("connaught place", new LocationSuggestion("Connaught Place, Delhi, India", "Connaught Place, Delhi", 28.6315, 77.2167));
        POPULAR_LOCALITIES.put("cp", new LocationSuggestion("Connaught Place, Delhi, India", "Connaught Place, Delhi", 28.6315, 77.2167));
        POPULAR_LOCALITIES.put("karol bagh", new LocationSuggestion("Karol Bagh, Delhi, India", "Karol Bagh, Delhi", 28.6514, 77.1907));
        POPULAR_LOCALITIES.put("lajpat nagar", new LocationSuggestion("Lajpat Nagar, Delhi, India", "Lajpat Nagar, Delhi", 28.5677, 77.2433));
        POPULAR_LOCALITIES.put("south delhi", new LocationSuggestion("South Delhi, Delhi, India", "South Delhi", 28.5245, 77.2066));
        POPULAR_LOCALITIES.put("vasant kunj", new LocationSuggestion("Vasant Kunj, Delhi, India", "Vasant Kunj, Delhi", 28.5204, 77.1567));
        
        // Hyderabad localities
        POPULAR_LOCALITIES.put("hitech city", new LocationSuggestion("HITEC City, Hyderabad, Telangana, India", "HITEC City, Hyderabad", 17.4435, 78.3772));
        POPULAR_LOCALITIES.put("hitec city", new LocationSuggestion("HITEC City, Hyderabad, Telangana, India", "HITEC City, Hyderabad", 17.4435, 78.3772));
        POPULAR_LOCALITIES.put("gachibowli", new LocationSuggestion("Gachibowli, Hyderabad, Telangana, India", "Gachibowli, Hyderabad", 17.4401, 78.3489));
        POPULAR_LOCALITIES.put("madhapur", new LocationSuggestion("Madhapur, Hyderabad, Telangana, India", "Madhapur, Hyderabad", 17.4483, 78.3915));
        POPULAR_LOCALITIES.put("kondapur", new LocationSuggestion("Kondapur, Hyderabad, Telangana, India", "Kondapur, Hyderabad", 17.4593, 78.3569));
        POPULAR_LOCALITIES.put("banjara hills", new LocationSuggestion("Banjara Hills, Hyderabad, Telangana, India", "Banjara Hills, Hyderabad", 17.4156, 78.4347));
        POPULAR_LOCALITIES.put("jubilee hills", new LocationSuggestion("Jubilee Hills, Hyderabad, Telangana, India", "Jubilee Hills, Hyderabad", 17.4325, 78.4073));
        POPULAR_LOCALITIES.put("kukatpally", new LocationSuggestion("Kukatpally, Hyderabad, Telangana, India", "Kukatpally, Hyderabad", 17.4849, 78.4138));
        POPULAR_LOCALITIES.put("secunderabad", new LocationSuggestion("Secunderabad, Telangana, India", "Secunderabad, Hyderabad", 17.4399, 78.4983));
        POPULAR_LOCALITIES.put("ameerpet", new LocationSuggestion("Ameerpet, Hyderabad, Telangana, India", "Ameerpet, Hyderabad", 17.4375, 78.4483));
        
        // Chennai localities
        POPULAR_LOCALITIES.put("anna nagar", new LocationSuggestion("Anna Nagar, Chennai, Tamil Nadu, India", "Anna Nagar, Chennai", 13.0850, 80.2101));
        POPULAR_LOCALITIES.put("t nagar", new LocationSuggestion("T. Nagar, Chennai, Tamil Nadu, India", "T. Nagar, Chennai", 13.0418, 80.2341));
        POPULAR_LOCALITIES.put("adyar", new LocationSuggestion("Adyar, Chennai, Tamil Nadu, India", "Adyar, Chennai", 13.0067, 80.2565));
        POPULAR_LOCALITIES.put("velachery", new LocationSuggestion("Velachery, Chennai, Tamil Nadu, India", "Velachery, Chennai", 12.9815, 80.2180));
        POPULAR_LOCALITIES.put("omr", new LocationSuggestion("OMR, Chennai, Tamil Nadu, India", "OMR, Chennai", 12.9165, 80.2274));
        POPULAR_LOCALITIES.put("sholinganallur", new LocationSuggestion("Sholinganallur, Chennai, Tamil Nadu, India", "Sholinganallur, Chennai", 12.9010, 80.2279));
        POPULAR_LOCALITIES.put("porur", new LocationSuggestion("Porur, Chennai, Tamil Nadu, India", "Porur, Chennai", 13.0382, 80.1565));
        POPULAR_LOCALITIES.put("tambaram", new LocationSuggestion("Tambaram, Chennai, Tamil Nadu, India", "Tambaram, Chennai", 12.9249, 80.1000));
        
        // Pune localities
        POPULAR_LOCALITIES.put("kothrud", new LocationSuggestion("Kothrud, Pune, Maharashtra, India", "Kothrud, Pune", 18.5074, 73.8077));
        POPULAR_LOCALITIES.put("hinjewadi", new LocationSuggestion("Hinjewadi, Pune, Maharashtra, India", "Hinjewadi, Pune", 18.5912, 73.7380));
        POPULAR_LOCALITIES.put("wakad", new LocationSuggestion("Wakad, Pune, Maharashtra, India", "Wakad, Pune", 18.5942, 73.7628));
        POPULAR_LOCALITIES.put("baner", new LocationSuggestion("Baner, Pune, Maharashtra, India", "Baner, Pune", 18.5590, 73.7868));
        POPULAR_LOCALITIES.put("viman nagar", new LocationSuggestion("Viman Nagar, Pune, Maharashtra, India", "Viman Nagar, Pune", 18.5679, 73.9143));
        POPULAR_LOCALITIES.put("kalyani nagar", new LocationSuggestion("Kalyani Nagar, Pune, Maharashtra, India", "Kalyani Nagar, Pune", 18.5463, 73.9020));
        POPULAR_LOCALITIES.put("magarpatta", new LocationSuggestion("Magarpatta, Pune, Maharashtra, India", "Magarpatta, Pune", 18.5147, 73.9270));
        POPULAR_LOCALITIES.put("hadapsar", new LocationSuggestion("Hadapsar, Pune, Maharashtra, India", "Hadapsar, Pune", 18.5089, 73.9260));
        
        // Major cities
        POPULAR_LOCALITIES.put("bangalore", new LocationSuggestion("Bangalore, Karnataka, India", "Bangalore", 12.9716, 77.5946));
        POPULAR_LOCALITIES.put("bengaluru", new LocationSuggestion("Bengaluru, Karnataka, India", "Bengaluru", 12.9716, 77.5946));
        POPULAR_LOCALITIES.put("mumbai", new LocationSuggestion("Mumbai, Maharashtra, India", "Mumbai", 19.0760, 72.8777));
        POPULAR_LOCALITIES.put("delhi", new LocationSuggestion("Delhi, India", "Delhi", 28.7041, 77.1025));
        POPULAR_LOCALITIES.put("new delhi", new LocationSuggestion("New Delhi, India", "New Delhi", 28.6139, 77.2090));
        POPULAR_LOCALITIES.put("hyderabad", new LocationSuggestion("Hyderabad, Telangana, India", "Hyderabad", 17.3850, 78.4867));
        POPULAR_LOCALITIES.put("chennai", new LocationSuggestion("Chennai, Tamil Nadu, India", "Chennai", 13.0827, 80.2707));
        POPULAR_LOCALITIES.put("pune", new LocationSuggestion("Pune, Maharashtra, India", "Pune", 18.5204, 73.8567));
        POPULAR_LOCALITIES.put("kolkata", new LocationSuggestion("Kolkata, West Bengal, India", "Kolkata", 22.5726, 88.3639));
        POPULAR_LOCALITIES.put("ahmedabad", new LocationSuggestion("Ahmedabad, Gujarat, India", "Ahmedabad", 23.0225, 72.5714));
        POPULAR_LOCALITIES.put("jaipur", new LocationSuggestion("Jaipur, Rajasthan, India", "Jaipur", 26.9124, 75.7873));
        POPULAR_LOCALITIES.put("lucknow", new LocationSuggestion("Lucknow, Uttar Pradesh, India", "Lucknow", 26.8467, 80.9462));
        POPULAR_LOCALITIES.put("chandigarh", new LocationSuggestion("Chandigarh, India", "Chandigarh", 30.7333, 76.7794));
        POPULAR_LOCALITIES.put("kochi", new LocationSuggestion("Kochi, Kerala, India", "Kochi", 9.9312, 76.2673));
        POPULAR_LOCALITIES.put("coimbatore", new LocationSuggestion("Coimbatore, Tamil Nadu, India", "Coimbatore", 11.0168, 76.9558));
        POPULAR_LOCALITIES.put("indore", new LocationSuggestion("Indore, Madhya Pradesh, India", "Indore", 22.7196, 75.8577));
        POPULAR_LOCALITIES.put("nagpur", new LocationSuggestion("Nagpur, Maharashtra, India", "Nagpur", 21.1458, 79.0882));
        POPULAR_LOCALITIES.put("surat", new LocationSuggestion("Surat, Gujarat, India", "Surat", 21.1702, 72.8311));
        POPULAR_LOCALITIES.put("vadodara", new LocationSuggestion("Vadodara, Gujarat, India", "Vadodara", 22.3072, 73.1812));
        POPULAR_LOCALITIES.put("mysore", new LocationSuggestion("Mysore, Karnataka, India", "Mysore", 12.2958, 76.6394));
        POPULAR_LOCALITIES.put("mysuru", new LocationSuggestion("Mysuru, Karnataka, India", "Mysuru", 12.2958, 76.6394));
        POPULAR_LOCALITIES.put("visakhapatnam", new LocationSuggestion("Visakhapatnam, Andhra Pradesh, India", "Visakhapatnam", 17.6868, 83.2185));
        POPULAR_LOCALITIES.put("vizag", new LocationSuggestion("Visakhapatnam, Andhra Pradesh, India", "Vizag", 17.6868, 83.2185));
        POPULAR_LOCALITIES.put("bhopal", new LocationSuggestion("Bhopal, Madhya Pradesh, India", "Bhopal", 23.2599, 77.4126));
        POPULAR_LOCALITIES.put("patna", new LocationSuggestion("Patna, Bihar, India", "Patna", 25.5941, 85.1376));
    }
    
    private final RestTemplate restTemplate;
    private final GeocodingCacheRepository cacheRepository;
    private final ObjectMapper objectMapper;
    
    @Value("${app.name:EventHub Connect}")
    private String appName;
    
    @Value("${app.contact-email:contact@eventhub.com}")
    private String contactEmail;
    
    public GeocodingService(GeocodingCacheRepository cacheRepository) {
        this.restTemplate = new RestTemplate();
        this.cacheRepository = cacheRepository;
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Autocomplete search - returns list of location suggestions.
     * Uses a hybrid approach:
     * 1. First checks popular Indian localities (instant, prefix match)
     * 2. Then calls Photon API (better partial matching than Nominatim)
     * 3. Falls back to Nominatim if Photon fails
     * 
     * @param query Search query (e.g., "whi" for Whitefield)
     * @param limit Maximum number of results (default 8)
     * @return List of location suggestions
     */
    public List<LocationSuggestion> autocomplete(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return Collections.emptyList();
        }
        
        String trimmedQuery = query.trim().toLowerCase();
        int effectiveLimit = Math.min(limit > 0 ? limit : MAX_AUTOCOMPLETE_RESULTS, 10);
        
        List<LocationSuggestion> results = new ArrayList<>();
        
        // Step 1: Check popular localities first (instant results for common searches)
        List<LocationSuggestion> localMatches = searchPopularLocalities(trimmedQuery, effectiveLimit);
        results.addAll(localMatches);
        
        // If we have enough local matches, return them immediately
        if (results.size() >= effectiveLimit) {
            return results.subList(0, effectiveLimit);
        }
        
        // Step 2: Try Photon API (better partial matching)
        int remaining = effectiveLimit - results.size();
        try {
            List<LocationSuggestion> photonResults = searchPhoton(trimmedQuery, remaining + 3);
            
            // Add non-duplicate results
            for (LocationSuggestion suggestion : photonResults) {
                if (!isDuplicate(results, suggestion) && results.size() < effectiveLimit) {
                    results.add(suggestion);
                }
            }
        } catch (Exception e) {
            log.warn("Photon API failed, falling back to Nominatim: {}", e.getMessage());
            
            // Step 3: Fallback to Nominatim
            try {
                List<LocationSuggestion> nominatimResults = searchNominatim(trimmedQuery, remaining + 3);
                for (LocationSuggestion suggestion : nominatimResults) {
                    if (!isDuplicate(results, suggestion) && results.size() < effectiveLimit) {
                        results.add(suggestion);
                    }
                }
            } catch (Exception ex) {
                log.error("Both Photon and Nominatim failed for query '{}': {}", trimmedQuery, ex.getMessage());
            }
        }
        
        return results;
    }
    
    /**
     * Search popular Indian localities with prefix matching.
     * This provides instant results for common searches like "whi" → "Whitefield"
     */
    private List<LocationSuggestion> searchPopularLocalities(String query, int limit) {
        List<LocationSuggestion> matches = new ArrayList<>();
        String lowerQuery = query.toLowerCase();
        
        for (Map.Entry<String, LocationSuggestion> entry : POPULAR_LOCALITIES.entrySet()) {
            String key = entry.getKey();
            
            // Prefix match
            if (key.startsWith(lowerQuery)) {
                matches.add(entry.getValue());
                if (matches.size() >= limit) break;
            }
        }
        
        // If no prefix matches, try contains match
        if (matches.isEmpty()) {
            for (Map.Entry<String, LocationSuggestion> entry : POPULAR_LOCALITIES.entrySet()) {
                String key = entry.getKey();
                if (key.contains(lowerQuery)) {
                    matches.add(entry.getValue());
                    if (matches.size() >= limit) break;
                }
            }
        }
        
        return matches;
    }
    
    /**
     * Search using Photon API (Komoot) - better for autocomplete with partial matching.
     */
    private List<LocationSuggestion> searchPhoton(String query, int limit) {
        String url = UriComponentsBuilder.fromHttpUrl(PHOTON_BASE_URL + "/api")
                .queryParam("q", query)
                .queryParam("limit", limit)
                .queryParam("lat", INDIA_CENTER_LAT)  // Bias towards India
                .queryParam("lon", INDIA_CENTER_LON)
                .queryParam("lang", "en")
                .build()
                .toUriString();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return parsePhotonResponse(response.getBody());
        }
        
        return Collections.emptyList();
    }
    
    /**
     * Search using Nominatim API (fallback).
     */
    private List<LocationSuggestion> searchNominatim(String query, int limit) {
        String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_BASE_URL + "/search")
                .queryParam("q", query)
                .queryParam("format", "json")
                .queryParam("addressdetails", "1")
                .queryParam("limit", limit)
                .queryParam("countrycodes", "in")
                .build()
                .toUriString();
        
        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return parseAutocompleteResponse(response.getBody());
        }
        
        return Collections.emptyList();
    }
    
    /**
     * Parse Photon API response.
     */
    private List<LocationSuggestion> parsePhotonResponse(String responseBody) {
        List<LocationSuggestion> suggestions = new ArrayList<>();
        
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode features = root.path("features");
            
            if (features.isArray()) {
                for (JsonNode feature : features) {
                    JsonNode geometry = feature.path("geometry");
                    JsonNode properties = feature.path("properties");
                    
                    JsonNode coordinates = geometry.path("coordinates");
                    if (!coordinates.isArray() || coordinates.size() < 2) continue;
                    
                    double lon = coordinates.get(0).asDouble();
                    double lat = coordinates.get(1).asDouble();
                    
                    // Build display name from properties
                    String name = properties.path("name").asText("");
                    String city = properties.path("city").asText("");
                    String state = properties.path("state").asText("");
                    String country = properties.path("country").asText("");
                    
                    // Skip if not in India
                    if (!country.isEmpty() && !country.equalsIgnoreCase("India")) {
                        continue;
                    }
                    
                    StringBuilder displayName = new StringBuilder();
                    StringBuilder shortName = new StringBuilder();
                    
                    if (!name.isEmpty()) {
                        displayName.append(name);
                        shortName.append(name);
                    }
                    if (!city.isEmpty() && !city.equals(name)) {
                        if (displayName.length() > 0) displayName.append(", ");
                        if (shortName.length() > 0) shortName.append(", ");
                        displayName.append(city);
                        shortName.append(city);
                    }
                    if (!state.isEmpty()) {
                        if (displayName.length() > 0) displayName.append(", ");
                        displayName.append(state);
                    }
                    if (!country.isEmpty()) {
                        if (displayName.length() > 0) displayName.append(", ");
                        displayName.append(country);
                    }
                    
                    if (displayName.length() > 0 && lat != 0 && lon != 0) {
                        suggestions.add(new LocationSuggestion(
                                displayName.toString(),
                                shortName.length() > 0 ? shortName.toString() : displayName.toString(),
                                lat, lon
                        ));
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Photon response: {}", e.getMessage());
        }
        
        return suggestions;
    }
    
    /**
     * Check if a suggestion is a duplicate (same location within ~100m).
     */
    private boolean isDuplicate(List<LocationSuggestion> existing, LocationSuggestion newSuggestion) {
        for (LocationSuggestion s : existing) {
            // Check if coordinates are very close (within ~100m)
            BigDecimal latDiff = s.getLatitude().subtract(newSuggestion.getLatitude()).abs();
            BigDecimal lonDiff = s.getLongitude().subtract(newSuggestion.getLongitude()).abs();
            BigDecimal threshold = new BigDecimal("0.001");
            if (latDiff.compareTo(threshold) < 0 && lonDiff.compareTo(threshold) < 0) {
                return true;
            }
            // Also check if short names are similar
            if (s.getShortName().equalsIgnoreCase(newSuggestion.getShortName())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Geocode a specific location - returns coordinates.
     * Checks cache first, then calls API if not cached.
     * 
     * @param locationText Location text to geocode
     * @return LocationDTO with coordinates, or null if not found
     */
    @Transactional
    public LocationDTO geocode(String locationText) {
        if (locationText == null || locationText.trim().isEmpty()) {
            return null;
        }
        
        String normalizedQuery = locationText.trim().toLowerCase();
        
        // Check cache first
        Optional<GeocodingCache> cached = cacheRepository
                .findByQueryTextIgnoreCaseAndNotExpired(normalizedQuery, LocalDateTime.now());
        
        if (cached.isPresent()) {
            GeocodingCache cache = cached.get();
            log.debug("Cache hit for query: {}", normalizedQuery);
            return new LocationDTO(cache.getLocationName(), cache.getLatitude(), cache.getLongitude());
        }
        
        // Call Nominatim API
        try {
            String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_BASE_URL + "/search")
                    .queryParam("q", locationText.trim())
                    .queryParam("format", "json")
                    .queryParam("addressdetails", "1")
                    .queryParam("limit", "1")
                    .queryParam("countrycodes", "in")
                    .build()
                    .toUriString();
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                LocationDTO result = parseGeocodeResponse(response.getBody());
                
                // Cache the result
                if (result != null) {
                    cacheResult(normalizedQuery, result);
                }
                
                return result;
            }
        } catch (Exception e) {
            log.error("Geocoding failed for location '{}': {}", locationText, e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Reverse geocode - get location name from coordinates.
     * 
     * @param lat Latitude
     * @param lng Longitude
     * @return Location name, or null if not found
     */
    public String reverseGeocode(double lat, double lng) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_BASE_URL + "/reverse")
                    .queryParam("lat", lat)
                    .queryParam("lon", lng)
                    .queryParam("format", "json")
                    .queryParam("addressdetails", "1")
                    .build()
                    .toUriString();
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseReverseGeocodeResponse(response.getBody());
            }
        } catch (Exception e) {
            log.error("Reverse geocoding failed for ({}, {}): {}", lat, lng, e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Store result in cache with 30-day expiration.
     */
    @Transactional
    public void cacheResult(String query, LocationDTO result) {
        try {
            // Check if already exists
            Optional<GeocodingCache> existing = cacheRepository.findByQueryText(query.toLowerCase());
            
            if (existing.isPresent()) {
                // Update existing entry
                GeocodingCache cache = existing.get();
                cache.setLocationName(result.getName());
                cache.setLatitude(result.getLatitude());
                cache.setLongitude(result.getLongitude());
                cache.setExpiresAt(LocalDateTime.now().plusDays(CACHE_EXPIRY_DAYS));
                cacheRepository.save(cache);
            } else {
                // Create new entry
                GeocodingCache cache = new GeocodingCache();
                cache.setQueryText(query.toLowerCase());
                cache.setLocationName(result.getName());
                cache.setLatitude(result.getLatitude());
                cache.setLongitude(result.getLongitude());
                cache.setExpiresAt(LocalDateTime.now().plusDays(CACHE_EXPIRY_DAYS));
                cacheRepository.save(cache);
            }
            
            log.debug("Cached geocoding result for query: {}", query);
        } catch (Exception e) {
            log.warn("Failed to cache geocoding result: {}", e.getMessage());
        }
    }
    
    /**
     * Clean up expired cache entries.
     * Runs daily at 3 AM.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredCache() {
        int deleted = cacheRepository.deleteExpiredEntries(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired geocoding cache entries", deleted);
        }
    }
    
    /**
     * Create HTTP headers with required User-Agent for Nominatim.
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", appName + " (" + contactEmail + ")");
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return headers;
    }
    
    /**
     * Parse autocomplete response from Nominatim.
     */
    private List<LocationSuggestion> parseAutocompleteResponse(String responseBody) {
        List<LocationSuggestion> suggestions = new ArrayList<>();
        
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            
            if (root.isArray()) {
                for (JsonNode node : root) {
                    String displayName = node.path("display_name").asText("");
                    double lat = node.path("lat").asDouble();
                    double lon = node.path("lon").asDouble();
                    
                    // Extract short name from address details
                    String shortName = extractShortName(node);
                    
                    if (!displayName.isEmpty() && lat != 0 && lon != 0) {
                        suggestions.add(new LocationSuggestion(displayName, shortName, lat, lon));
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse autocomplete response: {}", e.getMessage());
        }
        
        return suggestions;
    }
    
    /**
     * Parse geocode response from Nominatim.
     */
    private LocationDTO parseGeocodeResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            
            if (root.isArray() && root.size() > 0) {
                JsonNode first = root.get(0);
                String displayName = first.path("display_name").asText("");
                double lat = first.path("lat").asDouble();
                double lon = first.path("lon").asDouble();
                
                // Use short name for storage
                String shortName = extractShortName(first);
                String name = shortName.isEmpty() ? displayName : shortName;
                
                if (lat != 0 && lon != 0) {
                    return new LocationDTO(name, lat, lon);
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse geocode response: {}", e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Parse reverse geocode response from Nominatim.
     */
    private String parseReverseGeocodeResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            
            // Try to get a meaningful short name
            JsonNode address = root.path("address");
            
            // Priority: suburb > neighbourhood > city_district > city > state
            String[] priorities = {"suburb", "neighbourhood", "city_district", "city", "state"};
            
            for (String key : priorities) {
                String value = address.path(key).asText("");
                if (!value.isEmpty()) {
                    return value;
                }
            }
            
            // Fallback to display name
            return root.path("display_name").asText("");
        } catch (Exception e) {
            log.error("Failed to parse reverse geocode response: {}", e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Extract a short, meaningful name from address details.
     */
    private String extractShortName(JsonNode node) {
        JsonNode address = node.path("address");
        
        // Priority order for short name
        String[] priorities = {"suburb", "neighbourhood", "city_district", "town", "city"};
        
        StringBuilder shortName = new StringBuilder();
        
        for (String key : priorities) {
            String value = address.path(key).asText("");
            if (!value.isEmpty()) {
                if (shortName.length() > 0) {
                    shortName.append(", ");
                }
                shortName.append(value);
                
                // Stop after getting 2 components
                if (shortName.toString().split(",").length >= 2) {
                    break;
                }
            }
        }
        
        // Add city if not already included
        String city = address.path("city").asText("");
        if (!city.isEmpty() && !shortName.toString().contains(city)) {
            if (shortName.length() > 0) {
                shortName.append(", ");
            }
            shortName.append(city);
        }
        
        return shortName.toString();
    }
    
    /**
     * Check if a query is cached and not expired.
     */
    public boolean isCached(String query) {
        if (query == null || query.trim().isEmpty()) {
            return false;
        }
        return cacheRepository.existsByQueryTextAndNotExpired(query.trim().toLowerCase(), LocalDateTime.now());
    }
}
