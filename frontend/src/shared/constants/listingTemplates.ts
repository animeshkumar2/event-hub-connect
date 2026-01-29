// Listing Templates for all categories
// Based on Indian market research (2024-2025 pricing)
// IMPORTANT: Field names in categorySpecificData MUST match exactly with categoryFieldConfigs.ts

export interface ListingTemplate {
  id: string;
  name: string;
  description: string;
  type: 'ITEM' | 'PACKAGE';
  categoryId: string;
  dbCategoryId: string;
  highlights: string[];
  includedItemsText: string[];
  excludedItemsText: string[];
  deliveryTime: string;
  eventTypeIds: number[];
  categorySpecificData: Record<string, any>;
  shortDescription: string;
  displayPrice: number;
  priceUnit?: string;
}

export interface PackageTemplate {
  id: string;
  name: string;
  description: string;
  suggestedPrice: number;
  savings: number;
  bundleItemIds: string[];
  highlights: string[];
  shortDescription: string;
}

export interface CategoryTemplates {
  categoryId: string;
  categoryName: string;
  items: ListingTemplate[];
  package: PackageTemplate;
}

// ============================================
// PHOTOGRAPHY & VIDEOGRAPHY TEMPLATES
// Fields: serviceType, pricingType, price, durationHours, teamSize, editedPhotos,
//         rawPhotos, highlightVideo, highlightVideoMinutes, fullVideo, fullVideoMinutes,
//         droneIncluded, albumIncluded, albumPages, preWeddingIncluded
// ============================================

const photographyItems: ListingTemplate[] = [
  {
    id: 'photo-wedding-day',
    name: 'Wedding Day Photography',
    description: 'Complete wedding day coverage with candid and traditional photography. Capture every precious moment from getting ready to the final farewell.',
    type: 'ITEM',
    categoryId: 'photography-videography',
    dbCategoryId: 'photo-video',
    shortDescription: '8-10 hrs • 500+ photos',
    displayPrice: 75000,
    highlights: ['8-10 hours coverage', '2 photographers', '500+ edited photos', 'Online gallery'],
    includedItemsText: ['Candid shots', 'Traditional poses', 'Getting ready coverage', 'Ceremony coverage', 'Reception coverage', 'Group photos', 'Photo editing & color correction'],
    excludedItemsText: ['Drone photography', 'Same-day edits', 'Printed album', 'Travel outside city'],
    deliveryTime: 'after:30 days',
    eventTypeIds: [1, 5],
    categorySpecificData: {
      serviceType: 'Photography Only',
      pricingType: 'Per Event',
      price: 75000,
      durationHours: 10,
      teamSize: '2 photographers',
      editedPhotos: 500,
      rawPhotos: true,
      highlightVideo: true,
      highlightVideoMinutes: 5,
      fullVideo: false,
      droneIncluded: false,
      albumIncluded: true,
      albumPages: 40,
      preWeddingIncluded: false
    }
  },
  {
    id: 'photo-prewedding',
    name: 'Pre-Wedding Shoot',
    description: 'Romantic pre-wedding photoshoot at location of your choice. Create beautiful memories before your big day.',
    type: 'ITEM',
    categoryId: 'photography-videography',
    dbCategoryId: 'photo-video',
    shortDescription: '4-5 hrs • 100+ photos',
    displayPrice: 35000,
    highlights: ['4-5 hours shoot', '1 location', '100+ edited photos', 'Outfit changes allowed'],
    includedItemsText: ['Location scouting assistance', '2 outfit changes', 'Creative poses', 'All edited soft copies', 'Online gallery access'],
    excludedItemsText: ['Location fees', 'Travel beyond 30km', 'Props & accessories', 'Printed photos'],
    deliveryTime: 'after:15 days',
    eventTypeIds: [1, 5],
    categorySpecificData: {
      serviceType: 'Photography Only',
      pricingType: 'Per Event',
      price: 35000,
      durationHours: 5,
      teamSize: '1 photographer + 1 assistant',
      editedPhotos: 100,
      rawPhotos: true,
      highlightVideo: true,
      highlightVideoMinutes: 3,
      fullVideo: false,
      droneIncluded: true,
      albumIncluded: false,
      preWeddingIncluded: true
    }
  },
  {
    id: 'photo-videography-combo',
    name: 'Photo + Video Coverage',
    description: 'Complete photography and videography coverage for your event. Best value for comprehensive documentation.',
    type: 'ITEM',
    categoryId: 'photography-videography',
    dbCategoryId: 'photo-video',
    shortDescription: 'Full day • Photo + Video',
    displayPrice: 120000,
    highlights: ['Full day coverage', '2 photographers + 2 videographers', '500+ photos', 'Highlight reel'],
    includedItemsText: ['Candid & traditional photography', 'Cinematic video', '10-15 min highlight reel', 'Full ceremony video', 'Online gallery'],
    excludedItemsText: ['Drone footage', 'Same-day edit', 'Printed album', 'USB drive'],
    deliveryTime: 'after:45 days',
    eventTypeIds: [1, 2, 3, 4, 5],
    categorySpecificData: {
      serviceType: 'Both Photography & Videography',
      pricingType: 'Per Event',
      price: 120000,
      durationHours: 10,
      teamSize: '2 photographers + 2 videographers',
      editedPhotos: 500,
      rawPhotos: true,
      highlightVideo: true,
      highlightVideoMinutes: 15,
      fullVideo: true,
      fullVideoMinutes: 120,
      droneIncluded: true,
      albumIncluded: true,
      albumPages: 60,
      preWeddingIncluded: true
    }
  }
];

