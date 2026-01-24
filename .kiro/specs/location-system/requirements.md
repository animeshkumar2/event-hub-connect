# Requirements Document

## Introduction

This document specifies the requirements for the Phase 1 Location System for EventHub Connect. The system enables location-based matching between vendors and customers to ensure both parties only see realistic service options based on geographic proximity. The goal is to create a simple, free, and scalable location system that improves marketplace quality by filtering out impossible distances.

## Glossary

- **Vendor**: A service provider registered on the platform who offers event-related services
- **Customer**: A user searching for and booking event services
- **Primary_Location**: A single physical location representing a vendor's base of operations or a customer's event venue
- **Service_Radius**: The maximum distance (in kilometers) a vendor is willing to travel to serve customers
- **Search_Radius**: The maximum distance (in kilometers) a customer is willing to look for vendors
- **Service_Mode**: The delivery method for a service listing (customer visits vendor, vendor travels to customer, or both)
- **Distance_Calculation**: The straight-line (Haversine) distance between two geographic coordinates
- **Geocoding_Service**: A free API service that converts location text into geographic coordinates (latitude/longitude)
- **Location_Autocomplete**: A UI component that suggests location names as the user types

## Requirements

### Requirement 1: Vendor Primary Location

**User Story:** As a vendor, I want to specify my primary service location during onboarding, so that customers can understand where I operate from.

#### Acceptance Criteria

1. WHEN a vendor completes the onboarding process, THE Onboarding_System SHALL require the vendor to enter a primary service location
2. WHEN a vendor enters a location, THE Location_Autocomplete SHALL suggest matching locations from the geocoding service
3. WHEN a vendor selects a location, THE System SHALL store the location name and geographic coordinates (latitude, longitude)
4. THE System SHALL display the stored location as a human-readable area name (e.g., "HSR Layout, Bangalore")
5. IF a vendor attempts to complete onboarding without a primary location, THEN THE System SHALL prevent submission and display a validation error

### Requirement 2: Vendor Service Radius

**User Story:** As a vendor, I want to specify how far I'm willing to travel to serve customers, so that I only receive leads within my service area.

#### Acceptance Criteria

1. WHEN a vendor completes the onboarding process, THE Onboarding_System SHALL require the vendor to select a service radius
2. THE System SHALL provide a slider with predefined radius options: 10 km, 25 km, 50 km, 100 km
3. WHEN a vendor selects a radius, THE System SHALL store the value in kilometers
4. THE System SHALL default the service radius to 25 km if not explicitly selected
5. IF a vendor attempts to complete onboarding without selecting a service radius, THEN THE System SHALL use the default value of 25 km

### Requirement 3: Vendor Location Management

**User Story:** As a vendor, I want to update my service location and radius from my dashboard, so that I can adjust my service area as my business changes.

#### Acceptance Criteria

1. WHEN a vendor accesses their profile settings, THE Dashboard SHALL display the current primary location and service radius
2. WHEN a vendor updates their primary location, THE System SHALL validate and store the new location with coordinates
3. WHEN a vendor updates their service radius, THE System SHALL store the new radius value
4. WHEN location settings are updated, THE System SHALL immediately apply changes to search results and lead filtering
5. THE System SHALL display a confirmation message after successful location updates

### Requirement 4: Listing Service Mode

**User Story:** As a vendor, I want to specify the service mode for each listing, so that customers understand how the service is delivered.

#### Acceptance Criteria

1. WHEN a vendor creates or edits a listing, THE Listing_Form SHALL require selection of a service mode
2. THE System SHALL provide three service mode options: "Customer visits me", "I go to customer", "Both"
3. WHEN a listing is saved, THE System SHALL store the selected service mode
4. THE System SHALL default the service mode to "Both" if not explicitly selected
5. WHEN displaying a listing to customers, THE System SHALL show the service mode as a label

### Requirement 5: Customer Search Location

**User Story:** As a customer, I want to specify my event location when searching, so that I can find vendors who can serve my area.

#### Acceptance Criteria

1. WHEN a customer initiates a search, THE Search_Interface SHALL prompt for a location input
2. WHEN a customer enters a location, THE Location_Autocomplete SHALL suggest matching locations from the geocoding service
3. WHEN a customer selects a location, THE System SHALL store the location name and geographic coordinates for the search session
4. THE System SHALL persist the customer's last used location for convenience
5. IF a customer searches without specifying a location, THEN THE System SHALL prompt them to enter a location before showing results

