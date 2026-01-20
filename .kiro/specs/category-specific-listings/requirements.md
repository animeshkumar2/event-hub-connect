---
title: Category-Specific Listing Forms
status: draft
priority: high
created: 2026-01-20
---

# Category-Specific Listing Forms

## Overview

Implement dynamic listing forms that adapt based on vendor category, capturing category-specific pricing models and requirements while maintaining a consistent user experience.

## Problem Statement

The current generic listing form doesn't accommodate the diverse business models across vendor categories:

- **Catering**: Per-plate pricing, minimum guests, cuisine types
- **Photography**: Per-hour/per-event pricing, deliverables, team composition
- **Venue**: Per-day pricing, capacity, amenities
- **Décor**: Per-setup pricing, coverage area, theme-based packages
- **Makeup**: Per-person pricing, trial sessions, products used
- **DJ**: Per-hour pricing, equipment specifications
- **Sound & Lights**: Equipment-based pricing, coverage area

This leads to incomplete listings, poor search/filter experience, and customer confusion.

## Goals

1. Enable category-specific form fields that capture relevant business details
2. Support multiple pricing models (per-plate, per-hour, per-event, per-day, etc.)
3. Maintain backward compatibility with existing listings
4. Provide better search and filtering based on category-specific criteria
5. Improve customer understanding of what's included in each listing


## User Stories

### US-1: Vendor Creates Category-Specific Listing
**As a** catering vendor  
**I want to** specify per-plate pricing with veg/non-veg options and minimum guest count  
**So that** customers understand my pricing model and requirements

**Acceptance Criteria:**
- Form shows catering-specific fields when category is selected
- Can specify separate pricing for veg and non-veg
- Can set minimum and maximum guest counts
- Can list cuisine types and service styles
- Can specify what's included (servers, crockery, setup, etc.)

### US-2: Photography Vendor Specifies Deliverables
**As a** photography vendor  
**I want to** specify my team size, duration, and deliverables  
**So that** customers know exactly what they'll receive

**Acceptance Criteria:**
- Can specify service type (photography, videography, or both)
- Can set duration (hourly or per-event)
- Can list deliverables (edited photos count, videos, albums)
- Can indicate if drone coverage is included
- Can specify delivery timeline

### US-3: Venue Owner Lists Capacity and Amenities
**As a** venue owner  
**I want to** specify venue capacity, area, and included amenities  
**So that** customers can determine if my venue fits their needs

**Acceptance Criteria:**
- Can specify seating and standing capacity
- Can list venue area in sq ft
- Can indicate catering and alcohol policies
- Can list included amenities (parking, AC, power backup)
- Can set per-day or per-hour pricing


### US-4: Customer Searches with Category-Specific Filters
**As a** customer  
**I want to** filter catering vendors by price per plate and cuisine type  
**So that** I can find vendors within my budget and preferences

**Acceptance Criteria:**
- Can filter by category-specific criteria (e.g., price per plate for catering)
- Search results show pricing in appropriate format (₹450/plate vs ₹75,000/event)
- Can filter by key category attributes (cuisine type, service style, etc.)

### US-5: Existing Listings Continue to Work
**As a** vendor with existing listings  
**I want** my current listings to remain functional  
**So that** my business isn't disrupted during the migration

**Acceptance Criteria:**
- Existing listings display correctly without category-specific data
- Can edit existing listings and optionally add category-specific fields
- No data loss during migration
- Backward compatible API responses

## Technical Approach

### Architecture: Hybrid Base + Category-Specific

**Base Fields (All Categories):**
- Name, description, images
- Event types
- Base price (for search/sorting)
- Pricing model enum

**Category-Specific Fields:**
- Stored as JSONB in database
- Validated against category schema
- Key fields indexed for search/filter


## Database Schema Changes

### Listings Table Additions

```sql
ALTER TABLE listings 
ADD COLUMN pricing_model VARCHAR(50),
ADD COLUMN category_specific_data JSONB;

-- Index for JSONB queries
CREATE INDEX idx_listings_category_data ON listings USING GIN (category_specific_data);

-- Index for pricing model
CREATE INDEX idx_listings_pricing_model ON listings (pricing_model);
```

### Pricing Model Enum Values

- `per_plate` - Catering (price per guest)
- `per_hour` - Photography, DJ, hourly services
- `per_event` - Photography packages, full-day services
- `per_day` - Venue, multi-day services
- `per_person` - Makeup, individual services
- `per_setup` - Décor, one-time setup
- `per_item` - Individual items
- `fixed` - Fixed package price

### Category-Specific Data Structure

