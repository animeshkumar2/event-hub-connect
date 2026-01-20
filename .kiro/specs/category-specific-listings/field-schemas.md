---
title: Category Field Schemas
status: draft
---

# Category Field Schemas

Detailed field definitions for each vendor category.

## Schema Format

```typescript
interface FieldSchema {
  name: string;              // Field identifier
  label: string;             // Display label
  type: FieldType;           // Input type
  required: boolean;         // Is field required
  placeholder?: string;      // Placeholder text
  helpText?: string;         // Help text below field
  unit?: string;             // Unit display (e.g., "₹", "hours")
  min?: number;              // Min value for numbers
  max?: number;              // Max value for numbers
  options?: string[];        // Options for select/multiselect
  defaultValue?: any;        // Default value
  validation?: ValidationRule[];
}

type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio';
```


## 1. Catering

**Pricing Model**: `per_plate`

### Fields

```json
[
  {
    "name": "cuisineType",
    "label": "Cuisine Type",
    "type": "select",
    "required": true,
    "options": [
      "North Indian",
      "South Indian",
      "Chinese",
      "Continental",
      "Italian",
      "Mexican",
      "Thai",
      "Multi-Cuisine",
      "Other"
    ],
    "helpText": "Primary cuisine style you specialize in"
  },
  {
    "name": "serviceStyle",
    "label": "Service Style",
    "type": "select",
    "required": true,
    "options": [
      "Buffet",
      "Plated Service",
      "Family Style",
      "Cocktail Style",
      "Food Stations"
    ]
  },
  {
    "name": "pricePerPlateVeg",
    "label": "Price per Plate (Vegetarian)",
    "type": "number",
    "required": true,
    "unit": "₹",
    "min": 100,
    "helpText": "Price per vegetarian plate"
  },
  {
    "name": "pricePerPlateNonVeg",
    "label": "Price per Plate (Non-Vegetarian)",
    "type": "number",
    "required": false,
    "unit": "₹",
    "min": 100,
    "helpText": "Leave empty if you don't offer non-veg"
  },
  {
    "name": "minGuests",
    "label": "Minimum Guest Count",
    "type": "number",
    "required": true,
    "min": 1,
    "helpText": "Minimum number of guests you cater for"
  },
  {
    "name": "maxGuests",
    "label": "Maximum Guest Count",
    "type": "number",
    "required": false,
    "min": 1,
    "helpText": "Maximum capacity (leave empty for no limit)"
  },
  {
    "name": "menuItems",
    "label": "Menu Items",
    "type": "textarea",
    "required": true,
    "placeholder": "e.g., 4 starters, 3 main courses, 2 breads, rice, dessert",
    "helpText": "List what's included in the menu"
  },
  {
    "name": "includes",
    "label": "What's Included",
    "type": "multiselect",
    "required": false,
    "options": [
      "Servers/Waiters",
      "Crockery & Cutlery",
      "Tables & Chairs",
      "Setup & Decoration",
      "Cleanup Service",
      "Mineral Water",
      "Welcome Drinks"
    ]
  },
  {
    "name": "liveCounters",
    "label": "Live Counters Available",
    "type": "checkbox",
    "required": false,
    "helpText": "Do you offer live cooking stations?"
  },
  {
    "name": "liveCounterTypes",
    "label": "Live Counter Types",
    "type": "multiselect",
    "required": false,
    "options": [
      "Chaat Counter",
      "Dosa Counter",
      "Pasta Counter",
      "Grill Counter",
      "Dessert Counter"
    ],
    "helpText": "Select if live counters are available"
  }
]
```


## 2. Photography & Videography

**Pricing Model**: `per_event` or `per_hour`

### Fields

