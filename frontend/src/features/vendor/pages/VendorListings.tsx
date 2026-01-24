import { useState, useEffect, useMemo, useCallback } from 'react';
import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/shared/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2,
  Package,
  Box,
  MoreVertical,
  X,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Camera,
  Palette,
  UtensilsCrossed,
  MapPin,
  Sparkles,
  Music,
  Lightbulb,
  Tag
} from 'lucide-react';
import { ImageUpload } from '@/shared/components/ImageUpload';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useVendorListingsData, useEventTypeCategories } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { useResponsiveCardLimit } from '@/shared/hooks/useResponsiveCardLimit';
import { ListingCard } from '@/features/vendor/components/ListingCard';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { useVendorProfile } from '@/shared/hooks/useVendorProfile';
import CompleteProfilePrompt from '@/shared/components/CompleteProfilePrompt';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { InlineError } from '@/shared/components/InlineError';
import { CategoryFieldRenderer } from '@/features/vendor/components/CategoryFields';
import { DeliveryTimeInput } from '@/features/vendor/components/DeliveryTimeInput';
import { ListingFormWizard } from '@/features/vendor/components/ListingFormWizard';

// Category icon mapping
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('photo') || name.includes('video')) return Camera;
  if (name.includes('décor') || name.includes('decor')) return Palette;
  if (name.includes('catering') || name.includes('food')) return UtensilsCrossed;
  if (name.includes('venue')) return MapPin;
  if (name.includes('makeup') || name.includes('styling')) return Sparkles;
  if (name.includes('dj') || name.includes('entertainment')) return Music;
  if (name.includes('sound') || name.includes('light')) return Lightbulb;
  return Tag;
};

// Core category mapping for Phase 1
// Maps display categories to their underlying DB category IDs
const CORE_CATEGORY_MAP = {
  'photography-videography': ['photographer', 'cinematographer', 'videographer'],
  'decorator': ['decorator'],
  'caterer': ['caterer'],
  'venue': ['venue'],
  'mua': ['mua'],
  'dj-entertainment': ['dj', 'live-music'],
  'sound-lights': ['sound-lights'],
  'other': ['other', 'return-gifts', 'invitations', 'anchors', 'event-coordinator'],
};

// Helper: Get core category ID from DB category ID
const getCoreCategoryId = (dbCategoryId: string): string => {
  for (const [coreId, dbIds] of Object.entries(CORE_CATEGORY_MAP)) {
    if (dbIds.includes(dbCategoryId)) {
      return coreId;
    }
  }
  return 'other'; // Default to other if not found
};

// Helper: Get primary DB category ID from core category ID
const getDbCategoryId = (coreCategoryId: string): string => {
  const dbIds = CORE_CATEGORY_MAP[coreCategoryId as keyof typeof CORE_CATEGORY_MAP];
  return dbIds ? dbIds[0] : 'other';
};

// Helper: Get all DB category IDs for a core category
const getAllDbCategoryIds = (coreCategoryId: string): string[] => {
  return CORE_CATEGORY_MAP[coreCategoryId as keyof typeof CORE_CATEGORY_MAP] || ['other'];
};

// Build core categories list for dropdowns
const coreCategories = [
  { id: 'photography-videography', name: 'Photography & Videography', icon: '📸' },
  { id: 'decorator', name: 'Décor', icon: '🎨' },
  { id: 'caterer', name: 'Catering', icon: '🍽️' },
  { id: 'venue', name: 'Venue', icon: '🏛️' },
  { id: 'mua', name: 'Makeup & Styling', icon: '💄' },
  { id: 'dj-entertainment', name: 'DJ & Entertainment', icon: '🎵' },
  { id: 'sound-lights', name: 'Sound & Lights', icon: '💡' },
  { id: 'other', name: 'Other', icon: '📦' },
];

// Extra charge with pricing type
type ExtraCharge = { name: string; price: string };

// Initial form state
const initialFormData = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  customCategoryName: '',
  eventTypeIds: [] as number[],
  images: [] as string[],
  highlights: [] as string[],
  includedItemsText: [] as string[],
  includedItemIds: [] as string[],
  excludedItemsText: [] as string[],
  deliveryTime: '',
  extraChargesDetailed: [] as ExtraCharge[],
  extraCharges: [] as string[],
  unit: '',
  minimumQuantity: 1,
  customNotes: '', // New field for "Anything Else to Add"
};

