/**
 * React hooks for API calls
 */

import { useState, useEffect } from 'react';
import { publicApi, customerApi, vendorApi, authApi } from '../services/api';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<{ success: boolean; data: T; message: string }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        if (!cancelled) {
          if (response && response.success) {
            // Handle case where data might be wrapped
            const responseData = response.data;
            // If data is an object with a data property, unwrap it
            if (responseData && typeof responseData === 'object' && 'data' in responseData) {
              setData((responseData as any).data);
            } else {
              setData(responseData);
            }
            setError(null); // Clear any previous errors
          } else {
            // Handle error response (e.g., 404 with success: false)
            setError(response?.message || 'Failed to fetch data');
            setData(null); // Clear data on error
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('API call error:', err);
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => {
    setLoading(true);
    apiCall().then(response => {
      if (response && response.success) {
        const responseData = response.data;
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
          setData((responseData as any).data);
        } else {
          setData(responseData);
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error('Refetch error:', err);
      setLoading(false);
    });
  }};
}

// Specific hooks for common API calls
export function useEventTypes() {
  return useApi(() => publicApi.getEventTypes());
}

export function useCategories() {
  return useApi(() => publicApi.getCategories());
}

export function useCities() {
  return useApi(() => publicApi.getCities());
}

export function useVendor(vendorId: string | null) {
  return useApi(
    () => vendorId ? publicApi.getVendor(vendorId) : Promise.resolve({ success: false, data: null, message: 'No vendor ID' }),
    [vendorId]
  );
}

export function useSearchListings(params: {
  eventType?: number;
  category?: string;
  listingType?: string;
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  q?: string;
}) {
  return useApi(
    () => publicApi.searchListings(params),
    [JSON.stringify(params)]
  );
}

export function useSearchVendors(params: {
  category?: string;
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  q?: string;
}) {
  return useApi(
    () => publicApi.searchVendors(params),
    [JSON.stringify(params)]
  );
}

export function useVendorListings(vendorId: string | null) {
  return useApi(
    () => vendorId ? publicApi.getVendorListings(vendorId) : Promise.resolve({ success: false, data: [], message: 'No vendor ID' }),
    [vendorId]
  );
}

export function useVendorPackages(vendorId: string | null) {
  return useApi(
    () => vendorId ? publicApi.getVendorPackages(vendorId) : Promise.resolve({ success: false, data: [], message: 'No vendor ID' }),
    [vendorId]
  );
}

export function useVendorReviews(vendorId: string | null, page = 0, size = 10) {
  return useApi(
    () => vendorId ? publicApi.getVendorReviews(vendorId, page, size) : Promise.resolve({ success: false, data: [], message: 'No vendor ID' }),
    [vendorId, page, size]
  );
}

export function useVendorFAQs(vendorId: string | null) {
  return useApi(
    () => vendorId ? publicApi.getVendorFAQs(vendorId) : Promise.resolve({ success: false, data: [], message: 'No vendor ID' }),
    [vendorId]
  );
}

export function useVendorPastEvents(vendorId: string | null) {
  return useApi(
    () => vendorId ? publicApi.getVendorPastEvents(vendorId) : Promise.resolve({ success: false, data: [], message: 'No vendor ID' }),
    [vendorId]
  );
}

export function useVendorBookableSetups(vendorId: string | null) {
  return useApi(
    () => vendorId ? publicApi.getVendorBookableSetups(vendorId) : Promise.resolve({ success: false, data: [], message: 'No vendor ID' }),
    [vendorId]
  );
}

export function useVendorAvailability(vendorId: string | null, startDate?: string, endDate?: string) {
  return useApi(
    () => vendorId ? publicApi.getVendorAvailability(vendorId, startDate, endDate) : Promise.resolve({ success: false, data: [], message: 'No vendor ID' }),
    [vendorId, startDate, endDate]
  );
}

export function useStats() {
  return useApi(() => publicApi.getStats());
}

// Vendor API hooks (for vendor's own data)
export function useVendorProfile() {
  return useApi(() => vendorApi.getProfile());
}

export function useMyVendorListings() {
  return useApi(() => vendorApi.getListings());
}

export function useVendorOrders(status?: string, page = 0, size = 10) {
  return useApi(
    () => vendorApi.getOrders(status, page, size),
    [status, page, size]
  );
}

export function useVendorLeads() {
  return useApi(() => vendorApi.getLeads());
}

export function useMyVendorReviews(page = 0, size = 10) {
  return useApi(
    () => vendorApi.getReviews(page, size),
    [page, size]
  );
}

export function useVendorReviewStatistics() {
  return useApi(() => vendorApi.getReviewStatistics());
}

export function useMyVendorFAQs() {
  return useApi(() => vendorApi.getFAQs());
}

export function useVendorChatThreads() {
  return useApi(() => vendorApi.getChatThreads());
}

export function useVendorWallet() {
  return useApi(() => vendorApi.getWallet());
}

export function useVendorWalletTransactions(page = 0, size = 10) {
  return useApi(
    () => vendorApi.getWalletTransactions(page, size),
    [page, size]
  );
}

export function useVendorDashboardStats() {
  return useApi(() => vendorApi.getDashboardStats());
}

export function useMyVendorPastEvents() {
  return useApi(() => vendorApi.getPastEvents());
}

export function useMyVendorAvailability(startDate?: string, endDate?: string) {
  return useApi(
    () => vendorApi.getAvailability(startDate, endDate),
    [startDate, endDate]
  );
}

export function useMyVendorBookableSetups() {
  return useApi(() => vendorApi.getBookableSetups());
}

export function useVendorUpcomingOrders() {
  return useApi(() => vendorApi.getUpcomingOrders());
}

export function useListingDetails(listingId: string | null) {
  return useApi(
    () => listingId ? publicApi.getListing(listingId) : Promise.resolve({ success: false, data: null, message: 'No listing ID' }),
    [listingId]
  );
}

export function usePackageDetails(packageId: string | null) {
  return useApi(
    () => packageId ? publicApi.getPackage(packageId) : Promise.resolve({ success: false, data: null, message: 'No package ID' }),
    [packageId]
  );
}