const photographyItemsExtra: ListingTemplate[] = [
  {
    id: 'photo-personal-shoot',
    name: 'Personal Photoshoot',
    description: 'Professional photoshoot for individuals - portfolio, social media, dating profiles, or just for yourself. Indoor or outdoor locations.',
    type: 'ITEM',
    categoryId: 'photography-videography',
    dbCategoryId: 'photo-video',
    shortDescription: '2 hrs • 50+ photos',
    displayPrice: 8000,
    highlights: ['2 hour shoot', '50+ edited photos', 'Outfit changes', 'Location flexible'],
    includedItemsText: ['2 hours photoshoot', '50+ edited photos', '2 outfit changes', 'Basic retouching', 'Online gallery', 'Location within city'],
    excludedItemsText: ['Makeup artist', 'Props & accessories', 'Location fees', 'Printed photos'],
    deliveryTime: 'after:5 days',
    eventTypeIds: [9],
    categorySpecificData: {
      serviceType: 'Photography Only',
      pricingType: 'Per Event',
      price: 8000,
      durationHours: 2,
      teamSize: '1 photographer',
      editedPhotos: 50,
      rawPhotos: false,
      highlightVideo: false,
      droneIncluded: false,
      albumIncluded: false,
      preWeddingIncluded: false
    }
  },
  {
    id: 'photo-club-event',
    name: 'Club & Event Photo + Video',
    description: 'Professional photography and videography for nightclubs, parties, and events. Capture the energy and vibe of your night with photos and highlight reels.',
    type: 'ITEM',
    categoryId: 'photography-videography',
    dbCategoryId: 'photo-video',
    shortDescription: '4 hrs • Photo + Video',
    displayPrice: 25000,
    highlights: ['4 hour coverage', '200+ photos', 'Highlight reel', 'Low-light expertise'],
    includedItemsText: ['4 hours event coverage', '200+ edited photos', '1-2 min highlight reel', 'Low-light photography', 'Candid & posed shots', 'Quick 48hr delivery', 'Online gallery'],
    excludedItemsText: ['Full event video', 'Printed photos', 'Extended hours', 'Travel outside city'],
    deliveryTime: 'after:2 days',
    eventTypeIds: [7, 8],
    categorySpecificData: {
      serviceType: 'Both Photography & Videography',
      pricingType: 'Per Event',
      price: 25000,
      durationHours: 4,
      teamSize: '1 photographer + 1 videographer',
      editedPhotos: 200,
      rawPhotos: true,
      highlightVideo: true,
      highlightVideoMinutes: 2,
      fullVideo: false,
      droneIncluded: false,
      albumIncluded: false,
      preWeddingIncluded: false
    }
  },
  {
    id: 'photo-reel-creation',
    name: 'Reels & Short Video Creation',
    description: 'Professional short-form video content for Instagram Reels, YouTube Shorts, and TikTok. Trending edits and transitions.',
    type: 'ITEM',
    categoryId: 'photography-videography',
    dbCategoryId: 'photo-video',
    shortDescription: '3 reels • Trending edits',
    displayPrice: 12000,
    highlights: ['3 edited reels', 'Trending transitions', 'Music sync', 'Vertical format'],
    includedItemsText: ['2 hour shoot', '3 fully edited reels (30-60 sec each)', 'Trending transitions & effects', 'Music synchronization', 'Color grading', 'Vertical format optimized'],
    excludedItemsText: ['Raw footage', 'Additional reels', 'Location fees', 'Props'],
    deliveryTime: 'after:3 days',
    eventTypeIds: [7, 8, 9],
    categorySpecificData: {
      serviceType: 'Videography Only',
      pricingType: 'Per Event',
      price: 12000,
      durationHours: 2,
      teamSize: '1 videographer',
      editedPhotos: 0,
      rawPhotos: false,
      highlightVideo: true,
      highlightVideoMinutes: 3,
      fullVideo: false,
      droneIncluded: false,
      albumIncluded: false,
      preWeddingIncluded: false
    }
  }
];

const photographyPackage: PackageTemplate = {
  id: 'photo-complete-wedding',
  name: 'Complete Wedding Coverage',
  description: 'All-inclusive photography and videography package for your wedding.',
  suggestedPrice: 150000,
  savings: 20000,
  bundleItemIds: ['photo-wedding-day', 'photo-prewedding', 'photo-videography-combo'],
  highlights: ['Save ₹20,000', 'Single point of contact', 'Coordinated coverage'],
  shortDescription: 'Photo + Video + Pre-wedding'
};

// ============================================
// DECORATOR TEMPLATES
// Fields: price, decorType, theme, coverageArea, tableCenterpieces, includes,
//         stageBackdrop, entranceArch, ceilingDraping, aisleDecoration,
//         dismantlingIncluded, customizationAvailable
// ============================================

const decoratorItems: ListingTemplate[] = [
  {
    id: 'decor-stage',
    name: 'Stage Decoration',
    description: 'Elegant stage setup with flowers, drapes, and lighting. Perfect backdrop for your ceremonies and photos.',
    type: 'ITEM',
    categoryId: 'decorator',
    dbCategoryId: 'decorator',
    shortDescription: 'Fresh flowers • LED lights',
    displayPrice: 35000,
    highlights: ['Fresh flowers', 'LED lighting', 'Fabric draping', 'Photo-ready setup'],
    includedItemsText: ['Stage backdrop design', 'Fresh flower arrangements', 'Fabric draping', 'Basic LED lighting', 'Setup & dismantling'],
    excludedItemsText: ['Mandap decoration', 'Entry gate', 'Table centerpieces', 'Ceiling decoration'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 4, 5],
    categorySpecificData: {
      price: 35000,
      decorType: ['Stage Decoration', 'Photo Booth'],
      theme: 'Traditional',
      coverageArea: 500,
      tableCenterpieces: 0,
      includes: ['Fresh Flowers', 'Drapes & Fabrics', 'Lighting', 'Backdrop', 'Props'],
      stageBackdrop: true,
      entranceArch: false,
      ceilingDraping: false,
      aisleDecoration: false,
      dismantlingIncluded: true,
      customizationAvailable: true
    }
  },
  {
    id: 'decor-entrance',
    name: 'Entrance & Pathway Decoration',
    description: 'Grand entrance setup with welcome boards, flower arrangements, and pathway decoration.',
    type: 'ITEM',
    categoryId: 'decorator',
    dbCategoryId: 'decorator',
    shortDescription: 'Welcome arch • Pathway lights',
    displayPrice: 25000,
    highlights: ['Welcome signage', 'Flower rangoli', 'Pathway lights', 'Photo corner'],
    includedItemsText: ['Main entrance arch', 'Welcome board', 'Pathway flower pots', 'Fairy lights', 'Photo booth corner'],
    excludedItemsText: ['Red carpet', 'Live plants rental', 'Balloon decoration', 'Valet area setup'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 3, 5, 6],
    categorySpecificData: {
      price: 25000,
      decorType: ['Entrance Decoration', 'Aisle Decoration'],
      theme: 'Modern',
      coverageArea: 200,
      tableCenterpieces: 0,
      includes: ['Fresh Flowers', 'Artificial Flowers', 'Lighting', 'Entrance Arch', 'Props'],
      stageBackdrop: false,
      entranceArch: true,
      ceilingDraping: false,
      aisleDecoration: true,
      dismantlingIncluded: true,
      customizationAvailable: true
    }
  },
  {
    id: 'decor-full-venue',
    name: 'Full Venue Decoration',
    description: 'Complete venue transformation including stage, entrance, tables, and ceiling. Premium package for grand events.',
    type: 'ITEM',
    categoryId: 'decorator',
    dbCategoryId: 'decorator',
    shortDescription: 'Complete venue • 20 tables',
    displayPrice: 75000,
    highlights: ['Stage + Entrance + Tables', 'Ceiling draping', '20 table centerpieces', 'Premium flowers'],
    includedItemsText: ['Stage backdrop', 'Entrance arch', '20 table centerpieces', 'Ceiling draping', 'Aisle decoration', 'Fresh flowers throughout'],
    excludedItemsText: ['Mandap decoration', 'Car decoration', 'Additional tables beyond 20'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 4, 5],
    categorySpecificData: {
      price: 75000,
      decorType: ['Stage Decoration', 'Entrance Decoration', 'Full Venue Decoration', 'Table Centerpieces', 'Ceiling Draping'],
      theme: 'Royal',
      coverageArea: 2000,
      tableCenterpieces: 20,
      includes: ['Fresh Flowers', 'Artificial Flowers', 'Drapes & Fabrics', 'Lighting', 'Props', 'Backdrop', 'Entrance Arch', 'Ceiling Decoration'],
      stageBackdrop: true,
      entranceArch: true,
      ceilingDraping: true,
      aisleDecoration: true,
      dismantlingIncluded: true,
      customizationAvailable: true
    }
  }
];

