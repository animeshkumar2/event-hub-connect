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
  Tag,
  Navigation,
  LayoutGrid
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
import { useVendorProfile as useVendorProfileCompletion } from '@/shared/hooks/useVendorProfile';
import CompleteProfilePrompt from '@/shared/components/CompleteProfilePrompt';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { InlineError } from '@/shared/components/InlineError';
import { CategoryFieldRenderer } from '@/features/vendor/components/CategoryFields';
import { DeliveryTimeInput } from '@/features/vendor/components/DeliveryTimeInput';
import { ListingFormWizard } from '@/features/vendor/components/ListingFormWizard';
import { ServiceModeSelector, ServiceMode, getServiceModeLabel } from '@/shared/components/ServiceModeSelector';
import { TemplateSelectionModal } from '@/features/vendor/components/TemplateSelectionModal';
import { CATEGORY_TEMPLATES } from '@/shared/constants/listingTemplates';

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
  id: '', // Empty for new listings, set when editing
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
  serviceMode: 'BOTH' as ServiceMode, // Location system
};

export default function VendorListings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Render counter for debugging
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [listingType, setListingType] = useState<'PACKAGE' | 'ITEM'>('PACKAGE');
  const [editingListing, setEditingListing] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track which listing is being deleted
  const [pendingImageDeletes, setPendingImageDeletes] = useState<string[]>([]); // Images to delete on save
  const [deleteDialog, setDeleteDialog] = useState<{ 
    open: boolean; 
    listing: any | null;
    checkResult: {
      hasActiveOrders: boolean;
      isUsedInPackages: boolean;
      activeOrderCount: number;
      packageCount: number;
      activeOrderNumbers: string[];
      packageNames: string[];
      warningMessage: string | null;
      deleteType: 'HARD' | 'SOFT';
    } | null;
    isChecking: boolean;
  }>({
    open: false,
    listing: null,
    checkResult: null,
    isChecking: false,
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
  const { isComplete: profileComplete, isLoading: profileLoading, canCreateListing, completionPercentage, missingFields } = useVendorProfileCompletion();
  
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
  
  const items = React.useMemo(() => {
    const filtered = completedListings.filter((l: any) => l.type === 'ITEM');
    console.log('📦 Items for bundling:', {
      completedListingsCount: completedListings.length,
      itemsCount: filtered.length,
      items: filtered.map((i: any) => ({ id: i.id, name: i.name, type: i.type, isDraft: i.isDraft }))
    });
    return filtered;
  }, [completedListings]);
  
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
      loadedListingId: loadedListingIdRef.current,
      rawCategorySpecificData: editingListing?.categorySpecificData,
      typeOfRawData: typeof editingListing?.categorySpecificData
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
          // categorySpecificData might be double-stringified from backend
          let data = editingListing.categorySpecificData;
          
          // First parse if it's a string
          if (typeof data === 'string') {
            data = JSON.parse(data);
          }
          
          // Check if result is still a string (double-stringified case)
          if (typeof data === 'string') {
            data = JSON.parse(data);
          }
          
          parsedCategorySpecificData = data;
          console.log('📦 Parsed categorySpecificData:', parsedCategorySpecificData);
        } catch (e) {
          console.error('Failed to parse categorySpecificData:', e);
          console.error('Raw categorySpecificData:', editingListing.categorySpecificData);
          parsedCategorySpecificData = {};
        }
      } else {
        console.log('⚠️ No categorySpecificData found in editingListing');
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
        id: editingListing.id, // Include ID for image upload folder path
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
        serviceMode: editingListing.serviceMode || 'BOTH',
      });
      console.log('📋 DEBUG - includedItemsText:', editingListing.includedItemsText);
      console.log('📋 DEBUG - excludedItemsText:', editingListing.excludedItemsText);
      console.log('📋 DEBUG - customNotes:', editingListing.customNotes);
      console.log('✅ setFormData called');
      console.log('📦 Setting categorySpecificData:', { type: typeof parsedCategorySpecificData, value: parsedCategorySpecificData });
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
        case 'photography-videography':
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
        toast.error('Please select at least 2 services to create a package');
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
        images: formData.images, // Will be updated below if there are pending changes
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
        // For creates: send as object (DTO accepts Object)
        // For updates: send as string (entity expects String)
        categorySpecificData: listingType === 'ITEM' && formData.categoryId !== 'other' && Object.keys(categorySpecificData).length > 0
          ? (editingListing ? JSON.stringify(categorySpecificData) : categorySpecificData)
          : undefined,
        serviceMode: formData.serviceMode, // Location system
      };

      // Process pending image changes (upload new files, prepare final URLs)
      if (pendingImageChanges && (pendingImageChanges.filesToUpload.length > 0 || pendingImageChanges.urlsToDelete.length > 0)) {
        const { uploadImage, deleteImage } = await import('@/shared/utils/storage');
        const vendorId = localStorage.getItem('vendor_id') || 'unknown';
        const listingId = editingListing?.id || 'new';
        const folder = `vendors/${vendorId}/listings/${listingId}`;
        
        // Upload new files
        const uploadedUrls: Map<File, string> = new Map();
        for (const file of pendingImageChanges.filesToUpload) {
          try {
            const url = await uploadImage(file, folder);
            uploadedUrls.set(file, url);
          } catch (error: any) {
            toast.error(`Failed to upload ${file.name}: ${error.message}`);
            throw error;
          }
        }
        
        // Build final URLs array in correct order
        payload.images = pendingImageChanges.finalOrder.map(item => {
          if (typeof item === 'string') return item;
          return uploadedUrls.get(item) || '';
        }).filter(url => url !== '');
        
        // Queue deletions for after successful save
        if (pendingImageChanges.urlsToDelete.length > 0) {
          setPendingImageDeletes(pendingImageChanges.urlsToDelete);
        }
      }

      console.log('📤 Submitting listing payload:', {
        listingType,
        categoryId: formData.categoryId,
        categorySpecificDataKeys: Object.keys(categorySpecificData),
        categorySpecificData,
        payloadCategorySpecificData: payload.categorySpecificData,
        imagesCount: payload.images.length
      });

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
          // Delete removed images from R2 after successful save
          if (pendingImageDeletes.length > 0) {
            const { deleteImages } = await import('@/shared/utils/storage');
            deleteImages(pendingImageDeletes).then(({ deleted, failed }) => {
              if (deleted.length > 0) console.log('Deleted images from R2:', deleted.length);
              if (failed.length > 0) console.warn('Failed to delete some images:', failed.length);
            });
          }
          // Clear all pending states
          setPendingImageDeletes([]);
          setPendingImageChanges(null);
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
          // Clear all pending states
          setPendingImageDeletes([]);
          setPendingImageChanges(null);
          toast.success(`${listingType === 'PACKAGE' ? 'Package' : 'Service'} created successfully!`);
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
    setDeleteDialog({ open: true, listing, checkResult: null, isChecking: true });
    
    // Check for dependencies before showing confirmation
    try {
      const response = await vendorApi.checkDeleteListing(listing.id);
      if (response.success && response.data) {
        setDeleteDialog(prev => ({ 
          ...prev, 
          checkResult: response.data,
          isChecking: false 
        }));
      } else {
        setDeleteDialog(prev => ({ ...prev, isChecking: false }));
      }
    } catch (error) {
      console.error('Failed to check delete dependencies:', error);
      setDeleteDialog(prev => ({ ...prev, isChecking: false }));
    }
  };

  // Handler to check profile completion before creating listing
  const handleCreateListing = (type?: 'PACKAGE' | 'ITEM') => {
    if (!canCreateListing) {
      toast.error(
        'Please complete your profile setup first (Business Name, Category, City)',
        {
          action: {
            label: 'Complete Profile',
            onClick: () => navigate('/vendor/profile'),
          },
        }
      );
      return;
    }
    if (type) {
      setListingType(type);
    }
    // For ITEM, show template selection modal
    // For PACKAGE, go directly to form (packages don't have templates)
    if (type === 'ITEM') {
      setShowTemplateModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  // Handle starting blank (no template) - opens form wizard
  const handleStartBlank = () => {
    setFormData(initialFormData);
    setCategorySpecificData({});
    setShowTemplateModal(false);
    setShowCreateModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteDialog.listing) return;
    
    // Prevent multiple clicks
    if (isDeleting === deleteDialog.listing.id) {
      return;
    }

    setIsDeleting(deleteDialog.listing.id);
    try {
      // Use force=true if soft delete would happen but user confirmed
      const shouldForce = deleteDialog.checkResult?.deleteType === 'SOFT' && 
        (deleteDialog.checkResult?.hasActiveOrders || deleteDialog.checkResult?.isUsedInPackages);
      
      const response = await vendorApi.deleteListing(deleteDialog.listing.id, shouldForce);
      if (response.success) {
        const deleteType = deleteDialog.checkResult?.deleteType;
        if (deleteType === 'SOFT') {
          toast.success('Listing deactivated successfully!');
        } else {
          toast.success('Listing deleted successfully!');
        }
        setDeleteDialog({ open: false, listing: null, checkResult: null, isChecking: false });
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

  // State for pending image changes (new approach - upload on save)
  const [pendingImageChanges, setPendingImageChanges] = useState<{
    filesToUpload: File[];
    urlsToDelete: string[];
    finalOrder: (string | File)[];
  } | null>(null);

  const handleImagesChange = React.useCallback((newImages: string[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  }, []);

  const handlePendingImageChanges = React.useCallback((changes: {
    filesToUpload: File[];
    urlsToDelete: string[];
    finalOrder: (string | File)[];
  }) => {
    setPendingImageChanges(changes);
  }, []);

  // Legacy handler for backward compatibility
  const handlePendingImageDeletes = React.useCallback((urls: string[]) => {
    setPendingImageDeletes(urls);
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
          case 'photography-videography':
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
        // For creates: send as object (DTO accepts Object)
        // For updates: send as string (entity expects String)
        categorySpecificData: formData.categoryId !== 'other' 
          ? (editingListing ? JSON.stringify(categorySpecificData) : categorySpecificData) 
          : undefined,
        serviceMode: formData.serviceMode, // Location system
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
    setPendingImageDeletes([]); // Clear pending deletes (user cancelled, don't delete)
    setPendingImageChanges(null); // Clear pending image changes (user cancelled)
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
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <BrandedLoader fullScreen={false} message="Gathering your listings..." />
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
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <BrandedLoader fullScreen={false} message="Setting up your profile..." />
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
      <div className="p-4 sm:p-6 space-y-5">
        {/* Header - Compact */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Services</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedListings.length} service{completedListings.length !== 1 ? 's' : ''} • {completedListings.filter((l: any) => l.isActive).length} live
            </p>
          </div>
        </div>

        {/* Add New Service Section - Prominent CTA */}
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Add New Service</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Single Service Card */}
              <div 
                onClick={() => handleCreateListing('ITEM')}
                className="group relative p-4 rounded-xl border-2 border-transparent bg-white dark:bg-card hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 group-hover:scale-110 transition-transform">
                    <Box className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm group-hover:text-emerald-600 transition-colors">Single Service</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      One service like Photography, Catering, Decoration
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-emerald-50 text-emerald-700 border-emerald-200">Most Common</Badge>
                </div>
              </div>

              {/* Package Deal Card */}
              <div 
                onClick={() => items.length > 0 ? handleCreateListing('PACKAGE') : toast.info('Create at least one service first to bundle them into a package')}
                className={`group relative p-4 rounded-xl border-2 border-transparent bg-white dark:bg-card transition-all cursor-pointer ${items.length > 0 ? 'hover:border-primary/50 hover:shadow-lg' : 'opacity-60'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">Package Deal</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Bundle services together at a special price
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {items.length > 0 ? (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">Higher Value</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-amber-600 border-amber-300 bg-amber-50">
                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Create services first
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Selection Modal */}
        <TemplateSelectionModal
          open={showTemplateModal}
          onOpenChange={setShowTemplateModal}
          onStartBlank={handleStartBlank}
          onRefetch={refetch}
        />

        {/* Create/Edit Listing Dialog */}
        {showCreateModal && (
          <Dialog open={showCreateModal} onOpenChange={(open) => {
            if (!open) closeModal();
            else setShowCreateModal(open);
          }}>
            <DialogContent className="bg-card border-border max-w-3xl w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-foreground text-lg sm:text-xl">
                  {editingListing ? 'Edit Listing' : listingType === 'PACKAGE' ? 'Create Package' : 'Create Service'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm mt-2">
                  {listingType === 'PACKAGE' 
                    ? 'Bundle your services together for a special price'
                    : 'Add details about your service offering'
                  }
                </DialogDescription>
              </DialogHeader>

              <ListingFormWizard
                formData={formData}
                setFormData={setFormDataWithLog}
                listingType={listingType}
                setListingType={setListingType}
                categorySpecificData={(() => {
                  console.log('🔴 Passing categorySpecificData to wizard:', typeof categorySpecificData, categorySpecificData);
                  return categorySpecificData;
                })()}
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
                handlePendingImageDeletes={handlePendingImageDeletes}
                handlePendingImageChanges={handlePendingImageChanges}
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

        {/* Draft Listings Section - Improved UX */}
        {draftListings.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    {draftListings.length} Incomplete {draftListings.length === 1 ? 'Draft' : 'Drafts'}
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Continue editing to publish
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDraftSectionOpen(draftSectionOpen ? undefined : 'drafts')}
                className="h-8 px-3 text-xs font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-800"
              >
                {draftSectionOpen ? 'Hide' : 'Show'} 
                <ChevronDown className={`h-3.5 w-3.5 ml-1.5 transition-transform duration-200 ${draftSectionOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            {draftSectionOpen && (
              <div className="space-y-2">
                {draftListings.slice(0, 4).map((listing: any) => (
                  <div 
                    key={listing.id}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-card rounded-lg border border-amber-100 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Box className="h-5 w-5 text-amber-400" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {listing.name || 'Untitled Service'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.type === 'PACKAGE' ? 'Package' : 'Service'} • Last edited recently
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/vendor/listings/preview/${listing.id}?edit=true`)}
                        className="h-8 px-3 text-xs font-medium border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-700 dark:text-amber-300"
                      >
                        <Edit className="h-3 w-3 mr-1.5" />
                        Continue
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDelete(listing); }}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* View All Link */}
                {draftListings.length > 4 && (
                  <button 
                    onClick={() => navigate('/vendor/listings/drafts')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 dark:text-amber-300 dark:hover:bg-amber-800/30 rounded-lg transition-colors"
                  >
                    View all {draftListings.length} drafts
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search services..."
              className="pl-9 h-9 text-sm bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9 text-sm bg-background border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="items">Services Only</SelectItem>
              <SelectItem value="packages">Packages Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* All Services Grid - Unified View */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              All Services ({completedListings.length})
            </h2>
          </div>

          {completedListings.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Package className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-foreground text-sm mb-1">No services yet</h3>
              <p className="text-xs text-muted-foreground mb-4">Create your first service to start getting bookings</p>
              <Button onClick={() => handleCreateListing('ITEM')} size="sm" className="h-8 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Filter based on selection */}
              {(() => {
                const filteredListings = completedListings
                  .filter((listing: any) => {
                    if (selectedCategoryFilter === 'items') return listing.type === 'ITEM';
                    if (selectedCategoryFilter === 'packages') return listing.type === 'PACKAGE';
                    return true;
                  })
                  .filter((listing: any) => {
                    if (!searchQuery) return true;
                    return listing.name?.toLowerCase().includes(searchQuery.toLowerCase());
                  });
                
                const displayedListings = filteredListings.slice(0, cardLimit);
                const remainingCount = filteredListings.length - cardLimit;
                
                return (
                  <>
                    {displayedListings.map((listing: any) => {
                      const isPackage = listing.type === 'PACKAGE';
                      const CategoryIcon = getCategoryIcon(getCategoryName(listing.listingCategory?.id || listing.categoryId || ''));
                  
                  return (
                    <Card 
                      key={listing.id} 
                      className="group overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-card"
                    >
                      {/* Image Section */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {listing.images?.[0] ? (
                          <>
                            <img
                              src={listing.images[0]}
                              alt={listing.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            {isPackage ? <Package className="h-10 w-10 text-muted-foreground/30" /> : <Box className="h-10 w-10 text-muted-foreground/30" />}
                          </div>
                        )}
                        
                        {/* Type Badge - Top Left */}
                        <Badge 
                          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 ${
                            isPackage 
                              ? 'bg-primary text-white' 
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {isPackage ? '📦 Package' : '🏷️ Service'}
                        </Badge>
                        
                        {/* Status Badge - Top Right */}
                        <Badge 
                          className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 ${
                            listing.isActive 
                              ? 'bg-green-500/90 text-white' 
                              : 'bg-gray-500/90 text-white'
                          }`}
                        >
                          {listing.isActive ? '● Live' : '○ Off'}
                        </Badge>
                        
                        {/* Price - Bottom Right */}
                        <div className="absolute bottom-2 right-2">
                          <Badge className="bg-white/95 text-foreground font-bold text-sm px-2 py-1 shadow-md">
                            ₹{getDisplayPrice(listing).toLocaleString('en-IN')}
                          </Badge>
                        </div>
                        
                        {/* Image Count - Bottom Left */}
                        {listing.images?.length > 1 && (
                          <Badge variant="secondary" className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5">
                            <Camera className="h-3 w-3 mr-0.5" /> {listing.images.length}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Content Section */}
                      <CardContent className="p-3">
                        {/* Title & Category */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                              {listing.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground truncate">
                                {getCategoryName(listing.listingCategory?.id || listing.categoryId || '')}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => navigate(`/vendor/listings/preview/${listing.id}`)}>
                                <Eye className="mr-2 h-3.5 w-3.5" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/vendor/listings/preview/${listing.id}?edit=true`)}>
                                <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(listing)}>
                                {listing.isActive ? '○ Deactivate' : '● Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(listing)} 
                                className="text-red-600"
                                disabled={isDeleting === listing.id}
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Event Types */}
                        {listing.eventTypes && listing.eventTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {listing.eventTypes.slice(0, 2).map((eventType: any, index: number) => {
                              const displayText = typeof eventType === 'string' 
                                ? eventType 
                                : (eventType?.displayName || eventType?.name || 'Event');
                              return (
                                <Badge key={index} variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                                  {displayText}
                                </Badge>
                              );
                            })}
                            {listing.eventTypes.length > 2 && (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground">
                                +{listing.eventTypes.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Package Items Count */}
                        {isPackage && listing.includedItemIds?.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                            <Package className="h-3 w-3" /> {listing.includedItemIds.length} services bundled
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              
              {/* View More Card - Enhanced - Only show if there are more filtered listings */}
              {remainingCount > 0 && (
                <Card 
                  className="relative overflow-hidden border-0 cursor-pointer group min-h-[280px]"
                  onClick={() => navigate('/vendor/listings/all')}
                >
                  {/* Animated Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet-500/10 to-pink-500/5 group-hover:from-primary/15 group-hover:via-violet-500/20 group-hover:to-pink-500/10 transition-all duration-700" />
                  
                  {/* Animated Border with gradient */}
                  <div className="absolute inset-0 rounded-lg border-2 border-dashed border-primary/20 group-hover:border-primary/50 transition-all duration-300" />
                  
                  {/* Floating Orbs */}
                  <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-primary/30 transition-all duration-700" />
                  <div className="absolute bottom-6 left-6 w-20 h-20 bg-gradient-to-br from-pink-500/15 to-violet-500/15 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:w-48 group-hover:h-48 transition-all duration-700" />
                  
                  {/* Sparkle decorations */}
                  <div className="absolute top-8 left-8 w-2 h-2 bg-primary/40 rounded-full group-hover:animate-ping" />
                  <div className="absolute bottom-12 right-12 w-1.5 h-1.5 bg-violet-500/40 rounded-full group-hover:animate-ping" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute top-1/3 right-8 w-1 h-1 bg-pink-500/40 rounded-full group-hover:animate-ping" style={{ animationDelay: '0.4s' }} />
                  
                  {/* Content */}
                  <CardContent className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                    {/* Icon with glow effect */}
                    <div className="relative mb-4">
                      <div className="absolute inset-0 w-14 h-14 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-violet-500/20 to-pink-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-primary/20 border border-primary/10">
                        <LayoutGrid className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    
                    {/* Count Badge - Big animated number */}
                    <div className="mb-2 relative">
                      <span className="text-4xl font-bold bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
                        +{remainingCount}
                      </span>
                    </div>
                    
                    {/* Text */}
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                      More Listings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View all {filteredListings.length} listings
                    </p>
                    
                    {/* CTA Button with gradient */}
                    <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-violet-500/10 group-hover:from-primary group-hover:to-violet-500 transition-all duration-300">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:text-white transition-colors">
                        <span>Explore All</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, listing: null, checkResult: null, isChecking: false })}
        onConfirm={confirmDelete}
        title={
          deleteDialog.checkResult?.deleteType === 'SOFT' 
            ? "Can't Delete This Service" 
            : "Delete Listing"
        }
        description={
          deleteDialog.isChecking ? (
            "Checking for active bookings..."
          ) : deleteDialog.checkResult?.warningMessage ? (
            <div className="space-y-4">
              {deleteDialog.checkResult.hasActiveOrders && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">📋</span>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-200">
                        {deleteDialog.checkResult.activeOrderCount} customer{deleteDialog.checkResult.activeOrderCount > 1 ? 's have' : ' has'} booked this service
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        You can't delete services with active bookings. We'll hide it from new customers instead.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {deleteDialog.checkResult.isUsedInPackages && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">📦</span>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">
                        Part of {deleteDialog.checkResult.packageCount} package{deleteDialog.checkResult.packageCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {deleteDialog.checkResult.packageNames.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="font-medium text-foreground">What happens next?</p>
                <p className="text-muted-foreground mt-1">
                  {deleteDialog.checkResult.deleteType === 'SOFT' 
                    ? "This service will be hidden from your storefront. Existing bookings will continue as normal. You can reactivate it anytime."
                    : "This listing will be permanently deleted."}
                </p>
              </div>
            </div>
          ) : deleteDialog.listing?.isDraft ? (
            "Are you sure you want to delete this draft? This action cannot be undone."
          ) : (
            "Are you sure you want to delete this listing? This will remove it from customer view."
          )
        }
        itemName={deleteDialog.listing?.name}
        isDeleting={isDeleting !== null || deleteDialog.isChecking}
        confirmText={
          deleteDialog.checkResult?.deleteType === 'SOFT' 
            ? "Deactivate Service" 
            : "Delete"
        }
      />
    </VendorLayout>
  );
}
