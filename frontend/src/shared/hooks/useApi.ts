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
          if (response.success) {
            setData(response.data);
          } else {
            setError(response.message || 'Failed to fetch data');
          }
        }
      } catch (err: any) {
        if (!cancelled) {
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
      if (response.success) {
        setData(response.data);
      }
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

