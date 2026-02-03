// Vendor Category to Allowed Listing Categories Mapping
// This defines what listing categories a vendor can create based on their profession

export interface CategoryPermission {
  vendorCategoryId: string;
  vendorCategoryName: string;
  allowedListingCategories: string[];
  description: string;
  isAllAccess?: boolean;
}

export const VENDOR_CATEGORY_PERMISSIONS: Record<string, CategoryPermission> = {
  'photo-video': {
    vendorCategoryId: 'photo-video',
    vendorCategoryName: 'Photographer',
    allowedListingCategories: ['photo-video'],
    description: 'Photography & Videography services',
  },
  'decorator': {
    vendorCategoryId: 'decorator',
    vendorCategoryName: 'Decorator',
    allowedListingCategories: ['decorator', 'caterer', 'venue'],
    description: 'Décor, Catering & Venue services',
  },
  'caterer': {
    vendorCategoryId: 'caterer',
    vendorCategoryName: 'Caterer',
    allowedListingCategories: ['caterer', 'venue', 'decorator'],
    description: 'Catering, Venue & Décor services',
  },
  'venue': {
    vendorCategoryId: 'venue',
    vendorCategoryName: 'Venue Owner',
    allowedListingCategories: ['venue', 'caterer', 'decorator'],
    description: 'Venue, Catering & Décor services',
  },
  'mua': {
    vendorCategoryId: 'mua',
    vendorCategoryName: 'Makeup Artist',
    allowedListingCategories: ['mua'],
    description: 'Makeup & Styling services',
  },
  'dj-entertainment': {
    vendorCategoryId: 'dj-entertainment',
    vendorCategoryName: 'DJ',
    allowedListingCategories: ['dj-entertainment', 'sound-lights', 'artists'],
    description: 'DJ, Sound & Lights, Artists services',
  },
  'sound-lights': {
    vendorCategoryId: 'sound-lights',
    vendorCategoryName: 'Sound & Lights',
    allowedListingCategories: ['sound-lights', 'dj-entertainment', 'artists'],
    description: 'Sound & Lights, DJ, Artists services',
  },
  'artists': {
    vendorCategoryId: 'artists',
    vendorCategoryName: 'Artist / Performer',
    allowedListingCategories: ['artists', 'dj-entertainment', 'sound-lights'],
    description: 'Artists, DJ & Sound services',
  },
  'event-planner': {
    vendorCategoryId: 'event-planner',
    vendorCategoryName: 'Event Planner',
    allowedListingCategories: ['photo-video', 'decorator', 'caterer', 'venue', 'mua', 'dj-entertainment', 'sound-lights', 'artists'],
    description: 'All event services',
    isAllAccess: true,
  },
};

// Helper function to get allowed categories for a vendor
export const getAllowedCategoriesForVendor = (vendorCategoryId: string): string[] => {
  const permission = VENDOR_CATEGORY_PERMISSIONS[vendorCategoryId];
  if (!permission) return [];
  return permission.allowedListingCategories;
};

// Helper function to check if a vendor can create a listing in a category
export const canVendorCreateListing = (vendorCategoryId: string, listingCategoryId: string): boolean => {
  const allowedCategories = getAllowedCategoriesForVendor(vendorCategoryId);
  return allowedCategories.includes(listingCategoryId);
};

// Helper function to get permission info for a vendor category
export const getVendorPermissionInfo = (vendorCategoryId: string): CategoryPermission | null => {
  return VENDOR_CATEGORY_PERMISSIONS[vendorCategoryId] || null;
};

// Category display names mapping
export const LISTING_CATEGORY_NAMES: Record<string, string> = {
  'photo-video': 'Photography & Videography',
  'decorator': 'Décor',
  'caterer': 'Catering',
  'venue': 'Venue',
  'mua': 'Makeup & Styling',
  'dj-entertainment': 'DJ & Entertainment',
  'sound-lights': 'Sound & Lights',
  'artists': 'Artists & Performers',
};

// Get display names for allowed categories
export const getAllowedCategoryNames = (vendorCategoryId: string): string[] => {
  const allowedCategories = getAllowedCategoriesForVendor(vendorCategoryId);
  return allowedCategories.map(catId => LISTING_CATEGORY_NAMES[catId] || catId);
};
