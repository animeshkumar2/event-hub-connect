import { Vendor, Package } from '@/data/mockData';

/**
 * Flattened package structure for package-centric display
 */
export interface FlattenedPackage {
  packageId: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  vendorReviewCount: number;
  vendorCity: string;
  vendorCoverageRadius: number;
  category: string;
  packageName: string;
  packageType: string;
  price: number;
  description: string;
  includedItems: string[];
  excludedItems: string[];
  deliveryTime: string;
  images: string[];
  availability: 'available' | 'limited' | 'booked';
  isPopular: boolean;
  isTrending: boolean;
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
 * Flatten vendor/package data structure into package-centric format
 */
export const flattenPackages = (vendors: Vendor[], eventType?: string): FlattenedPackage[] => {
  const flattened: FlattenedPackage[] = [];

  vendors.forEach(vendor => {
    vendor.packages.forEach(pkg => {
      // Filter by eventType if provided
      // If package has eventTypes defined, it must include the eventType
      // If package doesn't have eventTypes, include it for backward compatibility
      if (eventType) {
        if (pkg.eventTypes && pkg.eventTypes.length > 0) {
          if (!pkg.eventTypes.includes(eventType)) {
            return; // Skip this package if it doesn't match the event type
          }
        }
        // If no eventTypes defined, include it (backward compatibility)
      }
      
      flattened.push({
        packageId: pkg.id,
        vendorId: vendor.id,
        vendorName: vendor.businessName,
        vendorRating: vendor.rating,
        vendorReviewCount: vendor.reviewCount,
        vendorCity: vendor.city,
        vendorCoverageRadius: vendor.coverageRadius,
        category: vendor.category,
        packageName: pkg.name,
        packageType: classifyPackageType(pkg.name),
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
  });

  return flattened;
};

/**
 * Get unique package types for a given category
 */
export const getPackageTypesForCategory = (
  packages: FlattenedPackage[],
  category: string
): string[] => {
  const types = new Set<string>();
  
  packages
    .filter(pkg => pkg.category === category)
    .forEach(pkg => types.add(pkg.packageType));
  
  return ['All Packages', ...Array.from(types).sort()];
};
