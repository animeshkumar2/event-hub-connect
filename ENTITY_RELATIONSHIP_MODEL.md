# Entity Relationship Model

## Overview
This document describes the entity relationships in the Event Hub Connect platform.

## Core Entities

### 1. **Event Type** (Reference Data)
- **Type**: Enum/Constant
- **Values**: `['Wedding', 'Birthday', 'Anniversary', 'Corporate', 'Engagement', 'Baby Shower', 'Other']`
- **Purpose**: Defines the type of event a customer is planning
- **Relationships**: Many-to-Many with Packages and Listings

### 2. **Category** (Reference Data)
- **Type**: Enum/Constant
- **Values**: `['photographer', 'cinematographer', 'decorator', 'dj', 'sound-lights', 'mua', 'caterer', 'return-gifts', 'invitations', 'live-music', 'anchors', 'event-coordinator', 'other']`
- **Purpose**: Defines the service category
- **Important**: There is ONE category system, but categories are assigned at TWO levels:

#### **Category Assignment Levels:**

1. **Vendor Category** (`vendor.category`):
   - Vendor's PRIMARY business category
   - Required field
   - Example: A vendor registered as "photographer"
   - Used for: Vendor discovery, vendor profile categorization

2. **Item Category** (`package.category` or `listing.category`):
   - Category assigned to individual packages/listings
   - Used for filtering on search page
   - **CRITICAL**: When filtering by category, we filter by ITEM category, NOT vendor category

#### **Category Rules:**

**For Packages:**
- `package.category` is OPTIONAL
- If not set, defaults to `vendor.category`
- Can override vendor category (e.g., photographer vendor creates a decorator package)
- Used for filtering: `pkg.category || vendor.category`

**For Listings:**
- `listing.category` is REQUIRED
- Must be `vendor.category` OR `'other'`
- Cannot be a different category (enforced by `validateListingCategory()`)
- Used for filtering: `listing.category` (explicit, no fallback)

- **Relationships**: 
  - One-to-Many with Vendors (vendor has one primary category)
  - Many-to-Many with Packages (package can have its own category)
  - Many-to-Many with Listings (listing must match vendor category or be 'other')

### 3. **Vendor** (Core Entity)
```typescript
interface Vendor {
  id: string;
  businessName: string;
  category: string;              // Primary category (required)
  city: string;
  // ... other fields
  packages: Package[];           // One-to-Many relationship (Packages are a type of Listing)
  listings?: Listing[];           // One-to-Many relationship (Individual listings)
  reviews: Review[];              // One-to-Many relationship
  faqs: FAQ[];                   // One-to-Many relationship
  availability: AvailabilitySlot[]; // One-to-Many relationship
  bookableSetups?: BookableSetup[]; // One-to-Many relationship (optional)
}
```

**Conceptual Model**: 
- Vendor has **Listings** (general term)
- Listings can be of two types:
  - **Packages** (`packages` array): Bundles with includedItems, addOns, etc.
  - **Individual Listings** (`listings` array): Single items/services

**Relationships:**
- **Vendor → Category**: Many-to-One (vendor belongs to one primary category)
- **Vendor → Packages**: One-to-Many (vendor can have multiple packages - packages are a type of listing)
- **Vendor → Individual Listings**: One-to-Many (vendor can have multiple individual listings)
- **Vendor → Reviews**: One-to-Many (vendor can have multiple reviews)
- **Vendor → FAQs**: One-to-Many (vendor can have multiple FAQs)
- **Vendor → Availability**: One-to-Many (vendor has multiple availability slots)
- **Vendor → BookableSetups**: One-to-Many (vendor can have multiple bookable setups)

### 4. **Listing** (Core Entity - Parent Concept)
**Conceptual Model**: A Listing is a general term for any item a vendor offers. It can be either:
- **Individual Listing**: Single item/service (e.g., "Professional Camera Rental", "Premium Chairs")
- **Package**: Bundle of items/services (e.g., "Classic Wedding Package", "Pre-Wedding Shoot")