const decoratorPackage: PackageTemplate = {
  id: 'decor-complete-venue',
  name: 'Complete Venue Decoration',
  description: 'Transform your entire venue with our complete decoration package.',
  suggestedPrice: 65000,
  savings: 10000,
  bundleItemIds: ['decor-stage', 'decor-entrance', 'decor-full-venue'],
  highlights: ['Save ₹10,000', 'Unified theme', 'Complete venue transformation'],
  shortDescription: 'Stage + Entrance + Tables'
};

// ============================================
// CATERING TEMPLATES
// Fields: pricePerPlateVeg, pricePerPlateNonVeg, cuisineType, serviceStyle,
//         minGuests, maxGuests, menuItems, includes, liveCounters, liveCounterTypes
// ============================================

const cateringItems: ListingTemplate[] = [
  {
    id: 'catering-veg-buffet',
    name: 'Vegetarian Buffet',
    description: 'Complete vegetarian buffet with starters, main course, breads, rice, and desserts. Perfect for traditional Indian events.',
    type: 'ITEM',
    categoryId: 'caterer',
    dbCategoryId: 'caterer',
    shortDescription: '₹450/plate • Multi-cuisine',
    displayPrice: 450,
    priceUnit: 'plate',
    highlights: ['4 starters', '6 main courses', '3 desserts', 'Live counters available'],
    includedItemsText: ['Welcome drinks', '4 veg starters', '6 main course items', '3 types of bread', 'Rice & biryani', '3 desserts', 'Papad & salad', 'Servers included'],
    excludedItemsText: ['Crockery rental', 'Tables & chairs', 'Mineral water bottles', 'Extra live counters'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 3, 4, 5, 6],
    categorySpecificData: {
      pricePerPlateVeg: 450,
      pricePerPlateNonVeg: 0,
      cuisineType: ['North Indian', 'South Indian', 'Chinese'],
      serviceStyle: 'Buffet',
      minGuests: 50,
      maxGuests: 500,
      menuItems: '4 starters (paneer tikka, spring rolls, samosa, pakora), 6 main courses (dal makhani, paneer butter masala, mix veg, chole, aloo gobi, palak paneer), 3 breads (naan, roti, paratha), jeera rice, veg biryani, 3 desserts (gulab jamun, rasmalai, ice cream)',
      includes: ['Servers/Waiters', 'Crockery & Cutlery', 'Setup & Decoration', 'Cleanup Service'],
      liveCounters: true,
      liveCounterTypes: ['Chaat Counter', 'Dosa Counter']
    }
  },
  {
    id: 'catering-nonveg-buffet',
    name: 'Non-Vegetarian Buffet',
    description: 'Premium non-veg buffet featuring chicken, mutton, and fish preparations along with vegetarian options.',
    type: 'ITEM',
    categoryId: 'caterer',
    dbCategoryId: 'caterer',
    shortDescription: '₹650/plate • Premium meats',
    displayPrice: 650,
    priceUnit: 'plate',
    highlights: ['Chicken & mutton', 'Fish preparations', 'Veg options included', 'Premium quality'],
    includedItemsText: ['Welcome drinks', '2 veg + 2 non-veg starters', '4 veg + 3 non-veg main course', 'Chicken biryani', '3 desserts', 'Servers included'],
    excludedItemsText: ['Prawns & lobster', 'Crockery rental', 'Alcohol service', 'Extra live counters'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 3, 4, 5],
    categorySpecificData: {
      pricePerPlateVeg: 500,
      pricePerPlateNonVeg: 650,
      cuisineType: ['North Indian', 'Multi-Cuisine', 'Chinese'],
      serviceStyle: 'Buffet',
      minGuests: 50,
      maxGuests: 400,
      menuItems: '4 starters (2 veg: paneer tikka, spring rolls; 2 non-veg: chicken tikka, fish fry), 7 main courses (dal makhani, paneer, mix veg, butter chicken, mutton curry, fish curry, egg curry), chicken biryani, 3 desserts',
      includes: ['Servers/Waiters', 'Crockery & Cutlery', 'Setup & Decoration', 'Cleanup Service', 'Welcome Drinks'],
      liveCounters: true,
      liveCounterTypes: ['Grill Counter', 'Chaat Counter']
    }
  },
  {
    id: 'catering-live-counter',
    name: 'Live Counter Setup',
    description: 'Interactive live cooking stations with chaat, dosa, pasta, and grill counters. Great for engagement and cocktail parties.',
    type: 'ITEM',
    categoryId: 'caterer',
    dbCategoryId: 'caterer',
    shortDescription: '₹550/plate • 4 live stations',
    displayPrice: 550,
    priceUnit: 'plate',
    highlights: ['4 live counters', 'Interactive cooking', 'Fresh preparations', 'Chef on-site'],
    includedItemsText: ['Chaat counter', 'Dosa counter', 'Pasta counter', 'Grill counter', 'Dedicated chefs', 'All equipment'],
    excludedItemsText: ['Main course buffet', 'Dessert counter', 'Beverage station', 'Extra counters'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 3, 5],
    categorySpecificData: {
      pricePerPlateVeg: 550,
      pricePerPlateNonVeg: 650,
      cuisineType: ['Multi-Cuisine'],
      serviceStyle: 'Food Stations',
      minGuests: 30,
      maxGuests: 200,
      menuItems: 'Chaat counter, Dosa counter, Pasta counter, Grill counter',
      includes: ['Servers/Waiters', 'Setup & Decoration'],
      liveCounters: true,
      liveCounterTypes: ['Chaat Counter', 'Dosa Counter', 'Pasta Counter', 'Grill Counter']
    }
  }
];