```json
[
  {
    "name": "serviceType",
    "label": "Service Type",
    "type": "select",
    "required": true,
    "options": [
      "Photography Only",
      "Videography Only",
      "Both Photography & Videography"
    ]
  },
  {
    "name": "pricingType",
    "label": "Pricing Type",
    "type": "radio",
    "required": true,
    "options": ["Per Hour", "Per Event"],
    "defaultValue": "Per Event"
  },
  {
    "name": "durationHours",
    "label": "Duration (Hours)",
    "type": "number",
    "required": false,
    "min": 1,
    "max": 24,
    "helpText": "For hourly pricing or package duration"
  },
  {
    "name": "teamSize",
    "label": "Team Composition",
    "type": "text",
    "required": true,
    "placeholder": "e.g., 2 photographers + 1 videographer",
    "helpText": "Describe your team size and roles"
  },
  {
    "name": "editedPhotos",
    "label": "Number of Edited Photos",
    "type": "number",
    "required": true,
    "min": 0,
    "helpText": "How many edited photos will be delivered"
  },
  {
    "name": "rawPhotos",
    "label": "Raw Photos Included",
    "type": "checkbox",
    "required": false,
    "helpText": "Will you provide unedited raw photos?"
  },
  {
    "name": "highlightVideo",
    "label": "Highlight Video Included",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "highlightVideoMinutes",
    "label": "Highlight Video Duration (Minutes)",
    "type": "number",
    "required": false,
    "min": 1,
    "max": 30
  },
  {
    "name": "fullVideo",
    "label": "Full Event Video Included",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "fullVideoMinutes",
    "label": "Full Video Duration (Minutes)",
    "type": "number",
    "required": false,
    "min": 1
  },
  {
    "name": "droneIncluded",
    "label": "Drone Coverage Included",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "albumIncluded",
    "label": "Physical Album Included",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "albumPages",
    "label": "Album Pages",
    "type": "number",
    "required": false,
    "min": 10,
    "helpText": "Number of pages in the album"
  },
  {
    "name": "deliveryDays",
    "label": "Delivery Timeline (Days)",
    "type": "number",
    "required": true,
    "min": 1,
    "helpText": "How many days to deliver final photos/videos"
  },
  {
    "name": "preWeddingIncluded",
    "label": "Pre-Wedding Shoot Included",
    "type": "checkbox",
    "required": false
  }
]
```


## 3. Venue

**Pricing Model**: `per_day` or `per_hour`

### Fields

```json
[
  {
    "name": "venueType",
    "label": "Venue Type",
    "type": "select",
    "required": true,
    "options": [
      "Banquet Hall",
      "Lawn/Garden",
      "Farmhouse",
      "Hotel",
      "Resort",
      "Terrace",
      "Beach",
      "Heritage Property",
      "Other"
    ]
  },
  {
    "name": "pricingType",
    "label": "Pricing Type",
    "type": "radio",
    "required": true,
    "options": ["Per Day", "Per Hour"],
    "defaultValue": "Per Day"
  },
  {
    "name": "capacitySeating",
    "label": "Seating Capacity",
    "type": "number",
    "required": true,
    "min": 10,
    "helpText": "Maximum guests with seating arrangement"
  },
  {
    "name": "capacityStanding",
    "label": "Standing Capacity",
    "type": "number",
    "required": false,
    "min": 10,
    "helpText": "Maximum guests for cocktail/standing events"
  },
  {
    "name": "areaSquareFeet",
    "label": "Area (Square Feet)",
    "type": "number",
    "required": false,
    "min": 100,
    "unit": "sq ft"
  },
  {
    "name": "amenities",
    "label": "Amenities Included",
    "type": "multiselect",
    "required": false,
    "options": [
      "Air Conditioning",
      "Parking",
      "Valet Parking",
      "Power Backup",
      "Restrooms",
      "Green Room",
      "Stage",
      "Dance Floor",
      "WiFi",
      "Sound System",
      "Projector"
    ]
  },
  {
    "name": "parkingCapacity",
    "label": "Parking Capacity (Vehicles)",
    "type": "number",
    "required": false,
    "min": 0
  },
  {
    "name": "cateringPolicy",
    "label": "Catering Policy",
    "type": "select",
    "required": true,
    "options": [
      "In-house Only",
      "Outside Allowed",
      "Both Options Available"
    ]
  },
  {
    "name": "alcoholPolicy",
    "label": "Alcohol Policy",
    "type": "select",
    "required": true,
    "options": [
      "Allowed",
      "Not Allowed",
      "Allowed with License"
    ]
  },
  {
    "name": "timingStart",
    "label": "Available From (Time)",
    "type": "text",
    "required": false,
    "placeholder": "e.g., 09:00 AM",
    "helpText": "Earliest booking time"
  },
  {
    "name": "timingEnd",
    "label": "Available Until (Time)",
    "type": "text",
    "required": false,
    "placeholder": "e.g., 02:00 AM",
    "helpText": "Latest event end time"
  },
  {
    "name": "overnightAllowed",
    "label": "Overnight Events Allowed",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "peakSeasonSurcharge",
    "label": "Peak Season Surcharge (%)",
    "type": "number",
    "required": false,
    "min": 0,
    "max": 100,
    "helpText": "Additional charge during peak season"
  },
  {
    "name": "advanceBookingDays",
    "label": "Minimum Advance Booking (Days)",
    "type": "number",
    "required": false,
    "min": 0,
    "defaultValue": 30
  }
]
```


## 4. Décor

**Pricing Model**: `per_setup`

### Fields

