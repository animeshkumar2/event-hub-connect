/**
 * React hooks for API calls - Optimized with React Query for caching and performance
 */

import { useMemo } from 'react';
import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query';
import { publicApi, customerApi, vendorApi, authApi } from '../services/api';

// Helper to unwrap API response data
function unwrapResponse<T>(response: { success: boolean; data: T; message: string }): T | null {
  if (!response || !response.success) {
    return null;
  }
  const responseData = response.data;
  // If data is an object with a data property, unwrap it
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return (responseData as any).data;
  }
  return responseData;
}

// Helper to convert React Query result to match old useApi interface
function convertQueryResult<T>(queryResult: UseQueryResult<T | null, Error>) {
  return {
    data: queryResult.data ?? null,
    loading: queryResult.isLoading,
    isFetching: queryResult.isFetching, // Expose isFetching to detect background refetches
    error: queryResult.error?.message || null,
    refetch: () => queryResult.refetch(),
  };
}

// Reference data hooks - cached for 5 minutes (rarely changes)
// Optimized for fast initial load with parallel fetching
export function useEventTypes() {
  const query = useQuery({
    queryKey: ['eventTypes'],
    queryFn: async () => {
      const startTime = performance.now();
      const response = await publicApi.getEventTypes();
      const duration = performance.now() - startTime;
      if (duration > 500) {
        console.warn(`Slow API call: getEventTypes took ${duration.toFixed(2)}ms`);
      }
      return unwrapResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Use cached data immediately if available, don't wait for refetch
    placeholderData: (previousData) => previousData,
  });
  return convertQueryResult(query);
}

export function useCategories() {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const startTime = performance.now();
      const response = await publicApi.getCategories();
      const duration = performance.now() - startTime;
      if (duration > 500) {
        console.warn(`Slow API call: getCategories took ${duration.toFixed(2)}ms`);
      }
      return unwrapResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Use cached data immediately if available, don't wait for refetch
    placeholderData: (previousData) => previousData,
  });
  return convertQueryResult(query);
}

export function useCities() {
  const query = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await publicApi.getCities();
      return unwrapResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  return convertQueryResult(query);
}

