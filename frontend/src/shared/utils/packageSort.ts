import { FlattenedPackage } from './packageUtils';

export type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'vendor';

/**
 * Sort packages by relevance (rating and popularity)
 */
export const sortByRelevance = (packages: FlattenedPackage[]): FlattenedPackage[] => {
  return [...packages].sort((a, b) => {
    // Popular packages first
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;

    // Then trending packages
    if (a.isTrending && !b.isTrending) return -1;
    if (!a.isTrending && b.isTrending) return 1;

    // Then by rating
    if (a.vendorRating !== b.vendorRating) {
      return b.vendorRating - a.vendorRating;
    }

    // Then by review count
    return b.vendorReviewCount - a.vendorReviewCount;
  });
};

/**
 * Sort packages by price (low to high)
 */
export const sortByPriceLow = (packages: FlattenedPackage[]): FlattenedPackage[] => {
  return [...packages].sort((a, b) => a.price - b.price);
};

/**
 * Sort packages by price (high to low)
 */
export const sortByPriceHigh = (packages: FlattenedPackage[]): FlattenedPackage[] => {
  return [...packages].sort((a, b) => b.price - a.price);
};

/**
 * Sort packages by rating (high to low)
 */
export const sortByRating = (packages: FlattenedPackage[]): FlattenedPackage[] => {
  return [...packages].sort((a, b) => {
    if (a.vendorRating !== b.vendorRating) {
      return b.vendorRating - a.vendorRating;
    }
    return b.vendorReviewCount - a.vendorReviewCount;
  });
};

/**
 * Sort packages by vendor name (alphabetically, grouping same vendor)
 */
export const sortByVendor = (packages: FlattenedPackage[]): FlattenedPackage[] => {
  return [...packages].sort((a, b) => {
    const vendorCompare = a.vendorName.localeCompare(b.vendorName);
    if (vendorCompare !== 0) return vendorCompare;
    
    // Within same vendor, sort by price
    return a.price - b.price;
  });
};

/**
 * Apply sort to packages based on sort option
 */
export const sortPackages = (
  packages: FlattenedPackage[],
  sortBy: SortOption
): FlattenedPackage[] => {
  switch (sortBy) {
    case 'relevance':
      return sortByRelevance(packages);
    case 'price-low':
      return sortByPriceLow(packages);
    case 'price-high':
      return sortByPriceHigh(packages);
    case 'rating':
      return sortByRating(packages);
    case 'vendor':
      return sortByVendor(packages);
    default:
      return sortByRelevance(packages);
  }
};
