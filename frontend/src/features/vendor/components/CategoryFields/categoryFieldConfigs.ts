// Category field configurations (frontend-only for now)
// This will eventually come from the backend API

export interface FieldSchema {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'radio';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  unit?: string;
  min?: number;
  max?: number;
  options?: string[];
  defaultValue?: any;
  dependsOn?: string; // Field only shows if this field has a truthy value
  dependsOnValue?: string | string[]; // Specific value(s) that should show this field
  fullWidth?: boolean; // Take full width in grid
}

export interface CategoryConfig {
  categoryId: string;
  pricingModel: string;
  fields: FieldSchema[];
  showPackageDetails?: boolean; // Whether to show inclusions/exclusions section
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'caterer': {
    categoryId: 'caterer',
    pricingModel: 'per_plate',
    showPackageDetails: true, // Enable package details section
    fields: [
      {
        name: 'pricePerPlateVeg',
        label: 'Price per Plate (Vegetarian)',
        type: 'number',
        required: true,
        unit: '₹',
        min: 100,
        helpText: 'This is your base price - price per vegetarian plate'
      },
      {
        name: 'pricePerPlateNonVeg',
        label: 'Price per Plate (Non-Vegetarian)',
        type: 'number',
        required: false,
        unit: '₹',
        min: 100,
        helpText: "Leave empty if you don't offer non-veg"
      },
      {
        name: 'cuisineType',
        label: 'Cuisine Types',
        type: 'multiselect',
        required: true,
        options: ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Italian', 'Mexican', 'Thai', 'Multi-Cuisine'],
        placeholder: 'e.g., Punjabi, Bengali, Gujarati',
        helpText: 'Select all cuisine styles you offer in this package',
        fullWidth: true
      },
      {
        name: 'serviceStyle',
        label: 'Service Style',
        type: 'select',
        required: true,
        options: ['Buffet', 'Plated Service', 'Family Style', 'Cocktail Style', 'Food Stations']
      },
      {
        name: 'minGuests',
        label: 'Minimum Guest Count',
        type: 'number',
        required: true,
        min: 1,
        helpText: 'Minimum number of guests you cater for'
      },
      {
        name: 'maxGuests',
        label: 'Maximum Guest Count',
        type: 'number',
        required: false,
        min: 1,
        helpText: 'Maximum capacity (leave empty for no limit)'
      },
      {
        name: 'menuItems',
        label: 'Menu Items',
        type: 'textarea',
        required: true,
        placeholder: 'e.g., 4 starters, 3 main courses, 2 breads, rice, dessert',
        helpText: "List what's included in the menu",
        fullWidth: true
      },
      {
        name: 'includes',
        label: "What's Included",
        type: 'multiselect',
        required: false,
        options: ['Servers/Waiters', 'Crockery & Cutlery', 'Tables & Chairs', 'Setup & Decoration', 'Cleanup Service', 'Mineral Water', 'Welcome Drinks'],
        placeholder: 'e.g., Buffet Warmers, Serving Trays',
        fullWidth: true
      },
      {
        name: 'liveCounters',
        label: 'Live Counters Available',
        type: 'checkbox',
        required: false,
        helpText: 'Do you offer live cooking stations?'
      },
      {
        name: 'liveCounterTypes',
        label: 'Live Counter Types',
        type: 'multiselect',
        required: false,
        options: ['Chaat Counter', 'Dosa Counter', 'Pasta Counter', 'Grill Counter', 'Dessert Counter'],
        placeholder: 'e.g., Biryani Counter, Juice Bar',
        helpText: 'Select if live counters are available',
        dependsOn: 'liveCounters',
        fullWidth: true
      }
    ]
  },

