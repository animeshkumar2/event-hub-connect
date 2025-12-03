// SOLUTION 1: All 12 Categories + Other
export const categories = [
  { id: 'photographer', name: 'Photography', icon: '📸' },
  { id: 'cinematographer', name: 'Cinematography', icon: '🎬' },
  { id: 'decorator', name: 'Décor', icon: '🎨' },
  { id: 'dj', name: 'DJ', icon: '🎵' },
  { id: 'sound-lights', name: 'Sound & Lights', icon: '💡' },
  { id: 'mua', name: 'Makeup / Stylist', icon: '💄' },
  { id: 'caterer', name: 'Catering', icon: '🍽️' },
  { id: 'return-gifts', name: 'Return Gifts', icon: '🎁' },
  { id: 'invitations', name: 'Invitations', icon: '✉️' },
  { id: 'live-music', name: 'Live Music', icon: '🎤' },
  { id: 'anchors', name: 'Anchors', icon: '🎙️' },
  { id: 'event-coordinator', name: 'Event Coordinators', icon: '📋' },
  { id: 'other', name: 'Other', icon: '📦' }, // For miscellaneous listings
];

export const cities = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
];

export const eventTypes = [
  'Wedding',
  'Birthday',
  'Anniversary',
  'Corporate',
  'Engagement',
  'Baby Shower',
  'Other',
];

// SOLUTION 3: Enhanced Package with exclusions, delivery time, extra charges
export interface Package {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  description: string;
  includedItems: string[];
  excludedItems: string[]; // NEW
  deliveryTime: string; // NEW
  extraCharges?: string[]; // NEW
  images: string[];
  addOns: AddOn[];
  bookableSetup?: string; // For SOLUTION 4: "Book This Exact Setup"
  eventTypes?: string[]; // Event types this package is suitable for (e.g., ['Wedding', 'Engagement'])
  category?: string; // Package's own category (if not specified, uses vendor.category)
}

export interface AddOn {
  id: string;
  packageId: string;
  title: string;
  price: number;
  description?: string;
}

// Individual Listing (for single items like chairs, tables, etc.)
export interface Listing {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string; // Must match vendor's category or be 'other'
  eventTypes?: string[]; // Event types this listing is suitable for
  unit?: string; // e.g., "per piece", "per set", "per hour"
  minimumQuantity?: number; // Minimum order quantity
  deliveryTime?: string;
  extraCharges?: string[];
}

/**
 * Validates if a listing category is allowed for a vendor category
 * Vendors can only list items in their own category or 'other' category
 */
export const validateListingCategory = (vendorCategory: string, listingCategory: string): boolean => {
  // Vendors can list items in their own category
  if (vendorCategory === listingCategory) {
    return true;
  }
  // Vendors can also list items in 'other' category
  if (listingCategory === 'other') {
    return true;
  }
  // Otherwise, not allowed
  return false;
};

/**
 * Gets suggested category for a listing based on keywords
 * Used to suggest correct category when vendor tries to list something outside their category
 */
export const suggestCategoryForListing = (listingName: string, listingDescription: string): string | null => {
  const text = `${listingName} ${listingDescription}`.toLowerCase();
  
  // Food-related keywords → catering
  if (text.match(/\b(food|plate|dish|meal|catering|caterer|menu|cuisine|biryani|curry|snack|appetizer|dessert|beverage|drink)\b/)) {
    return 'caterer';
  }
  
  // Photography equipment → photography
  if (text.match(/\b(camera|dslr|lens|photography|photo|shoot|photographer)\b/)) {
    return 'photographer';
  }
  
  // Decor items → decorator
  if (text.match(/\b(chair|table|decoration|decor|flower|floral|centerpiece|light|led|stage|backdrop|arch)\b/)) {
    return 'decorator';
  }
  
  // Sound/lighting equipment → sound-lights
  if (text.match(/\b(sound|speaker|microphone|mic|lighting|light|dmx|amplifier|mixer|dj equipment)\b/)) {
    return 'sound-lights';
  }
  
  // Music equipment → live-music or dj
  if (text.match(/\b(instrument|guitar|piano|keyboard|drums|music|band|musician)\b/)) {
    return 'live-music';
  }
  
  // Makeup/styling → mua
  if (text.match(/\b(makeup|cosmetic|stylist|hair|beauty|bridal makeup|mua)\b/)) {
    return 'mua';
  }
  
  // Video equipment → cinematographer
  if (text.match(/\b(video|camera|cinematography|cinematographer|film|recording)\b/)) {
    return 'cinematographer';
  }
  
  // If no match, return null (will use 'other')
  return null;
};

// SOLUTION 2: Enhanced Vendor with FAQs, reviews, coverage radius
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  eventType?: string;
  images?: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  slots: {
    time: string; // HH:MM format
    status: 'available' | 'booked' | 'busy';
  }[];
}