export function useEventTypeCategories() {
  const query = useQuery({
    queryKey: ['eventTypeCategories'],
    queryFn: async () => {
      const response = await publicApi.getEventTypeCategories();
      return unwrapResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData,
  });
  return convertQueryResult(query);
}

export function useVendor(vendorId: string | null) {
  const query = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await publicApi.getVendor(vendorId);
      return unwrapResponse(response);
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  return convertQueryResult(query);
}

// Search hooks - cached for 30 seconds (frequently changing)
export function useSearchListings(params: {
  eventType?: number;
  category?: string;
  listingType?: string;
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  q?: string;
  eventDate?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}, enabled: boolean = true) {
  // Use individual params instead of JSON.stringify for better caching
  const query = useQuery({
    queryKey: ['searchListings', params.eventType, params.category, params.listingType, params.city, params.minBudget, params.maxBudget, params.q, params.eventDate, params.sortBy, params.limit, params.offset],
    queryFn: async () => {
      const startTime = performance.now();
      const response = await publicApi.searchListings(params);
      const duration = performance.now() - startTime;
      if (duration > 1000) {
        console.warn(`Slow API call: searchListings took ${duration.toFixed(2)}ms`, params);
      }
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: enabled, // Can be disabled until dependencies are ready
    // Don't use placeholderData - we want to show loading state when switching categories
    // placeholderData would show stale data which is confusing UX
  });
  return convertQueryResult(query);
}

export function useSearchVendors(params: {
  category?: string;
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  q?: string;
  eventType?: number;
  eventDate?: string;
  sortBy?: string;
}, enabled: boolean = true) {
  const query = useQuery({
    queryKey: ['searchVendors', params.category, params.city, params.minBudget, params.maxBudget, params.q, params.eventType, params.eventDate, params.sortBy],
    queryFn: async () => {
      const startTime = performance.now();
      const response = await publicApi.searchVendors(params);
      const duration = performance.now() - startTime;
      if (duration > 1000) {
        console.warn(`Slow API call: searchVendors took ${duration.toFixed(2)}ms`, params);
      }
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: enabled, // Can be disabled until dependencies are ready
    // Don't use placeholderData - we want to show loading state when switching categories
    // placeholderData would show stale data which is confusing UX
  });
  return convertQueryResult(query);
}

export function useVendorListings(vendorId: string | null) {
  const query = useQuery({
    queryKey: ['vendorListings', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await publicApi.getVendorListings(vendorId);
      return unwrapResponse(response);
    },
    enabled: !!vendorId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  return convertQueryResult(query);
}

export function useVendorPackages(vendorId: string | null) {
  const query = useQuery({
    queryKey: ['vendorPackages', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await publicApi.getVendorPackages(vendorId);
      return unwrapResponse(response);
    },
    enabled: !!vendorId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  return convertQueryResult(query);
}

export function useVendorReviews(vendorId: string | null, page = 0, size = 10) {
  const query = useQuery({
    queryKey: ['vendorReviews', vendorId, page, size],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await publicApi.getVendorReviews(vendorId, page, size);
      return unwrapResponse(response);
    },
    enabled: !!vendorId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  return convertQueryResult(query);
}

export function useVendorFAQs(vendorId: string | null) {
  const query = useQuery({
    queryKey: ['vendorFAQs', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await publicApi.getVendorFAQs(vendorId);
      return unwrapResponse(response);
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  return convertQueryResult(query);
}

export function useVendorPastEvents(vendorId: string | null) {
  const query = useQuery({
    queryKey: ['vendorPastEvents', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await publicApi.getVendorPastEvents(vendorId);
      return unwrapResponse(response);
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes (rarely changes)
  });
  return convertQueryResult(query);
}

export function useVendorBookableSetups(vendorId: string | null) {
  const query = useQuery({
    queryKey: ['vendorBookableSetups', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await publicApi.getVendorBookableSetups(vendorId);
      return unwrapResponse(response);
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  return convertQueryResult(query);
}

export function useVendorAvailability(vendorId: string | null, startDate?: string, endDate?: string) {
  const query = useQuery({
    queryKey: ['vendorAvailability', vendorId, startDate, endDate],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await publicApi.getVendorAvailability(vendorId, startDate, endDate);
      return unwrapResponse(response);
    },
    enabled: !!vendorId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  return convertQueryResult(query);
}

export function useStats() {
  const query = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const startTime = performance.now();
      const response = await publicApi.getStats();
      const duration = performance.now() - startTime;
      if (duration > 1000) {
        console.warn(`Slow stats API call: took ${duration.toFixed(2)}ms`);
      }
      return unwrapResponse(response);
    },
    staleTime: 10 * 1000, // 10 seconds - stats change frequently but cache helps
    gcTime: 60 * 1000, // Keep in cache for 1 minute
    refetchOnMount: 'always', // Always refetch for fresh data
    refetchOnWindowFocus: false, // Don't refetch on focus to avoid unnecessary calls
    // Use cached data immediately while fetching fresh data in background
    placeholderData: (previousData) => previousData,
  });
  return convertQueryResult(query);
}

// Vendor API hooks (for vendor's own data)
export function useVendorProfile() {
  const query = useQuery({
    queryKey: ['vendorProfile'],
    queryFn: async () => {
      const response = await vendorApi.getProfile();
      return unwrapResponse(response);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  return convertQueryResult(query);
}

export function useMyVendorListings() {
  const query = useQuery({
    queryKey: ['myVendorListings'],
    queryFn: async () => {
      const response = await vendorApi.getListings();
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds (changes frequently)
  });
  return convertQueryResult(query);
}

export function useVendorOrders(status?: string, page = 0, size = 10, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['vendorOrders', status, page, size],
    queryFn: async () => {
      const response = await vendorApi.getOrders(status, page, size);
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: options?.enabled !== false, // Default to true, only disable if explicitly set to false
  });
  return convertQueryResult(query);
}

export function useVendorLeads() {
  const query = useQuery({
    queryKey: ['vendorLeads'],
    queryFn: async () => {
      const response = await vendorApi.getLeads();
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds (changes frequently)
  });
  return convertQueryResult(query);
}

export function useMyVendorReviews(page = 0, size = 10, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['myVendorReviews', page, size],
    queryFn: async () => {
      const response = await vendorApi.getReviews(page, size);
      return unwrapResponse(response);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false, // Default to true, only disable if explicitly set to false
  });
  return convertQueryResult(query);
}

export function useVendorReviewStatistics(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['vendorReviewStatistics'],
    queryFn: async () => {
      const response = await vendorApi.getReviewStatistics();
      return unwrapResponse(response);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false, // Default to true, only disable if explicitly set to false
  });
  return convertQueryResult(query);
}

export function useMyVendorFAQs() {
  const query = useQuery({
    queryKey: ['myVendorFAQs'],
    queryFn: async () => {
      const response = await vendorApi.getFAQs();
      return unwrapResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (rarely changes)
  });
  return convertQueryResult(query);
}

export function useVendorChatThreads() {
  const query = useQuery({
    queryKey: ['vendorChatThreads'],
    queryFn: async () => {
      const response = await vendorApi.getChatThreads();
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds (real-time data)
  });
  return convertQueryResult(query);
}

export function useVendorWallet() {
  const query = useQuery({
    queryKey: ['vendorWallet'],
    queryFn: async () => {
      const response = await vendorApi.getWallet();
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
  return convertQueryResult(query);
}

export function useVendorWalletTransactions(page = 0, size = 10) {
  const query = useQuery({
    queryKey: ['vendorWalletTransactions', page, size],
    queryFn: async () => {
      const response = await vendorApi.getWalletTransactions(page, size);
      return unwrapResponse(response);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  return convertQueryResult(query);
}

export function useVendorDashboardStats(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['vendorDashboardStats'],
    queryFn: async () => {
      const response = await vendorApi.getDashboardStats();
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: options?.enabled !== false, // Default to true, only disable if explicitly set to false
  });
  return convertQueryResult(query);
}

export function useMyVendorPastEvents() {
  const query = useQuery({
    queryKey: ['myVendorPastEvents'],
    queryFn: async () => {
      const response = await vendorApi.getPastEvents();
      return unwrapResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (rarely changes)
  });
  return convertQueryResult(query);
}

export function useMyVendorAvailability(startDate?: string, endDate?: string) {
  const query = useQuery({
    queryKey: ['myVendorAvailability', startDate, endDate],
    queryFn: async () => {
      const response = await vendorApi.getAvailability(startDate, endDate);
      return unwrapResponse(response);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  return convertQueryResult(query);
}

export function useMyVendorBookableSetups() {
  const query = useQuery({
    queryKey: ['myVendorBookableSetups'],
    queryFn: async () => {
      const response = await vendorApi.getBookableSetups();
      return unwrapResponse(response);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  return convertQueryResult(query);
}

export function useVendorUpcomingOrders() {
  const query = useQuery({
    queryKey: ['vendorUpcomingOrders'],
    queryFn: async () => {
      const response = await vendorApi.getUpcomingOrders();
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
  return convertQueryResult(query);
}

export function useVendorBookings(page = 0, size = 10) {
  const query = useQuery({
    queryKey: ['vendorBookings', page, size],
    queryFn: async () => {
      const response = await vendorApi.getBookings(page, size);
      return unwrapResponse(response);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
  return convertQueryResult(query);
}

export function useVendorUpcomingBookings() {
  const query = useQuery({
    queryKey: ['vendorUpcomingBookings'],
    queryFn: async () => {
      const response = await vendorApi.getUpcomingBookings();
      const data = unwrapResponse(response);
      // Ensure we return an array even if data is null or undefined
      return Array.isArray(data) ? data : (data ? [data] : []);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
  return convertQueryResult(query);
}

export function useVendorPastBookings() {
  const query = useQuery({
    queryKey: ['vendorPastBookings'],
    queryFn: async () => {
      const response = await vendorApi.getPastBookings();
      const data = unwrapResponse(response);
      // Ensure we return an array even if data is null or undefined
      return Array.isArray(data) ? data : (data ? [data] : []);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
  return convertQueryResult(query);
}

export function useBookingTimeline(bookingId: string | null) {
  const query = useQuery({
    queryKey: ['bookingTimeline', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const response = await vendorApi.getBookingTimeline(bookingId);
      return unwrapResponse(response);
    },
    enabled: !!bookingId,
    staleTime: 30 * 1000, // 30 seconds
  });
  return convertQueryResult(query);
}

export function useListingDetails(listingId: string | null) {
  const query = useQuery({
    queryKey: ['listingDetails', listingId],
    queryFn: async () => {
      if (!listingId) return null;
      const response = await publicApi.getListing(listingId);
      return unwrapResponse(response);
    },
    enabled: !!listingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  return convertQueryResult(query);
}

// Vendor-specific listing details (includes drafts and inactive listings)
export function useVendorListingDetails(listingId: string | null) {
  const query = useQuery({
    queryKey: ['vendorListingDetails', listingId],
    queryFn: async () => {
      if (!listingId) return null;
      const response = await vendorApi.getListing(listingId);
      return unwrapResponse(response);
    },
    enabled: !!listingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  return convertQueryResult(query);
}

export function usePackageDetails(packageId: string | null) {
  const query = useQuery({
    queryKey: ['packageDetails', packageId],
    queryFn: async () => {
      if (!packageId) return null;
      const response = await publicApi.getPackage(packageId);
      return unwrapResponse(response);
    },
    enabled: !!packageId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  return convertQueryResult(query);
}

// Parallel query hooks for pages that need multiple data sources
export function useVendorListingsData() {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['myVendorListings'],
        queryFn: async () => {
          const response = await vendorApi.getListings();
          return unwrapResponse(response);
        },
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      {
        queryKey: ['vendorProfile'],
        queryFn: async () => {
          const response = await vendorApi.getProfile();
          return unwrapResponse(response);
        },
        staleTime: 1 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      {
        queryKey: ['eventTypes'],
        queryFn: async () => {
          const response = await publicApi.getEventTypes();
          return unwrapResponse(response);
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      {
        queryKey: ['categories'],
        queryFn: async () => {
          const response = await publicApi.getCategories();
          return unwrapResponse(response);
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    ],
  });

  // Memoize each converted result individually
  const listings = useMemo(
    () => convertQueryResult(queries[0]),
    [queries[0].data, queries[0].isLoading, queries[0].error, queries[0].isFetching]
  );
  
  const profile = useMemo(
    () => convertQueryResult(queries[1]),
    [queries[1].data, queries[1].isLoading, queries[1].error, queries[1].isFetching]
  );
  
  const eventTypes = useMemo(
    () => convertQueryResult(queries[2]),
    [queries[2].data, queries[2].isLoading, queries[2].error, queries[2].isFetching]
  );
  
  const categories = useMemo(
    () => convertQueryResult(queries[3]),
    [queries[3].data, queries[3].isLoading, queries[3].error, queries[3].isFetching]
  );
  
  const loading = queries.some(q => q.isLoading);

  // Memoize the final return object
  return useMemo(() => ({
    listings,
    profile,
    eventTypes,
    categories,
    loading,
  }), [listings, profile, eventTypes, categories, loading]);
}

export function useVendorDashboardData() {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['vendorDashboardStats'],
        queryFn: async () => {
          const response = await vendorApi.getDashboardStats();
          return unwrapResponse(response);
        },
        staleTime: 30 * 1000,
      },
      {
        queryKey: ['vendorProfile'],
        queryFn: async () => {
          const response = await vendorApi.getProfile();
          return unwrapResponse(response);
        },
        staleTime: 1 * 60 * 1000,
      },
      {
        queryKey: ['vendorUpcomingOrders'],
        queryFn: async () => {
          const response = await vendorApi.getUpcomingOrders();
          return unwrapResponse(response);
        },
        staleTime: 30 * 1000,
      },
      {
        queryKey: ['vendorLeads'],
        queryFn: async () => {
          const response = await vendorApi.getLeads();
          return unwrapResponse(response);
        },
        staleTime: 30 * 1000,
      },
      {
        queryKey: ['myVendorListings'],
        queryFn: async () => {
          const response = await vendorApi.getListings();
          return unwrapResponse(response);
        },
        staleTime: 30 * 1000,
      },
    ],
  });

  return {
    stats: convertQueryResult(queries[0]),
    profile: convertQueryResult(queries[1]),
    upcomingOrders: convertQueryResult(queries[2]),
    leads: convertQueryResult(queries[3]),
    listings: convertQueryResult(queries[4]),
    loading: queries.some(q => q.isLoading),
  };
}