  'photo-video': {
    categoryId: 'photo-video',
    pricingModel: 'per_event',
    showPackageDetails: true,
    fields: [
      {
        name: 'serviceType',
        label: 'Service Type',
        type: 'select',
        required: true,
        options: ['Photography Only', 'Videography Only', 'Both Photography & Videography']
      },
      {
        name: 'pricingType',
        label: 'Pricing Type',
        type: 'radio',
        required: true,
        options: ['Per Hour', 'Per Event'],
        defaultValue: 'Per Event',
        helpText: 'How do you charge for this service?'
      },
      {
        name: 'price',
        label: 'Price (₹)',
        type: 'number',
        required: true,
        unit: '₹',
        min: 1000,
        helpText: 'Your base price for this listing',
        fullWidth: false
      },
      {
        name: 'durationHours',
        label: 'Duration (Hours)',
        type: 'number',
        required: false,
        min: 1,
        max: 24,
        helpText: 'For hourly pricing or package duration',
        dependsOn: 'pricingType',
        dependsOnValue: 'Per Hour'
      },
      {
        name: 'teamSize',
        label: 'Team Composition',
        type: 'text',
        required: true,
        placeholder: 'e.g., 2 photographers + 1 videographer',
        helpText: 'Describe your team size and roles'
      },
      {
        name: 'editedPhotos',
        label: 'Number of Edited Photos',
        type: 'number',
        required: true,
        min: 0,
        helpText: 'How many edited photos will be delivered'
      },
      {
        name: 'rawPhotos',
        label: 'Raw Photos Included',
        type: 'checkbox',
        required: false,
        helpText: 'Will you provide unedited raw photos?'
      },
      {
        name: 'highlightVideo',
        label: 'Highlight Video Included',
        type: 'checkbox',
        required: false
      },
      {
        name: 'highlightVideoMinutes',
        label: 'Highlight Video Duration (Minutes)',
        type: 'number',
        required: false,
        min: 1,
        max: 30,
        dependsOn: 'highlightVideo'
      },
      {
        name: 'fullVideo',
        label: 'Full Event Video Included',
        type: 'checkbox',
        required: false
      },
      {
        name: 'fullVideoMinutes',
        label: 'Full Video Duration (Minutes)',
        type: 'number',
        required: false,
        min: 1,
        dependsOn: 'fullVideo'
      },
      {
        name: 'droneIncluded',
        label: 'Drone Coverage Included',
        type: 'checkbox',
        required: false
      },
      {
        name: 'albumIncluded',
        label: 'Physical Album Included',
        type: 'checkbox',
        required: false
      },
      {
        name: 'albumPages',
        label: 'Album Pages',
        type: 'number',
        required: false,
        min: 10,
        helpText: 'Number of pages in the album',
        dependsOn: 'albumIncluded'
      },
      {
        name: 'preWeddingIncluded',
        label: 'Pre-Wedding Shoot Included',
        type: 'checkbox',
        required: false
      }
    ]
  },

