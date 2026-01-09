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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog';
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
  ArrowLeft
} from 'lucide-react';
import { ImageUpload } from '@/shared/components/ImageUpload';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useVendorListingsData, useEventTypeCategories } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';

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
  const [formStep, setFormStep] = useState<1 | 2>(1); // Two-step form
  const [pendingDelete, setPendingDelete] = useState<any>(null);
  
  // Fetch data in parallel using optimized hook
  const { listings, profile, eventTypes, categories, loading: dataLoading } = useVendorListingsData();
  const { data: eventTypeCategoriesData } = useEventTypeCategories();
  const listingsData = listings.data;
  const listingsLoading = listings.loading || dataLoading;
  const listingsError = listings.error;
  const refetch = listings.refetch;
  const profileData = profile.data;
  const eventTypesData = eventTypes.data;
  const categoriesData = categories.data;
  const eventTypeCategories = eventTypeCategoriesData || [];

  // Extra charge with pricing type
  type ExtraCharge = { name: string; price: string };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    customCategoryName: '', // Custom category name when categoryId is "other"
    eventTypeIds: [] as number[],
    images: [] as string[],
    // Highlights - key features
    highlights: [] as string[],
    // Package fields
    includedItemsText: [] as string[],
    includedItemIds: [] as string[], // IDs of linked items
    excludedItemsText: [] as string[],
    deliveryTime: '',
    extraChargesDetailed: [] as ExtraCharge[], // New structured format
    extraCharges: [] as string[], // Legacy format
    // Item fields
    unit: '',
    minimumQuantity: 1,
    // Negotiation
    openForNegotiation: true,
  });

  // Get vendor category
  const vendorCategoryId = profileData?.vendorCategory?.id || profileData?.categoryId || '';
  const vendorCategoryName = profileData?.vendorCategory?.name || profileData?.categoryName || '';

  // Get category name helper
  const getCategoryName = (categoryId: string) => {
    if (!categoriesData || !Array.isArray(categoriesData)) return '';
    const category = categoriesData.find((cat: any) => cat.id === categoryId);
    return category?.name || '';
  };

  // Filter event types based on selected category
  // Show only event types that are valid for the selected category
  const availableEventTypes = useMemo(() => {
    if (!eventTypesData || !Array.isArray(eventTypesData)) return [];
    if (!eventTypeCategories || eventTypeCategories.length === 0) return eventTypesData;
    
    // If no category selected, show all event types
    if (!formData.categoryId || formData.categoryId === 'other') {
      return eventTypesData;
    }

    // Get valid event type IDs for selected category
    const validEventTypeIds = new Set<number>();
    
    eventTypeCategories.forEach((etc: any) => {
      // Handle different possible structures
      const etcEventTypeId = etc.eventTypeId || etc.eventType?.id;
      const etcCategoryId = etc.categoryId || etc.category?.id;
      
      if (etcCategoryId === formData.categoryId && etcEventTypeId) {
        validEventTypeIds.add(etcEventTypeId);
      }
    });

    // Special case: Add Corporate to DJ category (as requested)
    if (formData.categoryId === 'dj') {
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

    return filtered;
  }, [eventTypesData, eventTypeCategories, formData.categoryId]);

  // Filter listings with enhanced search (name, description, category)
  const filteredListings = useMemo(() => {
    if (!listingsData || !Array.isArray(listingsData)) return [];
    
    let filtered = listingsData;
    
    // Filter by category
    if (selectedCategoryFilter !== 'all') {
      filtered = filtered.filter((listing: any) => {
        const listingCategoryId = listing.listingCategory?.id || listing.categoryId || '';
        return listingCategoryId === selectedCategoryFilter;
      });
    }
    
    // Filter by search query (name, description, category name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((listing: any) => {
        const categoryName = getCategoryName(listing.listingCategory?.id || listing.categoryId || '').toLowerCase();
        return (
          listing.name?.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          categoryName.includes(query)
        );
      });
    }
    
    return filtered;
  }, [listingsData, searchQuery, selectedCategoryFilter, categoriesData]);

  // Exclude drafts from main listings
  const completedListings = useMemo(() => 
    filteredListings.filter((l: any) => !isDraftListing(l)), 
    [filteredListings]
  );
  const packages = useMemo(() => completedListings.filter((l: any) => l.type === 'PACKAGE'), [completedListings]);
  const items = useMemo(() => completedListings.filter((l: any) => l.type === 'ITEM'), [completedListings]);
  
  // Helper function to check if draft - needs to be defined before useMemo calls
  function isDraftListing(listing: any) {
    // A listing is a draft if:
    // 1. Explicitly marked as draft
    // 2. Price is 0 or 0.01 (draft marker)
    // 3. Not active (isActive = false)
    // 4. Missing required fields (no images, no price, etc.)
    return listing.isDraft || 
           !listing.isActive || 
           !listing.price || 
           listing.price === 0 || 
           listing.price === 0.01 ||
           !listing.images?.length;
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
      
      setFormData({
        name: editingListing.name || '',
        description: editingListing.description || '',
        price: editingListing.price?.toString() || '',
        categoryId: editingListing.listingCategory?.id || editingListing.categoryId || vendorCategoryId,
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
        openForNegotiation: editingListing.openForNegotiation || false,
      });
      setListingType(editingListing.type || 'PACKAGE');
      setFormStep(1); // Reset to first step when editing
    } else {
      // Reset form
      setFormStep(1);
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: vendorCategoryId,
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
        openForNegotiation: true,
      });
      setListingType('PACKAGE');
    }
  }, [editingListing, vendorCategoryId]);

  const handleSubmit = async () => {
    // Prevent multiple clicks
    if (isPublishing) {
      return;
    }

    if (!formData.name || !formData.price || !formData.categoryId || formData.eventTypeIds.length === 0) {
      toast.error('Please fill in all required fields');
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
      
      eventTypeCategories.forEach((etc: any) => {
        const etcEventTypeId = etc.eventTypeId || etc.eventType?.id;
        const etcCategoryId = etc.categoryId || etc.category?.id;
        if (etcCategoryId === formData.categoryId && etcEventTypeId) {
          validEventTypeIds.add(etcEventTypeId);
        }
      });
      
      // Add Corporate to DJ category
      if (formData.categoryId === 'dj') {
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
        toast.error(`Some selected event types are not valid for the chosen category. Please select valid event types.`);
        return;
      }
    }

    setIsPublishing(true);
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        customCategoryName: formData.categoryId === 'other' ? formData.customCategoryName : undefined,
        eventTypeIds: formData.eventTypeIds,
        images: formData.images,
        highlights: formData.highlights,
        deliveryTime: formData.deliveryTime,
        // Include both formats for extra charges
        extraChargesDetailed: formData.extraChargesDetailed.map(ec => ({
          name: ec.name,
          price: parseFloat(ec.price) || 0
        })),
        extraCharges: formData.extraCharges,
        isActive: true, // Published listings should be active/visible
        isDraft: false, // Published listings are not drafts
        openForNegotiation: formData.openForNegotiation,
      };

      if (listingType === 'PACKAGE') {
        payload.includedItemsText = formData.includedItemsText;
        payload.includedItemIds = formData.includedItemIds;
        payload.excludedItemsText = formData.excludedItemsText;
        console.log('📦 Package payload being sent:', {
          includedItemIds: payload.includedItemIds,
          includedItemsText: payload.includedItemsText,
          formDataIncludedItemIds: formData.includedItemIds,
        });
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

  const requestDelete = (listing: any) => {
    setPendingDelete(listing);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const listing = pendingDelete;

    // Prevent multiple clicks
    if (isDeleting === listing.id) {
      return;
    }

    setIsDeleting(listing.id);
    try {
      const response = await vendorApi.deleteListing(listing.id);
      if (response.success) {
        toast.success('Listing deleted successfully!');
        refetch();
      } else {
        throw new Error(response.message || 'Failed to delete listing');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    } finally {
      setIsDeleting(null);
      setPendingDelete(null);
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
      // Use price=0.01 as a marker for draft listings (real listings will have actual prices)
      // IMPORTANT: Set isActive to false so draft listings are NOT visible on user side
      const payload: any = {
        name: formData.name,
        description: formData.description || 'Draft - description pending',
        price: formData.price ? parseFloat(formData.price) : 0.01, // 0.01 marks draft
        categoryId: formData.categoryId,
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
        isActive: false, // Drafts should NOT be active/visible on user side
        isDraft: true, // Explicitly mark as draft
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
          refetch();
        }
      } else {
        const response = listingType === 'PACKAGE'
          ? await vendorApi.createPackage(payload)
          : await vendorApi.createItem(payload);
        
        if (response.success) {
          toast.success('Draft saved! You can complete it later.');
          closeModal();
          refetch();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Close modal and reset
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingListing(null);
    setFormStep(1);
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (!formData.name || !formData.categoryId || formData.eventTypeIds.length === 0) {
      toast.error('Please fill in all required fields before proceeding');
      return;
    }
    setFormStep(2);
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    setFormStep(1);
  };

  // Separate drafts from active listings
  const draftListings = useMemo(() => 
    filteredListings.filter((l: any) => isDraftListing(l)), 
    [filteredListings]
  );

  if (listingsLoading) {
    return (
      <VendorLayout>
        <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/vendor/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Packages & Listings</h1>
            <p className="text-muted-foreground">
              {filteredListings.length} listings • {filteredListings.filter((l: any) => l.isActive).length} active
            </p>
          </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, or category..."
                  className="pl-10 bg-background border-border text-foreground w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
              <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesData && Array.isArray(categoriesData) && categoriesData.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showCreateModal} onOpenChange={(open) => {
              if (!open) closeModal();
              else setShowCreateModal(open);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Add Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingListing ? 'Edit Listing' : 'Create New Listing'}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    {formStep === 1 ? 'Enter basic information for your listing' : 'Add details, images and pricing for your listing'}
                  </DialogDescription>
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${formStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs font-bold">1</span>
                      Basic Info
                    </div>
                    <div className="w-8 h-0.5 bg-border" />
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${formStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs font-bold">2</span>
                      Details
                    </div>
                  </div>
                </DialogHeader>

                {/* STEP 1: Basic Information */}
                {formStep === 1 && (
                <div className="space-y-4 pt-4">
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

                  <div className="grid grid-cols-2 gap-4">
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
                          {categoriesData && Array.isArray(categoriesData) && categoriesData.map((cat: any) => (
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

                  {/* Open for Negotiation Toggle */}
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                    <div className="space-y-0.5">
                      <Label className="text-foreground font-medium">Open for Negotiation</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow customers to make offers on this listing
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.openForNegotiation}
                        onChange={(e) => setFormData({ ...formData, openForNegotiation: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Event Types *</Label>
                    {!formData.categoryId || formData.categoryId === 'other' ? (
                      <div className="p-3 border border-border rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          ⚠️ Please select a category first to see available event types
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-lg bg-background max-h-40 overflow-y-auto">
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
                            💡 Event types shown are valid for the selected category
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Step 1 Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border">
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
                      disabled={isSaving || !formData.name || !formData.categoryId || formData.eventTypeIds.length === 0}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save & Exit
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow"
                      onClick={goToNextStep}
                      disabled={!formData.name || !formData.categoryId || formData.eventTypeIds.length === 0}
                    >
                      Next →
                    </Button>
                  </div>
                </div>
                )}

                {/* STEP 2: Details */}
                {formStep === 2 && (
                <div className="space-y-4 pt-4">
                  {/* Back Button for Step 2 */}
                  <div className="mb-4 pb-4 border-b border-border">
                    <Button
                      variant="ghost"
                      onClick={goToPreviousStep}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Basic Info
                    </Button>
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
                      <div className="grid grid-cols-2 gap-4">
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

                  {/* Step 2 Buttons */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-border hover:bg-muted"
                        onClick={goToPreviousStep}
                      >
                        ← Back
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
                      className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow"
                      onClick={handleSubmit}
                      disabled={!formData.price || isPublishing || isSaving}
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
                      {!formData.price 
                        ? '⚠️ Set a price to publish' 
                        : formData.images.length === 0 
                          ? '⚠️ Consider adding images before publishing'
                          : '✓ Ready to publish'}
                    </p>
                  </div>
                </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {listingsError && (
          <Alert className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{listingsError}</AlertDescription>
          </Alert>
        )}

        {/* Draft Listings Section */}
        {draftListings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-foreground">Incomplete Listings ({draftListings.length})</h2>
              <span className="text-xs text-muted-foreground ml-2">Complete these to make them visible to customers</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {draftListings.map((listing: any) => (
                <Card key={listing.id} className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 overflow-hidden hover:border-yellow-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-yellow-500/20">
                          <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-700 text-xs font-medium">Draft</Badge>
                      </div>
                      <Badge variant="outline" className="text-xs bg-background">
                        {listing.type === 'PACKAGE' ? <Package className="h-3 w-3 mr-1" /> : <Box className="h-3 w-3 mr-1" />}
                        {listing.type === 'PACKAGE' ? 'Package' : 'Item'}
                      </Badge>
                    </div>
                    <h3 className="text-foreground font-semibold text-sm mb-2 line-clamp-1">{listing.name || 'Untitled'}</h3>
                    <div className="space-y-1 mb-3">
                      <p className="text-xs flex items-center gap-1 text-muted-foreground">
                        {listing.price && listing.price > 0.01 ? (
                          <><CheckCircle2 className="h-3 w-3 text-green-500" /> Price set</>
                        ) : (
                          <><X className="h-3 w-3 text-red-400" /> No price</>
                        )}
                      </p>
                      <p className="text-xs flex items-center gap-1 text-muted-foreground">
                        {listing.images?.length > 0 ? (
                          <><CheckCircle2 className="h-3 w-3 text-green-500" /> {listing.images.length} image(s)</>
                        ) : (
                          <><X className="h-3 w-3 text-red-400" /> No images</>
                        )}
                      </p>
                      <p className="text-xs flex items-center gap-1 text-muted-foreground">
                        {listing.description ? (
                          <><CheckCircle2 className="h-3 w-3 text-green-500" /> Has description</>
                        ) : (
                          <><X className="h-3 w-3 text-red-400" /> No description</>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
                        onClick={() => {
                          setEditingListing(listing);
                          setShowCreateModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Complete
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                        onClick={() => requestDelete(listing)}
                        disabled={isDeleting === listing.id}
                      >
                        {isDeleting === listing.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Packages Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Packages</h2>
              <Badge variant="secondary" className="ml-2">{packages.length}</Badge>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((listing: any) => (
              <Card 
                key={listing.id} 
                className="border-border overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => window.open(`/listing/${listing.id}?view=customer`, '_blank')}
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
                          onClick={(e) => { e.stopPropagation(); requestDelete(listing); }} 
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
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <Badge variant="outline" className="text-xs font-normal">
                      {getCategoryName(listing.listingCategory?.id || listing.categoryId || '') || 'Other'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {listing.eventTypes?.length > 0 && (
                        <span>{listing.eventTypes.length} event type{listing.eventTypes.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>

        {/* Items Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Box className="h-5 w-5 text-secondary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Individual Items</h2>
              <Badge variant="secondary" className="ml-2">{items.length}</Badge>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((listing: any) => (
              <Card 
                key={listing.id} 
                className="border-border overflow-hidden group hover:shadow-lg hover:border-secondary/30 transition-all duration-300 cursor-pointer"
                onClick={() => window.open(`/listing/${listing.id}?view=customer`, '_blank')}
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
                          onClick={(e) => { e.stopPropagation(); requestDelete(listing); }} 
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? `This will permanently delete "${pendingDelete.name || 'Untitled'}". This action cannot be undone.` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setPendingDelete(null)}
              className="border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting === pendingDelete?.id}
            >
              {isDeleting === pendingDelete?.id ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VendorLayout>
  );
}