### Requirement 6: Customer Search Radius

**User Story:** As a customer, I want to specify how far I'm willing to look for vendors, so that I can control the scope of my search.

#### Acceptance Criteria

1. WHEN a customer initiates a search, THE Search_Interface SHALL display a radius selector
2. THE System SHALL provide predefined radius options: 5 km, 10 km, 20 km, 30 km, 50 km
3. WHEN a customer selects a radius, THE System SHALL apply it to filter search results
4. THE System SHALL default the search radius to 20 km if not explicitly selected
5. WHEN a customer changes the search radius, THE System SHALL immediately refresh the search results

### Requirement 7: Bidirectional Distance Matching

**User Story:** As a platform operator, I want vendors and customers to be matched only when both are comfortable with the distance, so that leads are realistic and actionable.

#### Acceptance Criteria

1. WHEN calculating vendor visibility, THE Matching_System SHALL compute the distance between vendor and customer locations
2. THE Matching_System SHALL show a vendor to a customer only IF the customer is within the vendor's service radius AND the vendor is within the customer's search radius
3. THE Distance_Calculation SHALL use the Haversine formula for straight-line distance between coordinates
4. WHEN a vendor is outside the customer's search radius, THE System SHALL exclude them from results
5. WHEN a customer is outside the vendor's service radius, THE System SHALL exclude the vendor from results

### Requirement 8: Search Results Display

**User Story:** As a customer, I want to see relevant location information in search results, so that I can make informed decisions about vendors.

#### Acceptance Criteria

1. WHEN displaying vendor cards in search results, THE System SHALL show the distance from the customer's location (e.g., "7 km away")
2. WHEN displaying vendor cards, THE System SHALL show the vendor's base area (e.g., "Based in HSR")
3. WHEN displaying listing cards, THE System SHALL show the service mode label (e.g., "Travels to your venue", "Visit their studio", "Both")
4. THE System SHALL sort search results by relevance, with distance as a secondary factor
5. THE System SHALL format distances as whole numbers with "km" suffix

### Requirement 9: Lead Location Information

**User Story:** As a vendor, I want to see location details for incoming leads, so that I can assess the feasibility of each opportunity.

#### Acceptance Criteria

1. WHEN displaying a lead to a vendor, THE System SHALL show the customer's area name
2. WHEN displaying a lead, THE System SHALL show the distance from the vendor's location
3. WHEN displaying a lead, THE System SHALL show the service requested and associated listing
4. WHEN displaying a lead, THE System SHALL show the service mode involved (e.g., "You travel to customer")
5. THE Lead_Display SHALL format location information consistently (e.g., "Event in Whitefield (8 km)")

### Requirement 10: Empty Results Handling

**User Story:** As a customer, I want helpful suggestions when no vendors are found, so that I can still find services for my event.

#### Acceptance Criteria

1. WHEN a search returns zero results, THE System SHALL display a friendly empty state message
2. WHEN no results are found, THE System SHALL offer an "Expand search radius" button
3. WHEN a customer clicks "Expand search radius", THE System SHALL increase the radius by one step (e.g., 20 km → 30 km)
4. WHEN the radius is expanded, THE System SHALL automatically refresh the search results
5. IF the maximum radius (50 km) is already selected, THEN THE System SHALL suggest the customer try a different location

### Requirement 11: Geocoding Integration

**User Story:** As a platform operator, I want to use a free geocoding service, so that the location system has no API costs.

#### Acceptance Criteria

1. THE System SHALL integrate with a free geocoding API (Nominatim/OpenStreetMap or similar)
2. WHEN converting location text to coordinates, THE Geocoding_Service SHALL return latitude and longitude
3. WHEN providing autocomplete suggestions, THE Geocoding_Service SHALL return location names with context (area, city)
4. THE System SHALL cache geocoding results to minimize API calls
5. IF the geocoding service is unavailable, THEN THE System SHALL display an error message and allow manual retry

### Requirement 12: Data Constraints

**User Story:** As a platform operator, I want simple location data rules, so that the system remains maintainable and scalable.

#### Acceptance Criteria

1. THE System SHALL store only one primary location per vendor
2. THE System SHALL store only one location per customer search session
3. THE System SHALL store only one service radius per vendor
4. THE System SHALL store only one search radius per customer search session
5. THE System SHALL NOT support multiple zones, exclusions, or advanced location logic in Phase 1