```typescript
interface Listing {
  id: string;
  vendorId: string;              // Foreign Key to Vendor
  name: string;
  price: number;
  category: string;              // Required: must match vendor.category or be 'other'
  eventTypes?: string[];         // Many-to-Many with EventType
  type: 'listing' | 'package';   // Discriminator: identifies if it's individual or package
  // ... other fields
}
```

**For Individual Listings** (`type: 'listing'`):
```typescript
interface IndividualListing extends Listing {
  type: 'listing';
  unit?: string;                 // e.g., "per piece", "per set", "per hour"
  minimumQuantity?: number;     // Minimum order quantity
  deliveryTime?: string;
  extraCharges?: string[];
}
```

**For Packages** (`type: 'package'`):
```typescript
interface Package extends Listing {
  type: 'package';
  includedItems: string[];       // What's included in the package
  excludedItems: string[];       // What's NOT included
  deliveryTime: string;           // When deliverables will be ready
  extraCharges?: string[];       // Additional charges
  addOns: AddOn[];               // One-to-Many relationship
  bookableSetup?: string;        // Optional reference to BookableSetup
}
```

**Relationships:**
- **Listing → Vendor**: Many-to-One (listing belongs to one vendor)
- **Listing → Category**: Many-to-One (listing must match vendor.category or be 'other')
- **Listing → EventType**: Many-to-Many (listing can be suitable for multiple event types)
- **Package → AddOn**: One-to-Many (package can have multiple add-ons)
- **Package → BookableSetup**: Many-to-One (optional, package can reference a bookable setup)

**Note**: In the current implementation, we have separate `Package` and `Listing` interfaces for backward compatibility, but conceptually:
- **Package IS a type of Listing** (with additional fields like `includedItems`, `addOns`)
- **Individual Listing IS a type of Listing** (simpler, single-item focus)

### 6. **AddOn** (Sub-Entity)
```typescript
interface AddOn {
  id: string;
  packageId: string;             // Foreign Key to Package
  title: string;
  price: number;
  // ... other fields
}
```

**Relationships:**
- **AddOn → Package**: Many-to-One (add-on belongs to one package)

### 7. **Review** (Sub-Entity)
```typescript
interface Review {
  id: string;
  userId: string;                // Foreign Key to User (not defined in current model)
  vendorId: string;              // Implicit: belongs to vendor
  rating: number;
  eventType?: string;            // Optional: event type for which review was given
  // ... other fields
}
```

**Relationships:**
- **Review → Vendor**: Many-to-One (review belongs to one vendor)
- **Review → EventType**: Many-to-One (optional, review can be for specific event type)

### 8. **BookableSetup** (Sub-Entity)
```typescript
interface BookableSetup {
  id: string;
  vendorId: string;              // Foreign Key to Vendor
  category: string;              // Must match vendor.category
  // ... other fields
}
```

**Relationships:**
- **BookableSetup → Vendor**: Many-to-One (setup belongs to one vendor)
- **BookableSetup → Category**: Many-to-One (setup belongs to one category)

### 9. **CartItem** (Transaction Entity)
```typescript
interface CartItem {
  vendorId: string;              // Foreign Key to Vendor
  packageId: string;             // Foreign Key to Package
  addOns: AddOn[];               // References to AddOns
  // ... other fields
}
```

**Relationships:**
- **CartItem → Vendor**: Many-to-One
- **CartItem → Package**: Many-to-One
- **CartItem → AddOn**: Many-to-Many (cart item can have multiple add-ons)

## Filtering Flow (Event Type → Category → Listing)

**Note**: Both Packages and Individual Listings are types of Listings, so the filtering applies to both.

### Current Implementation:
1. **Event Type Filter** (First Level):
   - User selects an event type (e.g., "Wedding", "Corporate")
   - Only packages/listings with `eventTypes` array containing the selected event type are shown
   - **Strict Rule**: If eventType is provided, items MUST have `eventTypes` array and MUST include the eventType