  'venue': {
    categoryId: 'venue',
    pricingModel: 'per_day',
    showPackageDetails: true,
    fields: [
      {
        name: 'venueType',
        label: 'Venue Type',
        type: 'select',
        required: true,
        options: ['Banquet Hall', 'Lawn/Garden', 'Farmhouse', 'Hotel', 'Resort', 'Terrace', 'Beach', 'Heritage Property', 'Other']
      },
      {
        name: 'pricingType',
        label: 'Pricing Type',
        type: 'radio',
        required: true,
        options: ['Per Day', 'Per Hour'],
        defaultValue: 'Per Day'
      },
      {
        name: 'price',
        label: 'Price (₹)',
        type: 'number',
        required: true,
        unit: '₹',
        min: 1000,
        helpText: 'Your base price for this listing',
        fullWidth: false
      },
      {
        name: 'capacitySeating',
        label: 'Seating Capacity',
        type: 'number',
        required: true,
        min: 10,
        helpText: 'Maximum guests with seating arrangement'
      },
      {
        name: 'capacityStanding',
        label: 'Standing Capacity',
        type: 'number',
        required: false,
        min: 10,
        helpText: 'Maximum guests for cocktail/standing events'
      },
      {
        name: 'areaSquareFeet',
        label: 'Area',
        type: 'number',
        required: false,
        min: 100,
        unit: 'sq ft'
      },
      {
        name: 'parkingCapacity',
        label: 'Parking Capacity (Vehicles)',
        type: 'number',
        required: false,
        min: 0
      },
      {
        name: 'amenities',
        label: 'Amenities Included',
        type: 'multiselect',
        required: false,
        options: ['Air Conditioning', 'Parking', 'Valet Parking', 'Power Backup', 'Restrooms', 'Green Room', 'Stage', 'Dance Floor', 'WiFi', 'Sound System', 'Projector'],
        placeholder: 'e.g., Elevator, Wheelchair Access',
        fullWidth: true
      },
      {
        name: 'cateringPolicy',
        label: 'Catering Policy',
        type: 'select',
        required: true,
        options: ['In-house Only', 'Outside Allowed', 'Both Options Available']
      },
      {
        name: 'alcoholPolicy',
        label: 'Alcohol Policy',
        type: 'select',
        required: true,
        options: ['Allowed', 'Not Allowed', 'Allowed with License']
      },
      {
        name: 'timingStart',
        label: 'Available From (Time)',
        type: 'text',
        required: false,
        placeholder: 'e.g., 09:00 AM',
        helpText: 'Earliest booking time'
      },
      {
        name: 'timingEnd',
        label: 'Available Until (Time)',
        type: 'text',
        required: false,
        placeholder: 'e.g., 02:00 AM',
        helpText: 'Latest event end time'
      },
      {
        name: 'overnightAllowed',
        label: 'Overnight Events Allowed',
        type: 'checkbox',
        required: false
      },
      {
        name: 'peakSeasonSurcharge',
        label: 'Peak Season Surcharge',
        type: 'number',
        required: false,
        min: 0,
        max: 100,
        unit: '%',
        helpText: 'Additional charge during peak season'
      }
    ]
  },

  'decorator': {
    categoryId: 'decorator',
    pricingModel: 'per_setup',
    showPackageDetails: true,
    fields: [
      {
        name: 'price',
        label: 'Price (₹)',
        type: 'number',
        required: true,
        unit: '₹',
        min: 1000,
        helpText: 'Your base price for this décor setup',
        fullWidth: false
      },
      {
        name: 'decorType',
        label: 'Décor Type',
        type: 'multiselect',
        required: true,
        options: ['Stage Decoration', 'Entrance Decoration', 'Full Venue Decoration', 'Mandap Decoration', 'Photo Booth', 'Ceiling Draping', 'Table Centerpieces', 'Aisle Decoration'],
        placeholder: 'e.g., Car Decoration, Mehendi Setup',
        fullWidth: true
      },
      {
        name: 'theme',
        label: 'Theme Style',
        type: 'select',
        required: false,
        options: ['Traditional', 'Modern', 'Floral', 'Minimalist', 'Royal', 'Rustic', 'Beach', 'Vintage', 'Contemporary', 'Custom']
      },
      {
        name: 'coverageArea',
        label: 'Coverage Area',
        type: 'number',
        required: false,
        min: 10,
        unit: 'sq ft',
        helpText: 'Area covered by decoration'
      },
      {
        name: 'tableCenterpieces',
        label: 'Number of Table Centerpieces',
        type: 'number',
        required: false,
        min: 0
      },
      {
        name: 'includes',
        label: "What's Included",
        type: 'multiselect',
        required: false,
        options: ['Fresh Flowers', 'Artificial Flowers', 'Drapes & Fabrics', 'Lighting', 'Props', 'Furniture', 'Backdrop', 'Entrance Arch', 'Ceiling Decoration'],
        placeholder: 'e.g., LED Name Board, Floral Chandelier',
        fullWidth: true
      },
      {
        name: 'stageBackdrop',
        label: 'Stage Backdrop Included',
        type: 'checkbox',
        required: false
      },
      {
        name: 'entranceArch',
        label: 'Entrance Arch Included',
        type: 'checkbox',
        required: false
      },
      {
        name: 'ceilingDraping',
        label: 'Ceiling Draping Included',
        type: 'checkbox',
        required: false
      },
      {
        name: 'aisleDecoration',
        label: 'Aisle Decoration Included',
        type: 'checkbox',
        required: false
      },
      {
        name: 'dismantlingIncluded',
        label: 'Dismantling Included',
        type: 'checkbox',
        required: false,
        defaultValue: true
      },
      {
        name: 'customizationAvailable',
        label: 'Customization Available',
        type: 'checkbox',
        required: false,
        helpText: 'Can customers request custom designs?'
      }
    ]
  },

