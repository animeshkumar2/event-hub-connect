# Implementation Plan: Phase 1 Location System

## Overview

This implementation plan breaks down the Phase 1 Location System into discrete, incremental tasks. The approach prioritizes backend infrastructure first, then frontend components, followed by integration and testing. Each task builds on previous work to ensure no orphaned code.

## Tasks

- [x] 1. Database Schema Updates
  - [x] 1.1 Create migration script for vendor location fields
  - [x] 1.2 Create migration script for listing service_mode field
  - [x] 1.3 Create migration script for lead location fields
  - [x] 1.4 Create geocoding_cache table

- [x] 2. Backend Entity and Repository Updates
  - [x] 2.1 Update Vendor entity with location fields
  - [x] 2.2 Update Listing entity with service_mode field
  - [x] 2.3 Update Lead entity with customer location fields
  - [x] 2.4 Create GeocodingCache entity and repository

- [x] 3. Implement Distance Calculation Service
  - [x] 3.1 Create DistanceService with Haversine formula
  - [x] 3.2 Write property tests for DistanceService

- [x] 4. Implement Geocoding Service
  - [x] 4.1 Create GeocodingService with Nominatim integration
  - [x] 4.2 Implement geocoding cache logic
  - [x] 4.3 Write property tests for geocoding cache

- [x] 5. Create Geocoding API Endpoints
  - [x] 5.1 Create GeocodingController with public endpoints

- [x] 6. Update Vendor Location Management
  - [x] 6.1 Update VendorOnboardingService to handle location
  - [x] 6.2 Create vendor location update endpoint

- [x] 7. Update Search Service with Location Filtering
  - [x] 7.1 Add location parameters to SearchService
  - [x] 7.2 Update PublicSearchController with location params

- [x] 8. Update Listing Service with Service Mode
  - [x] 8.1 Update VendorListingService to handle service_mode
  - [x] 8.2 Update ListingDTO with service mode display

- [x] 9. Update Lead Service with Location Data
  - [x] 9.1 Update LeadService to capture customer location
  - [x] 9.2 Update lead DTOs with location display

- [x] 10. Checkpoint - Backend Complete ✅

- [x] 11. Frontend: Location Autocomplete Component
  - [x] 11.1 Create LocationAutocomplete component
  - [x] 11.2 Create useGeocodingApi hook (integrated in api.ts)

- [x] 12. Frontend: Radius Slider Component
  - [x] 12.1 Create RadiusSlider component

- [x] 13. Frontend: Service Mode Selector Component
  - [x] 13.1 Create ServiceModeSelector component

- [x] 14. Update Vendor Onboarding UI
  - [x] 14.1 Add location step to VendorOnboarding
  - [x] 14.2 Update onboarding API call with location data

- [x] 15. Update Vendor Dashboard Location Settings
  - [x] 15.1 Add location settings to VendorProfile page
  - [x] 15.2 Implement location update API integration

- [ ] 16. Update Listing Form with Service Mode
  - [ ] 16.1 Add ServiceModeSelector to listing create/edit forms
  - [ ] 16.2 Update listing API calls with service_mode

- [x] 17. Update Search Page with Location
  - [x] 17.1 Add location input to Search page
  - [x] 17.2 Add radius selector to Search page
  - [x] 17.3 Update search API calls with location params
  - [ ] 17.4 Implement location required prompt

- [ ] 18. Update Search Results Display
  - [ ] 18.1 Update VendorCard with location info
  - [ ] 18.2 Update PackageCard/ListingCard with service mode

- [ ] 19. Implement Empty Results Handling
  - [ ] 19.1 Add "Expand search radius" feature
  - [ ] 19.2 Handle maximum radius case

- [x] 20. Update Vendor Leads Display
  - [x] 20.1 Update VendorLeads page with location info
  - [x] 20.2 Format lead location consistently

- [ ] 21. Final Checkpoint - Integration Complete

## Implementation Status

### Completed (Backend + Core Frontend Components)
- Database migration script with all location fields
- All backend entities updated (Vendor, Listing, Lead, GeocodingCache)
- DistanceService with Haversine formula and property tests
- GeocodingService with Nominatim integration and caching
- GeocodingController with rate limiting
- Vendor location management (onboarding + update endpoints)
- Search service with bidirectional location filtering
- Lead service with customer location capture
- Frontend components: LocationAutocomplete, RadiusSlider, ServiceModeSelector
- VendorOnboarding updated with location fields
- API hooks updated with location parameters
- VendorProfile location settings (edit location + radius)
- Search page location filtering UI (autocomplete + radius slider)
- VendorLeads customer location display (with distance)

### Remaining (Frontend Integration)
- Listing form service mode selector
- Search results distance display in cards
- Empty results "Expand radius" feature
- Location required prompt for search

## Notes

- All property-based tests are required for comprehensive coverage
- The implementation uses Nominatim (free) for geocoding - no API keys required
- Nominatim requires a User-Agent header identifying the application
- Backend compiles and tests pass
- Frontend builds successfully
