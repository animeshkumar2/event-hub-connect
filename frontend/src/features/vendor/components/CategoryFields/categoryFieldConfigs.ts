// Category field configurations — trimmed to essentials

export interface FieldSchema {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'time' | 'deliveryTime';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  unit?: string;
  min?: number;
  max?: number;
  options?: string[];
  defaultValue?: any;
  dependsOn?: string;
  dependsOnValue?: string | string[];
  fullWidth?: boolean;
}

export interface CategoryConfig {
  categoryId: string;
  pricingModel: string;
  fields: FieldSchema[];
  showPackageDetails?: boolean;
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'caterer': {
    categoryId: 'caterer',
    pricingModel: 'per_plate',
    showPackageDetails: true,
    fields: [
      { name: 'foodType', label: 'Food Type', type: 'select', required: true, options: ['Veg', 'Non-Veg'], helpText: 'What type of food do you serve?' },
      { name: 'pricePerPlate', label: 'Price per Plate (₹)', type: 'number', required: true, unit: '₹', min: 100, helpText: 'Base price per plate' },
      { name: 'minGuests', label: 'Minimum Guests', type: 'number', required: true, min: 1, helpText: 'Minimum guests you cater for' },
      { name: 'minOrderPlates', label: 'Minimum Order (Plates)', type: 'number', required: true, min: 1, helpText: 'Minimum plates per booking' },
      { name: 'cuisineTypes', label: 'Cuisine Types', type: 'multiselect', required: true, fullWidth: true, options: ['North Indian','South Indian','Chinese','Continental','Italian','Mexican','Thai','Multi-Cuisine','Mughlai','Rajasthani','Bengali','Gujarati','Street Food'] },
      { name: 'serviceStyle', label: 'Service Style', type: 'multiselect', required: true, options: ['Buffet','Plated/Sit-down','Live Counters','Stall Setup','Home Delivery','Takeaway'] },
      { name: 'menuItems', label: 'Menu Items', type: 'textarea', required: true, fullWidth: true, placeholder: 'Add items from each course category', helpText: 'What dishes are included in this menu' },
      { name: 'includes', label: "What's Included", type: 'multiselect', required: false, fullWidth: true, options: ['Servers/Waiters','Crockery & Cutlery','Tables & Chairs','Setup & Cleanup','Buffet Warmers','Mineral Water','Chafing Dishes','Disposable Plates'] },
    ],
  },
  'photo-video': {
    categoryId: 'photo-video',
    pricingModel: 'per_event',
    showPackageDetails: true,
    fields: [
      { name: 'serviceType', label: 'Service Type', type: 'select', required: true, options: ['Photography Only', 'Videography Only', 'Both Photography & Videography'] },
      { name: 'pricingType', label: 'Pricing Type', type: 'radio', required: true, options: ['Per Hour', 'Per Event'], defaultValue: 'Per Event', helpText: 'How do you charge?' },
      { name: 'price', label: 'Price (₹)', type: 'number', required: true, unit: '₹', min: 1000, helpText: 'Your base price' },
      { name: 'durationHours', label: 'Duration (Hours)', type: 'number', required: false, min: 1, max: 24, helpText: 'Hours included in price', dependsOn: 'pricingType', dependsOnValue: 'Per Hour' },
      { name: 'teamComposition', label: 'Team Composition', type: 'text', required: true, placeholder: 'e.g., 2 photographers + 1 videographer', helpText: 'Describe your team size and roles' },
      { name: 'editedPhotos', label: 'Number of Edited Photos', type: 'number', required: true, min: 1, helpText: 'How many edited photos will be delivered' },
      { name: 'rawPhotos', label: 'Raw Photos Included', type: 'checkbox', required: false, helpText: 'Will you provide unedited raw photos?' },
      { name: 'highlightVideo', label: 'Highlight Video Included', type: 'checkbox', required: false, helpText: 'Short cinematic highlight reel' },
      { name: 'highlightVideoMinutes', label: 'Highlight Video Duration (Minutes)', type: 'number', required: false, min: 1, max: 30, helpText: 'Length of the highlight reel', dependsOn: 'highlightVideo' },
      { name: 'fullEventVideo', label: 'Full Event Video Included', type: 'checkbox', required: false, helpText: 'Complete event coverage video' },
      { name: 'fullVideoMinutes', label: 'Full Video Duration (Minutes)', type: 'number', required: false, min: 1, helpText: 'Approximate length of full video', dependsOn: 'fullEventVideo' },
      { name: 'droneIncluded', label: 'Drone Coverage Included', type: 'checkbox', required: false, helpText: 'Aerial shots with drone' },
      { name: 'albumIncluded', label: 'Physical Album Included', type: 'checkbox', required: false, helpText: 'Printed photo album included' },
      { name: 'albumPages', label: 'Album Pages', type: 'number', required: false, min: 10, helpText: 'Number of pages in the album', dependsOn: 'albumIncluded' },
      { name: 'preWeddingShoot', label: 'Pre-Wedding Shoot Included', type: 'checkbox', required: false, helpText: 'Separate pre-wedding photo session' },
      { name: 'deliveryTime', label: 'Delivery Time', type: 'deliveryTime', required: true, helpText: 'When will you deliver the final photos/videos?' },
      { name: 'includes', label: "What's Included", type: 'multiselect', required: false, fullWidth: true, options: ['Candid Photography','Traditional Photography','Photo Editing','Video Editing','Online Gallery','USB Drive','Soft Copies','Framed Prints','Thank You Cards','Second Shooter'] },
    ],
  },
  'venue': {
    categoryId: 'venue',
    pricingModel: 'per_session',
    showPackageDetails: true,
    fields: [
      { name: 'venueType', label: 'Venue Type', type: 'select', required: true, options: ['Banquet Hall', 'Lawn/Garden', 'Farmhouse', 'Hotel', 'Resort', 'Terrace', 'Beach', 'Heritage Property', 'Other'] },
      { name: 'venueSession', label: 'Session Type', type: 'select', required: true, options: ['Morning-Lunch (6 AM - 3 PM)', 'Evening-Dinner (4 PM - 12 AM)', 'Full Day'], helpText: 'Which session?' },
      { name: 'price', label: 'Price (₹)', type: 'number', required: true, unit: '₹', min: 1000, helpText: 'Price for this session' },
      { name: 'capacitySeating', label: 'Seating Capacity', type: 'number', required: true, min: 10, helpText: 'Max guests with seating' },

      { name: 'areaSquareFeet', label: 'Area (sq. ft.)', type: 'number', required: false, min: 100, helpText: 'Total usable area' },
      { name: 'numberOfHalls', label: 'Number of Halls', type: 'number', required: false, min: 1, helpText: 'How many halls/spaces available' },
      { name: 'cateringPolicy', label: 'Catering Policy', type: 'select', required: true, options: ['In-house Only', 'Outside Allowed', 'Both Options Available'] },
      { name: 'alcoholPolicy', label: 'Alcohol Policy', type: 'select', required: true, options: ['Allowed', 'Not Allowed', 'Allowed with License'] },
      { name: 'parkingCapacity', label: 'Parking Capacity (Cars)', type: 'number', required: false, min: 0, helpText: 'Number of cars that can be parked' },
      { name: 'djPolicy', label: 'DJ/Music Policy', type: 'select', required: false, options: ['Allowed till 10 PM', 'Allowed till 12 AM', 'No Restrictions', 'Not Allowed'] },
      { name: 'decorPolicy', label: 'Decoration Policy', type: 'select', required: false, options: ['In-house Only', 'Outside Allowed', 'Both Options Available'] },
      { name: 'roomsAvailable', label: 'Rooms Available', type: 'checkbox', required: false, helpText: 'Changing rooms or stay rooms' },
      { name: 'numberOfRooms', label: 'Number of Rooms', type: 'number', required: false, min: 1, helpText: 'Rooms available for guests', dependsOn: 'roomsAvailable' },
      { name: 'amenities', label: 'Amenities Included', type: 'multiselect', required: false, fullWidth: true, options: ['Air Conditioning','Parking','Power Backup','Restrooms','Green Room','Stage','Dance Floor','WiFi','Sound System','Projector','Swimming Pool','Elevator','Wheelchair Access','Bridal Suite','Garden Area','Terrace Access','Kitchen Access','Generator'] },
    ],
  },
  'decorator': {
    categoryId: 'decorator',
    pricingModel: 'per_setup',
    showPackageDetails: true,
    fields: [
      { name: 'price', label: 'Price (₹)', type: 'number', required: true, unit: '₹', min: 1000, helpText: 'Base price for this décor setup' },
      { name: 'includes', label: "What's Included", type: 'multiselect', required: false, fullWidth: true, options: ['Fresh Flowers','Artificial Flowers','Drapes & Fabrics','Lighting','Props','Furniture','Backdrop','Entrance Arch','Ceiling Decoration','Stage Decoration','Table Centerpieces','Aisle Decoration','Setup & Dismantling'] },
    ],
  },
  'mua': {
    categoryId: 'mua',
    pricingModel: 'per_person',
    showPackageDetails: true,
    fields: [
      { name: 'bridalPrice', label: 'Bridal Makeup Price (₹)', type: 'number', required: true, unit: '₹', helpText: 'Base/starting price for bridal makeup' },
      { name: 'makeupType', label: 'Makeup Type', type: 'select', required: true, options: ['HD Makeup', 'Airbrush Makeup', 'Traditional Makeup', 'Mineral Makeup'] },
      { name: 'numberOfLooks', label: 'Number of Looks', type: 'number', required: true, min: 1, helpText: 'How many looks included in this price' },
      { name: 'trialIncluded', label: 'Trial Session Included', type: 'checkbox', required: false, helpText: 'Pre-event trial makeup session' },
      { name: 'hairStyling', label: 'Hair Styling Included', type: 'checkbox', required: false, helpText: 'Hair styling along with makeup' },
      { name: 'drapingIncluded', label: 'Saree/Dupatta Draping Included', type: 'checkbox', required: false, helpText: 'Saree or dupatta draping service' },
      { name: 'productsUsed', label: 'Products / Brands Used', type: 'text', required: false, placeholder: 'e.g., MAC, Bobbi Brown, Huda Beauty', helpText: 'Key brands you use' },
      { name: 'deliveryTime', label: 'Delivery Time', type: 'deliveryTime', required: true, helpText: 'How long does the makeup session take?' },
      { name: 'servicesIncluded', label: 'Services Included', type: 'multiselect', required: false, fullWidth: true, options: ['Makeup','Hair Styling','Saree Draping','Jewelry Setting','Nail Art','Mehendi','Eyelash Extensions','Facial','Touch-ups','Dupatta Setting'] },
    ],
  },
  'dj-entertainment': {
    categoryId: 'dj-entertainment',
    pricingModel: 'per_event',
    showPackageDetails: true,
    fields: [
      { name: 'serviceType', label: 'Service Type', type: 'select', required: true, options: ['DJ', 'Live Band', 'Anchor/Emcee', 'Dancer/Performer', 'DJ + Anchor', 'DJ + Dancers'] },
      { name: 'price', label: 'Price (₹)', type: 'number', required: true, unit: '₹', min: 1000, helpText: 'Base price per event' },
      { name: 'durationHours', label: 'Max Duration (Hours)', type: 'number', required: true, min: 1, max: 24, helpText: 'Hours included in price' },
      { name: 'musicGenres', label: 'Music Genres', type: 'multiselect', required: true, fullWidth: true, options: ['Bollywood','EDM','Hip Hop','Punjabi','Sufi','Retro','Pop','Rock','Classical','Instrumental','Regional'] },
      { name: 'teamSize', label: 'Team Size', type: 'number', required: true, min: 1, helpText: 'Number of team members' },
      { name: 'languages', label: 'Languages (for Anchor)', type: 'multiselect', required: false, fullWidth: true, options: ['Hindi','English','Kannada','Tamil','Telugu','Marathi','Punjabi','Bengali','Gujarati'], helpText: 'Languages your anchor/emcee can host in' },
      { name: 'setupTime', label: 'Setup Time (Minutes)', type: 'number', required: false, min: 15, helpText: 'Time needed to set up before the event' },
      { name: 'backupEquipment', label: 'Backup Equipment Available', type: 'checkbox', required: false, helpText: 'Do you carry backup gear?' },
      { name: 'equipmentIncluded', label: 'Equipment Included', type: 'multiselect', required: false, fullWidth: true, options: ['Sound System','LED Lighting','Dance Floor Lighting','LED Screen','Smoke Machine','Fog Machine','Wireless Microphones','Mixer Console','Laser Show','CO2 Jets','Confetti Cannon','Sparkler Machine'] },
    ],
  },
  'sound-lights': {
    categoryId: 'sound-lights',
    pricingModel: 'per_day',
    showPackageDetails: true,
    fields: [
      { name: 'price', label: 'Price per Day (₹)', type: 'number', required: true, unit: '₹', min: 1000, helpText: 'Base price per day' },
      { name: 'durationHours', label: 'Hours Included', type: 'text', required: true, placeholder: 'e.g., 3-4 hours, Up to 6 hours', helpText: 'How many hours are included in this price' },
      { name: 'equipmentType', label: 'Equipment Type', type: 'multiselect', required: true, fullWidth: true, options: ['Sound System','LED Par Lights','Moving Head Lights','Laser Lights','Follow Spot','Stage Lighting','Architectural Lighting','Microphones','Mixer Console','Amplifiers','Subwoofers','LED Wall/Screen'] },
      { name: 'technicianIncluded', label: 'Technician Included', type: 'checkbox', required: false, helpText: 'Operator/technician provided with equipment' },
      { name: 'numberOfTechnicians', label: 'Number of Technicians', type: 'number', required: false, min: 1, helpText: 'How many technicians will be provided', dependsOn: 'technicianIncluded' },
      { name: 'setupDismantling', label: 'Setup & Dismantling Included', type: 'checkbox', required: false, helpText: 'Setup and takedown handled by your team' },
      { name: 'powerBackup', label: 'Power Backup Available', type: 'checkbox', required: false, helpText: 'Generator or backup power provided' },
      { name: 'includes', label: "What's Included", type: 'multiselect', required: false, fullWidth: true, options: ['Delivery & Pickup','Setup & Dismantling','Technician/Operator','Cables & Connectors','Stands & Mounts','Power Backup','Spare Equipment','Sound Check'] },
    ],
  },
};

export const getCategoryConfig = (categoryId: string): CategoryConfig | null => {
  const categoryMapping: Record<string, string> = {
    'photographer': 'photo-video',
    'cinematographer': 'photo-video',
    'photography-videography': 'photo-video',
    'dj': 'dj-entertainment',
  };
  const mappedId = categoryMapping[categoryId] || categoryId;
  return CATEGORY_CONFIGS[mappedId] || null;
};