**Catering Example:**
```json
{
  "cuisineType": "North Indian",
  "serviceStyle": "Buffet",
  "pricePerPlateVeg": 450,
  "pricePerPlateNonVeg": 650,
  "minGuests": 100,
  "maxGuests": 500,
  "menuItems": "4 starters, 3 mains, 2 breads, rice, dessert",
  "includes": ["Servers", "Crockery", "Setup", "Cleanup"],
  "liveCounters": true
}
```


**Photography Example:**
```json
{
  "serviceType": "Both",
  "duration": "Full Day",
  "durationHours": 12,
  "teamSize": "2 photographers + 1 videographer",
  "editedPhotos": 500,
  "rawPhotos": false,
  "highlightVideo": true,
  "highlightVideoMinutes": 5,
  "fullVideo": true,
  "fullVideoMinutes": 30,
  "droneIncluded": true,
  "albumIncluded": true,
  "albumPages": 40,
  "deliveryDays": 30
}
```

**Venue Example:**
```json
{
  "venueType": "Lawn",
  "capacitySeating": 500,
  "capacityStanding": 700,
  "areaSquareFeet": 10000,
  "amenities": ["Parking", "AC Green Room", "Power Backup", "Restrooms"],
  "cateringPolicy": "Outside Allowed",
  "alcoholPolicy": "Allowed with License",
  "timingStart": "09:00",
  "timingEnd": "02:00",
  "parkingCapacity": 100,
  "peakSeasonSurcharge": 20
}
```


## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

**Backend:**
- [ ] Add `pricing_model` and `category_specific_data` columns to Listing model
- [ ] Create database migration script
- [ ] Update Listing entity with new fields
- [ ] Create CategoryFieldConfig model for storing field schemas
- [ ] Create API endpoint to fetch category field configuration
- [ ] Update listing CRUD endpoints to handle category-specific data
- [ ] Add validation for category-specific fields

**Frontend:**
- [ ] Create CategoryFieldRenderer component for dynamic form fields
- [ ] Create field type components (text, number, select, multiselect, checkbox)
- [ ] Update listing form to fetch and render category-specific fields
- [ ] Add validation for category-specific fields
- [ ] Update listing display to show category-specific data

### Phase 2: Priority Categories (Week 2)

Implement field configurations for:
- [ ] Catering
- [ ] Photography & Videography
- [ ] Venue

**Tasks:**
- [ ] Define field schemas for each category
- [ ] Create seed data for category configurations
- [ ] Test form rendering for each category
- [ ] Update listing detail page to display category-specific info
- [ ] Add category-specific search filters


### Phase 3: Additional Categories (Week 3)

Implement field configurations for:
- [ ] Décor
- [ ] Makeup & Styling
- [ ] DJ & Entertainment
- [ ] Sound & Lights

### Phase 4: Search & Filter Enhancement (Week 4)

- [ ] Add category-specific filters to search page
- [ ] Implement JSONB queries for category-specific filtering
- [ ] Add sorting by category-specific fields
- [ ] Update search results to show category-specific pricing
- [ ] Add category-specific comparison features

### Phase 5: Migration & Testing (Week 5)

- [ ] Create migration script for existing listings
- [ ] Test backward compatibility
- [ ] Performance testing for JSONB queries
- [ ] User acceptance testing
- [ ] Documentation updates

## API Endpoints

### Get Category Field Configuration
```
GET /api/categories/{categoryId}/fields
Response: {
  "categoryId": "caterer",
  "pricingModel": "per_plate",
  "fields": [
    {
      "name": "cuisineType",
      "label": "Cuisine Type",
      "type": "select",
      "required": true,
      "options": ["North Indian", "South Indian", "Chinese", ...]
    },
    ...
  ]
}
```


### Create/Update Listing with Category Data
```
POST /api/vendor/listings
{
  "name": "North Indian Buffet Package",
  "description": "...",
  "price": 450,
  "pricingModel": "per_plate",
  "listingCategoryId": "caterer",
  "categorySpecificData": {
    "cuisineType": "North Indian",
    "serviceStyle": "Buffet",
    "pricePerPlateVeg": 450,
    "pricePerPlateNonVeg": 650,
    "minGuests": 100,
    ...
  }
}
```

### Search with Category Filters
```
GET /api/listings/search?category=caterer&cuisineType=North Indian&maxPricePerPlate=500
```

## Frontend Components

### CategoryFieldRenderer
```typescript
interface CategoryFieldRendererProps {
  categoryId: string;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
}
```

Responsibilities:
- Fetch field configuration for category
- Render appropriate input components
- Handle validation
- Manage field state


### Field Type Components

- **TextFieldInput**: Single-line text
- **TextAreaInput**: Multi-line text
- **NumberInput**: Numeric values with optional unit display
- **SelectInput**: Single selection dropdown
- **MultiSelectInput**: Multiple selection
- **CheckboxInput**: Boolean values
- **RadioInput**: Single selection from options

