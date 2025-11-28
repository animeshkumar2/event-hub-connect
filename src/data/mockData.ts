export const categories = [
  { id: 'photographer', name: 'Photographer', icon: '📸' },
  { id: 'decorator', name: 'Decorator', icon: '🎨' },
  { id: 'dj', name: 'DJ', icon: '🎵' },
  { id: 'caterer', name: 'Caterer', icon: '🍽️' },
  { id: 'mua', name: 'Makeup Artist', icon: '💄' },
  { id: 'venue', name: 'Venue', icon: '🏛️' },
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
}

export interface Package {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  description: string;
  includedItems: string[];
  images: string[];
  addOns: AddOn[];
}

export interface AddOn {
  id: string;
  packageId: string;
  title: string;
  price: number;
}

export const mockVendors: Vendor[] = [
  {
    id: 'v1',
    businessName: 'Moments Photography Studio',
    category: 'photographer',
    city: 'Mumbai',
    bio: 'Capturing your precious moments with artistic excellence. 10+ years of experience in wedding and event photography.',
    rating: 4.8,
    reviewCount: 127,
    startingPrice: 25000,
    coverImage: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
    portfolioImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
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
        images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'],
        addOns: [
          { id: 'a1', packageId: 'p1', title: 'Extra hour coverage', price: 5000 },
          { id: 'a2', packageId: 'p1', title: 'Drone photography', price: 8000 },
          { id: 'a3', packageId: 'p1', title: 'Additional album', price: 6000 },
        ],
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
        images: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800'],
        addOns: [
          { id: 'a4', packageId: 'p2', title: 'Additional location', price: 8000 },
          { id: 'a5', packageId: 'p2', title: 'Outfit change', price: 3000 },
        ],
      },
    ],
  },
  {
    id: 'v2',
    businessName: 'Grand Decor Events',
    category: 'decorator',
    city: 'Mumbai',
    bio: 'Transforming spaces into magical experiences. Specializing in wedding and corporate event decoration.',
    rating: 4.9,
    reviewCount: 89,
    startingPrice: 75000,
    coverImage: 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c6?w=1200',
    portfolioImages: [
      'https://images.unsplash.com/photo-1519167758481-83f29da8a1c6?w=800',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
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
          'Floral centerpieces',
          'LED lighting',
          'Aisle decoration',
        ],
        images: ['https://images.unsplash.com/photo-1519167758481-83f29da8a1c6?w=800'],
        addOns: [
          { id: 'a6', packageId: 'p3', title: 'Photo booth setup', price: 15000 },
          { id: 'a7', packageId: 'p3', title: 'Additional lighting', price: 20000 },
        ],
      },
    ],
  },
  {
    id: 'v3',
    businessName: 'Beat Masters DJ',
    category: 'dj',
    city: 'Delhi',
    bio: 'Professional DJ services for weddings, corporate events, and parties. Latest equipment and massive music library.',
    rating: 4.7,
    reviewCount: 156,
    startingPrice: 30000,
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
    portfolioImages: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    ],
    packages: [
      {
        id: 'p4',
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
        ],
        images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'],
        addOns: [
          { id: 'a8', packageId: 'p4', title: 'Extra hour', price: 8000 },
          { id: 'a9', packageId: 'p4', title: 'Additional speakers', price: 10000 },
        ],
      },
    ],
  },
  {
    id: 'v4',
    businessName: 'Delicious Bites Catering',
    category: 'caterer',
    city: 'Bangalore',
    bio: 'Multi-cuisine catering with customizable menus. From traditional to contemporary, we serve it all with love.',
    rating: 4.6,
    reviewCount: 203,
    startingPrice: 500,
    coverImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200',
    portfolioImages: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    ],
    packages: [
      {
        id: 'p5',
        vendorId: 'v4',
        name: 'Wedding Feast Package',
        price: 75000,
        description: 'Complete catering for 150 guests with multi-cuisine menu',
        includedItems: [
          '5-course meal',
          'Live counters',
          'Dessert station',
          'Service staff',
          'Crockery & cutlery',
        ],
        images: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=800'],
        addOns: [
          { id: 'a10', packageId: 'p5', title: 'Per additional guest', price: 500 },
          { id: 'a11', packageId: 'p5', title: 'Premium bar setup', price: 25000 },
        ],
      },
    ],
  },
  {
    id: 'v5',
    businessName: 'Glamour Studio',
    category: 'mua',
    city: 'Mumbai',
    bio: 'Professional bridal makeup and hair styling. Making you look stunning on your special day.',
    rating: 4.9,
    reviewCount: 234,
    startingPrice: 15000,
    coverImage: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200',
    portfolioImages: [
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    ],
    packages: [
      {
        id: 'p6',
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
        ],
        images: ['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800'],
        addOns: [
          { id: 'a12', packageId: 'p6', title: 'Family makeup (per person)', price: 5000 },
          { id: 'a13', packageId: 'p6', title: 'Engagement makeup', price: 12000 },
        ],
      },
    ],
  },
];

export const getVendorById = (id: string) => mockVendors.find(v => v.id === id);
export const getPackageById = (vendorId: string, packageId: string) => {
  const vendor = getVendorById(vendorId);
  return vendor?.packages.find(p => p.id === packageId);
};