const cateringPackage: PackageTemplate = {
  id: 'catering-complete',
  name: 'Complete Catering Package',
  description: 'Full catering solution with buffet and live counters.',
  suggestedPrice: 750,
  savings: 100,
  bundleItemIds: ['catering-veg-buffet', 'catering-live-counter'],
  highlights: ['Save ₹100/plate', 'Buffet + Live counters', 'Complete solution'],
  shortDescription: 'Buffet + Live Counters'
};

// ============================================
// VENUE TEMPLATES
// Fields: venueType, pricingType, price, capacitySeating, capacityStanding,
//         areaSquareFeet, parkingCapacity, amenities, cateringPolicy, alcoholPolicy,
//         timingStart, timingEnd, overnightAllowed, peakSeasonSurcharge
// ============================================

const venueItems: ListingTemplate[] = [
  {
    id: 'venue-banquet-hall',
    name: 'Banquet Hall',
    description: 'Air-conditioned banquet hall with modern amenities. Ideal for weddings, receptions, and corporate events.',
    type: 'ITEM',
    categoryId: 'venue',
    dbCategoryId: 'venue',
    shortDescription: '300 guests • AC hall',
    displayPrice: 150000,
    highlights: ['300 seating capacity', 'Air conditioned', 'Parking for 50 cars', 'In-house catering'],
    includedItemsText: ['AC hall for 8 hours', 'Basic stage setup', 'Sound system', 'Parking space', 'Green rooms', 'Power backup'],
    excludedItemsText: ['Decoration', 'Catering', 'DJ/Music', 'Extra hours'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 3, 4, 5],
    categorySpecificData: {
      venueType: 'Banquet Hall',
      pricingType: 'Per Day',
      price: 150000,
      capacitySeating: 300,
      capacityStanding: 400,
      areaSquareFeet: 5000,
      parkingCapacity: 50,
      amenities: ['Air Conditioning', 'Parking', 'Valet Parking', 'Power Backup', 'Restrooms', 'Green Room', 'Stage', 'Dance Floor', 'WiFi', 'Sound System', 'Projector'],
      cateringPolicy: 'Both Options Available',
      alcoholPolicy: 'Allowed with License',
      timingStart: '10:00 AM',
      timingEnd: '12:00 AM',
      overnightAllowed: false,
      peakSeasonSurcharge: 20
    }
  },
  {
    id: 'venue-lawn-garden',
    name: 'Lawn & Garden Venue',
    description: 'Beautiful open-air lawn perfect for outdoor ceremonies, mehendi, and sangeet functions.',
    type: 'ITEM',
    categoryId: 'venue',
    dbCategoryId: 'venue',
    shortDescription: '500 guests • Open air',
    displayPrice: 100000,
    highlights: ['500 guest capacity', 'Open air venue', 'Natural greenery', 'Flexible setup'],
    includedItemsText: ['Lawn area for full day', 'Basic lighting', 'Parking space', 'Washroom facilities', 'Power supply'],
    excludedItemsText: ['Tents & canopy', 'Decoration', 'Catering', 'Furniture rental'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 4, 5, 6],
    categorySpecificData: {
      venueType: 'Lawn/Garden',
      pricingType: 'Per Day',
      price: 100000,
      capacitySeating: 500,
      capacityStanding: 800,
      areaSquareFeet: 10000,
      parkingCapacity: 80,
      amenities: ['Parking', 'Valet Parking', 'Power Backup', 'Restrooms', 'WiFi'],
      cateringPolicy: 'Outside Allowed',
      alcoholPolicy: 'Allowed with License',
      timingStart: '06:00 AM',
      timingEnd: '11:00 PM',
      overnightAllowed: true,
      peakSeasonSurcharge: 25
    }
  },
  {
    id: 'venue-farmhouse',
    name: 'Farmhouse Venue',
    description: 'Private farmhouse with indoor and outdoor spaces. Perfect for intimate destination weddings.',
    type: 'ITEM',
    categoryId: 'venue',
    dbCategoryId: 'venue',
    shortDescription: '200 guests • Private property',
    displayPrice: 200000,
    highlights: ['Private property', 'Indoor + outdoor', 'Overnight stay', 'Pool access'],
    includedItemsText: ['Full property access', 'Indoor hall', 'Lawn area', 'Swimming pool', '5 AC rooms', 'Kitchen access', 'Parking'],
    excludedItemsText: ['Catering', 'Decoration', 'DJ equipment', 'Extra rooms'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 4, 5],
    categorySpecificData: {
      venueType: 'Farmhouse',
      pricingType: 'Per Day',
      price: 200000,
      capacitySeating: 200,
      capacityStanding: 300,
      areaSquareFeet: 15000,
      parkingCapacity: 40,
      amenities: ['Air Conditioning', 'Parking', 'Power Backup', 'Restrooms', 'WiFi'],
      cateringPolicy: 'Outside Allowed',
      alcoholPolicy: 'Allowed',
      timingStart: '12:00 PM',
      timingEnd: '12:00 PM',
      overnightAllowed: true,
      peakSeasonSurcharge: 30
    }
  }
];

const venuePackage: PackageTemplate = {
  id: 'venue-complete',
  name: 'Multi-Day Venue Package',
  description: 'Book venue for multiple events at discounted rate.',
  suggestedPrice: 350000,
  savings: 50000,
  bundleItemIds: ['venue-banquet-hall', 'venue-lawn-garden'],
  highlights: ['Save ₹50,000', 'Hall + Lawn combo', 'Multiple events'],
  shortDescription: 'Hall + Lawn for 2 days'
};