2. **Category Filter** (Second Level):
   - User selects a category (e.g., "Photography", "Décor")
   - **IMPORTANT**: Filters by ITEM category (`package.category` or `listing.category`), NOT vendor category
   - Only items where `item.category === selectedCategory` are shown
   - **Strict Rule**: Exact match required, no fallbacks
   - For packages: Uses `package.category || vendor.category` (package category takes precedence)
   - For listings: Uses `listing.category` (explicit, required)

3. **Result**: Items that match BOTH eventType AND item category

### Example Flow:
```
User Journey:
1. Select Event Type: "Corporate"
2. Select Category: "Photography"
3. See Results:
   - All Listings (both packages and individual listings) where: 
     * eventTypes.includes("Corporate") 
     * AND listing.category === "photographer"

Note: We filter by ITEM category (listing.category), 
NOT vendor.category. This allows:
- Photographer vendor's packages to appear in Photography section
- Decorator vendor's individual listings to appear in Décor section
- Items are categorized independently of their vendor's primary category
```

### **Corrected Conceptual Model:**

```
Vendor: "Moments Photography Studio"
├── vendor.category = "photographer"  ← Vendor's primary category
│
├── Listing (type: 'package'): "Classic Wedding Package"
│   ├── listing.category = "photographer"  ← Listing category
│   ├── listing.eventTypes = ["Wedding", "Engagement"]  ← Event types (can select multiple)
│   ├── includedItems: ["8 hours coverage", "2 photographers", ...]
│   └── addOns: [...]
│
├── Listing (type: 'package'): "Corporate Event Package"
│   ├── listing.category = "photographer"
│   ├── listing.eventTypes = ["Corporate"]
│   └── includedItems: [...]
│
└── Listing (type: 'listing'): "Professional Camera Rental"
    ├── listing.category = "photographer"
    ├── listing.eventTypes = ["Wedding", "Corporate"]  ← Can appear in multiple event types
    └── unit: "per day"
```

**Key Points**: 
1. **Package IS a subset/type of Listing** - Package is NOT a separate entity
2. **Listing hierarchy**: 
   - Listing (parent concept)
     - Package (type: 'package') - has includedItems, addOns, etc.
     - Individual Listing (type: 'listing') - simpler, single-item focus
3. **Both have**:
   - `category`: Photography, Décor, etc.
   - `eventTypes`: Can select multiple (Wedding, Corporate, Birthday, etc.)
4. **Filtering**: Event Type → Category → Listing (works for both packages and individual listings)

### **Key Distinction: Vendor Category vs Item Category**

**When filtering by "Category" on Search Page:**
- ✅ We use: `package.category` or `listing.category` (ITEM category)
- ❌ We do NOT use: `vendor.category` (VENDOR category)

**Why this matters:**
- A photographer vendor might create a package categorized as "decorator"
- That package would appear in Décor section, not Photography section
- The vendor's primary category is for vendor discovery, not item filtering

## Business Rules

### 1. **Vendor Category Rules**:
- Vendor has ONE primary category (e.g., "photographer")
- Vendor can create packages/listings in their own category OR "other" category
- System validates: `validateListingCategory(vendorCategory, listingCategory)`

### 2. **Package Category Rules**:
- Package can have its own `category` field
- If not specified, defaults to `vendor.category`
- Package category is used for filtering, NOT vendor category

### 3. **Listing Category Rules**:
- Listing MUST have `category` field
- Listing category MUST be `vendor.category` OR `'other'`
- System enforces this via `validateListingCategory()`

### 4. **Event Type Rules**:
- Both Packages and Listings can have `eventTypes` array
- `eventTypes` is optional but recommended
- If `eventTypes` is empty/undefined and eventType filter is active, item is excluded
- Multiple event types allowed: `['Wedding', 'Corporate', 'Birthday']`

### 5. **Filtering Priority**:
```
1. Event Type Filter (if eventType selected)
   ↓
2. Category Filter (if category selected)
   ↓
3. Other Filters (city, price, search query)
   ↓
4. Sorting
```

