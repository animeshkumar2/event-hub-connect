import React, { useState, useMemo, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/features/home/Navbar";
import { VendorCard } from "@/features/vendor/VendorCard";
import { PackageCard } from "@/features/search/PackageCard";
import { PremiumPackageCard } from "@/features/search/PremiumPackageCard";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Search as SearchIcon, SlidersHorizontal, ChevronLeft, ChevronRight, AlertCircle, Loader2, X, Calendar, MapPin, Navigation } from "lucide-react";
import { useSearchListings, useSearchVendors, useEventTypes, useCategories, useCities, useEventTypeCategories } from "@/shared/hooks/useApi";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar as CalendarComponent } from "@/shared/components/ui/calendar";
import { format } from "date-fns";
import { publicApi } from "@/shared/services/api";
import { cn } from "@/shared/lib/utils";
import { useCart } from "@/shared/contexts/CartContext";
import { useToast } from "@/shared/hooks/use-toast";
import { LocationAutocomplete, LocationDTO } from "@/shared/components/LocationAutocomplete";
import { RadiusSlider, CUSTOMER_RADIUS_OPTIONS } from "@/shared/components/RadiusSlider";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Get event type and category from URL first (before using in effects)
  const eventTypeParam = searchParams.get('eventType');
  const selectedCategory = searchParams.get('category') || 'all';
  const listingType = (searchParams.get('listingType') || 'all') as 'all' | 'packages';
  const viewParam = searchParams.get('view');
  
  // Filter state - initialize from URL params
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || '');
  const [selectedEventTypeFilter, setSelectedEventTypeFilter] = useState<string>(eventTypeParam || '');
  const [eventDate, setEventDate] = useState<Date | undefined>(
    searchParams.get('eventDate') ? new Date(searchParams.get('eventDate')!) : undefined
  );
  const [minBudget, setMinBudget] = useState<string>(searchParams.get('minBudget') || '');
  const [maxBudget, setMaxBudget] = useState<string>(searchParams.get('maxBudget') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'relevance');
  
  // Location filter state
  const [customerLocation, setCustomerLocation] = useState<LocationDTO | null>(null);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(20);

  // Sync filter changes to URL params (debounced to avoid too many updates)
  // Reset page when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      let paramsChanged = false;
      
      if (selectedCity) {
        newParams.set('city', selectedCity);
        paramsChanged = true;
      } else {
        if (newParams.has('city')) {
          newParams.delete('city');
          paramsChanged = true;
        }
      }
      
      // Only update eventType if it's different from the URL param (to avoid conflicts)
      const currentEventTypeParam = searchParams.get('eventType');
      if (selectedEventTypeFilter && selectedEventTypeFilter !== currentEventTypeParam) {
        newParams.set('eventType', selectedEventTypeFilter);
        paramsChanged = true;
      } else if (!selectedEventTypeFilter && currentEventTypeParam) {
        newParams.delete('eventType');
        paramsChanged = true;
      }
      
      if (eventDate) {
        newParams.set('eventDate', format(eventDate, 'yyyy-MM-dd'));
        paramsChanged = true;
      } else {
        if (newParams.has('eventDate')) {
          newParams.delete('eventDate');
          paramsChanged = true;
        }
      }
      
      if (minBudget) {
        newParams.set('minBudget', minBudget);
        paramsChanged = true;
      } else {
        if (newParams.has('minBudget')) {
          newParams.delete('minBudget');
          paramsChanged = true;
        }
      }
      
      if (maxBudget) {
        newParams.set('maxBudget', maxBudget);
        paramsChanged = true;
      } else {
        if (newParams.has('maxBudget')) {
          newParams.delete('maxBudget');
          paramsChanged = true;
        }
      }
      
      if (sortBy && sortBy !== 'relevance') {
        newParams.set('sortBy', sortBy);
        paramsChanged = true;
      } else {
        if (newParams.has('sortBy')) {
          newParams.delete('sortBy');
          paramsChanged = true;
        }
      }
      
      // Only update if params actually changed to avoid infinite loops
      if (paramsChanged) {
        // Reset page when filters change
        setPage(0);
        setAccumulatedListings([]);
        setSearchParams(newParams, { replace: true });
      }
    }, 300); // Debounce by 300ms
    
    return () => clearTimeout(timeoutId);
  }, [selectedCity, selectedEventTypeFilter, eventDate, minBudget, maxBudget, sortBy, searchParams, setSearchParams]);

  // Fetch reference data first - these are cached, so should load instantly on subsequent visits
  const { data: eventTypesData, loading: eventTypesLoading, error: eventTypesError } = useEventTypes();
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: eventTypeCategoriesData } = useEventTypeCategories();
  const { data: citiesData } = useCities();
  const cities = citiesData || [];
  
  // Try to get cached data immediately for faster initial render
  const cachedEventTypes = queryClient.getQueryData(['eventTypes']) as any;
  const cachedCategories = queryClient.getQueryData(['categories']) as any;
  const cachedEventTypeCategories = queryClient.getQueryData(['eventTypeCategories']) as any;
  
  // Use cached data if available, otherwise use fetched data
  const eventTypes = (cachedEventTypes || eventTypesData) || [];
  const allCategories = (cachedCategories || categoriesData) || [];
  const eventTypeCategories = (cachedEventTypeCategories || eventTypeCategoriesData) || [];
  
  // Determine if we should show vendors (only when explicitly set to view=vendors)
  const showVendors = viewParam === 'vendors';

  // Resolve eventType: handle both numeric ID and string name
  const eventTypeId = useMemo(() => {
    if (!eventTypeParam) return undefined;
    
    // Try to parse as number first
    const numericId = parseInt(eventTypeParam, 10);
    if (!isNaN(numericId)) {
      return numericId;
    }
    
    // If not a number, try to find by name (case-insensitive)
    // Check multiple possible field names and variations
    const normalizedParam = eventTypeParam.toLowerCase().trim();
    const eventType = eventTypes.find((et: any) => {
      const name = et.name?.toLowerCase().trim();
      const displayName = et.displayName?.toLowerCase().trim();
      const idStr = et.id?.toString().toLowerCase();
      
      return name === normalizedParam ||
             displayName === normalizedParam ||
             idStr === normalizedParam ||
             // Handle variations like "Baby Shower" vs "BabyShower"
             name?.replace(/\s+/g, '') === normalizedParam.replace(/\s+/g, '') ||
             displayName?.replace(/\s+/g, '') === normalizedParam.replace(/\s+/g, '');
    });
    
    if (!eventType && eventTypeParam) {
      console.warn(`⚠️ Could not resolve eventType "${eventTypeParam}" to an ID. Available eventTypes:`, 
        eventTypes.map((et: any) => ({ id: et.id, name: et.name, displayName: et.displayName })));
    }
    
    return eventType?.id;
  }, [eventTypeParam, eventTypes]);

  // Filter categories based on selected event type
  // Algorithm: 
  // 1. If event type is selected, show only categories valid for that event type
  // 2. If no event type selected, show all categories (or categories that appear in at least one event type)
  // 3. Always include "Other" category at the end
  const categories = useMemo(() => {
    if (!allCategories || allCategories.length === 0) return [];

    // Deduplicate by category id
    const seen = new Set<string>();
    const uniqueCategories = allCategories.filter((cat: any) => {
      if (seen.has(cat.id)) return false;
      seen.add(cat.id);
      return true;
    });
    
    // Find "Other" category to always include at the end
    const otherCategory = uniqueCategories.find((cat: any) => cat.id === 'other' || cat.id === 'Other');
    const categoriesWithoutOther = uniqueCategories.filter((cat: any) => cat.id !== 'other' && cat.id !== 'Other');
    
    // If event type is selected, filter categories based on event-type-categories mapping
    if (eventTypeId && !isNaN(eventTypeId) && eventTypeCategories.length > 0) {
      // Get category IDs valid for this event type
      const validCategoryIds = new Set(
        eventTypeCategories
          .filter((etc: any) => etc.eventTypeId === eventTypeId || etc.eventType?.id === eventTypeId)
          .map((etc: any) => etc.categoryId || etc.category?.id)
      );
      
      // Filter categories to only include valid ones for this event type
      const filteredCategories = categoriesWithoutOther.filter((cat: any) => 
        validCategoryIds.has(cat.id)
      );
      
      // Sort alphabetically by name, then add "Other" at the end
      const sorted = filteredCategories.sort((a: any, b: any) => 
        (a.name || a.displayName || '').localeCompare(b.name || b.displayName || '')
      );
      
      // Always add "Other" at the end if it exists
      return otherCategory ? [...sorted, otherCategory] : sorted;
    }
    
    // No event type selected - show all categories (sorted), with "Other" at the end
    const sorted = categoriesWithoutOther.sort((a: any, b: any) => 
      (a.name || a.displayName || '').localeCompare(b.name || b.displayName || '')
    );
    
    return otherCategory ? [...sorted, otherCategory] : sorted;
  }, [allCategories, eventTypeId, eventTypeCategories]);

  // Reference data is ready if we have data (from cache or fetch) or loading is complete
  // This ensures we can resolve IDs immediately if cached data exists
  const referenceDataReady = (eventTypes.length > 0 && categories.length > 0) || 
    (!eventTypesLoading && !categoriesLoading);

  // Map category ID: handle both hardcoded IDs (like 'mua') and API category IDs
  const resolvedCategoryId = useMemo(() => {
    if (selectedCategory === 'all') return undefined;
    
    // Direct ID mapping for hardcoded frontend category IDs to backend category IDs
    const directIdMap: Record<string, string> = {
      'mua': 'mua',
      'makeup': 'mua',
      'photo-video': 'photo-video',
      'photography-videography': 'photo-video',
      'photographer': 'photo-video',  // Legacy support
      'decorator': 'decorator',
      'dj-entertainment': 'dj-entertainment',
      'dj': 'dj-entertainment',  // Legacy support
      'caterer': 'caterer',
      'venue': 'venue',
      'sound-lights': 'sound-lights',
      'artists': 'artists',
    };
    
    // First, try direct ID mapping
    const mappedId = directIdMap[selectedCategory.toLowerCase()];
    if (mappedId) {
      // Check if the mapped ID exists in the API categories
      const apiCategory = categories.find((c: any) => 
        c.id?.toLowerCase() === mappedId.toLowerCase() ||
        c.id === mappedId
      );
      if (apiCategory) {
        return apiCategory.id;
      }
      // If not found in API categories, use the mapped ID directly (backend might accept it)
      return mappedId;
    }
    
    // Second, check if selectedCategory matches an API category ID exactly
    const apiCategory = categories.find((c: any) => c.id === selectedCategory || c.id?.toLowerCase() === selectedCategory.toLowerCase());
    if (apiCategory) {
      return apiCategory.id;
    }
    
    // Third, try to find by name/slug (for other hardcoded IDs)
    const categoryNameMap: Record<string, string[]> = {
      'mua': ['makeup', 'mua', 'makeup artist', 'makeup-artist'],
      'photo-video': ['photographer', 'photography', 'videography', 'photo-video'],
      'decorator': ['decorator', 'decoration', 'décor'],
      'dj-entertainment': ['dj', 'music', 'entertainment', 'dj-entertainment'],
      'caterer': ['caterer', 'catering'],
      'venue': ['venue', 'hall', 'banquet'],
      'sound-lights': ['sound', 'lights', 'audio'],
      'artists': ['artist', 'performer', 'band', 'musician'],
    };
    
    const searchTerms = categoryNameMap[selectedCategory.toLowerCase()] || [selectedCategory.toLowerCase()];
    
    // Try to find the actual API category by name or slug
    for (const term of searchTerms) {
      const foundCategory = categories.find((c: any) => 
        c.name?.toLowerCase().includes(term) ||
        c.slug?.toLowerCase() === term ||
        c.id?.toLowerCase() === term ||
        c.displayName?.toLowerCase().includes(term)
      );
      if (foundCategory) {
        return foundCategory.id;
      }
    }
    
    // Fallback: return the selected category as-is (might be a UUID or different format)
    return selectedCategory;
  }, [selectedCategory, categories]);

  // Fetch vendors or listings based on view mode
  // Track previous params to detect category/eventType changes
  const prevParamsRef = useRef<{ category?: string; eventType?: number }>({});
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  
  const currentCategory = showVendors && resolvedCategoryId ? resolvedCategoryId : undefined;
  const currentEventType = !showVendors && eventTypeId && !isNaN(eventTypeId) ? eventTypeId : undefined;
  
  // Detect when category or eventType changes
  useEffect(() => {
    const prevCategory = prevParamsRef.current.category;
    const prevEventType = prevParamsRef.current.eventType;
    
    if ((prevCategory !== currentCategory || prevEventType !== currentEventType) && 
        (prevCategory !== undefined || prevEventType !== undefined)) {
      // Category/eventType changed - show loading state
      setIsSwitchingCategory(true);
    }
    
    prevParamsRef.current = { category: currentCategory, eventType: currentEventType };
  }, [currentCategory, currentEventType]);
  
  // Clear invalid category selection when event type changes
  // If selected category is not valid for the new event type, reset to "all"
  useEffect(() => {
    if (eventTypeId && !isNaN(eventTypeId) && selectedCategory !== 'all' && eventTypeCategories.length > 0 && categories.length > 0) {
      // Check if selected category is valid for current event type
      const validCategoryIds = new Set(
        eventTypeCategories
          .filter((etc: any) => etc.eventTypeId === eventTypeId || etc.eventType?.id === eventTypeId)
          .map((etc: any) => etc.categoryId || etc.category?.id)
      );
      
      // Also include "other" category as it's always valid
      validCategoryIds.add('other');
      
      // Check if selected category is in the valid list
      const selectedCategoryValid = categories.some((cat: any) => 
        (cat.id === selectedCategory || cat.id === resolvedCategoryId) && 
        validCategoryIds.has(cat.id)
      );
      
      // If category is not valid, clear it
      if (!selectedCategoryValid && resolvedCategoryId) {
        setPage(0);
        setAccumulatedListings([]);
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('category');
          return newParams;
        }, { replace: true });
      }
    }
  }, [eventTypeId, selectedCategory, eventTypeCategories, categories, resolvedCategoryId]);
  
  // Only wait for reference data on first load, not when switching categories
  // If we have cached reference data, proceed immediately
  const canFetchSearchData = referenceDataReady || (eventTypes.length > 0 && categories.length > 0);
  
  // Get filter values
  const filterEventTypeId = useMemo(() => {
    if (!selectedEventTypeFilter) return undefined;
    const numericId = parseInt(selectedEventTypeFilter, 10);
    if (!isNaN(numericId)) return numericId;
    const eventType = eventTypes.find((et: any) => 
      et.name?.toLowerCase() === selectedEventTypeFilter.toLowerCase() ||
      et.id?.toString() === selectedEventTypeFilter
    );
    return eventType?.id;
  }, [selectedEventTypeFilter, eventTypes]);

  const { data: vendorsData, loading: vendorsLoading, isFetching: vendorsFetching, error: vendorsError } = useSearchVendors({
    category: currentCategory,
    city: selectedCity || undefined,
    eventType: filterEventTypeId,
    eventDate: eventDate ? format(eventDate, 'yyyy-MM-dd') : undefined,
    minBudget: minBudget ? parseFloat(minBudget) : undefined,
    maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
    sortBy: sortBy,
    customerLat: customerLocation?.latitude,
    customerLng: customerLocation?.longitude,
    searchRadiusKm: customerLocation ? searchRadiusKm : undefined,
  }, canFetchSearchData && showVendors); // Enable if we can fetch AND showing vendors

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  // Determine the eventType to pass to API - prioritize URL param over filter
  const apiEventType = useMemo(() => {
    // Use currentEventType (from URL) if available, otherwise use filterEventTypeId (from filter dropdown)
    const eventType = currentEventType || filterEventTypeId;
    if (eventType && !isNaN(eventType)) {
      return eventType;
    }
    // If eventTypeParam exists but couldn't be resolved, log warning
    if (eventTypeParam && !eventType) {
      console.warn(`⚠️ EventType "${eventTypeParam}" from URL could not be resolved to an ID. Filtering may not work correctly.`);
    }
    return undefined;
  }, [currentEventType, filterEventTypeId, eventTypeParam]);

  const { data: listingsData, loading: listingsLoading, isFetching: listingsFetching, error: listingsError } = useSearchListings({
    eventType: apiEventType,
    category: !showVendors && resolvedCategoryId ? resolvedCategoryId : undefined,
    listingType: listingType === 'packages' ? 'packages' : undefined,
    city: selectedCity || undefined,
    eventDate: eventDate ? format(eventDate, 'yyyy-MM-dd') : undefined,
    minBudget: minBudget ? parseFloat(minBudget) : undefined,
    maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
    sortBy: sortBy,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    customerLat: customerLocation?.latitude,
    customerLng: customerLocation?.longitude,
    searchRadiusKm: customerLocation ? searchRadiusKm : undefined,
  }, canFetchSearchData && !showVendors); // Enable if we can fetch AND showing listings
  
  // Reset switching state when data loads
  useEffect(() => {
    if (!vendorsLoading && !listingsLoading && !vendorsFetching && !listingsFetching) {
      setIsSwitchingCategory(false);
    }
  }, [vendorsLoading, listingsLoading, vendorsFetching, listingsFetching]);

  // Ensure data is always an array - handle both direct arrays and wrapped responses
  const vendors = useMemo(() => {
    if (!vendorsData) return [];
    if (Array.isArray(vendorsData)) return vendorsData;
    // If data is wrapped in an object with a data property
    if (vendorsData && typeof vendorsData === 'object' && 'data' in vendorsData) {
      const data = (vendorsData as any).data;
      return Array.isArray(data) ? data : (data ? [data] : []);
    }
    return [vendorsData];
  }, [vendorsData]);

  const [accumulatedListings, setAccumulatedListings] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Reset pagination when filters change (category, eventType, search query, city, budgets, sort)
  useEffect(() => {
    setPage(0);
    setAccumulatedListings([]);
    setHasMore(true);
  }, [currentEventType, resolvedCategoryId, searchQuery, selectedCity, minBudget, maxBudget, sortBy, listingType, apiEventType]);

  // Normalize current page data
  const currentPageListings = useMemo(() => {
    if (!listingsData) return [];
    if (Array.isArray(listingsData)) return listingsData;
    if (listingsData && typeof listingsData === 'object' && 'data' in listingsData) {
      const data = (listingsData as any).data;
      return Array.isArray(data) ? data : (data ? [data] : []);
    }
    return [listingsData];
  }, [listingsData]);

  // For logs and counts, prefer accumulated pages if present
  const listings = accumulatedListings.length > 0 ? accumulatedListings : currentPageListings;

  // Accumulate pages
  useEffect(() => {
    if (currentPageListings && currentPageListings.length >= 0) {
      if (page === 0) {
        setAccumulatedListings(currentPageListings);
      } else if (!listingsFetching && !listingsLoading) {
        setAccumulatedListings((prev) => {
          // Avoid duplicates by id
          const existingIds = new Set(prev.map((p: any) => p.id));
          const merged = [...prev];
          currentPageListings.forEach((item: any) => {
            if (!existingIds.has(item.id)) merged.push(item);
          });
          return merged;
        });
      }
      // If returned less than page size, no more data
      setHasMore(currentPageListings.length === PAGE_SIZE);
    }
  }, [currentPageListings, page, listingsFetching, listingsLoading]);

  // Transform API listings to match component expectations
  const transformedListings = useMemo(() => {
    try {
      const source = accumulatedListings.length > 0 ? accumulatedListings : currentPageListings;
      return source.map((listing: any) => {
        // Safely transform each listing
        const transformed = {
          ...listing,
          // Map API field names to component expected names
          includedItems: listing.includedItemsText || [],
          excludedItems: listing.excludedItemsText || [],
          addOns: listing.addOns || [], // Will be empty for now, can be fetched separately if needed
          category: listing.categoryId || listing.category || '',
          customCategoryName: listing.customCategoryName || '', // Custom category name when category is "other"
          // Ensure images is always an array
          images: Array.isArray(listing.images) ? listing.images : (listing.images ? [listing.images] : []),
          // Ensure price is a number
          price: typeof listing.price === 'number' ? listing.price : parseFloat(listing.price || 0),
          // Ensure required fields exist
          name: listing.name || 'Unnamed Listing',
          description: listing.description || '',
          vendorId: listing.vendorId || '',
          vendorName: listing.vendorName || 'Unknown Vendor',
          // Add default vendor fields (these aren't in API response, so set defaults)
          vendorRating: listing.vendorRating || 0,
          vendorReviewCount: listing.vendorReviewCount || 0,
          vendorCity: listing.vendorCity || '',
          vendorCoverageRadius: listing.vendorCoverageRadius || 0,
          // Preserve eventTypeIds for filtering
          eventTypeIds: listing.eventTypeIds || [],
        };
        return transformed;
      });
    } catch (error) {
      console.error('Error transforming listings:', error);
      return [];
    }
  }, [listings]);

  // Filter listings based on listing type, event type, and search query
  const filteredListings = useMemo(() => {
    let filtered = transformedListings;
    
    // Filter by listing type (packages vs items)
    if (listingType === 'packages') {
      filtered = filtered.filter((item: any) => item.type === 'PACKAGE' || item.type === 'package');
    }
    
    // Additional frontend filtering: Ensure event type matches if eventTypeId is set
    // This is a safety measure in case backend filtering doesn't work correctly
    // Use apiEventType to match what was sent to backend
    const activeEventTypeId = apiEventType || eventTypeId;
    if (activeEventTypeId && !isNaN(activeEventTypeId)) {
      filtered = filtered.filter((item: any) => {
        // If listing has eventTypeIds array, check if it includes the selected event type
        if (item.eventTypeIds && Array.isArray(item.eventTypeIds) && item.eventTypeIds.length > 0) {
          // Convert both to numbers for comparison (handle string IDs)
          const itemEventTypeIds = item.eventTypeIds.map((id: any) => {
            if (typeof id === 'string') {
              const parsed = parseInt(id, 10);
              return isNaN(parsed) ? id : parsed;
            }
            return id;
          });
          const targetId = Number(activeEventTypeId);
          return itemEventTypeIds.some((id: any) => Number(id) === targetId);
        }
        // If no eventTypeIds are set, exclude it (safety measure)
        // This ensures listings without event types don't show up when filtering by event type
        return false;
      });
    }
    
    // Filter by search query (name, description, vendor name, category, custom category)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const getCategoryName = (categoryId: string, customCategoryName?: string) => {
        if (customCategoryName) return customCategoryName;
        const cat = categories.find((c: any) => c.id === categoryId);
        return cat?.name || '';
      };
      
      filtered = filtered.filter((item: any) => {
        const categoryName = getCategoryName(item.category || '', item.customCategoryName).toLowerCase();
        return (
          item.name?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.vendorName?.toLowerCase().includes(query) ||
          categoryName.includes(query)
        );
      });
    }
    
    return filtered;
  }, [transformedListings, listingType, apiEventType, eventTypeId, searchQuery, categories]);

  const loadMore = () => {
    if (!hasMore || listingsFetching || listingsLoading) return;
    setPage((p) => p + 1);
  };

  // Infinite scroll - load more when sentinel is visible
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !listingsFetching && !listingsLoading && !showVendors) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading 200px before reaching the sentinel
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, listingsFetching, listingsLoading, showVendors]);
  
  // Filter vendors by search query
  const filteredVendors = useMemo(() => {
    if (!searchQuery) return vendors;
    
    const query = searchQuery.toLowerCase();
    const getCategoryName = (categoryId: string, customCategoryName?: string) => {
      if (customCategoryName) return customCategoryName;
      const cat = categories.find((c: any) => c.id === categoryId);
      return cat?.name || '';
    };
    
    return vendors.filter((vendor: any) => {
      const categoryName = getCategoryName(vendor.categoryId || vendor.category || '', vendor.customCategoryName).toLowerCase();
      return (
        vendor.businessName?.toLowerCase().includes(query) ||
        vendor.name?.toLowerCase().includes(query) ||
        categoryName.includes(query) ||
        vendor.cityName?.toLowerCase().includes(query)
      );
    });
  }, [vendors, searchQuery, categories]);

  // Get current event type name for display
  const currentEventTypeDisplay = eventTypes.find((et: any) => et.id === eventTypeId);

  const handleCategoryClick = (categoryId: string) => {
    flushSync(() => {
      // Reset page when category changes
      setPage(0);
      setAccumulatedListings([]);
      
      if (categoryId === 'all' || selectedCategory === categoryId) {
        // Clicking "All Categories" or clicking the same category (toggle off)
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('category');
          // Only keep view=vendors if it was explicitly set
          if (viewParam !== 'vendors') {
            newParams.delete('view');
          }
          return newParams;
        }, { replace: true });
      } else {
        // Selecting a different category - show listings filtered by category
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.set('category', categoryId);
          // Don't automatically switch to vendor view - show listings instead
          if (viewParam !== 'vendors') {
            newParams.delete('view');
          }
          return newParams;
        }, { replace: true });
      }
    });
  };

  const handleListingTypeChange = (type: 'all' | 'packages') => {
    // Reset page when listing type changes
    setPage(0);
    setAccumulatedListings([]);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (type === 'all') {
        newParams.delete('listingType');
      } else {
        newParams.set('listingType', type);
      }
      return newParams;
    }, { replace: true });
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const checkScroll = () => {
      if (categoryScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    const interval = setInterval(checkScroll, 100);
    return () => clearInterval(interval);
  }, [categories]);

  const handleBook = (listing: any) => {
    addToCart({
      id: listing.id,
      name: listing.name,
      price: listing.price,
      vendorId: listing.vendorId,
      vendorName: listing.vendorName,
      image: listing.images?.[0],
      type: listing.type === 'PACKAGE' ? 'package' : 'service',
    });
    toast({
      title: "Added to cart",
      description: `${listing.name} has been added to your cart.`,
    });
  };

  // Debug: Log data to help diagnose issues
  useEffect(() => {
    console.log('🔍 Search component state:', {
      showVendors,
      selectedCategory,
      resolvedCategoryId,
      eventTypeParam,
      eventTypeId,
      currentEventType,
      filterEventTypeId,
      apiEventType,
      eventTypes: eventTypes.map((et: any) => ({ id: et.id, name: et.name, displayName: et.displayName })),
      categories: categories.map((c: any) => ({ id: c.id, name: c.name })),
      filteredCategoriesCount: categories.length,
      eventTypeCategoriesCount: eventTypeCategories.length,
      validCategoryIdsForEventType: eventTypeId && !isNaN(eventTypeId) ? 
        eventTypeCategories
          .filter((etc: any) => etc.eventTypeId === eventTypeId || etc.eventType?.id === eventTypeId)
          .map((etc: any) => etc.categoryId || etc.category?.id) : [],
      vendorsCount: vendors.length,
      listingsCount: listings.length,
      filteredListingsCount: filteredListings.length,
      vendorsLoading,
      listingsLoading,
      vendorsError,
      listingsError,
    });
    
    // Log sample listings with their eventTypeIds
    if (listings.length > 0) {
      console.log('📦 Sample listings with eventTypeIds:', listings.slice(0, 3).map((l: any) => ({
        id: l.id,
        name: l.name,
        eventTypeIds: l.eventTypeIds,
        hasEventTypeIds: !!l.eventTypeIds && Array.isArray(l.eventTypeIds) && l.eventTypeIds.length > 0,
      })));
    }
    
    // Log vendor category IDs for debugging
    if (vendors.length > 0) {
      console.log('Sample vendor category IDs:', vendors.slice(0, 3).map((v: any) => ({
        id: v.id,
        businessName: v.businessName,
        categoryId: v.categoryId,
        categoryName: v.categoryName,
      })));
    }
    
    // Log listing category IDs for debugging
    if (listings.length > 0) {
      console.log('Sample listing category IDs:', listings.slice(0, 3).map((l: any) => ({
        id: l.id,
        name: l.name,
        categoryId: l.categoryId,
        category: l.category,
      })));
    }
  }, [showVendors, selectedCategory, resolvedCategoryId, eventTypeParam, eventTypeId, categories, vendors, listings, filteredListings, vendorsLoading, listingsLoading, vendorsError, listingsError]);

  // Category-themed hero backgrounds — changes when user selects a category
  const categoryHeroThemes: Record<string, { from: string; via: string; to: string; pattern: string; label: string }> = {
    'all':               { from: '#3b2d8b', via: '#5950b3', to: '#7867dc', pattern: 'M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z', label: '' },
    'caterer':           { from: '#c2410c', via: '#ea580c', to: '#f97316', pattern: 'M3 12h18M5 8c0-2 2-4 4-4h6c2 0 4 2 4 4v8c0 2-2 4-4 4H9c-2 0-4-2-4-4z', label: '🍽️' },
    'catering':          { from: '#c2410c', via: '#ea580c', to: '#f97316', pattern: 'M3 12h18M5 8c0-2 2-4 4-4h6c2 0 4 2 4 4v8c0 2-2 4-4 4H9c-2 0-4-2-4-4z', label: '🍽️' },
    'decorator':         { from: '#9d174d', via: '#db2777', to: '#ec4899', pattern: 'M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z', label: '🎨' },
    'decor':             { from: '#9d174d', via: '#db2777', to: '#ec4899', pattern: 'M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z', label: '🎨' },
    'photo-video':       { from: '#1e3a8a', via: '#2563eb', to: '#3b82f6', pattern: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z', label: '📸' },
    'photographer':      { from: '#1e3a8a', via: '#2563eb', to: '#3b82f6', pattern: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z', label: '📸' },
    'venue':             { from: '#065f46', via: '#059669', to: '#10b981', pattern: 'M3 21h18M5 21V7l7-4 7 4v14', label: '🏛️' },
    'dj':                { from: '#4c1d95', via: '#7c3aed', to: '#8b5cf6', pattern: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0z', label: '🎧' },
    'dj-entertainment':  { from: '#4c1d95', via: '#7c3aed', to: '#8b5cf6', pattern: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0z', label: '🎧' },
    'live-music':        { from: '#4c1d95', via: '#6d28d9', to: '#a855f7', pattern: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0z', label: '🎵' },
    'sound-lights':      { from: '#92400e', via: '#d97706', to: '#f59e0b', pattern: 'M13 2L3 14h9l-1 8 10-12h-9z', label: '💡' },
    'mua':               { from: '#881337', via: '#e11d48', to: '#f43f5e', pattern: 'M12 22c-4-4-8-7-8-11a8 8 0 1116 0c0 4-4 7-8 11z', label: '💄' },
    'makeup':            { from: '#881337', via: '#e11d48', to: '#f43f5e', pattern: 'M12 22c-4-4-8-7-8-11a8 8 0 1116 0c0 4-4 7-8 11z', label: '💄' },
    'artists':           { from: '#9a3412', via: '#dc2626', to: '#ef4444', pattern: 'M12 2a10 10 0 100 20 10 10 0 000-20z', label: '🎭' },
  };

  const heroTheme = useMemo(() => {
    const key = selectedCategory.toLowerCase();
    if (categoryHeroThemes[key]) return categoryHeroThemes[key];
    // Try partial match
    for (const [k, v] of Object.entries(categoryHeroThemes)) {
      if (key.includes(k) || k.includes(key)) return v;
    }
    return categoryHeroThemes['all'];
  }, [selectedCategory]);

  const waveSvgHtml = '<svg viewBox="0 0 1440 60" style="width:100%;height:auto;display:block" preserveAspectRatio="none"><path d="M0,60 L0,20 C360,50 720,0 1440,30 L1440,60 Z" fill="#f4f2fb"></path></svg>';

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-700" style={{
      background: selectedCategory === 'all' ? '#f4f2fb' : `linear-gradient(180deg, ${heroTheme.to}15 0%, ${heroTheme.to}08 40%, #f7f6fb 100%)`
    }}>
      {/* Decorative background — dynamically themed */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden transition-all duration-700">
        {/* Ambient orbs — use category color */}
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full blur-[100px] transition-all duration-700"
          style={{ background: selectedCategory === 'all' ? 'rgba(89,80,179,0.05)' : `${heroTheme.to}0d` }} />
        <div className="absolute top-[55%] -left-32 w-[500px] h-[500px] rounded-full blur-[100px] transition-all duration-700"
          style={{ background: selectedCategory === 'all' ? 'rgba(168,85,247,0.04)' : `${heroTheme.from}0a` }} />
        <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] rounded-full blur-[80px] transition-all duration-700"
          style={{ background: selectedCategory === 'all' ? 'rgba(129,140,248,0.04)' : `${heroTheme.via}08` }} />
        
        {/* Category SVG icon pattern — flows through the page */}
        {selectedCategory !== 'all' && (
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cat-bg-icons" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                <path d={heroTheme.pattern} fill="none" stroke={heroTheme.via} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                  transform="translate(48,48) scale(1.2)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cat-bg-icons)" />
          </svg>
        )}

        {/* Diamond pattern — only when "all" is selected */}
        {selectedCategory === 'all' && (
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="search-diamonds" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="2" height="2" x="15" y="15" fill="#5950b3" rx="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#search-diamonds)" />
          </svg>
        )}
      </div>

      <Navbar />

      {/* Hero Search Header — dynamically themed by category */}
      <div className="relative overflow-hidden transition-all duration-700" style={{
        background: `linear-gradient(135deg, ${heroTheme.from} 0%, ${heroTheme.via} 50%, ${heroTheme.to} 100%)`
      }}>
        {/* Animated wavy pattern overlay — like GigSalad */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.1]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="hero-waves" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q25 25 50 50 Q75 75 100 50" fill="none" stroke="white" strokeWidth="30" />
              <path d="M0 0 Q25 -25 50 0 Q75 25 100 0" fill="none" stroke="white" strokeWidth="30" />
              <path d="M0 100 Q25 75 50 100 Q75 125 100 100" fill="none" stroke="white" strokeWidth="30" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-waves)" />
        </svg>

        {/* Scattered category SVG icons */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {[
            { x: '5%', y: '20%', size: 28, rotate: -15 },
            { x: '15%', y: '65%', size: 22, rotate: 20 },
            { x: '85%', y: '15%', size: 26, rotate: 10 },
            { x: '92%', y: '60%', size: 24, rotate: -20 },
            { x: '40%', y: '10%', size: 20, rotate: 25 },
            { x: '65%', y: '75%', size: 22, rotate: -10 },
            { x: '75%', y: '25%', size: 18, rotate: 30 },
            { x: '25%', y: '80%', size: 20, rotate: -25 },
          ].map((pos, i) => (
            <g key={i} transform={`translate(${pos.x.replace('%','')},${pos.y.replace('%','')}) rotate(${pos.rotate})`} style={{ transform: `translate(${pos.x}, ${pos.y}) rotate(${pos.rotate}deg)` }}>
              <path d={heroTheme.pattern} fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: `scale(${pos.size / 24})`, transformOrigin: '12px 12px' }} />
            </g>
          ))}
        </svg>

        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-all duration-700"
          style={{ background: heroTheme.to, opacity: 0.2 }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none transition-all duration-700"
          style={{ background: heroTheme.from, opacity: 0.15 }} />

        <div className="container mx-auto px-4 pt-8 pb-14 relative z-10">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                {heroTheme.label && selectedCategory !== 'all' && (
                  <span className="text-4xl sm:text-5xl drop-shadow-lg">{heroTheme.label}</span>
                )}
                {showVendors
                  ? (selectedCategory !== 'all'
                      ? `${categories.find((c: any) => c.id === selectedCategory)?.name || 'Category'} Vendors`
                      : 'Explore Vendors')
                  : (selectedCategory !== 'all'
                      ? `${categories.find((c: any) => c.id === selectedCategory)?.name || selectedCategory}`
                      : (currentEventTypeDisplay ? `${currentEventTypeDisplay.name} Services` : 'Explore Services'))}
              </h1>
              <p className="text-white text-sm mt-1.5 opacity-60">
                {selectedCategory !== 'all'
                  ? `Browse the best ${(categories.find((c: any) => c.id === selectedCategory)?.name || '').toLowerCase()} professionals`
                  : 'Find and book the best event professionals near you'}
              </p>
            </div>
            {!showVendors && (
              <div className="flex rounded-xl p-1 flex-shrink-0 border border-white border-opacity-10" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <button
                  className={cn("px-5 py-2 rounded-lg text-xs font-semibold transition-all", listingType === 'all' ? "bg-white text-brand shadow-lg" : "text-white opacity-70 hover:opacity-100")}
                  onClick={() => handleListingTypeChange('all')}
                >All</button>
                <button
                  className={cn("px-5 py-2 rounded-lg text-xs font-semibold transition-all", listingType === 'packages' ? "bg-white text-brand shadow-lg" : "text-white opacity-70 hover:opacity-100")}
                  onClick={() => handleListingTypeChange('packages')}
                >Packages</button>
              </div>
            )}
          </div>
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder={`Search ${showVendors ? 'vendors' : 'services, vendors, categories'}...`}
              className="bg-white border-0 text-foreground text-sm rounded-2xl shadow-xl focus:shadow-2xl transition-all ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ paddingLeft: '3rem', height: '3.25rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0" dangerouslySetInnerHTML={{ __html: waveSvgHtml }} />
      </div>

      {/* ===== PREMIUM FILTER BAR ===== */}
      <div className="container mx-auto px-4 -mt-4 relative z-20">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 mb-5 overflow-hidden">

          {/* Category Scroll Strip */}
          <div className="relative">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div
              ref={categoryScrollRef}
              className="flex gap-2 px-5 py-4 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              <button
                className={cn(
                  "h-9 px-5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap flex-shrink-0",
                  selectedCategory === 'all'
                    ? "bg-gradient-to-r from-[#5950b3] to-[#7867dc] text-white shadow-md shadow-[#5950b3]/20"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => handleCategoryClick('all')}
              >All Services</button>
              {categories.map((category: any) => (
                <button
                  key={category.id}
                  className={cn(
                    "h-9 px-5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5",
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-[#5950b3] to-[#7867dc] text-white shadow-md shadow-[#5950b3]/20"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.icon && <span className="text-sm">{category.icon}</span>}
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Divider with subtle gradient */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4" />

          {/* Smart Filter Row */}
          <div className="px-5 py-3 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className={cn(
                "h-9 w-auto min-w-[130px] text-xs rounded-xl flex-shrink-0 transition-all font-medium",
                sortBy !== 'relevance'
                  ? "bg-[#5950b3]/8 border-[#5950b3]/20 text-[#5950b3] font-semibold"
                  : "border-gray-200 bg-gray-50/80 text-gray-600 hover:bg-gray-100"
              )}>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_low">Price: Low → High</SelectItem>
                <SelectItem value="price_high">Price: High → Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                {showVendors ? (<SelectItem value="reviews">Most Reviews</SelectItem>) : (<SelectItem value="newest">Newest First</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Separator dot */}
            <div className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0 hidden sm:block" />

            {/* City */}
            <Select value={selectedCity || "all"} onValueChange={(value) => setSelectedCity(value === "all" ? "" : value)}>
              <SelectTrigger className={cn(
                "h-9 w-auto min-w-[110px] text-xs rounded-xl flex-shrink-0 transition-all font-medium",
                selectedCity
                  ? "bg-[#5950b3]/8 border-[#5950b3]/20 text-[#5950b3] font-semibold"
                  : "border-gray-200 bg-gray-50/80 text-gray-600 hover:bg-gray-100"
              )}>
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city: any) => (<SelectItem key={city.id || city.name} value={city.name || city.id}>{city.name}</SelectItem>))}
              </SelectContent>
            </Select>

            {/* Event Type */}
            <Select
              value={selectedEventTypeFilter || (eventTypeParam ? eventTypeParam.toString() : "all")}
              onValueChange={(value) => {
                const newValue = value === "all" ? "" : value;
                setSelectedEventTypeFilter(newValue);
                setPage(0); setAccumulatedListings([]); setHasMore(true);
                queryClient.invalidateQueries({ queryKey: ['searchListings'] });
                queryClient.invalidateQueries({ queryKey: ['searchVendors'] });
                flushSync(() => { setSearchParams(prev => { const newParams = new URLSearchParams(prev); if (newValue) { newParams.set('eventType', newValue); } else { newParams.delete('eventType'); } return newParams; }, { replace: true }); });
              }}
            >
              <SelectTrigger className={cn(
                "h-9 w-auto min-w-[130px] text-xs rounded-xl flex-shrink-0 transition-all font-medium",
                selectedEventTypeFilter
                  ? "bg-[#5950b3]/8 border-[#5950b3]/20 text-[#5950b3] font-semibold"
                  : "border-gray-200 bg-gray-50/80 text-gray-600 hover:bg-gray-100"
              )}>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                {eventTypes.map((et: any) => (<SelectItem key={et.id} value={et.id.toString()}>{et.name || et.displayName}</SelectItem>))}
              </SelectContent>
            </Select>

            {/* Event Date */}
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  "h-9 px-4 rounded-xl border text-xs flex items-center gap-2 whitespace-nowrap flex-shrink-0 transition-all font-medium",
                  eventDate
                    ? "bg-[#5950b3]/8 border-[#5950b3]/20 text-[#5950b3] font-semibold"
                    : "border-gray-200 bg-gray-50/80 text-gray-600 hover:bg-gray-100"
                )}>
                  <Calendar className="h-3.5 w-3.5" />
                  {eventDate ? format(eventDate, "MMM d, yyyy") : "Event Date"}
                  {eventDate && (
                    <span
                      onClick={(e) => { e.stopPropagation(); setEventDate(undefined); }}
                      className="ml-0.5 w-4 h-4 rounded-full bg-[#5950b3]/15 hover:bg-[#5950b3]/25 flex items-center justify-center transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl shadow-xl border-gray-200" align="start">
                <CalendarComponent mode="single" selected={eventDate} onSelect={setEventDate} disabled={(date) => date < new Date()} initialFocus />
              </PopoverContent>
            </Popover>

            {/* More Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-9 px-4 rounded-xl border text-xs flex items-center gap-2 whitespace-nowrap transition-all font-medium flex-shrink-0",
                showFilters
                  ? "bg-gradient-to-r from-[#5950b3] to-[#7867dc] text-white border-transparent shadow-md shadow-[#5950b3]/20"
                  : "border-gray-200 bg-gray-50/80 text-gray-600 hover:bg-gray-100"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More Filters
              {(minBudget || maxBudget || customerLocation) && !showFilters && (
                <span className="w-2 h-2 rounded-full bg-[#5950b3] animate-pulse" />
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Active filter chips + Reset */}
            {(selectedCity || selectedEventTypeFilter || eventDate || minBudget || maxBudget || selectedCategory !== 'all' || customerLocation) && (
              <button
                onClick={() => {
                  setSelectedCity(''); setSelectedEventTypeFilter(''); setEventDate(undefined); setMinBudget(''); setMaxBudget(''); setCustomerLocation(null); setSearchRadiusKm(20);
                  setPage(0); setAccumulatedListings([]); setHasMore(true);
                  queryClient.invalidateQueries({ queryKey: ['searchListings'] }); queryClient.invalidateQueries({ queryKey: ['searchVendors'] });
                  setSearchParams(prev => { const newParams = new URLSearchParams(prev); newParams.delete('city'); newParams.delete('eventType'); newParams.delete('eventDate'); newParams.delete('minBudget'); newParams.delete('maxBudget'); newParams.delete('category'); return newParams; }, { replace: true });
                }}
                className="h-9 px-3.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>

          {/* Expanded Filters Panel */}
          <div className={cn(
            "grid transition-all duration-300 ease-in-out",
            showFilters ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4" />
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Budget Range */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">₹</span>
                      </div>
                      Budget Range
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={minBudget}
                          onChange={(e) => setMinBudget(e.target.value)}
                          className="h-10 text-sm rounded-xl border-gray-200 bg-gray-50/50 pl-7 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="flex items-center text-gray-300 text-xs font-medium">to</div>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={maxBudget}
                          onChange={(e) => setMaxBudget(e.target.value)}
                          className="h-10 text-sm rounded-xl border-gray-200 bg-gray-50/50 pl-7 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                    {/* Quick budget presets */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Under ₹10K', min: '', max: '10000' },
                        { label: '₹10K–50K', min: '10000', max: '50000' },
                        { label: '₹50K–1L', min: '50000', max: '100000' },
                        { label: '₹1L+', min: '100000', max: '' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => { setMinBudget(preset.min); setMaxBudget(preset.max); }}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all",
                            minBudget === preset.min && maxBudget === preset.max
                              ? "bg-[#5950b3] text-white shadow-sm"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                          )}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2.5 sm:col-span-2 lg:col-span-2">
                    <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                        <Navigation className="h-3 w-3 text-white" />
                      </div>
                      Event Location
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <LocationAutocomplete
                        value={customerLocation}
                        onChange={(loc) => { setCustomerLocation(loc); setPage(0); setAccumulatedListings([]); }}
                        placeholder="Search your event location..."
                        label=""
                      />
                      {customerLocation && (
                        <RadiusSlider
                          value={searchRadiusKm}
                          onChange={(radius) => { setSearchRadiusKm(radius); setPage(0); setAccumulatedListings([]); }}
                          options={CUSTOMER_RADIUS_OPTIONS}
                          label=""
                        />
                      )}
                    </div>
                    {customerLocation && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-[11px] font-medium border border-blue-100">
                          <MapPin className="h-3 w-3" />
                          {customerLocation.name} · {searchRadiusKm} km radius
                        </span>
                        <button
                          onClick={() => { setCustomerLocation(null); setPage(0); setAccumulatedListings([]); }}
                          className="text-[11px] text-gray-400 hover:text-red-500 transition-colors font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pb-12">

        {/* Error States */}
        {(eventTypesError || categoriesError) && (
          <Card className="p-6 mb-6 border-destructive">
            <CardContent className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Failed to load data</p>
                <p className="text-sm text-muted-foreground">
                  {eventTypesError || categoriesError}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {(showVendors ? vendorsError : listingsError) && (
          <Card className="p-6 mb-6 border-destructive">
            <CardContent className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  Failed to load {showVendors ? 'vendors' : 'listings'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {showVendors ? vendorsError : listingsError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {(!referenceDataReady ||
          (showVendors ? vendorsLoading : (listingsLoading && page === 0 && accumulatedListings.length === 0)) ||
          isSwitchingCategory) ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                {!referenceDataReady ? 'Loading categories...' : isSwitchingCategory ? 'Loading new results...' : showVendors ? 'Loading vendors...' : 'Loading listings...'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-full w-24" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-11 bg-gray-200 rounded-2xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {showVendors ? (
              filteredVendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  {/* Illustration */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#5950b3]/10 to-[#7867dc]/10 flex items-center justify-center">
                      <SearchIcon className="h-10 w-10 text-[#5950b3]/40" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-sm">🔍</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1.5">No vendors found</h3>
                  <p className="text-sm text-gray-400 max-w-xs text-center mb-6">
                    We couldn't find vendors matching your current filters. Try broadening your search.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedCity(''); setSelectedEventTypeFilter(''); setEventDate(undefined); setMinBudget(''); setMaxBudget(''); setCustomerLocation(null);
                        setPage(0); setAccumulatedListings([]); setHasMore(true);
                        queryClient.invalidateQueries({ queryKey: ['searchVendors'] });
                        setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('city'); p.delete('eventType'); p.delete('eventDate'); p.delete('minBudget'); p.delete('maxBudget'); p.delete('category'); return p; }, { replace: true });
                      }}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#5950b3] to-[#7867dc] text-white shadow-md shadow-[#5950b3]/20 hover:shadow-lg transition-all"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => handleCategoryClick('all')}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Browse All
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredVendors.map((vendor: any) => (
                      <VendorCard
                        key={vendor.id}
                        vendor={{
                          id: vendor.id,
                          businessName: vendor.businessName || vendor.name,
                          category: vendor.categoryId || vendor.category,
                          categoryName: vendor.categoryName,
                          city: vendor.city,
                          cityName: vendor.cityName,
                          rating: vendor.rating || vendor.averageRating,
                          reviewCount: vendor.reviewCount || vendor.totalReviews,
                          startingPrice: vendor.startingPrice || vendor.minPrice,
                          coverImage: vendor.coverImage || vendor.profileImage,
                          isVerified: vendor.isVerified,
                        }}
                      />
                    ))}
                  </div>
                </>
              )
            ) : (
              filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  {/* Illustration */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#5950b3]/10 to-[#7867dc]/10 flex items-center justify-center">
                      <SearchIcon className="h-10 w-10 text-[#5950b3]/40" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-sm">🔍</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1.5">
                    {listingType === 'packages' ? 'No packages found' : 'No listings found'}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-xs text-center mb-6">
                    {listingType === 'packages'
                      ? 'There are no packages available for this selection. Try browsing all services or switching categories.'
                      : eventTypeParam && !eventTypeId
                        ? `Event type "${eventTypeParam}" not recognized. Try picking one from the filters.`
                        : "We couldn't find listings matching your filters. Try adjusting or clearing them."}
                  </p>
                  <div className="flex items-center gap-3">
                    {listingType === 'packages' ? (
                      <>
                        <button
                          onClick={() => handleListingTypeChange('all')}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#5950b3] to-[#7867dc] text-white shadow-md shadow-[#5950b3]/20 hover:shadow-lg transition-all"
                        >
                          View All Services
                        </button>
                        {selectedCategory !== 'all' && (
                          <button
                            onClick={() => handleCategoryClick('all')}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            All Categories
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCity(''); setSelectedEventTypeFilter(''); setEventDate(undefined); setMinBudget(''); setMaxBudget(''); setCustomerLocation(null);
                            setPage(0); setAccumulatedListings([]); setHasMore(true);
                            queryClient.invalidateQueries({ queryKey: ['searchListings'] });
                            setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('city'); p.delete('eventType'); p.delete('eventDate'); p.delete('minBudget'); p.delete('maxBudget'); p.delete('category'); return p; }, { replace: true });
                          }}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#5950b3] to-[#7867dc] text-white shadow-md shadow-[#5950b3]/20 hover:shadow-lg transition-all"
                        >
                          Clear All Filters
                        </button>
                        <button
                          onClick={() => handleCategoryClick('all')}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          Browse All
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Warning if eventType couldn't be resolved */}
                  {eventTypeParam && !apiEventType && (
                    <Card className="mb-4 border-yellow-500/50 bg-yellow-500/10">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                              Event type "{eventTypeParam}" could not be resolved. Showing all listings.
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                              Please select an event type from the filters above for accurate results.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className={cn("grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
                    {filteredListings.map((listing: any) => {
                      try {
                        const isPackage = listing.type === 'PACKAGE' || listing.type === 'package';
                        
                        if (listingType === 'packages' && isPackage) {
                          return (
                            <PremiumPackageCard
                              key={listing.id}
                              pkg={listing}
                              vendorId={listing.vendorId || ''}
                              vendorName={listing.vendorName || 'Unknown Vendor'}
                              vendorCategory={listing.categoryId || listing.category}
                              onBook={(pkg, addOns, customizations) => {
                                const totalPrice = pkg.price + 
                                  (addOns?.reduce((sum: number, a: any) => sum + (a.price || 0), 0) || 0) +
                                  (customizations?.reduce((sum: number, c: any) => sum + (c.price || 0), 0) || 0);
                                handleBook({
                                  ...listing,
                                  price: totalPrice,
                                });
                              }}
                              theme="wedding"
                            />
                          );
                        } else {
                          return (
                            <PackageCard
                              key={listing.id}
                              package={listing}
                            />
                          );
                        }
                      } catch (error) {
                        console.error('Error rendering listing:', listing.id, error);
                        return (
                          <Card key={listing.id} className="p-4 border-destructive">
                            <CardContent>
                              <p className="text-sm text-destructive">Error rendering listing: {listing.name || listing.id}</p>
                            </CardContent>
                          </Card>
                        );
                      }
                    })}
                  </div>
                  {/* Infinite scroll sentinel */}
                  <div ref={loadMoreRef} className="flex justify-center mt-8 py-4 min-h-[40px]">
                    {/* Show loading when fetching more */}
                    {(listingsFetching || listingsLoading) && page > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading more...</span>
                      </div>
                    )}
                    {/* Only show end message when truly no more listings */}
                    {!hasMore && accumulatedListings.length > 0 && !listingsFetching && !listingsLoading && (
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
                        <p className="text-xs text-gray-400 font-medium">You've seen it all ✨</p>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
                      </div>
                    )}
                  </div>
                </>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