// ============================================
// MUA (MAKEUP ARTIST) TEMPLATES
// Fields: bridalPrice, familyPrice, guestPrice, serviceFor, servicesIncluded,
//         makeupType, productsUsed, numberOfLooks, touchupHours, trialIncluded,
//         trialPrice, travelIncludedKm, travelChargePerKm
// ============================================

const muaItems: ListingTemplate[] = [
  {
    id: 'mua-bridal',
    name: 'Bridal Makeup',
    description: 'Complete bridal makeup with HD/Airbrush finish. Includes hair styling, draping assistance, and touch-up service.',
    type: 'ITEM',
    categoryId: 'mua',
    dbCategoryId: 'mua',
    shortDescription: 'HD makeup • Hair styling',
    displayPrice: 25000,
    highlights: ['HD/Airbrush makeup', 'Hair styling included', '4 hrs touch-up', 'Premium products'],
    includedItemsText: ['Bridal makeup', 'Hair styling', 'Saree/Lehenga draping', 'Jewelry setting', '4 hours touch-up service', 'False lashes'],
    excludedItemsText: ['Trial session', 'Family makeup', 'Travel beyond 20km', 'Nail art'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 5],
    categorySpecificData: {
      bridalPrice: 25000,
      familyPrice: 5000,
      guestPrice: 3000,
      serviceFor: ['Bride', 'Family Members'],
      servicesIncluded: ['Makeup', 'Hair Styling', 'Saree Draping', 'Jewelry Setting'],
      makeupType: 'HD Makeup',
      productsUsed: 'MAC, Huda Beauty, Charlotte Tilbury, Bobbi Brown',
      numberOfLooks: 1,
      touchupHours: 4,
      trialIncluded: true,
      trialPrice: 0,
      travelIncludedKm: 20,
      travelChargePerKm: 15
    }
  },
  {
    id: 'mua-engagement',
    name: 'Engagement Makeup',
    description: 'Elegant makeup look for engagement ceremony. Natural yet glamorous finish perfect for photos.',
    type: 'ITEM',
    categoryId: 'mua',
    dbCategoryId: 'mua',
    shortDescription: 'Natural glam • Photos ready',
    displayPrice: 12000,
    highlights: ['Natural glam look', 'Hair styling', '2 hrs touch-up', 'Photo-ready finish'],
    includedItemsText: ['Engagement makeup', 'Hair styling', 'Draping assistance', '2 hours touch-up', 'False lashes'],
    excludedItemsText: ['Trial session', 'Family makeup', 'Travel beyond 15km'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 5], // Wedding, Engagement only - MUA category valid events
    categorySpecificData: {
      bridalPrice: 12000,
      familyPrice: 4000,
      guestPrice: 2500,
      serviceFor: ['Bride', 'Family Members'],
      servicesIncluded: ['Makeup', 'Hair Styling', 'Saree Draping'],
      makeupType: 'HD Makeup',
      productsUsed: 'MAC, Bobbi Brown, Lakme Absolute',
      numberOfLooks: 1,
      touchupHours: 2,
      trialIncluded: false,
      trialPrice: 2000,
      travelIncludedKm: 15,
      travelChargePerKm: 12
    }
  },
  {
    id: 'mua-party',
    name: 'Party Makeup',
    description: 'Glamorous party makeup for sangeet, cocktail, or reception. Stand out at any celebration.',
    type: 'ITEM',
    categoryId: 'mua',
    dbCategoryId: 'mua',
    shortDescription: 'Glam look • Evening events',
    displayPrice: 6000,
    highlights: ['Glamorous finish', 'Hair styling', 'Quick service', 'Long-lasting'],
    includedItemsText: ['Party makeup', 'Hair styling', 'False lashes', 'Setting spray'],
    excludedItemsText: ['Draping service', 'Touch-up service', 'Travel beyond 10km'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 5], // Wedding, Engagement only - MUA category valid events
    categorySpecificData: {
      bridalPrice: 6000,
      familyPrice: 4000,
      guestPrice: 3000,
      serviceFor: ['Bride', 'Family Members', 'Guests'],
      servicesIncluded: ['Makeup', 'Hair Styling'],
      makeupType: 'Traditional Makeup',
      productsUsed: 'MAC, Lakme',
      numberOfLooks: 1,
      touchupHours: 0,
      trialIncluded: false,
      trialPrice: 1500,
      travelIncludedKm: 10,
      travelChargePerKm: 10
    }
  }
];

const muaPackage: PackageTemplate = {
  id: 'mua-complete-wedding',
  name: 'Complete Wedding Makeup',
  description: 'All wedding events covered - mehendi, sangeet, wedding day.',
  suggestedPrice: 40000,
  savings: 8000,
  bundleItemIds: ['mua-bridal', 'mua-engagement', 'mua-party'],
  highlights: ['Save ₹8,000', '3 events covered', 'Trial included'],
  shortDescription: 'Mehendi + Sangeet + Wedding'
};

// ============================================
// DJ & ENTERTAINMENT TEMPLATES
// Fields: serviceType, pricingType, price, durationHours, equipmentIncluded,
//         soundSystemWattage, teamSize, musicGenre, customPlaylist, extraHourPrice
// ============================================