```json
[
  {
    "name": "decorType",
    "label": "Décor Type",
    "type": "multiselect",
    "required": true,
    "options": [
      "Stage Decoration",
      "Entrance Decoration",
      "Full Venue Decoration",
      "Mandap Decoration",
      "Photo Booth",
      "Ceiling Draping",
      "Table Centerpieces",
      "Aisle Decoration"
    ]
  },
  {
    "name": "theme",
    "label": "Theme Style",
    "type": "select",
    "required": false,
    "options": [
      "Traditional",
      "Modern",
      "Floral",
      "Minimalist",
      "Royal",
      "Rustic",
      "Beach",
      "Vintage",
      "Contemporary",
      "Custom"
    ]
  },
  {
    "name": "coverageArea",
    "label": "Coverage Area (Square Feet)",
    "type": "number",
    "required": false,
    "min": 10,
    "unit": "sq ft",
    "helpText": "Area covered by decoration"
  },
  {
    "name": "includes",
    "label": "What's Included",
    "type": "multiselect",
    "required": false,
    "options": [
      "Fresh Flowers",
      "Artificial Flowers",
      "Drapes & Fabrics",
      "Lighting",
      "Props",
      "Furniture",
      "Backdrop",
      "Entrance Arch",
      "Ceiling Decoration"
    ]
  },
  {
    "name": "stageBackdrop",
    "label": "Stage Backdrop Included",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "entranceArch",
    "label": "Entrance Arch Included",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "ceilingDraping",
    "label": "Ceiling Draping Included",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "tableCenterpieces",
    "label": "Number of Table Centerpieces",
    "type": "number",
    "required": false,
    "min": 0
  },
  {
    "name": "aisleDecoration",
    "label": "Aisle Decoration Included",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "setupTimeHours",
    "label": "Setup Time (Hours)",
    "type": "number",
    "required": false,
    "min": 1,
    "helpText": "Time needed before event to setup"
  },
  {
    "name": "dismantlingIncluded",
    "label": "Dismantling Included",
    "type": "checkbox",
    "required": false,
    "defaultValue": true
  },
  {
    "name": "customizationAvailable",
    "label": "Customization Available",
    "type": "checkbox",
    "required": false,
    "helpText": "Can customers request custom designs?"
  }
]
```


## 5. Makeup & Styling

**Pricing Model**: `per_person`

### Fields

```json
[
  {
    "name": "serviceFor",
    "label": "Service For",
    "type": "multiselect",
    "required": true,
    "options": [
      "Bride",
      "Groom",
      "Family Members",
      "Guests"
    ]
  },
  {
    "name": "servicesIncluded",
    "label": "Services Included",
    "type": "multiselect",
    "required": true,
    "options": [
      "Makeup",
      "Hair Styling",
      "Saree Draping",
      "Jewelry Setting",
      "Nail Art",
      "Mehendi"
    ]
  },
  {
    "name": "makeupType",
    "label": "Makeup Type",
    "type": "select",
    "required": true,
    "options": [
      "HD Makeup",
      "Airbrush Makeup",
      "Traditional Makeup",
      "Mineral Makeup"
    ]
  },
  {
    "name": "productsUsed",
    "label": "Products/Brands Used",
    "type": "text",
    "required": false,
    "placeholder": "e.g., MAC, Huda Beauty, Bobbi Brown",
    "helpText": "Brands you use for makeup"
  },
  {
    "name": "numberOfLooks",
    "label": "Number of Looks (for Bride)",
    "type": "number",
    "required": false,
    "min": 1,
    "max": 5,
    "helpText": "Different makeup looks for different events"
  },
  {
    "name": "trialIncluded",
    "label": "Trial Session Included",
    "type": "checkbox",
    "required": false
  },
  {
    "name": "trialPrice",
    "label": "Trial Session Price",
    "type": "number",
    "required": false,
    "unit": "₹",
    "helpText": "Leave empty if trial is included"
  },
  {
    "name": "travelIncludedKm",
    "label": "Travel Included (Kilometers)",
    "type": "number",
    "required": false,
    "min": 0,
    "helpText": "Free travel within this distance"
  },
  {
    "name": "travelChargePerKm",
    "label": "Travel Charge Beyond (₹/km)",
    "type": "number",
    "required": false,
    "min": 0
  },
  {
    "name": "touchupHours",
    "label": "Touch-up Service (Hours)",
    "type": "number",
    "required": false,
    "min": 0,
    "helpText": "How long you'll stay for touch-ups"
  },
  {
    "name": "bridalPrice",
    "label": "Bridal Makeup Price",
    "type": "number",
    "required": true,
    "unit": "₹"
  },
  {
    "name": "familyPrice",
    "label": "Family Makeup Price (per person)",
    "type": "number",
    "required": false,
    "unit": "₹"
  },
  {
    "name": "guestPrice",
    "label": "Guest Makeup Price (per person)",
    "type": "number",
    "required": false,
    "unit": "₹"
  }
]
```


## 6. DJ & Entertainment

**Pricing Model**: `per_hour` or `per_event`

### Fields

