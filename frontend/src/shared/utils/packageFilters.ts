import { FlattenedPackage } from './packageUtils';

/**
 * Filter packages by category
 * Strict matching - only returns items that exactly match the category
 */
export const filterByCategory = (
  packages: FlattenedPackage[],
  category: string
): FlattenedPackage[] => {
  if (!category || category === 'all') {
    return packages;
  }
  // Strict category matching - each item's category must exactly match
  return packages.filter(pkg => {
    // Ensure category exists and matches exactly
    return pkg.category && pkg.category === category;
  });
};

/**
 * Filter packages by listing type (package vs listing)
 */
export const filterByListingType = (
  packages: FlattenedPackage[],
  listingType: 'all' | 'packages'
): FlattenedPackage[] => {
  if (listingType === 'all') {
    return packages;
  }
  return packages.filter(pkg => pkg.type === 'package');
};

/**
 * Filter packages by minimum budget
 */
export const filterByMinBudget = (
  packages: FlattenedPackage[],
  minBudget: number
): FlattenedPackage[] => {
  if (!minBudget || minBudget <= 0) {
    return packages;
  }
  return packages.filter(pkg => pkg.price >= minBudget);
};

/**
 * Filter packages by maximum budget
 */
export const filterByMaxBudget = (
  packages: FlattenedPackage[],
  maxBudget: number
): FlattenedPackage[] => {
  if (!maxBudget || maxBudget <= 0) {
    return packages;
  }
  return packages.filter(pkg => pkg.price <= maxBudget);
};

/**
 * Filter packages by city (considering vendor coverage radius)
 */
export const filterByCity = (
  packages: FlattenedPackage[],
  city: string
): FlattenedPackage[] => {
  if (!city || city === 'all') {
    return packages;
  }
  return packages.filter(pkg => pkg.vendorCity === city);
};

/**
 * Filter packages by availability status
 */
export const filterByAvailability = (
  packages: FlattenedPackage[],
  availability: 'all' | 'available' | 'limited'
): FlattenedPackage[] => {
  if (!availability || availability === 'all') {
    return packages;
  }
  return packages.filter(pkg => pkg.availability === availability);
};

/**
 * Filter packages by minimum rating
 */
export const filterByMinRating = (
  packages: FlattenedPackage[],
  minRating: number
): FlattenedPackage[] => {
  if (!minRating || minRating <= 0) {
    return packages;
  }
  return packages.filter(pkg => pkg.vendorRating >= minRating);
};

/**
 * Combined filter function that applies all filters
 */
export interface PackageFilters {
  category?: string;
  listingType?: 'all' | 'packages';
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  minRating?: number;
  availability?: 'all' | 'available' | 'limited';
  searchQuery?: string;
}

export const applyFilters = (
  packages: FlattenedPackage[],
  filters: PackageFilters
): FlattenedPackage[] => {
  let filtered = packages;

  if (filters.category) {
    filtered = filterByCategory(filtered, filters.category);
  }

  if (filters.listingType) {
    filtered = filterByListingType(filtered, filters.listingType);
  }

  if (filters.city) {
    filtered = filterByCity(filtered, filters.city);
  }

  if (filters.minBudget) {
    filtered = filterByMinBudget(filtered, filters.minBudget);
  }

  if (filters.maxBudget) {
    filtered = filterByMaxBudget(filtered, filters.maxBudget);
  }

  if (filters.minRating) {
    filtered = filterByMinRating(filtered, filters.minRating);
  }

  if (filters.availability) {
    filtered = filterByAvailability(filtered, filters.availability);
  }

  if (filters.searchQuery) {
    filtered = searchPackages(filtered, filters.searchQuery);
  }

  return filtered;
};

/**
 * Search packages across multiple fields
 */
export const searchPackages = (
  packages: FlattenedPackage[],
  query: string
): FlattenedPackage[] => {
  if (!query || query.trim() === '') {
    return packages;
  }

  const searchTerm = query.toLowerCase().trim();

  return packages.filter(pkg => {
    const matchesName = (pkg.name || pkg.packageName || '').toLowerCase().includes(searchTerm);
    const matchesDescription = pkg.description.toLowerCase().includes(searchTerm);
    const matchesVendor = pkg.vendorName.toLowerCase().includes(searchTerm);

    return matchesName || matchesDescription || matchesVendor;
  });
};

/**
 * Highlight matching keywords in text
 */
export const highlightKeywords = (text: string, query: string): string => {
  if (!query || query.trim() === '') {
    return text;
  }

  const searchTerm = query.trim();
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-yellow-200 text-foreground">$1</mark>');
};