// SOLUTION 4: Bookable Setup
export interface BookableSetup {
  id: string;
  vendorId: string;
  packageId?: string;
  image: string;
  title: string;
  description: string;
  price: number;
  category: string;
}

export interface Vendor {
  id: string;
  businessName: string;
  category: string;
  city: string;
  bio: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  coverImage: string;
  portfolioImages: string[];
  packages: Package[];
  listings?: Listing[]; // Individual listings (e.g., chairs, tables, etc.)
  faqs: FAQ[]; // NEW
  reviews: Review[]; // NEW
  coverageRadius: number; // NEW - in km
  pastEvents?: { // NEW
    image: string;
    eventType: string;
    date: string;
  }[];
  availability: AvailabilitySlot[]; // SOLUTION 5: Real-time availability
  bookableSetups?: BookableSetup[]; // SOLUTION 4: Book exact setups
}

// SOLUTION 6: Cart System
export interface CartItem {
  id: string;
  vendorId: string;
  vendorName: string;
  packageId: string;
  packageName: string;
  price: number;
  basePrice: number;
  addOns: AddOn[];
  customizations?: {
    id: string;
    name: string;
    value: string;
    price: number;
  }[];
  eventDate?: string;
  eventTime?: string;
  quantity: number;
}

// SOLUTION 10: Event Planner Recommendations
export interface EventRecommendation {
  category: string;
  vendorId: string;
  vendorName: string;
  packageId: string;
  packageName: string;
  price: number;
  reason: string;
}

export interface EventPlan {
  budget: number;
  eventType: string;
  guestCount: number;
  date?: string;
  recommendations: EventRecommendation[];
  totalCost: number;
}

// Mock Reviews
const generateReviews = (vendorId: string, count: number): Review[] => {
  const names = ['Priya Sharma', 'Rahul Mehta', 'Anjali Patel', 'Vikram Singh', 'Sneha Reddy'];
  const comments = [
    'Amazing service! Highly recommended.',
    'Professional and punctual. Great quality work.',
    'Exceeded expectations. Worth every rupee!',
    'Very satisfied with the service.',
    'Best vendor we worked with. Thank you!',
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `r${vendorId}-${i}`,
    userId: `u${i}`,
    userName: names[i % names.length],
    rating: 4 + Math.random(),
    comment: comments[i % comments.length],
    date: new Date(2024, 11 - i, 15).toISOString(),
    eventType: eventTypes[i % eventTypes.length],
  }));
};

// Mock FAQs
const generateFAQs = (category: string): FAQ[] => {
  const commonFAQs: FAQ[] = [
    {
      id: 'faq1',
      question: 'What is included in the package?',
      answer: 'All items listed in the "What\'s Included" section are part of the base package. Additional services can be added as add-ons.',
    },
    {
      id: 'faq2',
      question: 'How far in advance should I book?',
      answer: 'We recommend booking at least 2-3 months in advance, especially for peak season dates. However, we accept bookings based on availability.',
    },
    {
      id: 'faq3',
      question: 'What is your cancellation policy?',
      answer: 'Cancellations made 30+ days before the event receive a full refund. 15-30 days: 50% refund. Less than 15 days: No refund.',
    },
    {
      id: 'faq4',
      question: 'Do you provide services outside the city?',
      answer: 'Yes, we provide services within our coverage radius. Additional travel charges may apply for locations beyond the coverage area.',
    },
    {
      id: 'faq5',
      question: 'Can I customize the package?',
      answer: 'Absolutely! You can add add-ons and customize various aspects of the package through our customization interface.',
    },
  ];
  
  return commonFAQs;
};

// Generate availability for next 3 months
const generateAvailability = (): AvailabilitySlot[] => {
  const slots: AvailabilitySlot[] = [];
  const today = new Date();
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const timeSlots = [
      { time: '09:00', status: Math.random() > 0.7 ? 'booked' : Math.random() > 0.5 ? 'busy' : 'available' as const },
      { time: '12:00', status: Math.random() > 0.6 ? 'booked' : Math.random() > 0.4 ? 'busy' : 'available' as const },
      { time: '15:00', status: Math.random() > 0.8 ? 'booked' : Math.random() > 0.5 ? 'busy' : 'available' as const },
      { time: '18:00', status: Math.random() > 0.7 ? 'booked' : Math.random() > 0.6 ? 'busy' : 'available' as const },
    ];
    
    slots.push({
      date: date.toISOString().split('T')[0],
      slots: timeSlots,
    });
  }
  
  return slots;
};