export default function VendorListings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Render counter for debugging
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listingType, setListingType] = useState<'PACKAGE' | 'ITEM'>('PACKAGE');
  const [editingListing, setEditingListing] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track which listing is being deleted
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; listing: any | null }>({
    open: false,
    listing: null,
  });
  const [draftSectionOpen, setDraftSectionOpen] = useState<string | undefined>('drafts'); // Default open
  const cardLimit = useResponsiveCardLimit(); // Get responsive card limit
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: true,
    included: true,
    highlights: false,
    photos: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Fetch data in parallel using optimized hook
  const { listings, profile, eventTypes, categories, loading: dataLoading } = useVendorListingsData();
  
  // Debug: Track what's changing
  const prevListingsData = React.useRef(listings.data);
  const prevProfileData = React.useRef(profile.data);
  if (prevListingsData.current !== listings.data) {
    console.log('⚠️ listings.data reference changed', {
      prevLength: prevListingsData.current?.length,
      newLength: listings.data?.length,
      same: prevListingsData.current === listings.data
    });
    prevListingsData.current = listings.data;
  }
  if (prevProfileData.current !== profile.data) {
    console.log('⚠️ profile.data reference changed');
    prevProfileData.current = profile.data;
  }
  
  console.log('🟡 After useVendorListingsData', {
    listingsDataLength: listings.data?.length,
    listingsLoading: listings.loading,
    listingsFetching: listings.isFetching,
    profileFetching: profile.isFetching,
    eventTypesFetching: eventTypes.isFetching,
    categoriesFetching: categories.isFetching
  });
  const { data: eventTypeCategoriesData } = useEventTypeCategories();
  
  // Check if vendor profile is complete (MUST be after all other hooks)
  const { isComplete: profileComplete, isLoading: profileLoading } = useVendorProfile();
  
  // Memoize listingsData to prevent re-renders when reference changes but data is the same
  const listingsData = React.useMemo(() => listings.data, [listings.data]);
  const listingsLoading = listings.loading || dataLoading;
  const listingsError = listings.error;
  const refetch = listings.refetch;
  const profileData = profile.data;
  const eventTypesData = eventTypes.data;
  const categoriesData = categories.data;
  const eventTypeCategories = React.useMemo(() => eventTypeCategoriesData || [], [eventTypeCategoriesData]);
  
  // Debug: Check if listingsData reference is changing
  const listingsDataRef = React.useRef(listingsData);
  if (listingsDataRef.current !== listingsData) {
    console.log('⚠️ listingsData reference changed!', {
      old: listingsDataRef.current,
      new: listingsData,
      same: listingsDataRef.current === listingsData
    });
    listingsDataRef.current = listingsData;
  }

  // Form state
  const [formData, setFormData] = useState(initialFormData);
  
  // Wrap setFormData to log when it's called
  const setFormDataWithLog = React.useCallback((data: any) => {
    console.log('🟢 setFormData called', typeof data === 'function' ? 'with function' : 'with data');
    console.trace('Stack trace:');
    setFormData(data);
  }, []);
  
  console.log('🔴 VendorListings render #', renderCount.current, {
    showCreateModal,
    editingListingId: editingListing?.id,
    formDataCategoryId: formData.categoryId,
    listingsDataLength: listingsData?.length
  });
  
  // Category-specific fields state
  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});
  
  // Wrap setCategorySpecificData to log when it's called
  const setCategorySpecificDataWithLog = React.useCallback((data: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => {
    console.log('🔵 setCategorySpecificData called', typeof data === 'function' ? 'with function' : data);
    setCategorySpecificData(data);
  }, []);

  // Draft states for inline editing
  const [draftIncludedItem, setDraftIncludedItem] = useState('');
  const [showIncludedItemInput, setShowIncludedItemInput] = useState(false);
  const [draftExcludedItem, setDraftExcludedItem] = useState('');
  const [showExcludedItemInput, setShowExcludedItemInput] = useState(false);
  const [draftExtraCharge, setDraftExtraCharge] = useState({ name: '', price: '' });
  const [showExtraChargeInput, setShowExtraChargeInput] = useState(false);
  const [draftHighlight, setDraftHighlight] = useState('');
  const [showHighlightInput, setShowHighlightInput] = useState(false);

  // Helper function to extract display price from listing
  const getDisplayPrice = React.useCallback((listing: any): number => {
    if (!listing) return 0;
    
    // Try to extract from category-specific data first
    if (listing.categorySpecificData) {
      try {
        const categoryData = typeof listing.categorySpecificData === 'string' 
          ? JSON.parse(listing.categorySpecificData)
          : listing.categorySpecificData;
        
        const categoryId = listing.listingCategory?.id || listing.categoryId;
        
        // Extract based on category
        let extractedPrice = 0;
        switch (categoryId) {
          case 'caterer':
            extractedPrice = categoryData.pricePerPlateVeg || categoryData.pricePerPlateNonVeg || 0;
            break;
          case 'photographer':
          case 'cinematographer':
          case 'videographer':
            extractedPrice = categoryData.photographyPrice || categoryData.videographyPrice || categoryData.price || 0;
            break;
          case 'decorator':
          case 'venue':
          case 'dj':
          case 'live-music':
          case 'sound-lights':
            extractedPrice = categoryData.price || 0;
            break;
          case 'mua':
            extractedPrice = categoryData.bridalPrice || categoryData.nonBridalPrice || 0;
            break;
          default:
            extractedPrice = categoryData.price || 0;
        }
        
        if (extractedPrice > 0) {
          return extractedPrice;
        }
      } catch (e) {
        console.error('Error parsing category data:', e);
      }
    }

    // Fallback to main price
    return Number(listing.price) || 0;
  }, []);

  // Get vendor category
  const vendorCategoryId = profileData?.vendorCategory?.id || profileData?.categoryId || '';
  const vendorCategoryName = profileData?.vendorCategory?.name || profileData?.categoryName || '';
  const vendorCoreCategoryId = getCoreCategoryId(vendorCategoryId);

  // Get category name helper - converts DB category to core category name
  const getCategoryName = React.useCallback((categoryId: string) => {
    // Check if it's already a core category ID
    const coreCategory = coreCategories.find(cat => cat.id === categoryId);
    if (coreCategory) return coreCategory.name;
    
    // Otherwise, convert DB category to core category
    const coreCategoryId = getCoreCategoryId(categoryId);
    const coreCat = coreCategories.find(cat => cat.id === coreCategoryId);
    return coreCat?.name || 'Other';
  }, [coreCategories]);

  // Filter event types based on selected category
  // TEMPORARILY DISABLED FOR DEBUGGING
  // Show only event types that are valid for the selected category
  const availableEventTypes = React.useMemo(() => {
    if (!eventTypesData || !Array.isArray(eventTypesData)) return [];
    if (!eventTypeCategories || eventTypeCategories.length === 0) return eventTypesData;
    
    // If no category selected, show warning message
    if (!formData.categoryId) {
      return [];
    }

    // Special case: "Other" category can be used for any event type
    if (formData.categoryId === 'other') {
      return eventTypesData;
    }

    // Get all DB category IDs for the selected core category
    const dbCategoryIds = getAllDbCategoryIds(formData.categoryId);

    // Get valid event type IDs for ALL mapped DB categories
    const validEventTypeIds = new Set<number>();
    
    dbCategoryIds.forEach(dbCategoryId => {
      eventTypeCategories.forEach((etc: any) => {
        const etcEventTypeId = etc.eventTypeId || etc.eventType?.id;
        const etcCategoryId = etc.categoryId || etc.category?.id;
        
        if (etcCategoryId === dbCategoryId && etcEventTypeId) {
          validEventTypeIds.add(etcEventTypeId);
        }
      });
    });

    // Special case: Add Corporate to DJ & Entertainment category
    if (formData.categoryId === 'dj-entertainment') {
      const corporateEventType = eventTypesData.find((et: any) => 
        et.name === 'Corporate' || et.name === 'Corporate Event' || et.displayName === 'Corporate Event'
      );
      if (corporateEventType) {
        validEventTypeIds.add(corporateEventType.id);
      }
    }

    // Filter event types to only include valid ones
    const filtered = eventTypesData.filter((et: any) => 
      validEventTypeIds.has(et.id)
    );

    // If no event types found, show all (fallback for categories without mappings)
    return filtered.length > 0 ? filtered : eventTypesData;
  }, [eventTypesData, eventTypeCategories, formData.categoryId]);

  // Use useMemo to prevent creating new array references on every render
  const draftListings = React.useMemo(() => 
    (listingsData || []).filter((l: any) => l.isDraft === true), 
    [listingsData]
  );
  
  const completedListings = React.useMemo(() => 
    (listingsData || []).filter((l: any) => !l.isDraft), 
    [listingsData]
  );
  
  const packages = React.useMemo(() => 
    completedListings.filter((l: any) => l.type === 'PACKAGE'), 
    [completedListings]
  );
  
  const items = React.useMemo(() => 
    completedListings.filter((l: any) => l.type === 'ITEM'), 
    [completedListings]
  );
  
  const filteredListings = completedListings;
  
  // Helper function to check if draft
  const isDraftListing = React.useCallback((listing: any) => {
    return listing.isDraft === true;
  }, []);

  // Handle edit query parameter (from preview page)
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && listingsData && !editingListing) {
      const listingToEdit = listingsData.find((l: any) => l.id === editId);
      if (listingToEdit) {
        setEditingListing(listingToEdit);
        setShowCreateModal(true);
        // Clear the edit param from URL
        searchParams.delete('edit');
        setSearchParams(searchParams, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, listingsData, editingListing]);

  // Initialize form when editing - use ref to prevent infinite loops
  const loadedListingIdRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    console.log('🟢 useEffect running:', {
      showCreateModal,
      editingListingId: editingListing?.id,
      loadedListingId: loadedListingIdRef.current
    });
    
    // Only load if modal is open and we have a new listing to edit
    if (showCreateModal && editingListing && editingListing.id !== loadedListingIdRef.current) {
      console.log('✅ Loading listing data');
      
      // Mark as loaded FIRST to prevent re-running
      loadedListingIdRef.current = editingListing.id;
      
      // Parse extra charges JSON if available
      let extraChargesDetailed: ExtraCharge[] = [];
      if (editingListing.extraChargesJson) {
        try {
          extraChargesDetailed = JSON.parse(editingListing.extraChargesJson);
        } catch {
          extraChargesDetailed = [];
        }
      }
      
      // Parse category-specific data if available
      let parsedCategorySpecificData: Record<string, any> = {};
      if (editingListing.categorySpecificData) {
        try {
          parsedCategorySpecificData = JSON.parse(editingListing.categorySpecificData);
        } catch (e) {
          console.error('Failed to parse categorySpecificData:', e);
          parsedCategorySpecificData = {};
        }
      }
      
      // Convert DB category ID to core category ID
      const dbCategoryId = editingListing.listingCategory?.id || editingListing.categoryId || vendorCategoryId;
      const coreCategoryId = getCoreCategoryId(dbCategoryId);
      
      // Extract event type IDs - handle both array of objects and array of IDs
      let eventTypeIds: number[] = [];
      if (editingListing.eventTypeIds && Array.isArray(editingListing.eventTypeIds)) {
        eventTypeIds = editingListing.eventTypeIds;
      } else if (editingListing.eventTypes && Array.isArray(editingListing.eventTypes)) {
        eventTypeIds = editingListing.eventTypes.map((et: any) => {
          const id = typeof et === 'object' ? (et.id || et.eventTypeId) : et;
          return id;
        }).filter((id: any) => id != null);
      }
      
      console.log('� Setting form data with eventTypeIds:', eventTypeIds);
      
      // Set all state at once to minimize re-renders
      setFormDataWithLog({
        name: editingListing.name || '',
        description: editingListing.description || '',
        price: editingListing.price?.toString() || '',
        categoryId: coreCategoryId,
        customCategoryName: editingListing.customCategoryName || '',
        eventTypeIds: eventTypeIds,
        images: editingListing.images || [],
        highlights: editingListing.highlights || [],
        includedItemsText: editingListing.includedItemsText || [],
        includedItemIds: editingListing.includedItemIds || [],
        excludedItemsText: editingListing.excludedItemsText || [],
        deliveryTime: editingListing.deliveryTime || '',
        extraChargesDetailed,
        extraCharges: editingListing.extraCharges || [],
        unit: editingListing.unit || '',
        minimumQuantity: editingListing.minimumQuantity || 1,
        customNotes: editingListing.customNotes || '',
      });
      console.log('📋 DEBUG - includedItemsText:', editingListing.includedItemsText);
      console.log('📋 DEBUG - excludedItemsText:', editingListing.excludedItemsText);
      console.log('📋 DEBUG - customNotes:', editingListing.customNotes);
      console.log('✅ setFormData called');
      setCategorySpecificData(parsedCategorySpecificData);
      setListingType(editingListing.type || 'PACKAGE');
      setExpandedSections({
        basic: true,
        pricing: true,
        included: true,
        highlights: true,
        photos: true,
      });
    } else if (!showCreateModal && loadedListingIdRef.current) {
      // Only reset when modal is actually closed
      loadedListingIdRef.current = null;
    }
  }, [editingListing?.id, showCreateModal]); // Only depend on ID and modal state

  const handleSubmit = async () => {
    // Prevent multiple clicks
    if (isPublishing) {
      return;
    }

    // Check if vendor_id exists in localStorage
    const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') : null;
    if (!vendorId) {
      toast.error('Vendor profile not found. Please complete vendor onboarding first.');
      console.error('vendor_id not found in localStorage. Available keys:', Object.keys(localStorage));
      return;
    }

    // Extract price from category-specific data for non-"Other" categories (ITEMS only)
    let finalPrice = formData.price;
    if (listingType === 'ITEM' && formData.categoryId && formData.categoryId !== 'other') {
      console.log('🔍 Extracting price from category data:', {
        categoryId: formData.categoryId,
        categorySpecificData
      });
      
      switch (formData.categoryId) {
        case 'caterer':
          finalPrice = categorySpecificData.pricePerPlateVeg || '';
          break;
        case 'photographer':
        case 'cinematographer':
        case 'videographer':
          // For photography, the price field is just 'price' regardless of pricing type
          finalPrice = categorySpecificData.price || categorySpecificData.photographyPrice || categorySpecificData.videographyPrice || '';
          break;
        case 'venue':
        case 'decorator':
        case 'dj-entertainment':
        case 'sound-lights':
          finalPrice = categorySpecificData.price || '';
          break;
        case 'mua':
          finalPrice = categorySpecificData.bridalPrice || '';
          break;
      }
      
      console.log('💰 Extracted final price:', finalPrice);
    }

    // Validation differs for ITEMS vs PACKAGES
    if (listingType === 'ITEM') {
      if (!formData.name || !finalPrice || !formData.categoryId || formData.eventTypeIds.length === 0) {
        toast.error('Please fill in all required fields including pricing');
        return;
      }
      
      // Validate custom category name if "Other" is selected
      if (formData.categoryId === 'other' && (!formData.customCategoryName || formData.customCategoryName.trim().length === 0)) {
        toast.error('Please enter a custom category name');
        return;
      }
    } else {
      // PACKAGE validation
      if (!formData.name || !finalPrice) {
        toast.error('Please fill in all required fields including pricing');
        return;
      }
      
      if (formData.includedItemIds.length < 2) {
        toast.error('Please select at least 2 items to create a package');
        return;
      }
    }
    
    // Validate images are required for publishing
    if (!formData.images || formData.images.length === 0) {
      // This shouldn't happen as button is disabled, but keep as safety check
      return;
    }

    // Validate event types are valid for selected category (ITEMS only)
    if (listingType === 'ITEM' && formData.categoryId && formData.categoryId !== 'other' && eventTypeCategories.length > 0) {
      const validEventTypeIds = new Set<number>();
      
      // Get all DB category IDs for the selected core category
      const dbCategoryIds = getAllDbCategoryIds(formData.categoryId);
      
      eventTypeCategories.forEach((etc: any) => {
        const etcEventTypeId = etc.eventTypeId || etc.eventType?.id;
        const etcCategoryId = etc.categoryId || etc.category?.id;
        // Check if the event type is valid for ANY of the mapped DB categories
        if (dbCategoryIds.includes(etcCategoryId) && etcEventTypeId) {
          validEventTypeIds.add(etcEventTypeId);
        }
      });
      
      // Add Corporate to DJ category
      if (formData.categoryId === 'dj-entertainment') {
        const corporateEventType = eventTypesData?.find((et: any) => 
          et.name === 'Corporate' || et.name === 'Corporate Event' || et.displayName === 'Corporate Event'
        );
        if (corporateEventType) {
          validEventTypeIds.add(corporateEventType.id);
        }
      }

      // Check if all selected event types are valid
      const invalidEventTypes = formData.eventTypeIds.filter(id => !validEventTypeIds.has(id));
      if (invalidEventTypes.length > 0) {
        console.log('❌ Event type validation failed:', {
          categoryId: formData.categoryId,
          dbCategoryIds,
          selectedEventTypeIds: formData.eventTypeIds,
          validEventTypeIds: Array.from(validEventTypeIds),
          invalidEventTypes
        });
        toast.error(`Some selected event types are not valid for the chosen category. Please select valid event types.`);
        return;
      }
    }

    setIsPublishing(true);
    try {
      // For packages, derive category from first bundled item or use placeholder
      const dbCategoryId = listingType === 'PACKAGE' && formData.includedItemIds.length > 0
        ? items.find(item => item.id === formData.includedItemIds[0])?.categoryId || 'other'
        : getDbCategoryId(formData.categoryId);
      
      // For packages, derive event types from bundled items
      let eventTypeIds = formData.eventTypeIds;
      if (listingType === 'PACKAGE' && formData.includedItemIds.length > 0) {
        const uniqueEventTypeIds = new Set<number>();
        formData.includedItemIds.forEach((itemId: string) => {
          const item = items.find(i => i.id === itemId);
          if (item) {
            // Check both eventTypeIds (from API) and eventTypes (if populated)
            if (item.eventTypeIds && Array.isArray(item.eventTypeIds)) {
              item.eventTypeIds.forEach((etId: number) => {
                uniqueEventTypeIds.add(etId);
              });
            } else if (item.eventTypes && Array.isArray(item.eventTypes)) {
              item.eventTypes.forEach((et: any) => {
                uniqueEventTypeIds.add(et.id || et);
              });
            }
          }
        });
        eventTypeIds = Array.from(uniqueEventTypeIds);
        console.log('📦 Package event types derived from bundle items:', {
          includedItemIds: formData.includedItemIds,
          derivedEventTypeIds: eventTypeIds
        });
        
        // Validate that we have at least one event type
        if (eventTypeIds.length === 0) {
          toast.error('Unable to determine event types from selected items. Please ensure your items have event types assigned.');
          return;
        }
      }
      
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(finalPrice), // Use extracted price
        categoryId: dbCategoryId, // Send DB category ID to backend
        customCategoryName: formData.categoryId === 'other' ? formData.customCategoryName : undefined,
        eventTypeIds: eventTypeIds,
        images: formData.images,
        highlights: formData.highlights.filter(h => h.trim()), // Remove empty highlights
        deliveryTime: formData.deliveryTime,
        customNotes: formData.customNotes || undefined,
        // Include both formats for extra charges, filter empty ones
        extraChargesDetailed: formData.extraChargesDetailed
          .filter(ec => ec.name.trim() && ec.price)
          .map(ec => ({
            name: ec.name,
            price: parseFloat(ec.price) || 0
          })),
        extraCharges: formData.extraCharges,
        isActive: true, // Published listings should be active/visible
        isDraft: false, // Published listings are not drafts
        // Store category-specific data as JSON string (ITEMS only)
        categorySpecificData: listingType === 'ITEM' && formData.categoryId !== 'other' && Object.keys(categorySpecificData).length > 0
          ? JSON.stringify(categorySpecificData)
          : undefined,
      };

      // Include/exclude items are available for both packages and items
      payload.includedItemsText = formData.includedItemsText.filter((i: string) => i.trim());
      payload.excludedItemsText = formData.excludedItemsText.filter((i: string) => i.trim());

      if (listingType === 'PACKAGE') {
        payload.includedItemIds = formData.includedItemIds;
      } else {
        payload.unit = formData.unit;
        payload.minimumQuantity = formData.minimumQuantity;
      }

      if (editingListing) {
        // Update existing listing
        const response = await vendorApi.updateListing(editingListing.id, payload);
        if (response.success) {
          toast.success('Listing updated successfully!');
          setShowCreateModal(false);
          setEditingListing(null);
          refetch();
        } else {
          throw new Error(response.message || 'Failed to update listing');
        }
      } else {
        // Create new listing
        const response = listingType === 'PACKAGE'
          ? await vendorApi.createPackage(payload)
          : await vendorApi.createItem(payload);
        
        if (response.success) {
          toast.success(`${listingType === 'PACKAGE' ? 'Package' : 'Item'} created successfully!`);
          setShowCreateModal(false);
          refetch();
        } else {
          throw new Error(response.message || 'Failed to create listing');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (listing: any) => {
    setDeleteDialog({ open: true, listing });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.listing) return;
    
    // Prevent multiple clicks
    if (isDeleting === deleteDialog.listing.id) {
      return;
    }

    setIsDeleting(deleteDialog.listing.id);
    try {
      const response = await vendorApi.deleteListing(deleteDialog.listing.id);
      if (response.success) {
        toast.success('Listing deleted successfully!');
        setDeleteDialog({ open: false, listing: null });
        refetch();
      } else {
        throw new Error(response.message || 'Failed to delete listing');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleActive = async (listing: any) => {
    try {
      const response = await vendorApi.updateListing(listing.id, {
        ...listing,
        isActive: !listing.isActive,
      });
      if (response.success) {
        toast.success(`Listing ${listing.isActive ? 'deactivated' : 'activated'}!`);
        refetch();
      }
    } catch (error: any) {
      toast.error('Failed to update listing status');
    }
  };

  const handleImagesChange = React.useCallback((newImages: string[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  }, []);

  // Highlight helpers - with draft state
  const addHighlight = React.useCallback(() => {
    setShowHighlightInput(true);
    setDraftHighlight('');
  }, []);

  const saveHighlight = React.useCallback(() => {
    if (draftHighlight.trim()) {
      setFormData(prev => ({ ...prev, highlights: [...prev.highlights, draftHighlight.trim()] }));
      setDraftHighlight('');
      setShowHighlightInput(false);
    }
  }, [draftHighlight]);

  const cancelHighlight = React.useCallback(() => {
    setDraftHighlight('');
    setShowHighlightInput(false);
  }, []);

  const removeHighlight = React.useCallback((index: number) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  }, []);

  // Included item text helpers - with draft state
  const addIncludedItem = React.useCallback(() => {
    setShowIncludedItemInput(true);
    setDraftIncludedItem('');
  }, []);

  const saveIncludedItem = React.useCallback(() => {
    if (draftIncludedItem.trim()) {
      setFormData(prev => ({ ...prev, includedItemsText: [...prev.includedItemsText, draftIncludedItem.trim()] }));
      setDraftIncludedItem('');
      setShowIncludedItemInput(false);
    }
  }, [draftIncludedItem]);

  const cancelIncludedItem = React.useCallback(() => {
    setDraftIncludedItem('');
    setShowIncludedItemInput(false);
  }, []);

  const updateIncludedItem = React.useCallback((index: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev.includedItemsText];
      updated[index] = value;
      return { ...prev, includedItemsText: updated };
    });
  }, []);

  const removeIncludedItem = React.useCallback((index: number) => {
    setFormData(prev => ({ ...prev, includedItemsText: prev.includedItemsText.filter((_, i) => i !== index) }));
  }, []);

  // Excluded item helpers - with draft state
  const addExcludedItem = React.useCallback(() => {
    setShowExcludedItemInput(true);
    setDraftExcludedItem('');
  }, []);

  const saveExcludedItem = React.useCallback(() => {
    if (draftExcludedItem.trim()) {
      setFormData(prev => ({ ...prev, excludedItemsText: [...prev.excludedItemsText, draftExcludedItem.trim()] }));
      setDraftExcludedItem('');
      setShowExcludedItemInput(false);
    }
  }, [draftExcludedItem]);

  const cancelExcludedItem = React.useCallback(() => {
    setDraftExcludedItem('');
    setShowExcludedItemInput(false);
  }, []);

  const updateExcludedItem = React.useCallback((index: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev.excludedItemsText];
      updated[index] = value;
      return { ...prev, excludedItemsText: updated };
    });
  }, []);

  const removeExcludedItem = React.useCallback((index: number) => {
    setFormData(prev => ({ ...prev, excludedItemsText: prev.excludedItemsText.filter((_, i) => i !== index) }));
  }, []);

  // Linked item helpers (actual items from vendor's inventory)
  const toggleLinkedItem = React.useCallback((itemId: string) => {
    setFormData(prev => {
      if (prev.includedItemIds.includes(itemId)) {
        return { ...prev, includedItemIds: prev.includedItemIds.filter(id => id !== itemId) };
      } else {
        return { ...prev, includedItemIds: [...prev.includedItemIds, itemId] };
      }
    });
  }, []);

  // Extra charge helpers - with draft state
  const addExtraCharge = React.useCallback(() => {
    setShowExtraChargeInput(true);
    setDraftExtraCharge({ name: '', price: '' });
  }, []);

  const saveExtraCharge = React.useCallback(() => {
    if (draftExtraCharge.name.trim() && draftExtraCharge.price) {
      setFormData(prev => ({ 
        ...prev, 
        extraChargesDetailed: [...prev.extraChargesDetailed, {
          name: draftExtraCharge.name.trim(),
          price: draftExtraCharge.price
        }] 
      }));
      setDraftExtraCharge({ name: '', price: '' });
      setShowExtraChargeInput(false);
    }
  }, [draftExtraCharge]);

  const cancelExtraCharge = React.useCallback(() => {
    setDraftExtraCharge({ name: '', price: '' });
    setShowExtraChargeInput(false);
  }, []);

  const removeExtraCharge = React.useCallback((index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      extraChargesDetailed: prev.extraChargesDetailed.filter((_, i) => i !== index) 
    }));
  }, []);

  const updateExtraCharge = React.useCallback((index: number, field: 'name' | 'price', value: string) => {
    setFormData(prev => {
      const updated = [...prev.extraChargesDetailed];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, extraChargesDetailed: updated };
    });
  }, []);

  // Save as draft functionality (saves with price=0.01 to mark as incomplete)
  const handleSaveAsDraft = async () => {
    // Check if vendor_id exists in localStorage
    const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') : null;
    console.log('🔍 Checking vendor_id:', vendorId);
    console.log('📦 All localStorage keys:', Object.keys(localStorage));
    console.log('👤 User ID:', localStorage.getItem('user_id'));
    console.log('🎭 User Role:', localStorage.getItem('user_role'));
    
    if (!vendorId) {
      toast.error('Vendor profile not found. Please complete vendor onboarding first.');
      console.error('❌ vendor_id not found in localStorage');
      return;
    }

    if (!formData.name) {
      toast.error('Please add at least a name to save as draft');
      return;
    }
    
    // For ITEMS, require category and event types
    // For PACKAGES, these will be derived from bundled items
    if (listingType === 'ITEM') {
      if (!formData.categoryId) {
        toast.error('Please select a category to save as draft');
        return;
      }
      if (formData.eventTypeIds.length === 0) {
        toast.error('Please select at least one event type to save as draft');
        return;
      }
    }

    setIsSaving(true);
    try {
      // For packages, use a placeholder category if no items selected yet
      const dbCategoryId = listingType === 'PACKAGE' && !formData.categoryId 
        ? 'other' // Placeholder for packages without items
        : getDbCategoryId(formData.categoryId);
      
      // Extract price from category-specific data for non-"Other" categories
      let finalPrice = formData.price;
      if (formData.categoryId && formData.categoryId !== 'other') {
        switch (formData.categoryId) {
          case 'caterer':
            finalPrice = categorySpecificData.pricePerPlateVeg || '';
            break;
          case 'photographer':
          case 'venue':
          case 'decorator':
          case 'dj-entertainment':
          case 'sound-lights':
            finalPrice = categorySpecificData.price || '';
            break;
          case 'mua':
            finalPrice = categorySpecificData.bridalPrice || '';
            break;
        }
      }
      
      // Save as draft - keep isActive true so vendor can still see it, but mark as draft
      const payload: any = {
        name: formData.name,
        description: formData.description || 'Draft - description pending',
        price: finalPrice ? parseFloat(finalPrice) : 0.01, // 0.01 marks draft if no price
        categoryId: dbCategoryId, // Send DB category ID to backend
        customCategoryName: formData.categoryId === 'other' ? formData.customCategoryName : undefined,
        // For packages without items, send a dummy event type to pass backend validation
        // This will be replaced when items are added
        eventTypeIds: formData.eventTypeIds.length > 0 ? formData.eventTypeIds : (listingType === 'PACKAGE' ? [1] : []), // Use event type ID 1 as placeholder for packages
        images: formData.images,
        highlights: formData.highlights.filter(h => h.trim()),
        deliveryTime: formData.deliveryTime,
        customNotes: formData.customNotes || undefined,
        extraChargesDetailed: formData.extraChargesDetailed.filter(ec => ec.name.trim()).map(ec => ({
          name: ec.name,
          price: parseFloat(ec.price) || 0
        })),
        extraCharges: formData.extraCharges,
        isActive: false, // Drafts should NOT be visible to customers
        isDraft: true, // Mark as draft
        // Store category-specific data as JSON
        categorySpecificData: formData.categoryId !== 'other' ? categorySpecificData : undefined,
      };

      // Include/exclude items are available for both packages and items
      payload.includedItemsText = formData.includedItemsText.filter((i: string) => i.trim());
      payload.excludedItemsText = formData.excludedItemsText.filter((i: string) => i.trim());
      
      console.log('📤 DRAFT SAVE - includedItemsText:', payload.includedItemsText);
      console.log('📤 DRAFT SAVE - excludedItemsText:', payload.excludedItemsText);
      console.log('📤 DRAFT SAVE - Full payload:', JSON.stringify(payload, null, 2));

      if (listingType === 'PACKAGE') {
        payload.includedItemIds = formData.includedItemIds;
      } else {
        payload.unit = formData.unit;
        payload.minimumQuantity = formData.minimumQuantity;
      }

      if (editingListing) {
        const response = await vendorApi.updateListing(editingListing.id, payload);
        if (response.success) {
          toast.success('Draft saved successfully!');
          closeModal();
          await refetch();
        } else {
          throw new Error(response.message || 'Failed to save draft');
        }
      } else {
        const response = listingType === 'PACKAGE'
          ? await vendorApi.createPackage(payload)
          : await vendorApi.createItem(payload);
        
        if (response.success) {
          toast.success('Draft saved! You can complete it later.');
          closeModal();
          await refetch();
        } else {
          throw new Error(response.message || 'Failed to save draft');
        }
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Close modal and reset
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingListing(null);
    setFormData(initialFormData); // Reset form to initial state
    setCategorySpecificData({}); // Reset category-specific data
    setExpandedSections({
      basic: true,
      pricing: true,
      included: true,
      highlights: false,
      photos: true,
    });
  };


  if (listingsLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <BrandedLoader fullScreen={false} message="Loading listings" />
        </div>
      </VendorLayout>
    );
  }

  // Show error state
  if (listingsError) {
    return (
      <VendorLayout>
        <InlineError
          title="Failed to load listings"
          message="We couldn't load your listings data. Please try again."
          error={listingsError}
          onRetry={() => refetch()}
          showHomeButton={false}
        />
      </VendorLayout>
    );
  }

  // Show loading state
  if (profileLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <BrandedLoader fullScreen={false} message="Loading profile" />
        </div>
      </VendorLayout>
    );
  }
  
  // Show profile completion prompt if profile is not complete
  if (!profileComplete) {
    return (
      <VendorLayout>
        <CompleteProfilePrompt 
          title="Complete Your Profile to Create Listings"
          description="You need to set up your vendor profile before you can create and manage listings."
          featureName="listings"
        />
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Packages & Listings</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {completedListings.length} listing{completedListings.length !== 1 ? 's' : ''} • {completedListings.filter((l: any) => l.isActive).length} active
              </p>
            </div>
            {/* Add Listing Button - Desktop */}
            <Button 
              className="hidden sm:flex bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Listing
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search listings..."
                className="pl-10 bg-background border-border text-foreground w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background border-border text-foreground">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {coreCategories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Add Listing Button - Mobile */}
            <Button 
              className="sm:hidden w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Listing
            </Button>
          </div>
        </div>

        {/* Create/Edit Listing Dialog */}
        {showCreateModal && (
          <Dialog open={showCreateModal} onOpenChange={(open) => {
            if (!open) closeModal();
            else setShowCreateModal(open);
          }}>
            <DialogContent className="bg-card border-border max-w-3xl w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-foreground text-lg sm:text-xl">
                  {editingListing ? 'Edit Listing' : 'Create New Listing'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm mt-2">
                  Complete the 3-step wizard to create your listing
                </DialogDescription>
              </DialogHeader>

              <ListingFormWizard
                formData={formData}
                setFormData={setFormDataWithLog}
                listingType={listingType}
                setListingType={setListingType}
                categorySpecificData={categorySpecificData}
                setCategorySpecificData={setCategorySpecificDataWithLog}
                editingListing={editingListing}
                onSubmit={handleSubmit}
                onSaveAsDraft={handleSaveAsDraft}
                onCancel={closeModal}
                isPublishing={isPublishing}
                isSaving={isSaving}
                eventTypesData={eventTypesData}
                categoriesData={categoriesData}
                items={items}
                availableEventTypes={availableEventTypes}
                coreCategories={coreCategories}
                eventTypeCategories={eventTypeCategories}
                getCategoryName={getCategoryName}
                getAllDbCategoryIds={getAllDbCategoryIds}
                toggleLinkedItem={toggleLinkedItem}
                draftIncludedItem={draftIncludedItem}
                setDraftIncludedItem={setDraftIncludedItem}
                showIncludedItemInput={showIncludedItemInput}
                setShowIncludedItemInput={setShowIncludedItemInput}
                saveIncludedItem={saveIncludedItem}
                cancelIncludedItem={cancelIncludedItem}
                removeIncludedItem={removeIncludedItem}
                draftExcludedItem={draftExcludedItem}
                setDraftExcludedItem={setDraftExcludedItem}
                showExcludedItemInput={showExcludedItemInput}
                setShowExcludedItemInput={setShowExcludedItemInput}
                saveExcludedItem={saveExcludedItem}
                cancelExcludedItem={cancelExcludedItem}
                removeExcludedItem={removeExcludedItem}
                draftExtraCharge={draftExtraCharge}
                setDraftExtraCharge={setDraftExtraCharge}
                showExtraChargeInput={showExtraChargeInput}
                setShowExtraChargeInput={setShowExtraChargeInput}
                saveExtraCharge={saveExtraCharge}
                cancelExtraCharge={cancelExtraCharge}
                removeExtraCharge={removeExtraCharge}
                draftHighlight={draftHighlight}
                setDraftHighlight={setDraftHighlight}
                showHighlightInput={showHighlightInput}
                setShowHighlightInput={setShowHighlightInput}
                saveHighlight={saveHighlight}
                cancelHighlight={cancelHighlight}
                removeHighlight={removeHighlight}
                handleImagesChange={handleImagesChange}
              />
            </DialogContent>
          </Dialog>
        )}


        {listingsError && (
          <Alert className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{listingsError}</AlertDescription>
          </Alert>
        )}

        {/* Draft Listings Section - Collapsible */}
        {draftListings.length > 0 && (
          <Accordion 
            type="single" 
            collapsible 
            value={draftSectionOpen}
            onValueChange={setDraftSectionOpen}
            className="mb-10"
          >
            <AccordionItem value="drafts" className="border rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <Clock className="h-6 w-6 text-yellow-500" />
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-foreground">Incomplete Listings</h2>
                    <p className="text-sm text-muted-foreground">Complete these to make them visible to customers</p>
                  </div>
                  <Badge variant="secondary" className="ml-2">{draftListings.length}</Badge>
                  {draftListings.length > cardLimit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/vendor/listings/drafts');
                      }}
                      className="ml-auto mr-4"
                    >
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {draftListings.slice(0, cardLimit).map((listing: any) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isDraft={true}
                      onEdit={(listing) => {
                        setEditingListing(listing);
                        setShowCreateModal(true);
                      }}
                      onDelete={handleDelete}
                      isDeleting={isDeleting === listing.id}
                      getCategoryName={getCategoryName}
                      allItems={items}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Packages Section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Packages</h2>
              <Badge variant="secondary" className="ml-2">{packages.length}</Badge>
            </div>
            {packages.length > cardLimit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/vendor/listings/packages')}
                className="self-start sm:self-auto"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
          {packages.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/5">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-1">No packages yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first package to offer bundled services</p>
                <Button onClick={() => { setListingType('PACKAGE'); setShowCreateModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Create Package
                </Button>
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.slice(0, cardLimit).map((listing: any) => (
              <Card 
                key={listing.id} 
                className="border-border overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="relative aspect-[16/10]">
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img
                        src={listing.images[0]}
                        alt={listing.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Package className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  {/* Status & Actions Row */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    <Badge className={`text-xs font-medium ${listing.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {listing.isActive ? '● Live' : '○ Inactive'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/40 backdrop-blur-sm hover:bg-black/60">
                          <MoreVertical className="h-4 w-4 text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card border-border" align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/vendor/listings/preview/${listing.id}`); }}>
                          <Eye className="mr-2 h-4 w-4" /> Preview as Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setEditingListing(listing);
                          setShowCreateModal(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleActive(listing); }}>
                          {listing.isActive ? '○ Deactivate' : '● Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDelete(listing); }} 
                          className="text-red-600 focus:text-red-600"
                          disabled={isDeleting === listing.id}
                        >
                          {isDeleting === listing.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* Price Badge */}
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-white text-foreground font-bold text-base px-3 py-1.5 shadow-lg">
                      ₹{getDisplayPrice(listing).toLocaleString('en-IN')}
                    </Badge>
                  </div>
                  {/* Image count indicator */}
                  {listing.images && listing.images.length > 1 && (
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="bg-black/50 text-white text-xs backdrop-blur-sm">
                        📷 {listing.images.length}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-foreground font-semibold text-base line-clamp-1 flex-1">{listing.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3 min-h-[2.5rem]">{listing.description || 'No description'}</p>
                  
                  {/* Category & Event Types Section */}
                  <div className="space-y-2 pt-3 border-t border-border/50">
                    {/* Category with icon - show multiple for packages with bundled items */}
                    {listing.includedItemIds && listing.includedItemIds.length > 0 ? (() => {
                      // Extract unique categories from bundled items
                      const uniqueCategories = new Set<string>();
                      listing.includedItemIds.forEach((itemId: string) => {
                        const item = items.find((i: any) => i.id === itemId);
                        if (item) {
                          const categoryId = item.listingCategory?.id || item.categoryId;
                          if (categoryId) {
                            const categoryName = getCategoryName(categoryId) || 'Other';
                            uniqueCategories.add(categoryName);
                          }
                        }
                      });
                      const categoryArray = Array.from(uniqueCategories);
                      
                      // If multiple categories, show as badges
                      if (categoryArray.length > 1) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {categoryArray.map((categoryName: string, index: number) => {
                              const CategoryIcon = getCategoryIcon(categoryName);
                              return (
                                <Badge 
                                  key={index}
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0.5 h-5 bg-primary/10 text-primary border-primary/30 flex items-center gap-1"
                                >
                                  <CategoryIcon className="h-3 w-3" />
                                  {categoryName}
                                </Badge>
                              );
                            })}
                          </div>
                        );
                      }
                      
                      // Single category - show as before
                      if (categoryArray.length === 1) {
                        const categoryName = categoryArray[0];
                        const CategoryIcon = getCategoryIcon(categoryName);
                        return (
                          <div className="flex items-center gap-1.5">
                            <CategoryIcon className="h-3.5 w-3.5 text-primary/70" />
                            <span className="text-xs text-muted-foreground font-medium">{categoryName}</span>
                          </div>
                        );
                      }
                      
                      // Fallback to listing's own category
                      const categoryName = getCategoryName(listing.listingCategory?.id || listing.categoryId || '') || 'Other';
                      const CategoryIcon = getCategoryIcon(categoryName);
                      return (
                        <div className="flex items-center gap-1.5">
                          <CategoryIcon className="h-3.5 w-3.5 text-primary/70" />
                          <span className="text-xs text-muted-foreground font-medium">{categoryName}</span>
                        </div>
                      );
                    })() : (
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const categoryName = getCategoryName(listing.listingCategory?.id || listing.categoryId || '') || 'Other';
                          const CategoryIcon = getCategoryIcon(categoryName);
                          return (
                            <>
                              <CategoryIcon className="h-3.5 w-3.5 text-primary/70" />
                              <span className="text-xs text-muted-foreground font-medium">{categoryName}</span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    
                    {/* Event Types as chips */}
                    {listing.eventTypes && listing.eventTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {listing.eventTypes.slice(0, 3).map((eventType: any, index: number) => {
                          const displayText = typeof eventType === 'string' 
                            ? eventType 
                            : (eventType?.displayName || eventType?.name || 'Event');
                          
                          return (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20"
                            >
                              {displayText}
                            </Badge>
                          );
                        })}
                        {listing.eventTypes.length > 3 && (
                          <Badge 
                            variant="secondary" 
                            className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground"
                          >
                            +{listing.eventTypes.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>

        {/* Items Section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Box className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Individual Items</h2>
              <Badge variant="secondary" className="ml-2">{items.length}</Badge>
            </div>
            {items.length > cardLimit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/vendor/listings/items')}
                className="self-start sm:self-auto"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
          {items.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/5">
              <CardContent className="p-8 text-center">
                <Box className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-1">No services yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create individual services that can be sold separately or bundled into packages</p>
                <Button onClick={() => { setListingType('ITEM'); setShowCreateModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Create Service
                </Button>
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.slice(0, cardLimit).map((listing: any) => (
              <Card 
                key={listing.id} 
                className="border-border overflow-hidden group hover:shadow-lg hover:border-secondary/30 transition-all duration-300"
              >
                <div className="relative aspect-square">
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img
                        src={listing.images[0]}
                        alt={listing.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center">
                      <Box className="h-10 w-10 text-secondary/30" />
                    </div>
                  )}
                  {/* Status & Actions Row */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    <Badge className={`text-xs font-medium ${listing.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {listing.isActive ? '● Live' : '○ Inactive'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/40 backdrop-blur-sm hover:bg-black/60">
                          <MoreVertical className="h-3.5 w-3.5 text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card border-border" align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/vendor/listings/preview/${listing.id}`); }}>
                          <Eye className="mr-2 h-4 w-4" /> Preview as Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setEditingListing(listing);
                          setShowCreateModal(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleActive(listing); }}>
                          {listing.isActive ? '○ Deactivate' : '● Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDelete(listing); }} 
                          className="text-red-600 focus:text-red-600"
                          disabled={isDeleting === listing.id}
                        >
                          {isDeleting === listing.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* Price Badge */}
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-white text-foreground font-bold text-sm px-2 py-1 shadow-lg">
                      ₹{getDisplayPrice(listing).toLocaleString('en-IN')}
                      {listing.unit && <span className="text-xs font-normal text-muted-foreground">/{listing.unit}</span>}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-foreground font-semibold text-sm line-clamp-1 mb-1">{listing.name}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-2 min-h-[2rem]">{listing.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs font-normal">
                      {getCategoryName(listing.listingCategory?.id || listing.categoryId || '') || 'Other'}
                    </Badge>
                    {listing.minimumQuantity > 1 && (
                      <span className="text-xs text-muted-foreground">Min: {listing.minimumQuantity}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, listing: null })}
        onConfirm={confirmDelete}
        title="Delete Listing"
        description={
          deleteDialog.listing?.isDraft
            ? "Are you sure you want to delete this draft? This action cannot be undone."
            : "Are you sure you want to delete this listing? This will remove it from customer view and cannot be undone."
        }
        itemName={deleteDialog.listing?.name}
        isDeleting={isDeleting !== null}
      />
    </VendorLayout>
  );
}
