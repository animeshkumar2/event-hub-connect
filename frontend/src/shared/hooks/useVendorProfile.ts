import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { vendorApi } from '@/shared/services/api';

interface VendorProfileCompletionStatus {
  isComplete: boolean;
  vendorId: string | null;
  isLoading: boolean;
  completionPercentage: number;
  missingFields: string[];
  canCreateListing: boolean;
}

/**
 * Hook to check if vendor has completed their profile
 * Returns vendorId, completion status, and what's missing
 * 
 * IMPORTANT: Once mandatory fields (businessName, categoryId, cityName) are filled,
 * the vendor can access ALL features. No percentage restriction.
 */
export function useVendorProfileCompletion(): VendorProfileCompletionStatus {
  const { user, isLoading: authLoading } = useAuth();
  const [vendorId, setVendorId] = useState<string | null>(() => {
    return localStorage.getItem('vendor_id');
  });
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;
      
      const storedVendorId = localStorage.getItem('vendor_id');
      if (storedVendorId !== vendorId) {
        setVendorId(storedVendorId);
      }
      
      // If we have a vendor ID, fetch the profile to check completion
      if (storedVendorId) {
        try {
          const response = await vendorApi.getProfile();
          if (response.success && response.data) {
            setProfileData(response.data);
          }
        } catch (error) {
          console.error('Error fetching vendor profile:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    fetchProfile();
  }, [authLoading]);

  // Calculate completion status
  const completionStatus = useMemo(() => {
    if (!profileData) {
      return {
        completionPercentage: 0,
        missingFields: ['businessName', 'categoryId', 'cityName'],
        canCreateListing: false,
        hasMandatoryFields: false,
      };
    }

    // Mandatory fields - required for basic access
    const hasMandatoryFields = 
      !!profileData.businessName && 
      (!!profileData.categoryId || !!profileData.vendorCategory) && 
      !!profileData.cityName;

    // Optional fields for profile completion percentage (for display purposes only)
    const checks = [
      { field: 'businessName', done: !!profileData.businessName && profileData.businessName.length >= 3, weight: 15 },
      { field: 'profileImage', done: !!profileData.profileImage, weight: 15 },
      { field: 'bio', done: !!profileData.bio && profileData.bio.length >= 50, weight: 15 },
      { field: 'portfolioImages', done: (profileData.portfolioImages?.length || 0) >= 3, weight: 20 },
      { field: 'location', done: !!profileData.locationName && !!profileData.locationLat, weight: 15 },
      { field: 'contact', done: !!profileData.phone || !!profileData.email, weight: 10 },
      { field: 'categoryId', done: !!profileData.categoryId || !!profileData.vendorCategory, weight: 5 },
      { field: 'cityName', done: !!profileData.cityName, weight: 5 },
    ];

    const completionPercentage = checks.filter(c => c.done).reduce((sum, c) => sum + c.weight, 0);
    const missingFields = checks.filter(c => !c.done).map(c => c.field);
    
    // Can create listing if mandatory fields are filled (NO percentage restriction)
    const canCreateListing = hasMandatoryFields;

    return { completionPercentage, missingFields, canCreateListing, hasMandatoryFields };
  }, [profileData]);

  // Don't mark as incomplete until we've actually checked the profile
  // This prevents showing "Complete Profile" prompt during initial load
  const isComplete = useMemo(() => {
    // If still loading, don't make a decision yet
    if (isLoading || authLoading) {
      return true; // Return true during loading to prevent premature prompt
    }
    
    // If no vendor ID, definitely not complete
    if (!vendorId) {
      return false;
    }
    
    // If we have vendor ID but no profile data yet, assume complete to avoid flash
    // (This happens when API call is in progress)
    if (!profileData) {
      return true; // Optimistic - wait for data to load
    }
    
    // Now we have data, check actual completion status
    return completionStatus.canCreateListing;
  }, [vendorId, profileData, completionStatus.canCreateListing, isLoading, authLoading]);

  return {
    isComplete,
    vendorId,
    isLoading: isLoading || authLoading,
    completionPercentage: completionStatus.completionPercentage,
    missingFields: completionStatus.missingFields,
    canCreateListing: completionStatus.canCreateListing,
  };
}

// Keep the old export name for backward compatibility
export { useVendorProfileCompletion as useVendorProfile };
