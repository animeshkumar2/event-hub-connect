import { Vendor, Package, Listing } from '@/data/mockData';

/**
 * Flattened package/listing structure for unified display
 */
export interface FlattenedPackage {
  id: string; // packageId or listingId
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  vendorReviewCount: number;
  vendorCity: string;
  vendorCoverageRadius: number;
  category: string;
  name: string; // packageName or listingName
  type: 'package' | 'listing'; // Distinguish between package and listing
  price: number;
  description: string;
  includedItems?: string[]; // Only for packages
  excludedItems?: string[]; // Only for packages
  deliveryTime?: string;
  images: string[];
  availability: 'available' | 'limited' | 'booked';
  isPopular: boolean;
  isTrending: boolean;
  // Legacy fields for backward compatibility
  packageId?: string;
  packageName?: string;
  packageType?: string;
}

/**
 * Classify package type based on package name
 */
export const classifyPackageType = (packageName: string): string => {
  const name = packageName.toLowerCase();
  
  if (name.includes('pre-wedding') || name.includes('prewedding')) return 'Pre-Wedding';
  if (name.includes('classic')) return 'Classic';
  if (name.includes('premium') || name.includes('royal') || name.includes('luxury')) return 'Premium';
  if (name.includes('basic') || name.includes('standard')) return 'Standard';
  if (name.includes('custom')) return 'Custom';
  if (name.includes('engagement')) return 'Engagement';
  if (name.includes('reception')) return 'Reception';
  if (name.includes('bridal')) return 'Bridal';
  
  return 'Other';
};

/**
 * Determine availability status based on vendor availability data
 */
const getAvailabilityStatus = (vendor: Vendor): 'available' | 'limited' | 'booked' => {
  if (!vendor.availability || vendor.availability.length === 0) {
    return 'available';
  }

  // Count available slots in next 30 days
  const today = new Date();
  const next30Days = new Date(today);
  next30Days.setDate(today.getDate() + 30);

  let availableCount = 0;
  let totalCount = 0;

  vendor.availability.forEach(slot => {
    const slotDate = new Date(slot.date);
    if (slotDate >= today && slotDate <= next30Days) {
      slot.slots.forEach(timeSlot => {
        totalCount++;
        if (timeSlot.status === 'available') {
          availableCount++;
        }
      });
    }
  });

  if (totalCount === 0) return 'available';
  
  const availabilityRatio = availableCount / totalCount;
  
  if (availabilityRatio === 0) return 'booked';
  if (availabilityRatio < 0.3) return 'limited';
  return 'available';
};

/**
 * Determine if package is popular based on vendor metrics
 */
const isPackagePopular = (vendor: Vendor): boolean => {
  return vendor.rating >= 4.7 && vendor.reviewCount >= 100;
};

/**
 * Determine if package is trending (high rating with moderate reviews)
 */
const isPackageTrending = (vendor: Vendor): boolean => {
  return vendor.rating >= 4.8 && vendor.reviewCount >= 50 && vendor.reviewCount < 100;
};

/**
 * Flatten vendor/package/listing data structure into unified format
 */
export const flattenPackages = (vendors: Vendor[], eventType?: string, listingType: 'all' | 'packages' = 'all'): FlattenedPackage[] => {
  const flattened: FlattenedPackage[] = [];

  vendors.forEach(vendor => {
    // Add packages
    if (listingType === 'all' || listingType === 'packages') {
      vendor.packages.forEach(pkg => {
        // STRICT FILTERING: Filter by eventType if provided
        // If eventType is specified, package MUST have eventTypes array and MUST include the eventType
        if (eventType) {
          // If package has no eventTypes or empty array, skip it (strict filtering)
          if (!pkg.eventTypes || pkg.eventTypes.length === 0) {
            return; // Skip packages without eventTypes when eventType filter is active
          }
          // Package must explicitly include this eventType
          if (!pkg.eventTypes.includes(eventType)) {
            return; // Skip this package if it doesn't match the event type
          }
        }
        
        flattened.push({
          id: pkg.id,
          packageId: pkg.id, // Legacy support
          vendorId: vendor.id,
          vendorName: vendor.businessName,
          vendorRating: vendor.rating,
          vendorReviewCount: vendor.reviewCount,
          vendorCity: vendor.city,
          vendorCoverageRadius: vendor.coverageRadius,
          // Packages can have their own category, but default to vendor category
          // This allows packages to be categorized independently if needed
          // CRITICAL: Filtering in Search page is based on this category, not vendor category
          // Ensure category is always set - use package category if available, otherwise vendor category
          category: (pkg as any).category || vendor.category,
          name: pkg.name,
          packageName: pkg.name, // Legacy support
          type: 'package',
          packageType: classifyPackageType(pkg.name), // Legacy support
          price: pkg.price,
          description: pkg.description,
          includedItems: pkg.includedItems,
          excludedItems: pkg.excludedItems || [],
          deliveryTime: pkg.deliveryTime,
          images: pkg.images,
          availability: getAvailabilityStatus(vendor),
          isPopular: isPackagePopular(vendor),
          isTrending: isPackageTrending(vendor),
        });
      });
    }

    // Add individual listings
    if (listingType === 'all' && vendor.listings && vendor.listings.length > 0) {
      vendor.listings.forEach(listing => {
        // STRICT FILTERING: Filter by eventType if provided
        // If eventType is specified, listing MUST have eventTypes array and MUST include the eventType
        if (eventType) {
          // If listing has no eventTypes or empty array, skip it (strict filtering)
          if (!listing.eventTypes || listing.eventTypes.length === 0) {
            return; // Skip listings without eventTypes when eventType filter is active
          }
          // Listing must explicitly include this eventType
          if (!listing.eventTypes.includes(eventType)) {
            return; // Skip this listing if it doesn't match the event type
          }
        }
        
        flattened.push({
          id: listing.id,
          vendorId: vendor.id,
          vendorName: vendor.businessName,
          vendorRating: vendor.rating,
          vendorReviewCount: vendor.reviewCount,
          vendorCity: vendor.city,
          vendorCoverageRadius: vendor.coverageRadius,
          // Use listing's own category first, fallback to vendor category only if not specified
          // This ensures listings are categorized correctly (e.g., decorator listings stay in decorator category)
          // CRITICAL: Listings MUST have their category set explicitly - they should not inherit vendor category
          // unless the listing truly belongs to that vendor's primary category
          category: listing.category || vendor.category,
          name: listing.name,
          type: 'listing',
          price: listing.price,
          description: listing.description,
          deliveryTime: listing.deliveryTime,
          images: listing.images,
          availability: getAvailabilityStatus(vendor),
          isPopular: isPackagePopular(vendor),
          isTrending: isPackageTrending(vendor),
        });
      });
    }
  });

  return flattened;
};

/**
 * Get unique package types for a given category (DEPRECATED - kept for backward compatibility)
 * @deprecated Package type filters are being removed. Use listing type filter instead.
 */
export const getPackageTypesForCategory = (
  packages: FlattenedPackage[],
  category: string
): string[] => {
  const types = new Set<string>();
  
  packages
    .filter(pkg => pkg.category === category && pkg.type === 'package')
    .forEach(pkg => {
      if (pkg.packageType) {
        types.add(pkg.packageType);
      }
    });
  
  return ['All Packages', ...Array.from(types).sort()];
};