const djItems: ListingTemplate[] = [
  {
    id: 'dj-wedding',
    name: 'Wedding DJ Setup',
    description: 'Professional DJ with premium sound system and lighting. Perfect for sangeet and reception.',
    type: 'ITEM',
    categoryId: 'dj-entertainment',
    dbCategoryId: 'dj-entertainment',
    shortDescription: '5 hrs • Sound + Lights',
    displayPrice: 35000,
    highlights: ['5 hours performance', 'Premium sound system', 'LED lighting', 'Custom playlist'],
    includedItemsText: ['Professional DJ', '10000W sound system', 'LED par lights', 'Moving head lights', '2 wireless mics', 'Smoke machine', 'Custom playlist'],
    excludedItemsText: ['LED screen', 'Extra hours', 'Dancers', 'Anchor/Emcee'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 5],
    categorySpecificData: {
      serviceType: 'DJ',
      pricingType: 'Per Event',
      price: 35000,
      durationHours: 5,
      equipmentIncluded: ['Sound System', 'LED Lighting', 'Dance Floor Lighting', 'Smoke Machine', 'Wireless Microphones', 'Mixer Console'],
      soundSystemWattage: 10000,
      teamSize: 2,
      musicGenre: ['Bollywood', 'Punjabi', 'EDM', 'Retro', 'Hip Hop'],
      customPlaylist: true,
      extraHourPrice: 5000
    }
  },
  {
    id: 'dj-corporate',
    name: 'Corporate Event DJ',
    description: 'Professional DJ setup for corporate events, conferences, and office parties.',
    type: 'ITEM',
    categoryId: 'dj-entertainment',
    dbCategoryId: 'dj-entertainment',
    shortDescription: '4 hrs • Professional setup',
    displayPrice: 25000,
    highlights: ['4 hours performance', 'Clean sound', 'Ambient lighting', 'Professional conduct'],
    includedItemsText: ['Professional DJ', '5000W sound system', 'Basic lighting', '2 wireless mics', 'Background music'],
    excludedItemsText: ['Dance floor lighting', 'Smoke machine', 'Extra hours', 'Anchor'],
    deliveryTime: 'same_day',
    eventTypeIds: [3],
    categorySpecificData: {
      serviceType: 'DJ',
      pricingType: 'Per Event',
      price: 25000,
      durationHours: 4,
      equipmentIncluded: ['Sound System', 'LED Lighting', 'Wireless Microphones', 'Mixer Console'],
      soundSystemWattage: 5000,
      teamSize: 2,
      musicGenre: ['Commercial', 'Retro', 'Bollywood', 'House'],
      customPlaylist: true,
      extraHourPrice: 4000
    }
  },
  {
    id: 'dj-anchor-combo',
    name: 'DJ + Anchor Combo',
    description: 'Complete entertainment package with DJ and professional anchor/emcee for your event.',
    type: 'ITEM',
    categoryId: 'dj-entertainment',
    dbCategoryId: 'dj-entertainment',
    shortDescription: '5 hrs • DJ + Emcee',
    displayPrice: 50000,
    highlights: ['DJ + Anchor combo', '5 hours', 'Games & activities', 'Crowd engagement'],
    includedItemsText: ['Professional DJ', 'Experienced anchor', '10000W sound', 'LED lighting', 'Games & activities', 'Couple introduction', 'Dance floor management'],
    excludedItemsText: ['Dancers', 'LED screen', 'Extra hours', 'Props for games'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 3, 5],
    categorySpecificData: {
      serviceType: 'DJ + Anchor',
      pricingType: 'Per Event',
      price: 50000,
      durationHours: 5,
      equipmentIncluded: ['Sound System', 'LED Lighting', 'Dance Floor Lighting', 'Wireless Microphones', 'Smoke Machine'],
      soundSystemWattage: 10000,
      teamSize: 3,
      musicGenre: ['Bollywood', 'Punjabi', 'EDM', 'Commercial'],
      customPlaylist: true,
      extraHourPrice: 7000
    }
  }
];

const djItemsExtra: ListingTemplate[] = [
  {
    id: 'dj-nightclub',
    name: 'Nightclub DJ Set',
    description: 'High-energy DJ performance for nightclubs and club nights. EDM, house, techno, and commercial hits to keep the dance floor packed.',
    type: 'ITEM',
    categoryId: 'dj-entertainment',
    dbCategoryId: 'dj-entertainment',
    shortDescription: '4 hrs • Club vibes',
    displayPrice: 30000,
    highlights: ['4 hour set', 'Club-style mixing', 'EDM & House', 'Crowd reading'],
    includedItemsText: ['4 hours DJ performance', 'Professional mixing', 'Track selection for club crowd', 'Seamless transitions', 'Crowd engagement'],
    excludedItemsText: ['Sound system', 'Lighting', 'Extended hours', 'Travel outside city'],
    deliveryTime: 'same_day',
    eventTypeIds: [7],
    categorySpecificData: {
      serviceType: 'DJ',
      pricingType: 'Per Event',
      price: 30000,
      durationHours: 4,
      equipmentIncluded: ['Mixer Console'],
      soundSystemWattage: 0,
      teamSize: 1,
      musicGenre: ['EDM', 'House', 'Commercial', 'Hip Hop'],
      customPlaylist: true,
      extraHourPrice: 6000
    }
  },
  {
    id: 'dj-house-party',
    name: 'House Party DJ',
    description: 'Fun and energetic DJ for private house parties and intimate gatherings. Versatile music selection to match your crowd.',
    type: 'ITEM',
    categoryId: 'dj-entertainment',
    dbCategoryId: 'dj-entertainment',
    shortDescription: '3 hrs • Portable setup',
    displayPrice: 18000,
    highlights: ['3 hour party', 'Portable sound system', 'All genres', 'Party games music'],
    includedItemsText: ['3 hours DJ performance', 'Portable sound system (3000W)', 'Basic LED lights', '1 wireless mic', 'Custom playlist', 'Party game music'],
    excludedItemsText: ['Smoke machine', 'Extended hours', 'Anchor services', 'Travel beyond 20km'],
    deliveryTime: 'same_day',
    eventTypeIds: [2, 7],
    categorySpecificData: {
      serviceType: 'DJ',
      pricingType: 'Per Event',
      price: 18000,
      durationHours: 3,
      equipmentIncluded: ['Sound System', 'LED Lighting', 'Wireless Microphones'],
      soundSystemWattage: 3000,
      teamSize: 1,
      musicGenre: ['Bollywood', 'Punjabi', 'EDM', 'Retro', 'Commercial', 'Hip Hop'],
      customPlaylist: true,
      extraHourPrice: 4000
    }
  }
];

const djPackage: PackageTemplate = {
  id: 'dj-complete',
  name: 'Complete Entertainment Package',
  description: 'DJ, anchor, and dancers for the ultimate party experience.',
  suggestedPrice: 75000,
  savings: 15000,
  bundleItemIds: ['dj-wedding', 'dj-anchor-combo'],
  highlights: ['Save ₹15,000', 'DJ + Anchor + Dancers', 'Full entertainment'],
  shortDescription: 'DJ + Anchor + Dancers'
};

// ============================================
// SOUND & LIGHTS TEMPLATES
// Fields: price, equipmentType, coverageArea, powerRequirement, teamSize,
//         durationDays, setupIncluded, dismantlingIncluded, extraDayPrice
// ============================================

