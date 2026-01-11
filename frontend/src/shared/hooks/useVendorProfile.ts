import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';

interface VendorProfileStatus {
  isComplete: boolean;
  vendorId: string | null;
  isLoading: boolean;
}

/**
 * Hook to check if vendor has completed their profile
 * Returns vendorId and completion status
 */
export function useVendorProfile(): VendorProfileStatus {
  const { user, isLoading: authLoading } = useAuth();
  const [vendorId, setVendorId] = useState<string | null>(() => {
    // Initialize from localStorage immediately
    return localStorage.getItem('vendor_id');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      const storedVendorId = localStorage.getItem('vendor_id');
      // Only update if it actually changed
      if (storedVendorId !== vendorId) {
        setVendorId(storedVendorId);
      }
      setIsLoading(false);
    }
  }, [authLoading]); // Removed 'user' dependency to prevent unnecessary re-runs

  return {
    isComplete: !!vendorId,
    vendorId,
    isLoading: isLoading || authLoading,
  };
}
