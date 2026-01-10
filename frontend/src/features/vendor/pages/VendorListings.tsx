import { useState, useEffect, useMemo } from 'react';
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

export default function VendorListings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
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
  const { data: eventTypeCategoriesData } = useEventTypeCategories();
  
  // Check if vendor profile is complete (MUST be after all other hooks)
  const { isComplete: profileComplete, isLoading: profileLoading } = useVendorProfile();
  
  const listingsData = listings.data;
  const listingsLoading = listings.loading || dataLoading;
  const listingsError = listings.error;
  const refetch = listings.refetch;
  const profileData = profile.data;
  const eventTypesData = eventTypes.data;
  const categoriesData = categories.data;
  const eventTypeCategories = eventTypeCategoriesData || [];

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
  };

  // Form state
  const [formData, setFormData] = useState(initialFormData);

  // Get vendor category
  const vendorCategoryId = profileData?.vendorCategory?.id || profileData?.categoryId || '';
  const vendorCategoryName = profileData?.vendorCategory?.name || profileData?.categoryName || '';
  const vendorCoreCategoryId = getCoreCategoryId(vendorCategoryId);

  // Get category name helper - converts DB category to core category name
  const getCategoryName = (categoryId: string) => {
    // Check if it's already a core category ID
    const coreCategory = coreCategories.find(cat => cat.id === categoryId);
    if (coreCategory) return coreCategory.name;
    
    // Otherwise, convert DB category to core category
    const coreCategoryId = getCoreCategoryId(categoryId);
    const coreCat = coreCategories.find(cat => cat.id === coreCategoryId);
    return coreCat?.name || 'Other';
  };

  // Filter event types based on selected category
  // Show only event types that are valid for the selected category
  const availableEventTypes = useMemo(() => {
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

  // Filter listings with enhanced search (name, description, category)
  const filteredListings = useMemo(() => {
    if (!listingsData || !Array.isArray(listingsData)) return [];
    
    let filtered = listingsData;
    
    // Filter by category
    if (selectedCategoryFilter !== 'all') {
      filtered = filtered.filter((listing: any) => {
        const listingDbCategoryId = listing.listingCategory?.id || listing.categoryId || '';
        const listingCoreCategoryId = getCoreCategoryId(listingDbCategoryId);
        return listingCoreCategoryId === selectedCategoryFilter;
      });
    }
    
    // Filter by search query (name, description, category name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((listing: any) => {
        const dbCategoryId = listing.listingCategory?.id || listing.categoryId || '';
        const categoryName = getCategoryName(dbCategoryId).toLowerCase();
        return (
          listing.name?.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          categoryName.includes(query)
        );
      });
    }
    
    return filtered;
  }, [listingsData, searchQuery, selectedCategoryFilter]);

  // Exclude drafts from main listings
  const completedListings = useMemo(() => 
    filteredListings.filter((l: any) => !isDraftListing(l)), 
    [filteredListings]
  );
  const packages = useMemo(() => completedListings.filter((l: any) => l.type === 'PACKAGE'), [completedListings]);
  const items = useMemo(() => completedListings.filter((l: any) => l.type === 'ITEM'), [completedListings]);
  
  // Helper function to check if draft - needs to be defined before useMemo calls
  function isDraftListing(listing: any) {
    // A listing is a draft if it has the isDraft flag set to true
    return listing.isDraft === true;
  }

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
  }, [searchParams, listingsData, editingListing, setSearchParams]);

  // Initialize form when editing
  useEffect(() => {
    if (editingListing) {
      // Parse extra charges JSON if available
      let extraChargesDetailed: ExtraCharge[] = [];
      if (editingListing.extraChargesJson) {
        try {
          extraChargesDetailed = JSON.parse(editingListing.extraChargesJson);
        } catch {
          extraChargesDetailed = [];
        }
      }
      
      // Convert DB category ID to core category ID
      const dbCategoryId = editingListing.listingCategory?.id || editingListing.categoryId || vendorCategoryId;
      const coreCategoryId = getCoreCategoryId(dbCategoryId);
      
      setFormData({
        name: editingListing.name || '',
        description: editingListing.description || '',
        price: editingListing.price?.toString() || '',
        categoryId: coreCategoryId, // Use core category ID
        customCategoryName: editingListing.customCategoryName || '',
        eventTypeIds: editingListing.eventTypes?.map((et: any) => et.id || et) || [],
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
      });
      setListingType(editingListing.type || 'PACKAGE');
      // Expand all sections when editing
      setExpandedSections({
        basic: true,
        pricing: true,
        included: true,
        highlights: true,
        photos: true,
      });
    } else {
      // Reset form - use core category ID
      setExpandedSections({
        basic: true,
        pricing: true,
        included: true,
        highlights: false,
        photos: true,
      });
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: vendorCoreCategoryId, // Use core category ID
        customCategoryName: '',
        eventTypeIds: [],
        images: [],
        highlights: [],
        includedItemsText: [],
        includedItemIds: [],
        excludedItemsText: [],
        deliveryTime: '',
        extraChargesDetailed: [],
        extraCharges: [],
        unit: '',
        minimumQuantity: 1,
      });
      setListingType('PACKAGE');
    }
  }, [editingListing, vendorCategoryId, vendorCoreCategoryId]);

  const handleSubmit = async () => {
    // Prevent multiple clicks
    if (isPublishing) {
      return;
    }

    if (!formData.name || !formData.price || !formData.categoryId || formData.eventTypeIds.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate images are required for publishing
    if (!formData.images || formData.images.length === 0) {
      // This shouldn't happen as button is disabled, but keep as safety check
      return;
    }
    
    // Validate custom category name if "Other" is selected
    if (formData.categoryId === 'other' && (!formData.customCategoryName || formData.customCategoryName.trim().length === 0)) {
      toast.error('Please enter a custom category name');
      return;
    }

    // Validate event types are valid for selected category
    if (formData.categoryId && formData.categoryId !== 'other' && eventTypeCategories.length > 0) {
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
      // Convert core category ID to DB category ID for API
      const dbCategoryId = getDbCategoryId(formData.categoryId);
      
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: dbCategoryId, // Send DB category ID to backend
        customCategoryName: formData.categoryId === 'other' ? formData.customCategoryName : undefined,
        eventTypeIds: formData.eventTypeIds,
        images: formData.images,
        highlights: formData.highlights.filter(h => h.trim()), // Remove empty highlights
        deliveryTime: formData.deliveryTime,
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
      };

      if (listingType === 'PACKAGE') {
        payload.includedItemsText = formData.includedItemsText.filter(i => i.trim());
        payload.includedItemIds = formData.includedItemIds;
        payload.excludedItemsText = formData.excludedItemsText.filter(i => i.trim());
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

  const handleImagesChange = (newImages: string[]) => {
    setFormData({ ...formData, images: newImages });
  };

  // Highlight helpers - inline input (no prompt)
  const addHighlight = () => {
    setFormData({ ...formData, highlights: [...formData.highlights, ''] });
  };

  const updateHighlight = (index: number, value: string) => {
    const updated = [...formData.highlights];
    updated[index] = value;
    setFormData({ ...formData, highlights: updated });
  };

  const removeHighlight = (index: number) => {
    setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== index) });
  };

  // Included item text helpers - inline input (no prompt)
  const addIncludedItem = () => {
    setFormData({ ...formData, includedItemsText: [...formData.includedItemsText, ''] });
  };

  const updateIncludedItem = (index: number, value: string) => {
    const updated = [...formData.includedItemsText];
    updated[index] = value;
    setFormData({ ...formData, includedItemsText: updated });
  };

  const removeIncludedItem = (index: number) => {
    setFormData({ ...formData, includedItemsText: formData.includedItemsText.filter((_, i) => i !== index) });
  };

  // Excluded item helpers - inline input (no prompt)
  const addExcludedItem = () => {
    setFormData({ ...formData, excludedItemsText: [...formData.excludedItemsText, ''] });
  };

  const updateExcludedItem = (index: number, value: string) => {
    const updated = [...formData.excludedItemsText];
    updated[index] = value;
    setFormData({ ...formData, excludedItemsText: updated });
  };

  const removeExcludedItem = (index: number) => {
    setFormData({ ...formData, excludedItemsText: formData.excludedItemsText.filter((_, i) => i !== index) });
  };

  // Linked item helpers (actual items from vendor's inventory)
  const toggleLinkedItem = (itemId: string) => {
    if (formData.includedItemIds.includes(itemId)) {
      setFormData({ ...formData, includedItemIds: formData.includedItemIds.filter(id => id !== itemId) });
    } else {
      setFormData({ ...formData, includedItemIds: [...formData.includedItemIds, itemId] });
    }
  };

  // Extra charge helpers - inline input (no prompt)
  const addExtraCharge = () => {
    setFormData({ 
      ...formData, 
      extraChargesDetailed: [...formData.extraChargesDetailed, { name: '', price: '' }] 
    });
  };

  const removeExtraCharge = (index: number) => {
    setFormData({ 
      ...formData, 
      extraChargesDetailed: formData.extraChargesDetailed.filter((_, i) => i !== index) 
    });
  };

  const updateExtraCharge = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...formData.extraChargesDetailed];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, extraChargesDetailed: updated });
  };

  // Save as draft functionality (saves with price=0.01 to mark as incomplete)
  const handleSaveAsDraft = async () => {
    if (!formData.name) {
      toast.error('Please add at least a name to save as draft');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a category to save as draft');
      return;
    }
    if (formData.eventTypeIds.length === 0) {
      toast.error('Please select at least one event type to save as draft');
      return;
    }

    setIsSaving(true);
    try {
      // Convert core category ID to DB category ID for API
      const dbCategoryId = getDbCategoryId(formData.categoryId);
      
      // Save as draft - keep isActive true so vendor can still see it, but mark as draft
      const payload: any = {
        name: formData.name,
        description: formData.description || 'Draft - description pending',
        price: formData.price ? parseFloat(formData.price) : 0.01, // 0.01 marks draft
        categoryId: dbCategoryId, // Send DB category ID to backend
        customCategoryName: formData.categoryId === 'other' ? formData.customCategoryName : undefined,
        eventTypeIds: formData.eventTypeIds,
        images: formData.images,
        highlights: formData.highlights.filter(h => h.trim()),
        deliveryTime: formData.deliveryTime,
        extraChargesDetailed: formData.extraChargesDetailed.filter(ec => ec.name.trim()).map(ec => ({
          name: ec.name,
          price: parseFloat(ec.price) || 0
        })),
        extraCharges: formData.extraCharges,
        isActive: false, // Drafts should NOT be visible to customers
        isDraft: true, // Mark as draft
      };

      if (listingType === 'PACKAGE') {
        payload.includedItemsText = formData.includedItemsText.filter(i => i.trim());
        payload.includedItemIds = formData.includedItemIds;
        payload.excludedItemsText = formData.excludedItemsText.filter(i => i.trim());
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
    setExpandedSections({
      basic: true,
      pricing: true,
      included: true,
      highlights: false,
      photos: true,
    });
  };

  // Separate drafts from active listings - use listingsData directly, not filtered
  const draftListings = useMemo(() => {
    if (!listingsData || !Array.isArray(listingsData)) {
      return [];
    }
    const drafts = listingsData.filter((l: any) => isDraftListing(l));
    return drafts;
  }, [listingsData]);

  if (listingsLoading) {
    return (
      <VendorLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  // Show loading state
  if (profileLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/vendor/dashboard')}
            className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
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
        <Dialog open={showCreateModal} onOpenChange={(open) => {
          if (!open) closeModal();
          else setShowCreateModal(open);
        }}>
          <DialogContent className="bg-card border-border max-w-2xl w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground text-lg sm:text-xl">
                {editingListing ? 'Edit Listing' : 'Create New Listing'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mt-2">
                <span className="inline-flex items-center gap-1">
                  <span className="text-red-500">*</span> Required fields must be completed to publish
                </span>
              </DialogDescription>
            </DialogHeader>

                {/* Single Scrollable Form */}
                <div className="space-y-3 pt-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Listing Type</Label>
                    <Select value={listingType} onValueChange={(value: 'PACKAGE' | 'ITEM') => setListingType(value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PACKAGE">Package</SelectItem>
                        <SelectItem value="ITEM">Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="e.g., Wedding Photography Package"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-background border-border text-foreground min-h-[100px]"
                      placeholder="Describe your listing..."
                    />
                  </div>

                  {/* Pricing & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Price (₹) *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="bg-background border-border text-foreground"
                        placeholder="25000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => {
                          // When category changes, filter event types and clear invalid selections
                          let newEventTypeIds = formData.eventTypeIds;
                          
                          if (value && value !== 'other' && eventTypeCategories.length > 0) {
                            // Get valid event type IDs for this category
                            const validEventTypeIds = new Set<number>();
                            eventTypeCategories.forEach((etc: any) => {
                              const etcEventTypeId = etc.eventTypeId || etc.eventType?.id;
                              const etcCategoryId = etc.categoryId || etc.category?.id;
                              if (etcCategoryId === value && etcEventTypeId) {
                                validEventTypeIds.add(etcEventTypeId);
                              }
                            });
                            
                            // Add Corporate to DJ
                            if (value === 'dj') {
                              const corporateEventType = eventTypesData?.find((et: any) => 
                                et.name === 'Corporate' || et.name === 'Corporate Event' || et.displayName === 'Corporate Event'
                              );
                              if (corporateEventType) {
                                validEventTypeIds.add(corporateEventType.id);
                              }
                            }
                            
                            // Remove invalid event types
                            newEventTypeIds = formData.eventTypeIds.filter(id => validEventTypeIds.has(id));
                          }
                          
                          setFormData({ 
                            ...formData, 
                            categoryId: value,
                            eventTypeIds: newEventTypeIds,
                            customCategoryName: value !== 'other' ? '' : formData.customCategoryName
                          });
                        }}
                      >
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {coreCategories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* Custom Category Name Input - shown when "Other" is selected */}
                      {formData.categoryId === 'other' && (
                        <div className="mt-2">
                          <Input
                            value={formData.customCategoryName}
                            onChange={(e) => setFormData({ ...formData, customCategoryName: e.target.value })}
                            placeholder="e.g., Balloon Artist, Event Planner, etc."
                            className="bg-background border-border text-foreground"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Please specify your category name
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Event Types *</Label>
                    {!formData.categoryId ? (
                      <div className="p-3 border border-border rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          ⚠️ Please select a category first to see available event types
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border border-border rounded-lg bg-background max-h-40 overflow-y-auto">
                          {availableEventTypes && Array.isArray(availableEventTypes) && availableEventTypes.length > 0 ? (
                            availableEventTypes.map((et: any) => (
                              <div key={et.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={formData.eventTypeIds.includes(et.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({ ...formData, eventTypeIds: [...formData.eventTypeIds, et.id] });
                                    } else {
                                      setFormData({ ...formData, eventTypeIds: formData.eventTypeIds.filter(id => id !== et.id) });
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <Label className="text-sm font-normal text-foreground cursor-pointer">
                                  {et.name || et.displayName}
                                </Label>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 p-2 text-sm text-muted-foreground">
                              No event types available for this category
                            </div>
                          )}
                        </div>
                        {formData.eventTypeIds.length === 0 && (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            ⚠️ Please select at least one event type
                          </p>
                        )}
                        {formData.eventTypeIds.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            💡 {formData.categoryId === 'other' 
                              ? 'All event types available for custom categories' 
                              : 'Event types shown are valid for the selected category'}
                          </p>
                        )}
                      </>
                    )}
                  </div>



                  {/* Highlights Section (for both PACKAGE and ITEM) */}
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Listing Highlights
                    </Label>
                    <p className="text-xs text-muted-foreground">Key features shown at the top of your listing (e.g., "Mandap decoration", "Stage decoration")</p>
                    <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/30">
                      {formData.highlights.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No highlights added yet</p>
                      ) : (
                        formData.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-center gap-2 group">
                            <span className="text-green-500 font-bold">•</span>
                            <Input 
                              value={highlight} 
                              onChange={(e) => updateHighlight(i, e.target.value)}
                              className="flex-1 bg-background border-border text-foreground h-9" 
                              placeholder="e.g., Mandap decoration"
                              autoFocus={highlight === ''}
                            />
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => removeHighlight(i)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))
                      )}
                      <Button size="sm" variant="outline" onClick={addHighlight} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" /> Add Highlight
                      </Button>
                    </div>
                  </div>

                  {listingType === 'PACKAGE' && (
                    <>
                      {/* ===== BUNDLE EXISTING ITEMS SECTION ===== */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <Label className="text-foreground font-semibold">Bundle Your Items</Label>
                          </div>
                          {formData.includedItemIds.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {formData.includedItemIds.length} selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Select items from your inventory to bundle into this package. Customers can click each item to see details.
                        </p>
                        
                        {items.length === 0 ? (
                          <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center bg-muted/5">
                            <Box className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm font-medium text-muted-foreground mb-1">No items to bundle yet</p>
                            <p className="text-xs text-muted-foreground mb-3">Create individual items first, then bundle them into packages</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                closeModal();
                                setListingType('ITEM');
                                setTimeout(() => setShowCreateModal(true), 100);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Create Service First
                            </Button>
                          </div>
                        ) : (
                          <div className="border border-border rounded-lg overflow-hidden">
                            <div className="max-h-48 overflow-y-auto">
                              {items.map((item: any) => {
                                const isSelected = formData.includedItemIds.includes(item.id);
                                return (
                                  <div 
                                    key={item.id} 
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-muted/50 border-b border-border last:border-b-0 ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                                    onClick={() => toggleLinkedItem(item.id)}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary flex-shrink-0"
                                    />
                                    {item.images && item.images.length > 0 ? (
                                      <img 
                                        src={item.images[0]} 
                                        alt={item.name}
                                        className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                        <Box className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {getCategoryName(item.listingCategory?.id || item.categoryId || '') || 'Uncategorized'}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                        ₹{Number(item.price).toLocaleString('en-IN')}
                                      </p>
                                      {item.unit && (
                                        <p className="text-xs text-muted-foreground">/{item.unit}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Summary Footer */}
                            {formData.includedItemIds.length > 0 && (
                              <div className="bg-primary/5 border-t border-primary/20 p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    Bundling {formData.includedItemIds.length} item{formData.includedItemIds.length > 1 ? 's' : ''}
                                  </span>
                                  <span className="text-sm font-semibold text-primary">
                                    Items total: ₹{items
                                      .filter((i: any) => formData.includedItemIds.includes(i.id))
                                      .reduce((sum: number, i: any) => sum + Number(i.price), 0)
                                      .toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">
                            {items.length > 0 ? 'Plus Custom Inclusions' : 'Or Add Custom Inclusions'}
                          </span>
                        </div>
                      </div>

                      {/* ===== CUSTOM INCLUSIONS SECTION ===== */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <Label className="text-foreground">What's Included</Label>
                          {formData.includedItemsText.filter(i => i.trim()).length > 0 && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-500/30">
                              {formData.includedItemsText.filter(i => i.trim()).length} custom
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Add services or items not listed as separate items</p>
                        <div className="space-y-2 p-3 border border-green-500/20 rounded-lg bg-green-500/5">
                          {formData.includedItemsText.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-2">No custom inclusions added</p>
                          ) : (
                            formData.includedItemsText.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 group">
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <Input 
                                  value={item} 
                                  onChange={(e) => updateIncludedItem(i, e.target.value)}
                                  className="flex-1 bg-background border-border text-foreground h-9" 
                                  placeholder="e.g., Flower arrangements, Stage lighting"
                                  autoFocus={item === ''}
                                />
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => removeIncludedItem(i)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))
                          )}
                          <Button size="sm" variant="outline" onClick={addIncludedItem} className="w-full border-dashed">
                            <Plus className="h-4 w-4 mr-2" /> Add Custom Inclusion
                          </Button>
                        </div>
                      </div>

                      {/* ===== EXCLUSIONS SECTION ===== */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500" />
                          <Label className="text-foreground">What's Not Included</Label>
                          {formData.excludedItemsText.filter(i => i.trim()).length > 0 && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-500/30">
                              {formData.excludedItemsText.filter(i => i.trim()).length}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Clarify what's NOT part of this package</p>
                        <div className="space-y-2 p-3 border border-red-500/20 rounded-lg bg-red-500/5">
                          {formData.excludedItemsText.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-2">No exclusions added</p>
                          ) : (
                            formData.excludedItemsText.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 group">
                                <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <Input 
                                  value={item} 
                                  onChange={(e) => updateExcludedItem(i, e.target.value)}
                                  className="flex-1 bg-background border-border text-foreground h-9" 
                                  placeholder="e.g., Transportation, Food"
                                  autoFocus={item === ''}
                                />
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => removeExcludedItem(i)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))
                          )}
                          <Button size="sm" variant="outline" onClick={addExcludedItem} className="w-full border-dashed">
                            <Plus className="h-4 w-4 mr-2" /> Add Exclusion
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {listingType === 'ITEM' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Unit</Label>
                          <Input
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            className="bg-background border-border text-foreground"
                            placeholder="e.g., per piece"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Minimum Quantity</Label>
                          <Input
                            type="number"
                            value={formData.minimumQuantity}
                            onChange={(e) => setFormData({ ...formData, minimumQuantity: parseInt(e.target.value) || 1 })}
                            className="bg-background border-border text-foreground"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Delivery Time */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Delivery / Service Time</Label>
                    <Input
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="e.g., 1 day before event, 2-3 weeks"
                    />
                  </div>

                  {/* Extra Charges with Pricing */}
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <Plus className="h-4 w-4 text-orange-500" />
                      Extra Charges
                    </Label>
                    <p className="text-xs text-muted-foreground">Optional add-ons with pricing that customers can select</p>
                    <div className="space-y-2 p-3 border border-border rounded-lg bg-orange-500/5">
                      {formData.extraChargesDetailed.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No extra charges added yet</p>
                      ) : (
                        formData.extraChargesDetailed.map((charge, i) => (
                          <div key={i} className="flex items-center gap-2 group p-2 rounded-lg bg-background border border-border">
                            <span className="text-orange-500 font-bold">+</span>
                            <Input 
                              value={charge.name} 
                              onChange={(e) => updateExtraCharge(i, 'name', e.target.value)}
                              className="flex-1 bg-transparent border-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0" 
                              placeholder="e.g., Additional lighting"
                              autoFocus={charge.name === ''}
                            />
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted">
                              <span className="text-muted-foreground text-sm">₹</span>
                              <Input 
                                type="number"
                                value={charge.price} 
                                onChange={(e) => updateExtraCharge(i, 'price', e.target.value)}
                                className="w-24 bg-transparent border-0 h-7 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-right font-medium" 
                                placeholder="10000"
                              />
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => removeExtraCharge(i)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))
                      )}
                      <Button size="sm" variant="outline" onClick={addExtraCharge} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" /> Add Extra Charge
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Images *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Upload multiple photos to showcase your listing. Drag to reorder.
                    </p>
                    <ImageUpload
                      images={formData.images}
                      onChange={handleImagesChange}
                      maxImages={20}
                    />
                    {formData.images.length === 0 && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                        ⚠️ At least one image is recommended
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-border hover:bg-muted"
                        onClick={closeModal}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
                        onClick={handleSaveAsDraft}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save & Exit
                      </Button>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSubmit}
                      disabled={!formData.name || !formData.price || !formData.categoryId || formData.eventTypeIds.length === 0 || formData.images.length === 0 || isPublishing || isSaving}
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {editingListing ? 'Updating...' : 'Publishing...'}
                        </>
                      ) : (
                        <>
                          {editingListing ? 'Update' : 'Publish'} Listing
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {!formData.name || !formData.categoryId || formData.eventTypeIds.length === 0
                        ? '⚠️ Complete all required fields to publish' 
                        : !formData.price 
                          ? '⚠️ Set a price to publish' 
                          : formData.images.length === 0 
                            ? '⚠️ Add at least one image to publish'
                            : '✓ Ready to publish'}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/listing/${listing.id}?view=customer`, '_blank'); }}>
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
                      ₹{Number(listing.price).toLocaleString('en-IN')}
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
                    {/* Category with icon */}
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/listing/${listing.id}?view=customer`, '_blank'); }}>
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
                      ₹{Number(listing.price).toLocaleString('en-IN')}
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