  'mua': {
    categoryId: 'mua',
    pricingModel: 'per_person',
    showPackageDetails: true,
    fields: [
      {
        name: 'bridalPrice',
        label: 'Bridal Makeup Price (₹)',
        type: 'number',
        required: true,
        unit: '₹',
        helpText: 'This is your base/starting price for bridal makeup'
      },
      {
        name: 'familyPrice',
        label: 'Family Makeup Price (₹ per person)',
        type: 'number',
        required: false,
        unit: '₹',
        helpText: 'Price for family members makeup'
      },
      {
        name: 'guestPrice',
        label: 'Guest Makeup Price (₹ per person)',
        type: 'number',
        required: false,
        unit: '₹',
        helpText: 'Price for guest makeup'
      },
      {
        name: 'serviceFor',
        label: 'Service For',
        type: 'multiselect',
        required: true,
        options: ['Bride', 'Groom', 'Family Members', 'Guests'],
        placeholder: 'e.g., Bridesmaids, Flower Girls',
        fullWidth: true
      },
      {
        name: 'servicesIncluded',
        label: 'Services Included',
        type: 'multiselect',
        required: true,
        options: ['Makeup', 'Hair Styling', 'Saree Draping', 'Jewelry Setting', 'Nail Art', 'Mehendi'],
        placeholder: 'e.g., Eyelash Extensions, Facial',
        fullWidth: true
      },
      {
        name: 'makeupType',
        label: 'Makeup Type',
        type: 'select',
        required: true,
        options: ['HD Makeup', 'Airbrush Makeup', 'Traditional Makeup', 'Mineral Makeup']
      },
      {
        name: 'productsUsed',
        label: 'Products/Brands Used',
        type: 'text',
        required: false,
        placeholder: 'e.g., MAC, Huda Beauty, Bobbi Brown',
        helpText: 'Brands you use for makeup'
      },
      {
        name: 'numberOfLooks',
        label: 'Number of Looks (for Bride)',
        type: 'number',
        required: false,
        min: 1,
        max: 5,
        helpText: 'Different makeup looks for different events'
      },
      {
        name: 'touchupHours',
        label: 'Touch-up Service (Hours)',
        type: 'number',
        required: false,
        min: 0,
        helpText: "How long you'll stay for touch-ups"
      },
      {
        name: 'trialIncluded',
        label: 'Trial Session Included',
        type: 'checkbox',
        required: false
      },
      {
        name: 'trialPrice',
        label: 'Trial Session Price',
        type: 'number',
        required: false,
        unit: '₹',
        helpText: 'Leave empty if trial is included'
      },
      {
        name: 'travelIncludedKm',
        label: 'Travel Included',
        type: 'number',
        required: false,
        min: 0,
        unit: 'km',
        helpText: 'Free travel within this distance'
      },
      {
        name: 'travelChargePerKm',
        label: 'Travel Charge Beyond',
        type: 'number',
        required: false,
        min: 0,
        unit: '₹/km'
      }
    ]
  },

