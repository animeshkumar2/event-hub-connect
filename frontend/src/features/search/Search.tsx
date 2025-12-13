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
import { Search as SearchIcon, SlidersHorizontal, ChevronLeft, ChevronRight, AlertCircle, Loader2, X, Calendar } from "lucide-react";
import { useSearchListings, useSearchVendors, useEventTypes, useCategories, useCities, useEventTypeCategories } from "@/shared/hooks/useApi";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar as CalendarComponent } from "@/shared/components/ui/calendar";
import { format } from "date-fns";
import { publicApi } from "@/shared/services/api";
import { cn } from "@/shared/lib/utils";
import { useCart } from "@/shared/contexts/CartContext";
import { useToast } from "@/shared/hooks/use-toast";

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
    
    // Find "Other" category to always include at the end
    const otherCategory = allCategories.find((cat: any) => cat.id === 'other' || cat.id === 'Other');
    const categoriesWithoutOther = allCategories.filter((cat: any) => cat.id !== 'other' && cat.id !== 'Other');
    
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
      'mua': 'makeup',  // Frontend uses 'mua', backend uses 'makeup'
      'makeup': 'makeup',
      'photographer': 'photographer',
      'decorator': 'decorator',
      'dj': 'dj',
      'caterer': 'caterer',
      'mehendi': 'mehendi',
      'event-coordinator': 'event-coordinator',
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
      'makeup': ['makeup', 'mua', 'makeup artist'],
      'photographer': ['photographer', 'photography'],
      'decorator': ['decorator', 'decoration', 'décor'],
      'dj': ['dj', 'music', 'sound'],
      'caterer': ['caterer', 'catering'],
      'mehendi': ['mehendi', 'henna'],
      'event-coordinator': ['event coordinator', 'event planner', 'planner'],
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
      type: listing.type === 'PACKAGE' ? 'package' : 'item',
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Search Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${showVendors ? 'vendors' : 'listings'}...`}
              className="pl-10 bg-background border-border text-foreground text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Compact Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {showVendors 
                  ? (selectedCategory !== 'all' 
                      ? `${categories.find((c: any) => c.id === selectedCategory)?.name || 'Category'} Vendors`
                      : 'All Vendors')
                  : (currentEventTypeDisplay ? `${currentEventTypeDisplay.name} Packages` : 'All Packages')}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Discover the perfect vendors for your event
              </p>
            </div>
            
            {/* Listing Type Filter - Compact */}
            {!showVendors && (
              <div className="flex gap-1.5 sm:gap-2">
                <Button
                  variant={listingType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3"
                  onClick={() => handleListingTypeChange('all')}
                >
                  All
                </Button>
                <Button
                  variant={listingType === 'packages' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3"
                  onClick={() => handleListingTypeChange('packages')}
                >
                  Packages
                </Button>
              </div>
            )}
          </div>

          {/* Compact Category Tabs */}
          <div className="relative">
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 bg-background/80 backdrop-blur-sm"
                onClick={() => scrollCategories('left')}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            )}
            <div
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs px-2.5 whitespace-nowrap"
                onClick={() => handleCategoryClick('all')}
              >
                All
              </Button>
              {categories.map((category: any) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-2.5 whitespace-nowrap"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
            {canScrollRight && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 bg-background/80 backdrop-blur-sm"
                onClick={() => scrollCategories('right')}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters and Sort Section */}
        <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filter Toggle Button */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-8 sm:h-9 text-[11px] sm:text-xs flex-1 sm:flex-initial"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            Filters
            {(selectedCity || selectedEventTypeFilter || eventDate || minBudget || maxBudget || selectedCategory !== 'all') && (
              <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">
                {[selectedCity, selectedEventTypeFilter, eventDate, minBudget, maxBudget, selectedCategory !== 'all' ? selectedCategory : null].filter(Boolean).length}
              </Badge>
            )}
          </Button>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 sm:h-9 w-full sm:w-40 text-[11px] sm:text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              {showVendors ? (
                <SelectItem value="reviews">Most Reviews</SelectItem>
              ) : (
                <SelectItem value="newest">Newest First</SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {(selectedCity || selectedEventTypeFilter || eventDate || minBudget || maxBudget || selectedCategory !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Reset all filter state immediately
                setSelectedCity('');
                setSelectedEventTypeFilter('');
                setEventDate(undefined);
                setMinBudget('');
                setMaxBudget('');
                // Reset page to 0 to reload from beginning
                setPage(0);
                setAccumulatedListings([]);
                setHasMore(true);
                // Invalidate queries to force refetch
                queryClient.invalidateQueries({ queryKey: ['searchListings'] });
                queryClient.invalidateQueries({ queryKey: ['searchVendors'] });
                // Clear all URL params
                setSearchParams(prev => {
                  const newParams = new URLSearchParams(prev);
                  newParams.delete('city');
                  newParams.delete('eventType');
                  newParams.delete('eventDate');
                  newParams.delete('minBudget');
                  newParams.delete('maxBudget');
                  newParams.delete('category');
                  // Keep view and listingType if they exist
                  return newParams;
                }, { replace: true });
              }}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-3 sm:mb-4 border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* City Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">City</Label>
                  <Select value={selectedCity || "all"} onValueChange={(value) => setSelectedCity(value === "all" ? "" : value)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city: any) => (
                        <SelectItem key={city.id || city.name} value={city.name || city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Event Type Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Event Type</Label>
                  <Select 
                    value={selectedEventTypeFilter || (eventTypeParam ? eventTypeParam.toString() : "all")} 
                    onValueChange={(value) => {
                      const newValue = value === "all" ? "" : value;
                      setSelectedEventTypeFilter(newValue);
                      // Reset page when event type changes
                      setPage(0);
                      setAccumulatedListings([]);
                      setHasMore(true);
                      // Invalidate queries to force refetch
                      queryClient.invalidateQueries({ queryKey: ['searchListings'] });
                      queryClient.invalidateQueries({ queryKey: ['searchVendors'] });
                      // Update URL immediately
                      flushSync(() => {
                        setSearchParams(prev => {
                          const newParams = new URLSearchParams(prev);
                          if (newValue) {
                            newParams.set('eventType', newValue);
                          } else {
                            newParams.delete('eventType');
                          }
                          return newParams;
                        }, { replace: true });
                      });
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Event Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Event Types</SelectItem>
                      {eventTypes.map((et: any) => (
                        <SelectItem key={et.id} value={et.id.toString()}>
                          {et.name || et.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Category</Label>
                  <Select 
                    value={selectedCategory || "all"} 
                    onValueChange={(value) => {
                      const categoryValue = value === "all" ? "all" : value;
                      // Reset page when category changes
                      setPage(0);
                      setAccumulatedListings([]);
                      setHasMore(true);
                      // Invalidate queries to force refetch
                      queryClient.invalidateQueries({ queryKey: ['searchListings'] });
                      queryClient.invalidateQueries({ queryKey: ['searchVendors'] });
                      // Use handleCategoryClick which already handles URL updates
                      handleCategoryClick(categoryValue);
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            {cat.icon && <span>{cat.icon}</span>}
                            <span>{cat.name || cat.displayName}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Event Date Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Event Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-9 justify-start text-left font-normal text-sm",
                          !eventDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {eventDate ? format(eventDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={eventDate}
                        onSelect={setEventDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Budget Range (₹)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      className="h-9 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Loading State - Show skeleton loaders for better perceived performance */}
        {(!referenceDataReady || 
          (showVendors ? vendorsLoading : (listingsLoading && page === 0 && accumulatedListings.length === 0)) || 
          isSwitchingCategory) ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                {!referenceDataReady
                  ? 'Loading categories...' 
                  : isSwitchingCategory
                    ? 'Loading new results...'
                    : showVendors 
                      ? 'Loading vendors...' 
                      : 'Loading listings...'}
              </span>
            </div>
            {/* Skeleton grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted rounded-lg mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {showVendors ? (
              // Vendors View
              filteredVendors.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">No vendors found.</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or browse all categories.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">
                      {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'} found
                      {searchQuery && ` for "${searchQuery}"`}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              // Listings View
              filteredListings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">No listings found.</p>
                  <p className="text-sm text-muted-foreground">
                    {eventTypeParam && !eventTypeId 
                      ? `Event type "${eventTypeParam}" not found. Try selecting from the filters above.`
                      : 'Try adjusting your filters or browse all categories.'}
                  </p>
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
                  
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">
                      {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} loaded
                      {apiEventType && ` (filtered by event type)`}
                    </p>
                  </div>

                  <div className={cn(
                    "grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  )}>
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
                      <p className="text-xs text-muted-foreground/60">
                        End of results
                      </p>
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