const soundLightsItems: ListingTemplate[] = [
  {
    id: 'sound-basic',
    name: 'Basic Sound System',
    description: 'Quality sound system for small to medium events. Includes speakers, amplifier, and microphones.',
    type: 'ITEM',
    categoryId: 'sound-lights',
    dbCategoryId: 'sound-lights',
    shortDescription: '5000W • Up to 200 guests',
    displayPrice: 15000,
    highlights: ['5000W system', '200 guest capacity', '2 wireless mics', 'Technician included'],
    includedItemsText: ['2 main speakers', '2 monitor speakers', 'Amplifier', '2 wireless microphones', 'Mixer console', 'Setup & operation'],
    excludedItemsText: ['Lighting equipment', 'Extra microphones', 'Recording equipment'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 3, 4, 5, 6],
    categorySpecificData: {
      price: 15000,
      equipmentType: ['Sound System', 'Microphones', 'Mixer Console', 'Amplifiers'],
      coverageArea: 2000,
      powerRequirement: 3,
      teamSize: 1,
      durationDays: 1,
      setupIncluded: true,
      dismantlingIncluded: true,
      extraDayPrice: 10000
    }
  },
  {
    id: 'sound-premium',
    name: 'Premium Sound System',
    description: 'High-power sound system for large events. Crystal clear audio for up to 500 guests.',
    type: 'ITEM',
    categoryId: 'sound-lights',
    dbCategoryId: 'sound-lights',
    shortDescription: '15000W • Up to 500 guests',
    displayPrice: 35000,
    highlights: ['15000W system', '500 guest capacity', '4 wireless mics', 'Professional mixing'],
    includedItemsText: ['Line array speakers', 'Subwoofers', 'Professional mixer', '4 wireless microphones', '2 technicians', 'Setup & operation'],
    excludedItemsText: ['Lighting equipment', 'Recording', 'Extra days'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 3, 5],
    categorySpecificData: {
      price: 35000,
      equipmentType: ['Sound System', 'Microphones', 'Mixer Console', 'Amplifiers'],
      coverageArea: 5000,
      powerRequirement: 8,
      teamSize: 2,
      durationDays: 1,
      setupIncluded: true,
      dismantlingIncluded: true,
      extraDayPrice: 25000
    }
  },
  {
    id: 'lights-event',
    name: 'Event Lighting Package',
    description: 'Complete lighting setup with LED par lights, moving heads, and ambient lighting.',
    type: 'ITEM',
    categoryId: 'sound-lights',
    dbCategoryId: 'sound-lights',
    shortDescription: 'LED + Moving heads',
    displayPrice: 25000,
    highlights: ['LED par lights', 'Moving head lights', 'Truss system', 'DMX controlled'],
    includedItemsText: ['12 LED par lights', '4 moving head lights', 'Truss system', 'DMX controller', 'Fog machine', 'Technician', 'Setup & operation'],
    excludedItemsText: ['Sound system', 'Laser lights', 'LED screen', 'Extra days'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 3, 5],
    categorySpecificData: {
      price: 25000,
      equipmentType: ['LED Par Lights', 'Moving Head Lights', 'Stage Lighting'],
      coverageArea: 3000,
      powerRequirement: 5,
      teamSize: 1,
      durationDays: 1,
      setupIncluded: true,
      dismantlingIncluded: true,
      extraDayPrice: 18000
    }
  }
];

const soundLightsPackage: PackageTemplate = {
  id: 'sound-lights-complete',
  name: 'Complete AV Package',
  description: 'Premium sound and lighting combo for the perfect event atmosphere.',
  suggestedPrice: 50000,
  savings: 10000,
  bundleItemIds: ['sound-premium', 'lights-event'],
  highlights: ['Save ₹10,000', 'Sound + Lights', 'Full AV setup'],
  shortDescription: 'Sound + Lights combo'
};

// ============================================
// OTHER CATEGORY TEMPLATES
// Fields: price (only field for "other" category - no specific config)
// ============================================

const otherItems: ListingTemplate[] = [
  {
    id: 'other-invitation',
    name: 'Wedding Invitation Cards',
    description: 'Premium printed wedding invitation cards with custom design. Includes envelopes and inserts.',
    type: 'ITEM',
    categoryId: 'other',
    dbCategoryId: 'other',
    shortDescription: '100 cards • Custom design',
    displayPrice: 15000,
    highlights: ['100 invitation cards', 'Custom design', 'Premium paper', 'Envelopes included'],
    includedItemsText: ['100 invitation cards', 'Custom design consultation', 'Premium 300gsm paper', 'Matching envelopes', '2 insert cards', 'Delivery'],
    excludedItemsText: ['Extra cards', 'Foil printing', 'Box packaging', 'Same-day delivery'],
    deliveryTime: 'after:7 days',
    eventTypeIds: [1, 5],
    categorySpecificData: {
      price: 15000
    }
  },
  {
    id: 'other-mehendi',
    name: 'Mehendi Artist',
    description: 'Professional mehendi artist for bridal and guest mehendi. Intricate designs with quality mehendi.',
    type: 'ITEM',
    categoryId: 'other',
    dbCategoryId: 'other',
    shortDescription: 'Bridal + 10 guests',
    displayPrice: 8000,
    highlights: ['Bridal mehendi', '10 guests included', 'Premium mehendi', 'Intricate designs'],
    includedItemsText: ['Bridal full hands & feet', 'Mehendi for 10 guests', 'Premium organic mehendi', 'Design consultation'],
    excludedItemsText: ['Extra guests', 'Groom mehendi', 'Travel beyond 15km'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 5],
    categorySpecificData: {
      price: 8000
    }
  },
  {
    id: 'other-pandit',
    name: 'Pandit Ji Services',
    description: 'Experienced pandit for wedding ceremonies, puja, and religious rituals.',
    type: 'ITEM',
    categoryId: 'other',
    dbCategoryId: 'other',
    shortDescription: 'Wedding ceremony • Puja',
    displayPrice: 11000,
    highlights: ['Experienced pandit', 'All rituals covered', 'Puja samagri', 'Flexible timing'],
    includedItemsText: ['Wedding ceremony', 'All rituals & mantras', 'Basic puja samagri', 'Guidance throughout'],
    excludedItemsText: ['Havan samagri', 'Travel beyond 20km', 'Additional pujas'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 5],
    categorySpecificData: {
      price: 11000
    }
  }
];