## Data Integrity Constraints

1. **Referential Integrity**:
   - `Package.vendorId` must exist in `Vendor.id`
   - `Listing.vendorId` must exist in `Vendor.id`
   - `AddOn.packageId` must exist in `Package.id`

2. **Category Integrity**:
   - `Vendor.category` must be valid category ID
   - `Package.category` (if set) must be valid category ID
   - `Listing.category` must be `vendor.category` OR `'other'`

3. **Event Type Integrity**:
   - `Package.eventTypes` array items must be valid event type strings
   - `Listing.eventTypes` array items must be valid event type strings

## Current Issues & Solutions

### Issue: Listings appearing in wrong event types
**Root Cause**: Filtering wasn't strict - items without `eventTypes` were still shown

**Solution**: 
- Made filtering strict: if `eventType` is provided, items MUST have `eventTypes` array
- Items without `eventTypes` are excluded when eventType filter is active
- Items must explicitly include the selected eventType in their `eventTypes` array

### Issue: Vendors couldn't select multiple event types
**Root Cause**: UI didn't support multi-select for event types

**Solution**:
- Added checkbox UI in VendorListings page
- Vendors can now select multiple event types
- Validation ensures at least one event type is selected

## Recommendations

1. **Database Schema** (if migrating to database):
   ```sql
   -- Many-to-Many: Package ↔ EventType
   CREATE TABLE package_event_types (
     package_id VARCHAR,
     event_type VARCHAR,
     PRIMARY KEY (package_id, event_type)
   );
   
   -- Many-to-Many: Listing ↔ EventType
   CREATE TABLE listing_event_types (
     listing_id VARCHAR,
     event_type VARCHAR,
     PRIMARY KEY (listing_id, event_type)
   );
   ```

2. **Data Validation**:
   - Enforce `eventTypes` array is not empty when creating packages/listings
   - Validate event type strings against `eventTypes` constant
   - Validate category strings against `categories` constant

3. **Indexing** (for performance):
   - Index on `Package.vendorId`
   - Index on `Listing.vendorId`
   - Index on `Package.category`
   - Index on `Listing.category`
   - Index on `Package.eventTypes` (if using array search)
   - Index on `Listing.eventTypes` (if using array search)



Database schema (simplified)
Tables
event_types
   id | name   ---|----------   1  | Wedding   2  | Birthday   3  | Death Rite
categories
 
   id | name         | display_name   ---|-------------|-------------   1  | photographer | Photography   2  | decorator    | Décor   3  | mua          | Makeup/Stylist
event_type_categories (junction table)
   event_type_id | category_id   --------------|------------   1 (Wedding)   | 1 (photographer) ✅   1 (Wedding)   | 2 (decorator) ✅   1 (Wedding)   | 3 (mua) ✅   2 (Birthday)  | 1 (photographer) ✅   2 (Birthday)  | 2 (decorator) ✅   2 (Birthday)  | 3 (mua) ❌ NOT ALLOWED   3 (Death Rite)| 2 (decorator) ✅   3 (Death Rite)| 3 (mua) ❌ NOT ALLOWED
vendors
   id | business_name        | category_id   ---|---------------------|------------   v1 | Moments Photography  | 1 (photographer)   v2 | Glamour Studio      | 3 (mua)
listings
   id | vendor_id | name                    | category_id | type   ---|-----------|------------------------|-------------|------   p1 | v1        | Classic Wedding Package | 1 (photographer) | package   l1 | v1        | Camera Rental          | 1 (photographer) | listing   l2 | v2        | Hair Styling Service   | 3 (mua)     | listing
listing_event_types (junction table)
   listing_id | event_type_id   -----------|---------------   p1         | 1 (Wedding)   p1         | 4 (Engagement)   l1         | 1 (Wedding)   l1         | 5 (Corporate)   l2         | 1 (Wedding)   l2         | 2 (Birthday)  ← But mua not allowed for Birthday!