// SOLUTION 4: Bookable Setups
const generateBookableSetups = (vendorId: string, category: string): BookableSetup[] => {
  if (category === 'decorator') {
    return [
      {
        id: `setup-${vendorId}-1`,
        vendorId,
        image: 'https://picsum.photos/id/1018/800/1000',
        title: 'Royal Floral Stage Setup',
        description: 'Elegant stage decoration with premium flowers and golden accents',
        price: 120000,
        category: 'decorator',
      },
      {
        id: `setup-${vendorId}-2`,
        vendorId,
        image: 'https://picsum.photos/id/1015/800/1000',
        title: 'Modern Minimalist Decor',
        description: 'Contemporary design with clean lines and sophisticated lighting',
        price: 85000,
        category: 'decorator',
      },
    ];
  }
  if (category === 'photographer') {
    return [
      {
        id: `setup-${vendorId}-1`,
        vendorId,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop&q=80',
        title: 'Candid Wedding Photography',
        description: 'Natural, unposed moments captured beautifully',
        price: 45000,
        category: 'photographer',
      },
    ];
  }
  return [];
};

export const mockVendors: Vendor[] = [
  {
    id: 'v1',
    businessName: 'Moments Photography Studio',
    category: 'photographer',
    city: 'Mumbai',
    bio: 'Capturing your precious moments with artistic excellence. 10+ years of experience in wedding and event photography. We specialize in candid, traditional, and cinematic styles.',
    rating: 4.8,
    reviewCount: 127,
    startingPrice: 25000,
    coverImage: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&h=800&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop&q=80',
    ],
    packages: [
      {
        id: 'p1',
        vendorId: 'v1',
        name: 'Classic Wedding Package',
        price: 45000,
        description: 'Complete wedding day coverage with traditional and candid shots',
        includedItems: [
          '8 hours coverage',
          '2 photographers',
          '500+ edited photos',
          'Online gallery',
          'Premium album (40 pages)',
        ],
        excludedItems: [
          'Video coverage',
          'Drone photography',
          'Same-day delivery',
          'Additional locations',
        ],
        deliveryTime: '15-20 days after event',
        extraCharges: [
          'Travel beyond 50km: ₹5/km',
          'Overtime: ₹5,000/hour',
          'Additional locations: ₹10,000',
        ],
        images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a1', packageId: 'p1', title: 'Extra hour coverage', price: 5000, description: 'Additional photography hour' },
          { id: 'a2', packageId: 'p1', title: 'Drone photography', price: 8000, description: 'Aerial shots and videos' },
          { id: 'a3', packageId: 'p1', title: 'Additional album', price: 6000, description: 'Extra premium album' },
          { id: 'a4', packageId: 'p1', title: 'Same-day highlights', price: 12000, description: 'Quick edit and delivery' },
        ],
        bookableSetup: 'setup-v1-1',
        eventTypes: ['Wedding', 'Anniversary'],
      },
      {
        id: 'p2',
        vendorId: 'v1',
        name: 'Pre-Wedding Shoot',
        price: 25000,
        description: 'Beautiful outdoor pre-wedding photography session',
        includedItems: [
          '4 hours shoot',
          '1 location',
          '100+ edited photos',
          'Online gallery',
        ],
        excludedItems: [
          'Multiple locations',
          'Outfit changes',
          'Hair & makeup',
        ],
        deliveryTime: '10-12 days after shoot',
        extraCharges: [
          'Additional location: ₹8,000',
          'Outfit change: ₹3,000',
        ],
        images: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a5', packageId: 'p2', title: 'Additional location', price: 8000 },
          { id: 'a6', packageId: 'p2', title: 'Outfit change', price: 3000 },
        ],
        eventTypes: ['Wedding', 'Engagement'],
      },
      {
        id: 'p1-birthday',
        vendorId: 'v1',
        name: 'Birthday Celebration Package',
        price: 18000,
        description: 'Fun and vibrant birthday photography with candid moments',
        includedItems: [
          '4 hours coverage',
          '1 photographer',
          '200+ edited photos',
          'Online gallery',
          'Birthday highlights video',
        ],
        excludedItems: [
          'Print album',
          'Drone photography',
          'Same-day delivery',
        ],
        deliveryTime: '7-10 days after event',
        extraCharges: [
          'Travel beyond 30km: ₹3/km',
          'Overtime: ₹3,000/hour',
        ],
        images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a7', packageId: 'p1-birthday', title: 'Print album', price: 4000 },
          { id: 'a8', packageId: 'p1-birthday', title: 'Drone shots', price: 6000 },
        ],
        eventTypes: ['Birthday'],
      },
    ],
    faqs: generateFAQs('photographer'),
    reviews: generateReviews('v1', 10),
    coverageRadius: 100,
    pastEvents: [
      { image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80', eventType: 'Wedding', date: '2024-10-15' },
      { image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop&q=80', eventType: 'Engagement', date: '2024-09-20' },
    ],
    availability: generateAvailability(),
    bookableSetups: generateBookableSetups('v1', 'photographer'),
    listings: [
      {
        id: 'l1',
        vendorId: 'v1',
        name: 'Professional Camera Rental',
        price: 5000,
        description: 'High-end DSLR camera rental for events. Includes camera body, lens, and basic accessories.',
        images: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop&q=80'],
        category: 'photographer',
        unit: 'per day',
        minimumQuantity: 1,
        deliveryTime: 'Same day pickup available',
        eventTypes: ['Wedding', 'Birthday', 'Corporate'],
      },
      {
        id: 'l2',
        vendorId: 'v1',
        name: 'Additional Photographer',
        price: 8000,
        description: 'Extra photographer for your event. Professional with 5+ years experience.',
        images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=80'],
        category: 'photographer',
        unit: 'per event',
        minimumQuantity: 1,
        deliveryTime: 'Available on event day',
        eventTypes: ['Wedding', 'Engagement', 'Anniversary'],
      },
    ],
  },
  {
    id: 'v2',
    businessName: 'Grand Decor Events',
    category: 'decorator',
    city: 'Mumbai',
    bio: 'Transforming spaces into magical experiences. Specializing in wedding and corporate event decoration. We create stunning visual experiences with premium flowers, elegant lighting, and creative designs.',
    rating: 4.9,
    reviewCount: 89,
    startingPrice: 75000,
    coverImage: 'https://picsum.photos/id/1018/1200/800',
    portfolioImages: [
      'https://picsum.photos/id/1015/800/600',
      'https://picsum.photos/id/1016/800/600',
      'https://picsum.photos/id/1018/800/600',
      'https://picsum.photos/id/1020/800/600',
      'https://picsum.photos/id/1025/800/600',
    ],
    packages: [
      {
        id: 'p3',
        vendorId: 'v2',
        name: 'Royal Wedding Decor',
        price: 150000,
        description: 'Luxurious wedding decoration with premium flowers and lighting',
        includedItems: [
          'Stage decoration',
          'Entrance arch',
          'Floral centerpieces (20 tables)',
          'LED lighting setup',
          'Aisle decoration',
          'Setup & breakdown',
        ],
        excludedItems: [
          'Photo booth',
          'Dance floor lighting',
          'Outdoor decoration',
          'Additional floral arrangements',
        ],
        deliveryTime: 'Setup completed on event day',
        extraCharges: [
          'Late night breakdown: ₹10,000',
          'Additional tables: ₹2,000/table',
          'Premium flowers upgrade: ₹30,000',
        ],
        images: ['https://picsum.photos/id/1018/800/600'],
        addOns: [
          { id: 'a7', packageId: 'p3', title: 'Photo booth setup', price: 15000, description: 'Complete photo booth with props' },
          { id: 'a8', packageId: 'p3', title: 'Additional lighting', price: 20000, description: 'Enhanced lighting effects' },
          { id: 'a9', packageId: 'p3', title: 'Dance floor decoration', price: 25000, description: 'Special dance floor setup' },
        ],
        bookableSetup: 'setup-v2-1',
        eventTypes: ['Wedding', 'Anniversary'],
      },
      {
        id: 'p4',
        vendorId: 'v2',
        name: 'Elegant Reception Decor',
        price: 95000,
        description: 'Sophisticated reception decoration with modern touches',
        includedItems: [
          'Stage backdrop',
          'Welcome area',
          'Table centerpieces (15 tables)',
          'Basic lighting',
          'Setup & breakdown',
        ],
        excludedItems: [
          'Floral arrangements',
          'Premium lighting',
          'Photo booth',
        ],
        deliveryTime: 'Setup completed on event day',
        extraCharges: [
          'Additional tables: ₹2,000/table',
        ],
        images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a10', packageId: 'p4', title: 'Premium floral upgrade', price: 35000 },
        ],
        eventTypes: ['Wedding', 'Corporate'],
      },
      {
        id: 'p2-birthday',
        vendorId: 'v2',
        name: 'Birthday Party Decor',
        price: 45000,
        description: 'Colorful and fun birthday decoration with balloons and themes',
        includedItems: [
          'Theme-based decoration',
          'Balloon arch',
          'Table centerpieces',
          'Photo backdrop',
          'Setup & breakdown',
        ],
        excludedItems: [
          'Premium flowers',
          'LED lighting',
          'Custom props',
        ],
        deliveryTime: 'Setup completed on event day',
        extraCharges: [
          'Custom theme props: ₹5,000',
          'Premium balloons: ₹3,000',
        ],
        images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a11', packageId: 'p2-birthday', title: 'LED lighting', price: 8000 },
          { id: 'a12', packageId: 'p2-birthday', title: 'Custom props', price: 5000 },
        ],
        eventTypes: ['Birthday'],
      },
    ],
    faqs: generateFAQs('decorator'),
    reviews: generateReviews('v2', 8),
    coverageRadius: 150,
    pastEvents: [
      { image: 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c6?w=800&h=600&fit=crop&q=80', eventType: 'Wedding', date: '2024-11-10' },
      { image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80', eventType: 'Corporate', date: '2024-10-25' },
    ],
    availability: generateAvailability(),
    bookableSetups: generateBookableSetups('v2', 'decorator'),
    listings: [
      {
        id: 'l3',
        vendorId: 'v2',
        name: 'Premium Chairs (Gold)',
        price: 150,
        description: 'Elegant gold-colored premium chairs. Perfect for weddings and formal events.',
        images: ['https://picsum.photos/id/1015/800/600'],
        category: 'decorator',
        unit: 'per piece',
        minimumQuantity: 50,
        deliveryTime: 'Setup on event day',
        eventTypes: ['Wedding', 'Anniversary', 'Corporate'],
      },
      {
        id: 'l4',
        vendorId: 'v2',
        name: 'Floral Centerpiece',
        price: 2500,
        description: 'Beautiful floral centerpiece for tables. Fresh flowers arranged elegantly.',
        images: ['https://picsum.photos/id/1018/800/600'],
        category: 'decorator',
        unit: 'per piece',
        minimumQuantity: 10,
        deliveryTime: 'Setup on event day',
        eventTypes: ['Wedding', 'Anniversary', 'Birthday'],
      },
      {
        id: 'l5',
        vendorId: 'v2',
        name: 'LED String Lights',
        price: 500,
        description: 'Warm white LED string lights for ambiance. 50 meters length.',
        images: ['https://picsum.photos/id/1020/800/600'],
        category: 'decorator',
        unit: 'per set',
        minimumQuantity: 1,
        deliveryTime: 'Setup on event day',
        eventTypes: ['Wedding', 'Birthday', 'Anniversary'],
      },
    ],
  },
  {
    id: 'v3',
    businessName: 'Beat Masters DJ',
    category: 'dj',
    city: 'Delhi',
    bio: 'Professional DJ services for weddings, corporate events, and parties. Latest equipment and massive music library. We keep the party going!',
    rating: 4.7,
    reviewCount: 156,
    startingPrice: 30000,
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop&q=80',
    ],
    packages: [
      {
        id: 'p5',
        vendorId: 'v3',
        name: 'Premium DJ Night',
        price: 50000,
        description: 'Complete DJ setup with professional sound and lighting',
        includedItems: [
          '5 hours coverage',
          'Professional DJ console',
          'Premium sound system',
          'LED lighting',
          'Fog machine',
          'Wireless microphones (2)',
        ],
        excludedItems: [
          'Extended hours',
          'Additional speakers',
          'Video projection',
          'Karaoke setup',
        ],
        deliveryTime: 'Setup 2 hours before event',
        extraCharges: [
          'Overtime: ₹8,000/hour',
          'Additional speakers: ₹10,000',
          'Late night (after 12 AM): ₹15,000',
        ],
        images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a11', packageId: 'p5', title: 'Extra hour', price: 8000, description: 'Additional DJ time' },
          { id: 'a12', packageId: 'p5', title: 'Additional speakers', price: 10000, description: 'Enhanced sound system' },
          { id: 'a13', packageId: 'p5', title: 'Karaoke setup', price: 12000, description: 'Complete karaoke system' },
        ],
        eventTypes: ['Wedding', 'Birthday', 'Anniversary'],
      },
      {
        id: 'p3-birthday',
        vendorId: 'v3',
        name: 'Birthday Party DJ',
        price: 25000,
        description: 'Fun and energetic DJ for birthday celebrations',
        includedItems: [
          '4 hours coverage',
          'DJ console',
          'Sound system',
          'Basic lighting',
          'Wireless microphone',
        ],
        excludedItems: [
          'Premium lighting',
          'Fog machine',
          'Extended hours',
        ],
        deliveryTime: 'Setup 1 hour before event',
        extraCharges: [
          'Overtime: ₹5,000/hour',
        ],
        images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a14', packageId: 'p3-birthday', title: 'Premium lighting', price: 6000 },
          { id: 'a15', packageId: 'p3-birthday', title: 'Extra hour', price: 5000 },
        ],
        eventTypes: ['Birthday'],
      },
    ],
    faqs: generateFAQs('dj'),
    reviews: generateReviews('v3', 12),
    coverageRadius: 200,
    availability: generateAvailability(),
    listings: [
      {
        id: 'l6',
        vendorId: 'v3',
        name: 'Professional DJ Console Rental',
        price: 15000,
        description: 'High-end DJ console with mixing capabilities. Perfect for professional DJs.',
        images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop&q=80'],
        category: 'dj',
        unit: 'per day',
        minimumQuantity: 1,
        deliveryTime: 'Same day pickup available',
        eventTypes: ['Wedding', 'Birthday', 'Corporate'],
      },
      {
        id: 'l7',
        vendorId: 'v3',
        name: 'Wireless Microphone Set',
        price: 3000,
        description: 'Professional wireless microphone system with 2 handheld mics and receiver.',
        images: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80'],
        category: 'dj',
        unit: 'per set',
        minimumQuantity: 1,
        deliveryTime: 'Available on event day',
        eventTypes: ['Wedding', 'Corporate', 'Birthday'],
      },
    ],
  },
  {
    id: 'v4',
    businessName: 'Delicious Bites Catering',
    category: 'caterer',
    city: 'Bangalore',
    bio: 'Multi-cuisine catering with customizable menus. From traditional to contemporary, we serve it all with love. Hygiene certified and experienced chefs.',
    rating: 4.6,
    reviewCount: 203,
    startingPrice: 500,
    coverImage: 'https://picsum.photos/id/292/1200/800',
    portfolioImages: [
      'https://picsum.photos/id/292/800/600',
      'https://picsum.photos/id/312/800/600',
      'https://picsum.photos/id/326/800/600',
    ],
    packages: [
      {
        id: 'p6',
        vendorId: 'v4',
        name: 'Wedding Feast Package',
        price: 75000,
        description: 'Complete catering for 150 guests with multi-cuisine menu',
        includedItems: [
          '5-course meal',
          'Live counters (2)',
          'Dessert station',
          'Service staff (10)',
          'Crockery & cutlery',
          'Buffet setup',
        ],
        excludedItems: [
          'Beverages',
          'Bar service',
          'Additional guests',
          'Special dietary requirements',
        ],
        deliveryTime: 'Served fresh on event day',
        extraCharges: [
          'Per additional guest: ₹500',
          'Bar service: ₹25,000',
          'Special dietary (per person): ₹1,000',
        ],
        images: ['https://picsum.photos/id/292/800/600'],
        addOns: [
          { id: 'a14', packageId: 'p6', title: 'Per additional guest', price: 500, description: 'Extra guest coverage' },
          { id: 'a15', packageId: 'p6', title: 'Premium bar setup', price: 25000, description: 'Complete bar service' },
          { id: 'a16', packageId: 'p6', title: 'Live cooking station', price: 15000, description: 'Interactive cooking experience' },
        ],
        eventTypes: ['Wedding', 'Anniversary'],
      },
      {
        id: 'p4-birthday',
        vendorId: 'v4',
        name: 'Birthday Party Catering',
        price: 35000,
        description: 'Delicious food for birthday celebrations - perfect for kids and adults',
        includedItems: [
          'Snacks & starters',
          'Main course buffet',
          'Birthday cake cutting',
          'Dessert station',
          'Service staff (5)',
          'Crockery & cutlery',
        ],
        excludedItems: [
          'Beverages',
          'Bar service',
          'Custom cake',
        ],
        deliveryTime: 'Served fresh on event day',
        extraCharges: [
          'Per additional guest: ₹300',
          'Custom birthday cake: ₹5,000',
        ],
        images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a17', packageId: 'p4-birthday', title: 'Custom cake', price: 5000 },
          { id: 'a18', packageId: 'p4-birthday', title: 'Extra guest', price: 300 },
        ],
        eventTypes: ['Birthday'],
      },
      {
        id: 'p4-corporate',
        vendorId: 'v4',
        name: 'Corporate Event Catering',
        price: 45000,
        description: 'Professional catering for corporate meetings and events',
        includedItems: [
          'Business lunch/dinner',
          'Coffee & tea station',
          'Service staff (6)',
          'Crockery & cutlery',
          'Buffet setup',
        ],
        excludedItems: [
          'Beverages',
          'Bar service',
          'Extended hours',
        ],
        deliveryTime: 'Served fresh on event day',
        extraCharges: [
          'Per additional guest: ₹400',
          'Bar service: ₹20,000',
        ],
        images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a19', packageId: 'p4-corporate', title: 'Extra guest', price: 400 },
          { id: 'a20', packageId: 'p4-corporate', title: 'Bar service', price: 20000 },
        ],
        eventTypes: ['Corporate'],
      },
    ],
    faqs: generateFAQs('caterer'),
    reviews: generateReviews('v4', 15),
    coverageRadius: 80,
    availability: generateAvailability(),
    listings: [
      {
        id: 'l8',
        vendorId: 'v4',
        name: 'Per Plate Catering',
        price: 500,
        description: 'Delicious multi-cuisine meal per person. Includes main course, rice, roti, and dessert.',
        images: ['https://picsum.photos/id/292/800/600'],
        category: 'caterer',
        unit: 'per plate',
        minimumQuantity: 50,
        deliveryTime: 'Served fresh on event day',
        eventTypes: ['Wedding', 'Birthday', 'Anniversary', 'Corporate'],
      },
      {
        id: 'l9',
        vendorId: 'v4',
        name: 'Live Cooking Station',
        price: 15000,
        description: 'Interactive live cooking counter with chef. Popular dishes prepared fresh.',
        images: ['https://picsum.photos/id/312/800/600'],
        category: 'caterer',
        unit: 'per station',
        minimumQuantity: 1,
        deliveryTime: 'Setup on event day',
        eventTypes: ['Wedding', 'Corporate'],
      },
      {
        id: 'l10',
        vendorId: 'v4',
        name: 'Dessert Station Setup',
        price: 8000,
        description: 'Beautiful dessert station with 5+ varieties of sweets and pastries.',
        images: ['https://picsum.photos/id/326/800/600'],
        category: 'caterer',
        unit: 'per station',
        minimumQuantity: 1,
        deliveryTime: 'Setup on event day',
        eventTypes: ['Wedding', 'Birthday', 'Anniversary'],
      },
    ],
  },
  {
    id: 'v5',
    businessName: 'Glamour Studio',
    category: 'mua',
    city: 'Mumbai',
    bio: 'Professional bridal makeup and hair styling. Making you look stunning on your special day. HD makeup specialists with premium products.',
    rating: 4.9,
    reviewCount: 234,
    startingPrice: 15000,
    coverImage: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=800&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&q=80',
    ],
    packages: [
      {
        id: 'p7',
        vendorId: 'v5',
        name: 'Bridal Makeup Package',
        price: 30000,
        description: 'Complete bridal makeup with hair styling and draping',
        includedItems: [
          'HD makeup',
          'Hair styling',
          'Saree draping',
          'False lashes',
          'Makeup trial',
          'Touch-up kit',
        ],
        excludedItems: [
          'Hair extensions',
          'Mehendi application',
          'Family makeup',
          'Multiple outfit changes',
        ],
        deliveryTime: 'On event day (3-4 hours before)',
        extraCharges: [
          'Hair extensions: ₹8,000',
          'Mehendi application: ₹5,000',
        ],
        images: ['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a17', packageId: 'p7', title: 'Family makeup (per person)', price: 5000, description: 'Additional person makeup' },
          { id: 'a18', packageId: 'p7', title: 'Engagement makeup', price: 12000, description: 'Separate engagement event' },
          { id: 'a19', packageId: 'p7', title: 'Hair extensions', price: 8000, description: 'Premium hair extensions' },
        ],
        eventTypes: ['Wedding', 'Engagement'],
      },
      {
        id: 'p5-birthday',
        vendorId: 'v5',
        name: 'Party Makeup Package',
        price: 8000,
        description: 'Glamorous makeup for birthday parties and celebrations',
        includedItems: [
          'Party makeup',
          'Hair styling',
          'False lashes',
          'Touch-up kit',
        ],
        excludedItems: [
          'Hair extensions',
          'Trial session',
          'Multiple outfit changes',
        ],
        deliveryTime: 'On event day (2 hours before)',
        extraCharges: [
          'Hair extensions: ₹5,000',
        ],
        images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a21', packageId: 'p5-birthday', title: 'Hair extensions', price: 5000 },
        ],
        eventTypes: ['Birthday'],
      },
    ],
    faqs: generateFAQs('mua'),
    reviews: generateReviews('v5', 18),
    coverageRadius: 50,
    availability: generateAvailability(),
    listings: [
      {
        id: 'l11',
        vendorId: 'v5',
        name: 'Hair Styling Service',
        price: 5000,
        description: 'Professional hair styling for any occasion. Includes blow dry and styling.',
        images: ['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop&q=80'],
        category: 'mua',
        unit: 'per person',
        minimumQuantity: 1,
        deliveryTime: 'On event day',
        eventTypes: ['Wedding', 'Engagement', 'Birthday'],
      },
      {
        id: 'l12',
        vendorId: 'v5',
        name: 'Saree Draping Service',
        price: 2000,
        description: 'Expert saree draping with perfect pleats and pallu styling.',
        images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=600&fit=crop&q=80'],
        category: 'mua',
        unit: 'per person',
        minimumQuantity: 1,
        deliveryTime: 'On event day',
        eventTypes: ['Wedding', 'Engagement'],
      },
      {
        id: 'l13',
        vendorId: 'v5',
        name: 'Makeup Trial Session',
        price: 3000,
        description: 'Pre-event makeup trial to finalize your look. Includes consultation.',
        images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&q=80'],
        category: 'mua',
        unit: 'per session',
        minimumQuantity: 1,
        deliveryTime: 'Scheduled appointment',
        eventTypes: ['Wedding', 'Engagement'],
      },
    ],
  },
  // Adding more vendors for other categories
  {
    id: 'v6',
    businessName: 'Cinematic Dreams',
    category: 'cinematographer',
    city: 'Delhi',
    bio: 'Professional wedding cinematography with cinematic storytelling. We create beautiful wedding films that you\'ll treasure forever.',
    rating: 4.8,
    reviewCount: 94,
    startingPrice: 60000,
    coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=800&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
    ],
    packages: [
      {
        id: 'p8',
        vendorId: 'v6',
        name: 'Wedding Cinematography Package',
        price: 85000,
        description: 'Complete wedding video coverage with cinematic editing',
        includedItems: [
          'Full day coverage',
          '2 cinematographers',
          '4K video quality',
          'Highlight reel (5-7 min)',
          'Full wedding film (45-60 min)',
          'Drone shots',
        ],
        excludedItems: [
          'Same-day edit',
          'Additional edits',
          'Raw footage',
        ],
        deliveryTime: '30-45 days after event',
        extraCharges: [
          'Same-day edit: ₹20,000',
          'Raw footage: ₹15,000',
        ],
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a20', packageId: 'p8', title: 'Same-day highlights', price: 20000 },
          { id: 'a21', packageId: 'p8', title: 'Raw footage', price: 15000 },
        ],
        eventTypes: ['Wedding', 'Engagement'],
      },
    ],
    faqs: generateFAQs('cinematographer'),
    reviews: generateReviews('v6', 8),
    coverageRadius: 120,
    availability: generateAvailability(),
    listings: [
      {
        id: 'l14',
        vendorId: 'v6',
        name: 'Drone Photography & Videography',
        price: 15000,
        description: 'Aerial shots and videos using professional drone equipment. Breathtaking views.',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop&q=80'],
        category: 'cinematographer',
        unit: 'per event',
        minimumQuantity: 1,
        deliveryTime: 'Included in final video',
        eventTypes: ['Wedding', 'Engagement'],
      },
      {
        id: 'l15',
        vendorId: 'v6',
        name: 'Same-Day Highlight Reel',
        price: 20000,
        description: 'Quick edit and delivery of highlight reel on the same day of event.',
        images: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80'],
        category: 'cinematographer',
        unit: 'per reel',
        minimumQuantity: 1,
        deliveryTime: 'Same day',
        eventTypes: ['Wedding', 'Engagement'],
      },
    ],
  },
  {
    id: 'v7',
    businessName: 'Sound & Light Masters',
    category: 'sound-lights',
    city: 'Bangalore',
    bio: 'Professional sound and lighting solutions for events. State-of-the-art equipment and expert technicians.',
    rating: 4.7,
    reviewCount: 67,
    startingPrice: 40000,
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=800&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&q=80',
    ],
    packages: [
      {
        id: 'p9',
        vendorId: 'v7',
        name: 'Premium Sound & Lights',
        price: 65000,
        description: 'Complete sound and lighting setup for large events',
        includedItems: [
          'Professional sound system',
          'LED stage lighting',
          'DMX control',
          'Sound engineer',
          'Lighting technician',
          'Setup & breakdown',
        ],
        excludedItems: [
          'Fog machines',
          'Laser shows',
          'Extended hours',
        ],
        deliveryTime: 'Setup on event day',
        extraCharges: [
          'Overtime: ₹5,000/hour',
          'Laser show: ₹25,000',
        ],
        images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&q=80'],
        addOns: [
          { id: 'a22', packageId: 'p9', title: 'Laser show', price: 25000 },
          { id: 'a23', packageId: 'p9', title: 'Fog machines', price: 8000 },
        ],
        eventTypes: ['Wedding', 'Corporate', 'Birthday'],
      },
    ],
    faqs: generateFAQs('sound-lights'),
    reviews: generateReviews('v7', 6),
    coverageRadius: 100,
    availability: generateAvailability(),
    listings: [
      {
        id: 'l16',
        vendorId: 'v7',
        name: 'Professional Sound System',
        price: 20000,
        description: 'High-quality sound system with speakers, amplifiers, and mixer. Perfect for large events.',
        images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&q=80'],
        category: 'sound-lights',
        unit: 'per event',
        minimumQuantity: 1,
        deliveryTime: 'Setup on event day',
        eventTypes: ['Wedding', 'Corporate', 'Birthday'],
      },
      {
        id: 'l17',
        vendorId: 'v7',
        name: 'LED Stage Lighting Setup',
        price: 15000,
        description: 'Dynamic LED stage lighting with color-changing effects and DMX control.',
        images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&q=80'],
        category: 'sound-lights',
        unit: 'per setup',
        minimumQuantity: 1,
        deliveryTime: 'Setup on event day',
        eventTypes: ['Wedding', 'Corporate', 'Birthday'],
      },
      {
        id: 'l18',
        vendorId: 'v7',
        name: 'Wireless Microphone System',
        price: 5000,
        description: 'Professional wireless microphone with receiver and stand. Clear audio quality.',
        images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&q=80'],
        category: 'sound-lights',
        unit: 'per set',
        minimumQuantity: 1,
        deliveryTime: 'Setup on event day',
        eventTypes: ['Wedding', 'Corporate'],
      },
    ],
  },
];

export const getVendorById = (id: string) => mockVendors.find(v => v.id === id);
export const getPackageById = (vendorId: string, packageId: string) => {
  const vendor = getVendorById(vendorId);
  return vendor?.packages.find(p => p.id === packageId);
};
export const getBookableSetupById = (id: string) => {
  for (const vendor of mockVendors) {
    const setup = vendor.bookableSetups?.find(s => s.id === id);
    if (setup) return setup;
  }
  return null;
};
