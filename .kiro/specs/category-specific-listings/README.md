# Category-Specific Listing Forms - Spec

## Overview

This spec defines the implementation of dynamic listing forms that adapt based on vendor category, enabling category-specific pricing models and business requirements.

## Problem

The current generic listing form doesn't capture the unique requirements of different vendor categories:
- Catering needs per-plate pricing with guest counts
- Photography needs deliverables and team composition
- Venues need capacity and amenities
- Each category has different pricing models and required fields

## Solution

Implement a hybrid approach with:
- **Base fields** for all listings (name, description, images, base price)
- **Category-specific fields** stored as JSONB in database
- **Dynamic form rendering** based on category selection
- **Multiple pricing models** (per-plate, per-hour, per-event, per-day, etc.)

## Documents

1. **[requirements.md](./requirements.md)** - User stories, acceptance criteria, technical approach
2. **[field-schemas.md](./field-schemas.md)** - Detailed field definitions for each category
3. **[implementation-guide.md](./implementation-guide.md)** - Step-by-step implementation instructions

## Key Features

- ✅ Dynamic form fields based on category
- ✅ Multiple pricing models support
- ✅ Category-specific search and filtering
- ✅ Backward compatible with existing listings
- ✅ Scalable config-driven architecture

## Priority Categories (Phase 1)

1. Catering - Per-plate pricing
2. Photography & Videography - Per-event pricing
3. Venue - Per-day pricing

## Additional Categories (Phase 2)

4. Décor - Per-setup pricing
5. Makeup & Styling - Per-person pricing
6. DJ & Entertainment - Per-hour pricing
7. Sound & Lights - Per-day pricing

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- Database schema changes
- Backend API endpoints
- Frontend dynamic form components

### Phase 2: Priority Categories (Week 2)
- Implement Catering, Photography, Venue
- Field configurations and validation
- Display logic updates

### Phase 3: Additional Categories (Week 3)
- Implement remaining categories
- Category-specific templates

### Phase 4: Search & Filter (Week 4)
- Category-specific filters
- Enhanced search functionality
- Comparison features

### Phase 5: Migration & Testing (Week 5)
- Data migration for existing listings
- Performance testing
- User acceptance testing

## Technical Stack

**Backend:**
- PostgreSQL JSONB for category-specific data
- Spring Boot REST API
- JPA/Hibernate for ORM

**Frontend:**
- React with TypeScript
- Dynamic form rendering
- shadcn/ui components

## Success Metrics

- 80% of new listings include category-specific data within 1 month
- 30% increase in listing detail page engagement
- 20% reduction in quote clarification questions
- < 200ms query performance for category-specific searches

## Next Steps

1. Review and approve this spec
2. Prioritize which categories to implement first
3. Begin Phase 1 implementation
4. Set up monitoring and analytics

## Status

**Current Status**: Draft - Awaiting Review

**Created**: 2026-01-20

**Last Updated**: 2026-01-20