## Validation Rules

### Backend Validation
- Validate against category field schema
- Ensure required fields are present
- Validate data types and ranges
- Validate enum values against allowed options

### Frontend Validation
- Real-time validation as user types
- Show field-specific error messages
- Prevent form submission if validation fails
- Highlight invalid fields

## Display Logic

### Listing Detail Page
- Show pricing in category-appropriate format
  - Catering: "Starting from ₹450/plate"
  - Photography: "₹75,000 per event"
  - Venue: "₹50,000 per day"
- Display category-specific details in organized sections
- Show "What's Included" based on category data
- Highlight key features (e.g., "Drone Coverage Included")


### Search Results
- Show pricing in appropriate format
- Display key category-specific attributes
- Enable filtering by category-specific criteria

## Migration Strategy

### Existing Listings
1. Add new columns with NULL allowed
2. Existing listings continue to work without category-specific data
3. Vendors can edit listings to add category-specific fields
4. Display logic handles both old and new format

### Data Migration Script
```sql
-- Example: Migrate catering listings with basic data
UPDATE listings 
SET 
  pricing_model = 'per_plate',
  category_specific_data = jsonb_build_object(
    'pricePerPlateVeg', price,
    'minGuests', 50
  )
WHERE listing_category_id = 'caterer' 
  AND pricing_model IS NULL;
```

## Performance Considerations

### Database Indexing
- GIN index on JSONB column for fast queries
- Index on pricing_model for filtering
- Composite indexes for common query patterns

### Query Optimization
- Use JSONB operators efficiently
- Limit JSONB queries to indexed fields
- Cache category field configurations


### Caching Strategy
- Cache category field configurations in memory
- Cache frequently accessed listings
- Invalidate cache on configuration updates

## Testing Requirements

### Unit Tests
- [ ] Category field configuration validation
- [ ] JSONB data serialization/deserialization
- [ ] Field type component rendering
- [ ] Validation logic for each field type

### Integration Tests
- [ ] Create listing with category-specific data
- [ ] Update listing with category-specific data
- [ ] Search with category-specific filters
- [ ] Backward compatibility with existing listings

### E2E Tests
- [ ] Complete listing creation flow for each category
- [ ] Search and filter by category-specific criteria
- [ ] Edit existing listing and add category data
- [ ] Display listing with category-specific information

## Security Considerations

- Validate all category-specific data on backend
- Sanitize user input to prevent XSS
- Prevent SQL injection in JSONB queries
- Rate limit API endpoints
- Validate file uploads for images


## Success Metrics

### Vendor Adoption
- 80% of new listings include category-specific data within 1 month
- 50% of existing listings updated with category-specific data within 3 months

### Customer Experience
- 30% increase in listing detail page engagement
- 20% reduction in quote request clarification questions
- Improved search relevance scores

### Technical Performance
- Category-specific queries complete in < 200ms
- No degradation in existing listing performance
- 99.9% uptime during migration

## Open Questions

1. **Multi-tier Pricing**: Should vendors be able to create multiple pricing tiers (Basic, Standard, Premium)?
2. **Custom Fields**: Should vendors be able to add custom fields beyond the predefined schema?
3. **Seasonal Pricing**: How to handle seasonal price variations?
4. **Negotiable Pricing**: How to indicate if pricing is negotiable vs fixed?
5. **Add-ons**: Should add-ons be part of category-specific data or separate entities?

## Dependencies

- Database migration approval
- Category field schema definitions
- UI/UX design for category-specific forms
- Backend API updates
- Frontend component library updates


## Risks & Mitigation

### Risk: Performance degradation with JSONB queries
**Mitigation**: 
- Proper indexing strategy
- Cache frequently accessed data
- Monitor query performance
- Optimize queries based on usage patterns

### Risk: Complex frontend logic becomes unmaintainable
**Mitigation**:
- Config-driven approach
- Reusable field components
- Comprehensive documentation
- Code reviews and refactoring

### Risk: Vendor confusion with new form fields
**Mitigation**:
- Clear field labels and help text
- Examples for each field
- Optional fields where possible
- Gradual rollout with vendor education

### Risk: Data inconsistency during migration
**Mitigation**:
- Thorough testing of migration scripts
- Backup before migration
- Rollback plan
- Gradual migration with monitoring

## Documentation Requirements

- [ ] API documentation for new endpoints
- [ ] Database schema documentation
- [ ] Frontend component documentation
- [ ] Vendor guide for creating category-specific listings
- [ ] Migration guide for existing vendors
- [ ] Admin guide for managing category configurations