  'dj-entertainment': {
    categoryId: 'dj-entertainment',
    pricingModel: 'per_hour',
    showPackageDetails: true,
    fields: [
      {
        name: 'serviceType',
        label: 'Service Type',
        type: 'select',
        required: true,
        options: ['DJ', 'Live Band', 'Anchor/Emcee', 'Dancer/Performer', 'DJ + Anchor', 'DJ + Dancers']
      },
      {
        name: 'pricingType',
        label: 'Pricing Type',
        type: 'radio',
        required: true,
        options: ['Per Hour', 'Per Event'],
        defaultValue: 'Per Event'
      },
      {
        name: 'price',
        label: 'Price (₹)',
        type: 'number',
        required: true,
        unit: '₹',
        min: 1000,
        helpText: 'Your base price for this listing',
        fullWidth: false
      },
      {
        name: 'durationHours',
        label: 'Duration (Hours)',
        type: 'number',
        required: true,
        min: 1,
        max: 24
      },
      {
        name: 'equipmentIncluded',
        label: 'Equipment Included',
        type: 'multiselect',
        required: false,
        options: ['Sound System', 'LED Lighting', 'Dance Floor Lighting', 'LED Screen', 'Smoke Machine', 'Wireless Microphones', 'Mixer Console'],
        placeholder: 'e.g., Laser Show, CO2 Cannons',
        fullWidth: true
      },
      {
        name: 'soundSystemWattage',
        label: 'Sound System Power',
        type: 'number',
        required: false,
        min: 1000,
        unit: 'W'
      },
      {
        name: 'teamSize',
        label: 'Team Size',
        type: 'number',
        required: false,
        min: 1,
        helpText: 'Number of team members'
      },
      {
        name: 'musicGenre',
        label: 'Music Genres',
        type: 'multiselect',
        required: false,
        options: ['Bollywood', 'EDM', 'Retro', 'Classical', 'Punjabi', 'Hip Hop', 'House', 'Commercial', 'Regional'],
        placeholder: 'e.g., Sufi, Ghazals, Rock',
        fullWidth: true
      },
      {
        name: 'customPlaylist',
        label: 'Custom Playlist Accepted',
        type: 'checkbox',
        required: false,
        defaultValue: true
      },
      {
        name: 'extraHourPrice',
        label: 'Extra Hour Price',
        type: 'number',
        required: false,
        unit: '₹',
        helpText: 'Price for additional hours beyond package'
      }
    ]
  },

  'sound-lights': {
    categoryId: 'sound-lights',
    pricingModel: 'per_day',
    showPackageDetails: true,
    fields: [
      {
        name: 'price',
        label: 'Price per Day (₹)',
        type: 'number',
        required: true,
        unit: '₹',
        min: 1000,
        helpText: 'Your base price per day for this equipment',
        fullWidth: false
      },
      {
        name: 'equipmentType',
        label: 'Equipment Type',
        type: 'multiselect',
        required: true,
        options: ['Sound System', 'LED Par Lights', 'Moving Head Lights', 'Laser Lights', 'Follow Spot', 'Stage Lighting', 'Architectural Lighting', 'Microphones', 'Mixer Console', 'Amplifiers'],
        placeholder: 'e.g., Truss System, DMX Controller',
        fullWidth: true
      },
      {
        name: 'coverageArea',
        label: 'Coverage Area',
        type: 'number',
        required: false,
        min: 100,
        unit: 'sq ft'
      },
      {
        name: 'powerRequirement',
        label: 'Power Requirement',
        type: 'number',
        required: false,
        min: 1,
        unit: 'KW'
      },
      {
        name: 'teamSize',
        label: 'Number of Technicians',
        type: 'number',
        required: false,
        min: 1,
        helpText: 'Technicians included in package'
      },
      {
        name: 'durationDays',
        label: 'Duration (Days)',
        type: 'number',
        required: true,
        min: 1,
        defaultValue: 1
      },
      {
        name: 'setupIncluded',
        label: 'Setup Included',
        type: 'checkbox',
        required: false,
        defaultValue: true
      },
      {
        name: 'dismantlingIncluded',
        label: 'Dismantling Included',
        type: 'checkbox',
        required: false,
        defaultValue: true
      },
      {
        name: 'extraDayPrice',
        label: 'Extra Day Price',
        type: 'number',
        required: false,
        unit: '₹'
      }
    ]
  }
};

// Map core category IDs to their configs
export const getCategoryConfig = (categoryId: string): CategoryConfig | null => {
  // Handle photography-videography group
  if (categoryId === 'photography-videography') {
    return CATEGORY_CONFIGS['photographer'];
  }
  
  // Handle dj-entertainment group
  if (categoryId === 'dj-entertainment') {
    return CATEGORY_CONFIGS['dj'];
  }
  
  return CATEGORY_CONFIGS[categoryId] || null;
};