```json
[
  {
    "name": "serviceType",
    "label": "Service Type",
    "type": "select",
    "required": true,
    "options": [
      "DJ",
      "Live Band",
      "Anchor/Emcee",
      "Dancer/Performer",
      "DJ + Anchor",
      "DJ + Dancers"
    ]
  },
  {
    "name": "pricingType",
    "label": "Pricing Type",
    "type": "radio",
    "required": true,
    "options": ["Per Hour", "Per Event"],
    "defaultValue": "Per Event"
  },
  {
    "name": "durationHours",
    "label": "Duration (Hours)",
    "type": "number",
    "required": true,
    "min": 1,
    "max": 24
  },
  {
    "name": "equipmentIncluded",
    "label": "Equipment Included",
    "type": "multiselect",
    "required": false,
    "options": [
      "Sound System",
      "LED Lighting",
      "Dance Floor Lighting",
      "LED Screen",
      "Smoke Machine",
      "Wireless Microphones",
      "Mixer Console"
    ]
  },
  {
    "name": "soundSystemWattage",
    "label": "Sound System Power (Watts)",
    "type": "number",
    "required": false,
    "min": 1000,
    "unit": "W"
  },
  {
    "name": "musicGenre",
    "label": "Music Genres",
    "type": "multiselect",
    "required": false,
    "options": [
      "Bollywood",
      "EDM",
      "Retro",
      "Classical",
      "Punjabi",
      "Hip Hop",
      "House",
      "Commercial",
      "Regional"
    ]
  },
  {
    "name": "customPlaylist",
    "label": "Custom Playlist Accepted",
    "type": "checkbox",
    "required": false,
    "defaultValue": true
  },
  {
    "name": "teamSize",
    "label": "Team Size",
    "type": "number",
    "required": false,
    "min": 1,
    "helpText": "Number of team members"
  },
  {
    "name": "setupTimeHours",
    "label": "Setup Time Required (Hours)",
    "type": "number",
    "required": false,
    "min": 1,
    "helpText": "Time needed before event"
  },
  {
    "name": "extraHourPrice",
    "label": "Extra Hour Price",
    "type": "number",
    "required": false,
    "unit": "₹",
    "helpText": "Price for additional hours beyond package"
  }
]
```


## 7. Sound & Lights

**Pricing Model**: `per_day`

### Fields

```json
[
  {
    "name": "equipmentType",
    "label": "Equipment Type",
    "type": "multiselect",
    "required": true,
    "options": [
      "Sound System",
      "LED Par Lights",
      "Moving Head Lights",
      "Laser Lights",
      "Follow Spot",
      "Stage Lighting",
      "Architectural Lighting",
      "Microphones",
      "Mixer Console",
      "Amplifiers"
    ]
  },
  {
    "name": "coverageArea",
    "label": "Coverage Area (Square Feet)",
    "type": "number",
    "required": false,
    "min": 100,
    "unit": "sq ft"
  },
  {
    "name": "powerRequirement",
    "label": "Power Requirement (KW)",
    "type": "number",
    "required": false,
    "min": 1,
    "unit": "KW"
  },
  {
    "name": "teamSize",
    "label": "Number of Technicians",
    "type": "number",
    "required": false,
    "min": 1,
    "helpText": "Technicians included in package"
  },
  {
    "name": "setupIncluded",
    "label": "Setup Included",
    "type": "checkbox",
    "required": false,
    "defaultValue": true
  },
  {
    "name": "dismantlingIncluded",
    "label": "Dismantling Included",
    "type": "checkbox",
    "required": false,
    "defaultValue": true
  },
  {
    "name": "durationDays",
    "label": "Duration (Days)",
    "type": "number",
    "required": true,
    "min": 1,
    "defaultValue": 1
  },
  {
    "name": "extraDayPrice",
    "label": "Extra Day Price",
    "type": "number",
    "required": false,
    "unit": "₹"
  }
]
```

## Category-Pricing Model Mapping

```typescript
const CATEGORY_PRICING_MODELS = {
  'caterer': 'per_plate',
  'photographer': 'per_event',
  'cinematographer': 'per_event',
  'videographer': 'per_event',
  'venue': 'per_day',
  'decorator': 'per_setup',
  'mua': 'per_person',
  'dj': 'per_hour',
  'live-music': 'per_event',
  'sound-lights': 'per_day'
};
```

## Validation Rules

### Cross-Field Validation

1. **Catering**: If `pricePerPlateNonVeg` is provided, it must be >= `pricePerPlateVeg`
2. **Photography**: If `highlightVideo` is checked, `highlightVideoMinutes` is required
3. **Venue**: `capacityStanding` should be >= `capacitySeating`
4. **Makeup**: If `trialIncluded` is false, `trialPrice` should be provided
5. **DJ**: If `pricingType` is "Per Hour", `extraHourPrice` is recommended