const otherPackage: PackageTemplate = {
  id: 'other-complete',
  name: 'Wedding Essentials',
  description: 'Essential services bundle for your wedding.',
  suggestedPrice: 30000,
  savings: 4000,
  bundleItemIds: ['other-invitation', 'other-mehendi', 'other-pandit'],
  highlights: ['Save ₹4,000', 'Cards + Mehendi + Pandit', 'Essential bundle'],
  shortDescription: 'Cards + Mehendi + Pandit'
};

// ============================================
// ARTISTS & PERFORMERS TEMPLATES
// Generic templates that work for any type of artist (musicians, dancers, performers)
// ============================================

const artistsItems: ListingTemplate[] = [
  {
    id: 'artist-solo-performance',
    name: 'Solo Artist Performance',
    description: 'Live solo performance by a professional artist. Perfect for intimate gatherings, cocktail hours, and background entertainment. Customize for your instrument/art form.',
    type: 'ITEM',
    categoryId: 'artists',
    dbCategoryId: 'artists',
    shortDescription: '2 hrs • Solo performance',
    displayPrice: 15000,
    highlights: ['2 hour performance', 'Professional artist', 'Sound system included', 'Flexible repertoire'],
    includedItemsText: ['2 hours live performance', 'Basic sound setup', 'Artist travel within city', 'Customized song/performance list', 'Setup & soundcheck'],
    excludedItemsText: ['Extended hours', 'Premium sound system', 'Travel outside city', 'Recording rights'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 3, 4, 5, 6, 7, 8],
    categorySpecificData: {
      price: 15000
    }
  },
  {
    id: 'artist-group-performance',
    name: 'Group/Band Performance',
    description: 'Live performance by a group of artists or band. Ideal for weddings, corporate events, and celebrations. Specify your group type (band, dance troupe, etc.).',
    type: 'ITEM',
    categoryId: 'artists',
    dbCategoryId: 'artists',
    shortDescription: '3 hrs • Group/Band',
    displayPrice: 45000,
    highlights: ['3 hour performance', '3-5 member group', 'Full sound system', 'Stage lighting'],
    includedItemsText: ['3 hours live performance', '3-5 artists/musicians', 'Professional sound system', 'Basic stage lighting', 'Customized setlist', 'Soundcheck & setup'],
    excludedItemsText: ['Extended hours', 'Premium lighting', 'Travel outside city', 'Recording/streaming rights'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 2, 3, 4, 5, 7, 8],
    categorySpecificData: {
      price: 45000
    }
  },
  {
    id: 'artist-premium-show',
    name: 'Premium Artist Show',
    description: 'Full-scale professional performance with complete production. Perfect for main events, sangeet nights, and grand celebrations. Customize for your performance type.',
    type: 'ITEM',
    categoryId: 'artists',
    dbCategoryId: 'artists',
    shortDescription: '4 hrs • Full production',
    displayPrice: 80000,
    highlights: ['4 hour show', 'Full production', 'Premium sound & lights', 'Multiple acts'],
    includedItemsText: ['4 hours performance', 'Multiple performance segments', 'Premium sound system', 'Professional lighting', 'Costume changes', 'Choreographed acts', 'Dedicated technician'],
    excludedItemsText: ['LED screens', 'Pyrotechnics', 'Travel outside city', 'Recording rights'],
    deliveryTime: 'same_day',
    eventTypeIds: [1, 3, 5, 7, 8],
    categorySpecificData: {
      price: 80000
    }
  }
];

const artistsPackage: PackageTemplate = {
  id: 'artist-complete',
  name: 'Complete Entertainment Package',
  description: 'Multiple performances for your multi-day event.',
  suggestedPrice: 120000,
  savings: 20000,
  bundleItemIds: ['artist-solo-performance', 'artist-group-performance', 'artist-premium-show'],
  highlights: ['Save ₹20,000', 'Multiple performances', 'Full event coverage'],
  shortDescription: 'Solo + Group + Premium Show'
};


// ============================================
// CATEGORY TEMPLATES MAP
// ============================================
export const CATEGORY_TEMPLATES: Record<string, CategoryTemplates> = {
  'photography-videography': {
    categoryId: 'photography-videography',
    categoryName: 'Photography & Videography',
    items: [...photographyItems, ...photographyItemsExtra],
    package: photographyPackage
  },
  'photo-video': {
    categoryId: 'photo-video',
    categoryName: 'Photography & Videography',
    items: [...photographyItems, ...photographyItemsExtra],
    package: photographyPackage
  },
  'decorator': {
    categoryId: 'decorator',
    categoryName: 'Decoration',
    items: decoratorItems,
    package: decoratorPackage
  },
  'caterer': {
    categoryId: 'caterer',
    categoryName: 'Catering',
    items: cateringItems,
    package: cateringPackage
  },
  'venue': {
    categoryId: 'venue',
    categoryName: 'Venue',
    items: venueItems,
    package: venuePackage
  },
  'mua': {
    categoryId: 'mua',
    categoryName: 'Makeup & Styling',
    items: muaItems,
    package: muaPackage
  },
  'dj-entertainment': {
    categoryId: 'dj-entertainment',
    categoryName: 'DJ & Entertainment',
    items: [...djItems, ...djItemsExtra],
    package: djPackage
  },
  'sound-lights': {
    categoryId: 'sound-lights',
    categoryName: 'Sound & Lights',
    items: soundLightsItems,
    package: soundLightsPackage
  },
  'artists': {
    categoryId: 'artists',
    categoryName: 'Artists & Performers',
    items: artistsItems,
    package: artistsPackage
  },
  'other': {
    categoryId: 'other',
    categoryName: 'Other Services',
    items: otherItems,
    package: otherPackage
  }
};

// Helper to get all templates as flat array
export const getAllTemplates = (): ListingTemplate[] => {
  const seen = new Set<string>();
  const templates: ListingTemplate[] = [];
  
  Object.values(CATEGORY_TEMPLATES).forEach(cat => {
    cat.items.forEach(item => {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        templates.push(item);
      }
    });
  });
  
  return templates;
};

// Helper to get template by ID
export const getTemplateById = (templateId: string): ListingTemplate | null => {
  for (const cat of Object.values(CATEGORY_TEMPLATES)) {
    const found = cat.items.find(item => item.id === templateId);
    if (found) return found;
  }
  return null;
};

// Helper to get templates for a category
export const getTemplatesForCategory = (categoryId: string): ListingTemplate[] => {
  return CATEGORY_TEMPLATES[categoryId]?.items || [];
};
