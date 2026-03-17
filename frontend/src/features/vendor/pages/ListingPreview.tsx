import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ListingGuide } from '@/features/vendor/components/VendorTour';

import { Separator } from '@/shared/components/ui/separator';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { ImageUpload, PendingImageChanges } from '@/shared/components/ImageUpload';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { uploadImage, deleteImages } from '@/shared/utils/storage';
import { 
  Star, MapPin, Clock, CheckCircle2, XCircle, ArrowLeft, User, Users, Package,
  AlertCircle, IndianRupee, Loader2, Save, X, Plus, Pencil, Eye,
  ShoppingCart, CalendarIcon, Lock, Camera, Trash2, Sparkles,
  ChevronDown, ChevronUp, Gift, FileText, Calendar, PartyPopper, Zap, ArrowRight, Rocket
} from 'lucide-react';
import { useVendorListingDetails, useEventTypes } from '@/shared/hooks/useApi';
import { publicApi, vendorApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { CategorySpecificDisplay } from '@/features/listing/CategorySpecificDisplay';
import { CategoryFieldRenderer } from '@/features/vendor/components/CategoryFields';
import { AddOnManager, type AddOnManagerHandle } from '@/features/vendor/components/AddOnManager';
import { CATALOG_BY_ID } from '@/shared/constants/addOnCatalog';
import { DeliveryTimeInput } from '@/features/vendor/components/DeliveryTimeInput';
import { ServiceModeSelector } from '@/shared/components/ServiceModeSelector';
import { LocationAutocomplete, LocationDTO } from '@/shared/components/LocationAutocomplete';
import { VendorPackagePreview } from './VendorPackagePreview';
import { getTemplateById } from '@/shared/constants/listingTemplates';
import { ListingEditWizard } from '@/features/vendor/components/ListingEditWizard';

interface ExtraCharge { name: string; price: number; }

// Helper to format delivery time with description
const formatDeliveryTime = (deliveryTime: string): { label: string; description: string } => {
  if (!deliveryTime) return { label: 'Not specified', description: '' };
  
  // Parse formats like "after:30 days", "before:7 days", "same_day", "instant"
  if (deliveryTime === 'same_day') return { label: 'Same Day', description: 'Service delivered on the event day' };
  if (deliveryTime === 'instant') return { label: 'Instant', description: 'Immediate delivery' };
  
  const match = deliveryTime.match(/^(after|before):(\d+)\s*(days?|weeks?|hours?)?$/i);
  if (match) {
    const [, timing, num, unit = 'days'] = match;
    const unitLabel = unit.toLowerCase().replace(/s$/, '');
    if (timing === 'after') {
      return { 
        label: `${num} ${unitLabel}${Number(num) > 1 ? 's' : ''} after event`, 
        description: `Delivered ${num} ${unitLabel}${Number(num) > 1 ? 's' : ''} after your event` 
      };
    } else {
      return { 
        label: `${num} ${unitLabel}${Number(num) > 1 ? 's' : ''} before event`, 
        description: `Delivered ${num} ${unitLabel}${Number(num) > 1 ? 's' : ''} before your event` 
      };
    }
  }
  
  return { label: deliveryTime, description: '' };
};

// Helper to get service mode with description
const getServiceModeWithDescription = (mode: string): { label: string; description: string } => {
  switch (mode) {
    case 'CUSTOMER_VISITS':
      return { label: 'Visit their location', description: 'You go to their studio/venue' };
    case 'VENDOR_TRAVELS':
      return { label: 'They come to you', description: 'Vendor travels to your event location' };
    case 'BOTH':
      return { label: 'Both options', description: 'Flexible - visit them or they come to you' };
    default:
      return { label: 'Both options', description: 'Flexible - visit them or they come to you' };
  }
};

const eventTypeNames: Record<number, string> = {
  1: 'Wedding', 2: 'Birthday', 3: 'Anniversary', 4: 'Corporate', 5: 'Engagement',
  6: 'Baby Shower', 7: 'Nightlife', 8: 'Concert', 9: 'Other'
};

export default function ListingPreview() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: listing, loading, error } = useVendorListingDetails(listingId || null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [useWizardMode, setUseWizardMode] = useState(true); // New: Use step-by-step wizard by default
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishCelebration, setShowPublishCelebration] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  
  const [draftHighlight, setDraftHighlight] = useState('');
  const [showHighlightInput, setShowHighlightInput] = useState(false);
  const [editingHighlightIndex, setEditingHighlightIndex] = useState<number | null>(null);
  const [draftIncludedItem, setDraftIncludedItem] = useState('');
  const [showIncludedItemInput, setShowIncludedItemInput] = useState(false);
  const [editingIncludedIndex, setEditingIncludedIndex] = useState<number | null>(null);
  const [draftExcludedItem, setDraftExcludedItem] = useState('');
  const [showExcludedItemInput, setShowExcludedItemInput] = useState(false);
  const [editingExcludedIndex, setEditingExcludedIndex] = useState<number | null>(null);
  const [draftExtraCharge, setDraftExtraCharge] = useState({ name: '', price: '' });
  const [showExtraChargeInput, setShowExtraChargeInput] = useState(false);
  const [editingExtraChargeIndex, setEditingExtraChargeIndex] = useState<number | null>(null);
  
  // Collapsible section states - collapsed by default

  // Add-on manager ref for saving
  const addOnManagerRef = useRef<AddOnManagerHandle>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    serviceDetails: false,
    eventTypes: false,
    includedExcluded: false,
    additionalNotes: false,
  });
  const expandAllDetailSections = useCallback(() => {
    setExpandedSections({
      serviceDetails: true,
      eventTypes: true,
      includedExcluded: true,
      additionalNotes: true,
    });
  }, []);
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Pending image changes for deferred upload
  const [pendingImageChanges, setPendingImageChanges] = useState<PendingImageChanges | null>(null);
  
  const { data: eventTypesData } = useEventTypes();
  const eventTypes = useMemo(() => eventTypesData || [], [eventTypesData]);
  const vendorId = listing?.vendorId || listing?.vendor?.id || null;

  // Fetch add-ons for the summary in preview mode
  const { data: addOnsData } = useQuery({
    queryKey: ['listingAddOns', listingId],
    queryFn: async () => {
      if (!listingId) return [];
      const response = await vendorApi.getPackageAddOns(listingId);
      const data = response && typeof response === 'object' && 'data' in response
        ? (response as any).data : response;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!listingId,
    staleTime: 30 * 1000,
  });
  const addOnsList = useMemo(() => addOnsData || [], [addOnsData]);
  
  // Check if this is a template-based listing
  const isTemplateBased = useMemo(() => {
    return listing?.customNotes?.startsWith('__TEMPLATE__:');
  }, [listing?.customNotes]);
  
  const templateId = useMemo(() => {
    if (!isTemplateBased || !listing?.customNotes) return null;
    return listing.customNotes.replace('__TEMPLATE__:', '');
  }, [isTemplateBased, listing?.customNotes]);
  
  // Get original template for name comparison
  const originalTemplate = useMemo(() => {
    if (!templateId) return null;
    return getTemplateById(templateId);
  }, [templateId]);
  
  const { data: bundledItemsData } = useQuery({
    queryKey: ['bundledItems', listing?.includedItemIds],
    queryFn: async () => {
      if (!listing?.includedItemIds || listing.includedItemIds.length === 0) return [];
      const response = await publicApi.getListingsByIds(listing.includedItemIds);
      return response && typeof response === 'object' && 'data' in response ? (response as any).data : response;
    },
    enabled: !!(listing?.includedItemIds && listing.includedItemIds.length > 0),
    staleTime: 2 * 60 * 1000,
  });
  
  const linkedItems = useMemo(() => Array.isArray(bundledItemsData) ? bundledItemsData : [], [bundledItemsData]);

  const isPackage = listing?.type?.toLowerCase() === 'package' || listing?.type === 'PACKAGE';
  const isItem = listing?.type?.toLowerCase() === 'item' || listing?.type === 'ITEM';
  const parsedExtraCharges: ExtraCharge[] = useMemo(() => {
    if (listing?.extraChargesJson) { try { return JSON.parse(listing.extraChargesJson); } catch { return []; } }
    return [];
  }, [listing?.extraChargesJson]);
  const displayHighlights = listing?.highlights?.length > 0 ? listing.highlights : listing?.includedItemsText?.slice(0, 4) || [];

  const displayPrice = useMemo(() => {
    if (!listing) return 0;
    if (listing.price && Number(listing.price) > 0.01) return Number(listing.price);
    if (listing.categorySpecificData) {
      try {
        const d = JSON.parse(listing.categorySpecificData);
        switch (listing.categoryId) {
          case 'caterer': return d.pricePerPlate || d.pricePerPlateVeg || d.pricePerPlateNonVeg || 0;
          case 'photographer': case 'cinematographer': case 'videographer': return d.photographyPrice || d.videographyPrice || d.price || 0;
          case 'decorator': case 'venue': case 'dj': case 'live-music': case 'sound-lights': return d.price || 0;
          case 'mua': return d.bridalPrice || d.nonBridalPrice || 0;
          default: return d.price || 0;
        }
      } catch { return Number(listing.price) || 0; }
    }
    return Number(listing.price) || 0;
  }, [listing]);

  const priceLabel = useMemo(() => {
    if (!listing?.categorySpecificData) return null;
    try {
      const d = JSON.parse(listing.categorySpecificData);
      switch (listing.categoryId) {
        case 'caterer': return '/plate';
        case 'mua': return displayPrice === d.bridalPrice ? '(Bridal)' : '(Non-Bridal)';
        default: return null;
      }
    } catch { return null; }
  }, [listing?.categorySpecificData, listing?.categoryId, displayPrice]);

  const enterEditMode = useCallback(() => {
    if (!listing) return;
    // Navigate to the Airbnb-style edit wizard
    navigate(`/vendor/edit-listing/${listing.id}`);
  }, [listing, navigate]);

  // Auto-enter edit mode if ?edit=true query param
  useEffect(() => {
    const shouldEdit = searchParams.get('edit') === 'true';
    if (shouldEdit && listing) {
      // Clear the query param and navigate to edit wizard
      searchParams.delete('edit');
      setSearchParams(searchParams, { replace: true });
      navigate(`/vendor/edit-listing/${listing.id}`, { replace: true });
    }
  }, [searchParams, listing, setSearchParams, navigate]);

  useEffect(() => {
    const handleEnterEditMode = () => {
      if (!isEditMode) enterEditMode();
    };
    const handleExpandAllDetails = () => {
      if (!isEditMode) enterEditMode();
      expandAllDetailSections();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('listing-guide:enter-edit-mode', handleEnterEditMode);
    window.addEventListener('listing-guide:expand-all-details', handleExpandAllDetails);
    return () => {
      window.removeEventListener('listing-guide:enter-edit-mode', handleEnterEditMode);
      window.removeEventListener('listing-guide:expand-all-details', handleExpandAllDetails);
    };
  }, [isEditMode, enterEditMode, expandAllDetailSections]);

  const cancelEditMode = useCallback(() => {
    setIsEditMode(false); setEditForm(null); setCategorySpecificData({});
    setDraftHighlight(''); setShowHighlightInput(false); setEditingHighlightIndex(null);
    setDraftIncludedItem(''); setShowIncludedItemInput(false); setEditingIncludedIndex(null);
    setDraftExcludedItem(''); setShowExcludedItemInput(false); setEditingExcludedIndex(null);
    setDraftExtraCharge({ name: '', price: '' }); setShowExtraChargeInput(false); setEditingExtraChargeIndex(null);
    setPendingImageChanges(null); // Clear pending image changes
  }, []);

  // Publish readiness checker - returns missing requirements
  const getPublishRequirements = useCallback((listingData: any, formData?: any, catData?: Record<string, any>) => {
    const requirements: { id: string; label: string; met: boolean }[] = [];
    const data = formData || listingData;
    const categoryData = catData || (listingData?.categorySpecificData ? (() => {
      try { 
        let parsed = listingData.categorySpecificData;
        while (typeof parsed === 'string') parsed = JSON.parse(parsed);
        return parsed;
      } catch { return {}; }
    })() : {});
    
    // 1. Name is required
    const hasName = data?.name && data.name.trim().length > 0;
    requirements.push({ id: 'name', label: 'Service name', met: hasName });
    
    // 2. At least 1 image
    let imageCount = data?.images?.length || 0;
    if (pendingImageChanges) {
      const existingUrls = pendingImageChanges.finalOrder.filter((item: any) => typeof item === 'string').length;
      const newFiles = pendingImageChanges.filesToUpload.length;
      imageCount = existingUrls + newFiles;
    }
    requirements.push({ id: 'images', label: 'At least 1 photo', met: imageCount > 0 });
    
    // 3. Price is required (must be set, not 0)
    let hasPrice = false;
    const catId = listingData?.categoryId;
    if (catId === 'other') {
      // For 'other' category, check the generic price field
      hasPrice = categoryData?.price && parseFloat(categoryData.price) > 0;
    } else if (catId === 'caterer') {
      hasPrice = (categoryData?.pricePerPlate && parseFloat(categoryData.pricePerPlate) > 0) || (categoryData?.pricePerPlateVeg && parseFloat(categoryData.pricePerPlateVeg) > 0);
    } else if (catId === 'mua') {
      hasPrice = categoryData?.bridalPrice && parseFloat(categoryData.bridalPrice) > 0;
    } else {
      // All other categories use the generic 'price' field
      hasPrice = categoryData?.price && parseFloat(categoryData.price) > 0;
    }
    requirements.push({ id: 'price', label: 'Set your pricing', met: hasPrice });
    
    // 4. Venue location is required for venue category
    if (catId === 'venue') {
      const hasVenueLocation = !!(data?.venueLatitude && data?.venueLongitude);
      requirements.push({ id: 'venueLocation', label: 'Venue location', met: hasVenueLocation });
    }
    
    // 5. For template-based listings, name must be changed from template name
    if (originalTemplate && listingData?.isDraft) {
      const nameChanged = data?.name !== originalTemplate.name;
      requirements.push({ id: 'templateRename', label: 'Rename service name', met: nameChanged });
    }
    
    // 6. Custom event type is required when "Other" event type is selected
    const otherEventType = eventTypes.find((et: any) => et.name === 'Other' || et.displayName === 'Other');
    const selectedEventTypeIds = data?.eventTypeIds || listingData?.eventTypeIds || [];
    const isOtherSelected = otherEventType && selectedEventTypeIds.includes(otherEventType.id);
    if (isOtherSelected) {
      // Check if custom event types exist (handle both array and string formats)
      const val = data?.customEventTypeName;
      let hasCustomEventType = false;
      if (val) {
        if (Array.isArray(val)) {
          hasCustomEventType = val.length > 0;
        } else if (typeof val === 'string') {
          // Try parsing as JSON array
          try {
            const parsed = JSON.parse(val);
            hasCustomEventType = Array.isArray(parsed) && parsed.length > 0;
          } catch {
            // Legacy string format
            hasCustomEventType = val.trim().length > 0;
          }
        }
      }
      requirements.push({ id: 'customEventType', label: 'Custom event type', met: hasCustomEventType });
    }
    
    return requirements;
  }, [pendingImageChanges, originalTemplate, eventTypes]);
  
  // Check if ready to publish
  const publishRequirements = useMemo(() => {
    if (!listing) return [];
    return getPublishRequirements(listing, isEditMode ? editForm : null, isEditMode ? categorySpecificData : undefined);
  }, [listing, editForm, categorySpecificData, isEditMode, getPublishRequirements]);
  
  const canPublish = useMemo(() => publishRequirements.every(r => r.met), [publishRequirements]);
  const missingRequirements = useMemo(() => publishRequirements.filter(r => !r.met), [publishRequirements]);

  const saveChanges = useCallback(async () => {
    if (!listing || !editForm) return;
    
    // Always require a name, even for drafts
    if (!editForm.name?.trim()) {
      toast.error('Please add a name to save');
      return;
    }
    
    // For template-based drafts, ONLY require name to be changed (other requirements are for publish only)
    if (listing.isDraft && originalTemplate && editForm.name === originalTemplate.name) {
      toast.error('Rename your service before saving');
      return;
    }
    
    // For venue category, require venue location even for drafts
    if (listing.categoryId === 'venue' && !editForm.venueLatitude && !editForm.venueAddress) {
      toast.error('Please set the venue location before saving');
      setExpandedSections(prev => ({ ...prev, serviceDetails: true }));
      setTimeout(() => {
        const venueField = document.querySelector('[data-listing-guide="preview-more-details"]');
        if (venueField) venueField.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    
    // For PUBLISHED listings, require all validations to pass
    if (!listing.isDraft && !canPublish) {
      toast.error('Please complete all required fields before saving');
      missingRequirements.forEach(r => toast.error(`Missing: ${r.label}`));
      return;
    }
    
    // Get price for payload
    let finalPrice = editForm.price;
    if (isItem && listing.categoryId !== 'other') {
      const p = categorySpecificData;
      finalPrice = p.pricePerPlate || p.pricePerPlateVeg || p.price || p.photographyPrice || p.videographyPrice || p.bridalPrice || editForm.price;
    }
    
    setIsSaving(true);
    try {
      // Start with current images from editForm
      let finalImages = editForm.images || [];
      
      // Process pending image changes if any
      if (pendingImageChanges) {
        console.log('📸 Processing pending image changes:', {
          filesToUpload: pendingImageChanges.filesToUpload.length,
          urlsToDelete: pendingImageChanges.urlsToDelete,
          finalOrder: pendingImageChanges.finalOrder.length,
          finalOrderItems: pendingImageChanges.finalOrder.map(item => typeof item === 'string' ? item : 'File')
        });
        
        const vendorId = localStorage.getItem('vendor_id') || 'unknown';
        const folder = `vendors/${vendorId}/listings/${listing.id}`;
        
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
        finalImages = pendingImageChanges.finalOrder.map(item => {
          if (typeof item === 'string') return item;
          return uploadedUrls.get(item) || '';
        }).filter(url => url !== '');
        
        console.log('📸 Final images to save:', finalImages);
        
        // Delete removed images from R2 (don't fail if delete fails)
        if (pendingImageChanges.urlsToDelete.length > 0) {
          console.log('🗑️ Deleting images from R2:', pendingImageChanges.urlsToDelete);
          deleteImages(pendingImageChanges.urlsToDelete).then(({ deleted, failed }) => {
            console.log('🗑️ Delete results:', { deleted, failed });
            if (deleted.length > 0) console.log('Deleted images from R2:', deleted.length);
            if (failed.length > 0) console.warn('Failed to delete some images:', failed.length);
          });
        }
      } else {
        console.log('📸 No pending image changes, using editForm.images:', editForm.images);
      }
      
      const payload: any = {
        name: editForm.name, description: editForm.description, price: parseFloat(finalPrice) || 0,
        images: finalImages, highlights: editForm.highlights.filter((h: string) => h.trim()),
        includedItemsText: editForm.includedItemsText, excludedItemsText: editForm.excludedItemsText,
        // For updates: send extraChargesJson directly (entity expects JSON string)
        extraChargesJson: JSON.stringify(
          editForm.extraChargesDetailed
            .filter((ec: any) => ec.name.trim() && ec.price)
            .map((ec: any) => ({ name: ec.name, price: parseFloat(ec.price) || 0 }))
        ),
        deliveryTime: editForm.deliveryTime, customNotes: editForm.customNotes,
        // For venue category, always set to CUSTOMER_VISITS (customers come to venue)
        serviceMode: listing.categoryId === 'venue' ? 'CUSTOMER_VISITS' : editForm.serviceMode, 
        openForNegotiation: editForm.openForNegotiation,
        eventTypeIds: editForm.eventTypeIds,
        // Custom event type names - only send if "Other" event type is selected
        // Serialize as JSON array string for storage
        customEventTypeName: (() => {
          const otherEventType = eventTypes.find((et: any) => et.name === 'Other' || et.displayName === 'Other');
          const isOtherSelected = otherEventType && (editForm.eventTypeIds || []).includes(otherEventType.id);
          if (!isOtherSelected) return undefined;
          const val = editForm.customEventTypeName;
          if (!val || (Array.isArray(val) && val.length === 0)) return undefined;
          // If it's an array, serialize to JSON string
          if (Array.isArray(val)) return JSON.stringify(val);
          return val; // Already a string
        })(),
        minimumQuantity: listing.categoryId === 'caterer' ? (editForm.minimumQuantity || 0) : undefined,
        categorySpecificData: isItem && listing.categoryId !== 'other' && Object.keys(categorySpecificData).length > 0 ? JSON.stringify(categorySpecificData) : undefined,
        // Explicitly preserve draft status - don't accidentally publish
        isDraft: listing.isDraft,
        // Venue location fields (only for venue category)
        ...(listing.categoryId === 'venue' && {
          venueAddress: editForm.venueAddress || undefined,
          venueCity: editForm.venueCity || undefined,
          venueLatitude: editForm.venueLatitude || undefined,
          venueLongitude: editForm.venueLongitude || undefined,
        }),
      };
      
      console.log('💾 Saving listing payload:', { 
        eventTypeIds: payload.eventTypeIds,
        editFormEventTypeIds: editForm.eventTypeIds,
        images: payload.images?.length 
      });
      
      const response = await vendorApi.updateListing(listing.id, payload);
      if (response.success) {
        // Save add-on changes if any
        if (addOnManagerRef.current?.hasChanges()) {
          try { await addOnManagerRef.current.saveAddOns(); } catch { /* toast already shown */ }
        }

        // Optimistic update - directly set the cache with new data
        const updatedListing = {
          ...listing,
          ...payload,
        };
        queryClient.setQueryData(['vendorListingDetails', listingId], updatedListing);
        
        // Clear pending image changes
        setPendingImageChanges(null);
        
        // Exit edit mode immediately with optimistic data
        setIsEditMode(false);
        setEditForm(null);
        setCategorySpecificData({});
        
        // Show success toast
        toast.success(listing.isDraft ? 'Draft saved!' : 'Listing updated!');
        
        // Advance listing guide from save-draft → publish
        const guidePhase = localStorage.getItem('vendor_listing_guide_phase');
        if (guidePhase === 'save-draft') {
          localStorage.setItem('vendor_listing_guide_phase', 'publish');
          window.dispatchEvent(new CustomEvent('listing-guide:advance-to-publish'));
        }
        
        // Refetch queries to ensure fresh data everywhere
        queryClient.invalidateQueries({ queryKey: ['vendorListingDetails', listingId] });
        queryClient.invalidateQueries({ queryKey: ['vendorListings'] });
        queryClient.invalidateQueries({ queryKey: ['myVendorListings'] });
        queryClient.invalidateQueries({ queryKey: ['listingAddOns', listingId] });
        // Force refetch the listings data so cards show updated images
        queryClient.refetchQueries({ queryKey: ['myVendorListings'] });
      } else { toast.error(response.message || 'Failed to update'); }
    } catch (err: any) { toast.error(err.message || 'Failed to update'); }
    finally { setIsSaving(false); }
  }, [listing, editForm, categorySpecificData, isItem, listingId, queryClient, pendingImageChanges, canPublish, missingRequirements]);

  // Highlight functions with inline editing support
  const addHighlight = () => { 
    if (draftHighlight.trim()) { 
      if (editingHighlightIndex !== null) {
        setEditForm((p: any) => ({ ...p, highlights: p.highlights.map((h: string, idx: number) => idx === editingHighlightIndex ? draftHighlight.trim() : h) }));
        setEditingHighlightIndex(null);
      } else {
        setEditForm((p: any) => ({ ...p, highlights: [...(p.highlights || []), draftHighlight.trim()] })); 
      }
      setDraftHighlight(''); setShowHighlightInput(false); 
    } 
  };
  const startEditHighlight = (i: number) => { setEditingHighlightIndex(i); setDraftHighlight(editForm?.highlights?.[i] || ''); setShowHighlightInput(true); };
  const removeHighlight = (i: number) => setEditForm((p: any) => ({ ...p, highlights: p.highlights.filter((_: any, idx: number) => idx !== i) }));
  
  // Included items functions with inline editing support
  const addIncludedItem = () => { 
    if (draftIncludedItem.trim()) { 
      if (editingIncludedIndex !== null) {
        setEditForm((p: any) => ({ ...p, includedItemsText: p.includedItemsText.map((h: string, idx: number) => idx === editingIncludedIndex ? draftIncludedItem.trim() : h) }));
        setEditingIncludedIndex(null);
      } else {
        setEditForm((p: any) => ({ ...p, includedItemsText: [...(p.includedItemsText || []), draftIncludedItem.trim()] })); 
      }
      setDraftIncludedItem(''); setShowIncludedItemInput(false); 
    } 
  };
  const startEditIncludedItem = (i: number) => { setEditingIncludedIndex(i); setDraftIncludedItem(editForm?.includedItemsText?.[i] || ''); setShowIncludedItemInput(true); };
  const removeIncludedItem = (i: number) => setEditForm((p: any) => ({ ...p, includedItemsText: p.includedItemsText.filter((_: any, idx: number) => idx !== i) }));
  
  // Excluded items functions with inline editing support
  const addExcludedItem = () => { 
    if (draftExcludedItem.trim()) { 
      if (editingExcludedIndex !== null) {
        setEditForm((p: any) => ({ ...p, excludedItemsText: p.excludedItemsText.map((h: string, idx: number) => idx === editingExcludedIndex ? draftExcludedItem.trim() : h) }));
        setEditingExcludedIndex(null);
      } else {
        setEditForm((p: any) => ({ ...p, excludedItemsText: [...(p.excludedItemsText || []), draftExcludedItem.trim()] })); 
      }
      setDraftExcludedItem(''); setShowExcludedItemInput(false); 
    } 
  };
  const startEditExcludedItem = (i: number) => { setEditingExcludedIndex(i); setDraftExcludedItem(editForm?.excludedItemsText?.[i] || ''); setShowExcludedItemInput(true); };
  const removeExcludedItem = (i: number) => setEditForm((p: any) => ({ ...p, excludedItemsText: p.excludedItemsText.filter((_: any, idx: number) => idx !== i) }));
  
  // Extra charges functions with inline editing support
  const addExtraCharge = () => { 
    if (draftExtraCharge.name.trim() && draftExtraCharge.price) { 
      if (editingExtraChargeIndex !== null) {
        setEditForm((p: any) => ({ ...p, extraChargesDetailed: p.extraChargesDetailed.map((c: any, idx: number) => idx === editingExtraChargeIndex ? { ...draftExtraCharge } : c) }));
        setEditingExtraChargeIndex(null);
      } else {
        setEditForm((p: any) => ({ ...p, extraChargesDetailed: [...(p.extraChargesDetailed || []), { ...draftExtraCharge }] })); 
      }
      setDraftExtraCharge({ name: '', price: '' }); setShowExtraChargeInput(false); 
    } 
  };
  const startEditExtraCharge = (i: number) => { 
    setEditingExtraChargeIndex(i); 
    setDraftExtraCharge({ name: editForm?.extraChargesDetailed?.[i]?.name || '', price: editForm?.extraChargesDetailed?.[i]?.price?.toString() || '' }); 
    setShowExtraChargeInput(true); 
  };
  const removeExtraCharge = (i: number) => setEditForm((p: any) => ({ ...p, extraChargesDetailed: p.extraChargesDetailed.filter((_: any, idx: number) => idx !== i) }));
  const toggleEventType = (id: number) => setEditForm((p: any) => {
    const isSelected = p.eventTypeIds.includes(id);
    // Prevent removing the last event type
    if (isSelected && p.eventTypeIds.length === 1) {
      return p; // Don't change state
    }
    return { ...p, eventTypeIds: isSelected ? p.eventTypeIds.filter((x: number) => x !== id) : [...p.eventTypeIds, id] };
  });

  // Publish draft listing
  const publishListing = useCallback(async () => {
    if (!listing) return;
    
    // Check publish requirements (includes template rename check)
    if (!canPublish) {
      missingRequirements.forEach(r => toast.error(`Missing: ${r.label}`));
      return;
    }
    
    setIsPublishing(true);
    try {
      const payload = {
        isDraft: false,
        isActive: true,
        // Clear template marker from customNotes
        customNotes: isTemplateBased ? '' : listing.customNotes,
      };
      
      const response = await vendorApi.updateListing(listing.id, payload);
      if (response.success) {
        localStorage.setItem('vendor_listing_guide_seen', 'true');
        localStorage.removeItem('vendor_listing_guide_phase');
        // Force immediate refetch so the DRAFT bar disappears
        await queryClient.refetchQueries({ queryKey: ['vendorListingDetails', listingId] });
        setShowPublishCelebration(true);
        queryClient.invalidateQueries({ queryKey: ['vendorListings'] });
        queryClient.invalidateQueries({ queryKey: ['myVendorListings'] });
      } else {
        toast.error(response.message || 'Failed to publish');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  }, [listing, isTemplateBased, templateId, listingId, queryClient, navigate, canPublish, missingRequirements]);

  // Delete listing state and function
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteListing = useCallback(async () => {
    if (!listing) return;
    
    setIsDeleting(true);
    try {
      const response = await vendorApi.deleteListing(listing.id);
      if (response.success) {
        toast.success('Listing deleted successfully!');
        queryClient.invalidateQueries({ queryKey: ['vendorListings'] });
        queryClient.invalidateQueries({ queryKey: ['myVendorListings'] });
        navigate('/vendor/listings');
      } else {
        toast.error(response.message || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [listing, queryClient, navigate]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><BrandedLoader fullScreen={false} message="Loading..." /></div>;
  if (!loading && (error || !listing)) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-sm"><CardContent className="p-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h2 className="text-lg font-bold mb-2">Not Found</h2>
        <p className="text-sm text-muted-foreground mb-4">{error || "Listing doesn't exist."}</p>
        <Button size="sm" onClick={() => navigate('/vendor/listings')}><ArrowLeft className="mr-1 h-4 w-4" />Back</Button>
      </CardContent></Card>
    </div>
  );

  // Use enhanced VendorPackagePreview for packages with bundled items
  if (isPackage && listing.includedItemIds && listing.includedItemIds.length > 0) {
    return (
      <VendorPackagePreview 
        listing={listing}
        listingId={listingId || ''}
        onBack={() => navigate('/vendor/listings')}
      />
    );
  }

  // Render wizard mode when editing
  if (isEditMode && useWizardMode && editForm) {
    return (
      <ListingEditWizard
        listing={listing}
        editForm={editForm}
        setEditForm={setEditForm}
        categorySpecificData={categorySpecificData}
        setCategorySpecificData={setCategorySpecificData}
        onSave={saveChanges}
        onCancel={cancelEditMode}
        isSaving={isSaving}
        canPublish={canPublish}
        publishRequirements={publishRequirements}
        pendingImageChanges={pendingImageChanges}
        setPendingImageChanges={setPendingImageChanges}
        highlights={editForm?.highlights || []}
        onAddHighlight={(text) => setEditForm((p: any) => ({ ...p, highlights: [...(p.highlights || []), text] }))}
        onRemoveHighlight={(index) => setEditForm((p: any) => ({ ...p, highlights: p.highlights.filter((_: any, i: number) => i !== index) }))}
        onEditHighlight={(index, text) => setEditForm((p: any) => ({ ...p, highlights: p.highlights.map((h: string, i: number) => i === index ? text : h) }))}
        onPublish={publishListing}
        isPublishing={isPublishing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Vendor Owner Banner */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                <Eye className="h-4 w-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">Preview</p>
                <p className="text-xs text-slate-400">How customers see this listing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={cancelEditMode} disabled={isSaving} className="h-8 text-xs gap-1.5">
                    <X className="h-3.5 w-3.5" />Cancel
                  </Button>
                  {listing.isDraft ? (
                    <Button size="sm" onClick={saveChanges} disabled={isSaving} data-listing-guide="preview-save-draft" className="h-8 text-xs gap-1.5 bg-slate-900 hover:bg-slate-800 text-white">
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save Draft
                    </Button>
                  ) : (
                    <div className="relative group">
                      <Button size="sm" onClick={saveChanges} disabled={isSaving || !canPublish}
                        className={cn("h-8 text-xs gap-1.5", canPublish ? "bg-slate-900 hover:bg-slate-800 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Save
                      </Button>
                      {!canPublish && (
                        <div className="absolute top-full right-0 mt-1 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          <p className="font-medium mb-1">Complete to save:</p>
                          {missingRequirements.map(r => (<p key={r.id} className="flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5 text-amber-400" />{r.label}</p>))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate('/vendor/listings')} className="h-8 text-xs gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" />Back
                  </Button>
                  <Button size="sm" onClick={enterEditMode} className="h-8 text-xs gap-1.5 bg-brand hover:bg-brand-dark text-white">
                    <Pencil className="h-3.5 w-3.5" />Edit Listing
                  </Button>
                  {listing.isDraft && (
                    <div className="relative group">
                      <Button size="sm" onClick={publishListing} disabled={isPublishing || !canPublish} data-listing-guide="preview-publish"
                        className={cn("h-8 text-xs gap-1.5", canPublish ? "bg-slate-900 hover:bg-slate-800 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>
                        {isPublishing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}Publish
                      </Button>
                      {!canPublish && (
                        <div className="absolute top-full right-0 mt-1 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          <p className="font-medium mb-1">Complete to publish:</p>
                          {missingRequirements.map(r => (<p key={r.id} className="flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5 text-amber-400" />{r.label}</p>))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditMode && (
        <div className={cn("border-b py-2 px-4", canPublish ? "bg-slate-50 border-slate-200" : "bg-amber-50/50 border-amber-200")}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200">
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">EDITING</span>
                </div>
                {listing.isDraft && <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Draft</span>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {publishRequirements.map((req) => (
                  <div key={req.id} className={cn("flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border",
                    req.met ? "bg-white text-slate-700 border-slate-200" : "bg-red-50 text-red-600 border-red-200")}>
                    {req.met ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{req.label}
                  </div>
                ))}
              </div>
              {canPublish ? (
                <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />All fields complete</span>
              ) : (
                <span className="text-[11px] text-amber-700 font-medium">{listing.isDraft ? 'Complete to publish' : 'Complete to save'}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {listing.isDraft && !isEditMode && (
        <div className="bg-slate-50 border-b border-slate-200 py-3 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-200 px-3 py-1.5 rounded-lg">
                  <span className="text-sm">📝</span>
                  <span className="text-xs font-medium text-slate-700">DRAFT</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 transition-all duration-300" style={{ width: `${(publishRequirements.filter(r => r.met).length / publishRequirements.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{publishRequirements.filter(r => r.met).length}/{publishRequirements.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {publishRequirements.map((req) => (
                  <div key={req.id} className={cn("flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border",
                    req.met ? "bg-white text-slate-700 border-slate-200" : "bg-red-50 text-red-600 border-red-200")}>
                    {req.met ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{req.label}
                  </div>
                ))}
              </div>
              {canPublish ? (
                <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" /><span className="text-sm font-medium">Ready to Publish</span>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-medium max-w-[150px] text-right">Complete missing items to publish</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Full-width image grid (view mode only) */}
        {!isEditMode && (
          <div className="rounded-2xl overflow-hidden mb-6">
            {listing.images?.length >= 5 ? (
              /* 5+ images: 1 large left + 4 small right grid */
              <div className="grid grid-cols-4 gap-1.5 h-[340px] sm:h-[420px]">
                <button onClick={() => { setSelectedImageIndex(0); setShowAllPhotos(true); }} className="relative col-span-2 row-span-2 overflow-hidden group cursor-pointer">
                  <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(1); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[1]} alt={`${listing.name} 2`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(2); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[2]} alt={`${listing.name} 3`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(3); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[3]} alt={`${listing.name} 4`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(4); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[4]} alt={`${listing.name} 5`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {listing.images.length > 5 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">+{listing.images.length - 5} more</span>
                    </div>
                  )}
                </button>
              </div>
            ) : listing.images?.length === 4 ? (
              /* 4 images: 1 large left + 3 right (1 top spanning full, 2 bottom) */
              <div className="grid grid-cols-4 gap-1.5 h-[340px] sm:h-[420px]">
                <button onClick={() => { setSelectedImageIndex(0); setShowAllPhotos(true); }} className="relative col-span-2 row-span-2 overflow-hidden group cursor-pointer">
                  <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(1); setShowAllPhotos(true); }} className="relative col-span-2 overflow-hidden group cursor-pointer">
                  <img src={listing.images[1]} alt={`${listing.name} 2`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(2); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[2]} alt={`${listing.name} 3`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(3); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[3]} alt={`${listing.name} 4`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
              </div>
            ) : listing.images?.length === 3 ? (
              /* 3 images: 1 large left + 2 stacked right */
              <div className="grid grid-cols-3 gap-1.5 h-[340px] sm:h-[420px]">
                <button onClick={() => { setSelectedImageIndex(0); setShowAllPhotos(true); }} className="relative col-span-2 row-span-2 overflow-hidden group cursor-pointer">
                  <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(1); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[1]} alt={`${listing.name} 2`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(2); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[2]} alt={`${listing.name} 3`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
              </div>
            ) : listing.images?.length === 2 ? (
              <div className="grid grid-cols-2 gap-1.5 h-[300px] sm:h-[400px]">
                <button onClick={() => { setSelectedImageIndex(0); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
                <button onClick={() => { setSelectedImageIndex(1); setShowAllPhotos(true); }} className="relative overflow-hidden group cursor-pointer">
                  <img src={listing.images[1]} alt={`${listing.name} 2`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
              </div>
            ) : listing.images?.length === 1 ? (
              <button onClick={() => { setSelectedImageIndex(0); setShowAllPhotos(true); }} className="relative w-full h-[300px] sm:h-[420px] overflow-hidden group cursor-pointer">
                <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </button>
            ) : (
              <div className="w-full h-[240px] bg-slate-50 flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200">
                <Camera className="h-14 w-14 text-slate-200" />
                <span className="text-xs text-slate-300">No photos yet</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left - Main */}
          <div className="lg:col-span-2 space-y-0">

            {/* Images — edit mode only (view mode is full-width above) */}
            {isEditMode && (
              <Card data-listing-guide="preview-photos"><CardContent className="p-4">
                <Label className="text-xs font-medium mb-2 block">Photos <span className="text-red-500">*</span></Label>
                <ImageUpload 
                  images={editForm?.images || []} 
                  onChange={(imgs) => setEditForm((p: any) => ({ ...p, images: imgs }))} 
                  onPendingChanges={setPendingImageChanges}
                  maxImages={10}
                />
                {(editForm?.images?.length === 0 && !pendingImageChanges?.filesToUpload?.length) && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Add at least one image to showcase your listing
                  </p>
                )}
              </CardContent></Card>
            )}

            {/* Header */}
            {isEditMode ? (
              <Card data-listing-guide="preview-name"><CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs">Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={editForm?.name || ''}
                    onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))}
                    className="h-9 text-sm mt-1"
                    data-template-original-name={originalTemplate?.name || ''}
                  />
                  {(!editForm?.name || !editForm.name.trim()) && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Service name is required
                    </p>
                  )}
                </div>
                <div><Label className="text-xs">Description</Label><Textarea value={editForm?.description || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} className="text-sm mt-1" /></div>
              </CardContent></Card>
            ) : (
              <div className="pt-5 pb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight">{listing.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{listing.vendorName}</span>
                  {listing.vendorCity && <><span className="text-slate-200">·</span><span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{listing.vendorCity}</span></>}
                  {listing.vendorRating > 0 && <><span className="text-slate-200">·</span><span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-brand text-brand" />{listing.vendorRating.toFixed(1)}</span></>}
                  <span className="text-slate-200">·</span>
                  <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{listing.categoryName || listing.categoryId}</span>
                  <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{listing.type === 'PACKAGE' ? 'Package' : 'Service'}</span>
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", listing.isActive ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-400")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", listing.isActive ? "bg-brand" : "bg-slate-300")} />
                    {listing.isActive ? 'Live' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}

            {/* ===== TAB BAR (view mode only) ===== */}
            {!isEditMode && (() => {
              const hasDetails = !!listing.categorySpecificData;
              const hasEvents = listing.eventTypeIds?.length > 0;
              const hasNotes = !!listing.customNotes;
              const tabs = [
                { id: 'overview', label: 'Overview' },
                { id: 'pricing', label: 'Pricing' },
                ...(hasDetails ? [{ id: 'details', label: 'Details' }] : []),
                ...(hasEvents ? [{ id: 'events', label: 'Events' }] : []),
                ...(hasNotes ? [{ id: 'notes', label: 'Notes' }] : []),
              ];
              return (
                <div className="border-b border-slate-200 sticky top-0 bg-white z-20">
                  <div className="flex gap-0 overflow-x-auto">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors relative",
                          activeTab === tab.id
                            ? "text-slate-900"
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ===== TAB: OVERVIEW ===== */}
            {!isEditMode && activeTab === 'overview' && (
              <div className="space-y-0">
                {/* Description */}
                {listing.description && (
                  <div className="py-6 border-b border-slate-100">
                    <p className="text-[15px] text-slate-600 leading-relaxed">{listing.description}</p>
                  </div>
                )}

                {/* Key Highlights */}
                {displayHighlights.length > 0 && (
                  <div className="py-6 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Key Highlights</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {displayHighlights.map((item: string, i: number) => (
                        <div key={i} className="relative rounded-xl bg-gradient-to-br from-brand/[0.05] to-brand/[0.10] border border-brand/10 px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="h-4 w-4 text-brand" />
                            </div>
                            <span className="text-sm font-medium text-slate-800">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* Add-Ons (decorator only) */}
                {listing.categoryId === 'decorator' && addOnsList.length > 0 && (
                  <div className="py-6 border-b border-slate-100" id="addon-manager-section">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-semibold text-slate-900">Add-Ons & Activities</h3>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{addOnsList.length} available</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {addOnsList.map((a: any) => {
                        const catalogItem = a.description ? CATALOG_BY_ID.get(a.description) : null;
                        const imgUrl = a.imageUrl || catalogItem?.imageUrl;
                        return (
                          <div key={a.id} className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white group shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                              {imgUrl ? (
                                <img src={imgUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                  <Package className="h-8 w-8 text-slate-200" />
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-medium text-slate-900 line-clamp-1">{a.title}</p>
                              <p className="text-sm font-semibold text-slate-700 mt-1">₹{Number(a.price).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bundled Items (packages only) */}
                {isPackage && linkedItems.length > 0 && (
                  <div className="py-6 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-900 mb-5">What's Included · {linkedItems.length} services</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {linkedItems.map((item: any) => (
                        <div key={item.id} className="group rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="aspect-square bg-slate-100 relative overflow-hidden">
                            {item.images?.[0] ? (
                              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="h-6 w-6 text-slate-300" /></div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.categoryName || 'Service'}</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1.5">₹{Number(item.price).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== TAB: PRICING ===== */}
            {!isEditMode && activeTab === 'pricing' && (
              <div className="py-6 space-y-5">
                {/* Price hero + badges */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Price</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-brand/60">₹</span>
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">{displayPrice.toLocaleString('en-IN')}</span>
                        {priceLabel && <span className="text-sm text-slate-400 ml-1">{priceLabel}</span>}
                        {isItem && listing.unit && !priceLabel && <span className="text-sm text-slate-400 ml-1">/{listing.unit}</span>}
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border", listing.openForNegotiation ? "border-brand/20 bg-brand/5 text-brand" : "border-slate-100 bg-slate-50 text-slate-400")}>
                      <IndianRupee className="h-3 w-3" />
                      {listing.openForNegotiation ? 'Negotiable' : 'Fixed'}
                    </span>
                  </div>

                  {/* Min plates for caterer */}
                  {listing.categoryId === 'caterer' && (() => {
                    let minPlates = listing.minimumQuantity;
                    if ((!minPlates || minPlates <= 1) && listing.categorySpecificData) {
                      try {
                        const csd = typeof listing.categorySpecificData === 'string' ? JSON.parse(listing.categorySpecificData) : listing.categorySpecificData;
                        if (csd.minOrderPlates && parseInt(csd.minOrderPlates) > 0) minPlates = parseInt(csd.minOrderPlates);
                      } catch {}
                    }
                    return minPlates > 0 ? (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                        <Users className="h-4 w-4 text-slate-400" />
                        Minimum order: {minPlates} plates
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Category-specific pricing tiers */}
                {listing.categorySpecificData && (() => {
                  try {
                    const catData = JSON.parse(listing.categorySpecificData);
                    const cards: { label: string; value: string; sublabel?: string }[] = [];

                    if (listing.categoryId === 'caterer') {
                      if (!catData.pricePerPlate && catData.pricePerPlateNonVeg > 0) cards.push({ label: 'Non-Veg', value: `₹${Number(catData.pricePerPlateNonVeg).toLocaleString('en-IN')}`, sublabel: 'per plate' });
                      if (catData.minGuests) cards.push({ label: 'Min Guests', value: String(catData.minGuests) });
                      if (catData.maxGuests > 0) cards.push({ label: 'Max Guests', value: String(catData.maxGuests) });
                    } else if (listing.categoryId === 'mua') {
                      if (catData.familyPrice > 0) cards.push({ label: 'Family', value: `₹${Number(catData.familyPrice).toLocaleString('en-IN')}`, sublabel: 'per person' });
                      if (catData.guestPrice > 0) cards.push({ label: 'Guest', value: `₹${Number(catData.guestPrice).toLocaleString('en-IN')}`, sublabel: 'per person' });
                      if (catData.trialPrice > 0) cards.push({ label: 'Trial', value: `₹${Number(catData.trialPrice).toLocaleString('en-IN')}`, sublabel: 'session' });
                    } else if (listing.categoryId === 'dj' || listing.categoryId === 'dj-entertainment' || listing.categoryId === 'live-music') {
                      if (catData.extraHourPrice > 0) cards.push({ label: 'Extra Hour', value: `₹${Number(catData.extraHourPrice).toLocaleString('en-IN')}` });
                    } else if (listing.categoryId === 'sound-lights') {
                      if (catData.extraDayPrice > 0) cards.push({ label: 'Extra Day', value: `₹${Number(catData.extraDayPrice).toLocaleString('en-IN')}` });
                    } else if (listing.categoryId === 'venue') {
                      if (catData.peakSeasonSurcharge > 0) cards.push({ label: 'Peak Season', value: `+${catData.peakSeasonSurcharge}%`, sublabel: 'surcharge' });
                    }

                    if (cards.length === 0) return null;
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
                        {cards.map((card, i) => (
                          <div key={i} className="flex items-center justify-between px-5 py-4">
                            <div>
                              <p className="text-sm text-slate-500">{card.label}</p>
                              {card.sublabel && <p className="text-xs text-slate-400">{card.sublabel}</p>}
                            </div>
                            <p className="text-base font-semibold text-slate-900">{card.value}</p>
                          </div>
                        ))}
                      </div>
                    );
                  } catch { return null; }
                })()}

                {/* Extra Charges */}
                {parsedExtraCharges.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-900">Extra Charges</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {parsedExtraCharges.map((c, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-3.5">
                          <span className="text-sm text-slate-600">{c.name}</span>
                          <span className="text-sm font-semibold text-slate-900">+ ₹{Number(c.price).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Included / Excluded */}
                {(() => {
                  // Merge listing-level includes with category-specific includes (e.g. caterer's "Included with Service")
                  let includedItems: string[] = listing.includedItemsText?.length > 0 ? [...listing.includedItemsText] : [];
                  if (listing.categorySpecificData) {
                    try {
                      const catData = typeof listing.categorySpecificData === 'string' ? JSON.parse(listing.categorySpecificData) : listing.categorySpecificData;
                      if (catData.includes) {
                        const catIncludes = Array.isArray(catData.includes) ? catData.includes : (typeof catData.includes === 'string' ? catData.includes.split(',').map((s: string) => s.trim()) : []);
                        // Add category includes that aren't already in the list
                        catIncludes.forEach((item: string) => {
                          if (!includedItems.some(existing => existing.toLowerCase() === item.toLowerCase())) {
                            includedItems.push(item);
                          }
                        });
                      }
                    } catch {}
                  }
                  const excludedItems: string[] = listing.excludedItemsText?.length > 0 ? listing.excludedItemsText : [];
                  if (includedItems.length === 0 && excludedItems.length === 0) return null;
                  return (
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                      {includedItems.length > 0 && (
                        <div className="p-5">
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">What's Included</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            {includedItems.map((item: string, i: number) => (
                              <div key={i} className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center flex-shrink-0"><CheckCircle2 className="h-3 w-3 text-white" /></div>
                                <span className="text-sm text-slate-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {excludedItems.length > 0 && (
                        <div className={cn("p-5", includedItems.length > 0 && "border-t border-slate-100")}>
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">Not Included</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            {excludedItems.map((item: string, i: number) => (
                              <div key={i} className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><XCircle className="h-3 w-3 text-slate-400" /></div>
                                <span className="text-sm text-slate-400">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ===== TAB: DETAILS ===== */}
            {!isEditMode && activeTab === 'details' && (
              <div className="py-6 space-y-6">
                {listing.categorySpecificData ? (
                  <CategorySpecificDisplay categoryId={listing.categoryId} categorySpecificData={listing.categorySpecificData} hidePricing />
                ) : listing.isDraft && listing.categoryId && listing.categoryId !== 'other' ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Category details not added yet</p>
                    <p className="text-xs text-slate-400 mt-1">Click Edit to add pricing and details</p>
                  </div>
                ) : null}

              </div>
            )}


            {/* ===== TAB: EVENTS ===== */}
            {!isEditMode && activeTab === 'events' && (
              <div className="py-6">
                <h3 className="text-base font-semibold text-slate-900 mb-2">Suitable Event Types</h3>
                <p className="text-sm text-slate-400 mb-5">This service is a great fit for these events</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {listing.eventTypeIds?.map((id: number) => {
                    const eventIcons: Record<number, string> = {
                      1: '💒', 2: '🎂', 3: '💝', 4: '🏢', 5: '💍',
                      6: '👶', 7: '🌙', 8: '🎵', 9: '✨'
                    };
                    const isOther = id === 9 || eventTypeNames[id] === 'Other';
                    if (isOther && listing.customEventTypeName) {
                      let customTypes: string[] = [];
                      const val = listing.customEventTypeName;
                      if (Array.isArray(val)) { customTypes = val; }
                      else { try { const parsed = JSON.parse(val); if (Array.isArray(parsed)) customTypes = parsed; else customTypes = [val]; } catch { customTypes = val.split(',').map((s: string) => s.trim()).filter(Boolean); } }
                      return customTypes.map((customType, idx) => (
                        <div key={`${id}-${idx}`} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-brand/[0.04] border border-brand/10">
                          <span className="text-base">✨</span>
                          <span className="text-sm font-medium text-slate-700">{customType}</span>
                        </div>
                      ));
                    }
                    return (
                      <div key={id} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-brand/[0.04] border border-brand/10">
                        <span className="text-base">{eventIcons[id] || '🎉'}</span>
                        <span className="text-sm font-medium text-slate-700">{eventTypeNames[id] || `Event ${id}`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== TAB: NOTES ===== */}
            {!isEditMode && activeTab === 'notes' && listing.customNotes && (
              <div className="py-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Additional Notes</h3>
                <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-100">
                  <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{listing.customNotes}</p>
                </div>
              </div>
            )}

            {/* ===== EDIT MODE SECTIONS (unchanged) ===== */}

            {/* Edit: Key Highlights */}
            {isEditMode && (
              <Card className="overflow-hidden border-0 shadow-md bg-white">
                <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-4 py-3 relative overflow-hidden">
                  <div className="relative flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      <Zap className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-white">Key Highlights</h3>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="space-y-1.5">
                    {(editForm?.highlights || []).map((item: string, i: number) => (
                      editingHighlightIndex === i ? null : (
                        <div key={i} className="group flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 hover:shadow-sm transition-all">
                          <div className="p-1 rounded bg-emerald-100"><CheckCircle2 className="h-3 w-3 text-emerald-600" /></div>
                          <span className="flex-1 text-xs font-medium text-emerald-900">{item}</span>
                          <Button size="sm" variant="ghost" onClick={() => startEditHighlight(i)} className="h-6 w-6 p-0 text-slate-500 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => removeHighlight(i)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></Button>
                        </div>
                      )
                    ))}
                    {showHighlightInput ? (
                      <div className="flex items-center gap-2 p-2 rounded-lg border-2 border-primary bg-primary/5">
                        <div className="p-1 rounded bg-primary/20">{editingHighlightIndex !== null ? <Pencil className="h-3 w-3 text-primary" /> : <Plus className="h-3 w-3 text-primary" />}</div>
                        <Input value={draftHighlight} onChange={(e) => setDraftHighlight(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addHighlight(); if (e.key === 'Escape') { setShowHighlightInput(false); setDraftHighlight(''); setEditingHighlightIndex(null); } }} className="flex-1 h-7 text-xs border-0 bg-transparent focus-visible:ring-0" placeholder={editingHighlightIndex !== null ? "Edit highlight..." : "Type a highlight..."} autoFocus />
                        <Button size="sm" onClick={addHighlight} disabled={!draftHighlight.trim()} className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">{editingHighlightIndex !== null ? 'Save' : 'Add'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowHighlightInput(false); setDraftHighlight(''); setEditingHighlightIndex(null); }} className="h-7 w-7 p-0 text-slate-500"><X className="h-3 w-3" /></Button>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setShowHighlightInput(true)} className="w-full h-8 text-xs border border-dashed border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 rounded-lg"><Plus className="h-3 w-3 mr-1" />Add Highlight</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit: Category Details */}
            {isEditMode && listing.categoryId && listing.categoryId !== 'other' && (
                <Card className="overflow-hidden border-0 shadow-md bg-white" data-listing-guide="preview-pricing">
                  <div className="bg-gradient-to-r from-primary via-violet-600 to-purple-600 px-4 py-3 relative overflow-hidden">
                    <div className="relative flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                        <Package className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white">Category Details</h3>
                          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] text-white font-medium">Required</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <CategoryFieldRenderer 
                      categoryId={listing.categoryId} 
                      values={categorySpecificData} 
                      onChange={setCategorySpecificData} 
                      errors={{}} 
                      listingType={listing.type}
                      hidePackageDetails={true}
                    />
                    {(() => {
                      const p = categorySpecificData;
                      const hasPrice = 
                        (listing.categoryId === 'caterer' && (p.pricePerPlate && parseFloat(p.pricePerPlate) > 0 || p.pricePerPlateVeg && parseFloat(p.pricePerPlateVeg) > 0)) ||
                        (listing.categoryId === 'mua' && p.bridalPrice && parseFloat(p.bridalPrice) > 0) ||
                        (['photographer', 'photography-videography', 'photo-video', 'venue', 'decorator', 'dj', 'dj-entertainment', 'sound-lights', 'live-music', 'cinematographer', 'videographer'].includes(listing.categoryId) && p.price && parseFloat(p.price) > 0);
                      if (!hasPrice && listing.categoryId !== 'other') {
                        return (
                          <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-100"><AlertCircle className="h-3.5 w-3.5 text-amber-600" /></div>
                            <div><p className="text-xs font-semibold text-amber-800">Price is required</p><p className="text-[10px] text-amber-600">Fill in pricing above to continue</p></div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
            )}

            {/* Edit: Add-Ons (decorator only) */}
            {listingId && isEditMode && listing.categoryId === 'decorator' && (
              <AddOnManager
                ref={addOnManagerRef}
                listingId={listingId}
                listingType={listing?.type || ''}
                isEditMode={isEditMode}
              />
            )}

            <div data-listing-guide="preview-all-details" className="space-y-3">
            {/* Edit: Service Details (collapsible) */}
            {isEditMode && (
              <Card className="overflow-hidden border border-slate-200 shadow-none bg-white" data-listing-guide="preview-more-details">
                <button type="button" onClick={() => toggleSection('serviceDetails')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <h3 className="text-sm font-semibold text-slate-900">Service Details</h3>
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", expandedSections.serviceDetails ? "rotate-180" : "")} />
                </button>
                <div className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  expandedSections.serviceDetails ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <CardContent className="p-3">
                    {true ? (
                      <div className="space-y-3">
                        {/* Delivery Time Section - Hide for DJ and Venue categories */}
                        {listing.categoryId !== 'dj-entertainment' && listing.categoryId !== 'venue' && (
                          <>
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-blue-100">
                                  <Clock className="h-3 w-3 text-blue-600" />
                                </div>
                                <Label className="text-xs font-medium text-slate-700">Delivery Time</Label>
                              </div>
                              <DeliveryTimeInput value={editForm?.deliveryTime || ''} onChange={(v) => setEditForm((p: any) => ({ ...p, deliveryTime: v }))} />
                            </div>

                            <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                          </>
                        )}

                        {/* Service Mode Section - Hide for venue category (customers always come to venue) */}
                        {listing.categoryId !== 'venue' && (
                          <>
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-violet-100">
                                  <MapPin className="h-3 w-3 text-violet-600" />
                                </div>
                                <Label className="text-xs font-medium text-slate-700">Service Mode</Label>
                              </div>
                              <ServiceModeSelector value={editForm?.serviceMode || 'BOTH'} onChange={(v) => setEditForm((p: any) => ({ ...p, serviceMode: v }))} label="" />
                            </div>

                            <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                          </>
                        )}

                        {/* Negotiation Toggle */}
                        <div 
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200",
                            editForm?.openForNegotiation 
                              ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200" 
                              : "bg-slate-50 border border-transparent hover:border-slate-200"
                          )}
                          onClick={() => setEditForm((p: any) => ({ ...p, openForNegotiation: !p?.openForNegotiation }))}
                        >
                          <div className={cn(
                            "p-1.5 rounded transition-all",
                            editForm?.openForNegotiation ? "bg-emerald-100" : "bg-slate-100"
                          )}>
                            <IndianRupee className={cn(
                              "h-3.5 w-3.5",
                              editForm?.openForNegotiation ? "text-emerald-600" : "text-slate-400"
                            )} />
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              "text-xs font-medium",
                              editForm?.openForNegotiation ? "text-emerald-800" : "text-slate-700"
                            )}>Open for Negotiation</p>
                          </div>
                          <div className={cn(
                            "w-9 h-5 rounded-full p-0.5 transition-all duration-300",
                            editForm?.openForNegotiation ? "bg-emerald-500" : "bg-slate-300"
                          )}>
                            <div className={cn(
                              "w-4 h-4 rounded-full bg-white shadow transition-all duration-300",
                              editForm?.openForNegotiation ? "translate-x-4" : "translate-x-0"
                            )} />
                          </div>
                        </div>

                        {/* Minimum Order for Caterers */}
                        {listing.categoryId === 'caterer' && (
                          <>
                            <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-amber-100">
                                  <Users className="h-3 w-3 text-amber-600" />
                                </div>
                                <Label className="text-xs font-medium text-slate-700">Minimum Order</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="number" 
                                  value={editForm?.minimumQuantity || ''} 
                                  onChange={(e) => setEditForm((p: any) => ({ ...p, minimumQuantity: parseInt(e.target.value) || 0 }))} 
                                  className="h-7 text-xs w-20 text-center font-medium" 
                                  placeholder="0"
                                />
                                <span className="text-xs text-slate-500">plates min</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Venue Location - Only for venue category */}
                        {listing.categoryId === 'venue' && (
                          <>
                            <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-emerald-100">
                                  <MapPin className="h-3 w-3 text-emerald-600" />
                                </div>
                                <Label className="text-xs font-medium text-slate-700">Venue Location <span className="text-red-500">*</span></Label>
                              </div>
                              <p className="text-[10px] text-slate-500 mb-2">
                                Enter the exact location of this venue to help customers find you
                              </p>
                              <LocationAutocomplete
                                value={editForm?.venueLatitude && editForm?.venueLongitude ? {
                                  name: editForm.venueAddress || '',
                                  latitude: editForm.venueLatitude,
                                  longitude: editForm.venueLongitude,
                                } : null}
                                onChange={(location: LocationDTO | null) => {
                                  if (location) {
                                    const parts = location.name.split(',').map(p => p.trim());
                                    const city = parts.length > 1 ? parts[parts.length - 1] : parts[0];
                                    setEditForm((p: any) => ({
                                      ...p,
                                      venueAddress: location.name,
                                      venueCity: city,
                                      venueLatitude: location.latitude,
                                      venueLongitude: location.longitude,
                                    }));
                                  } else {
                                    setEditForm((p: any) => ({
                                      ...p,
                                      venueAddress: '',
                                      venueCity: '',
                                      venueLatitude: null,
                                      venueLongitude: null,
                                    }));
                                  }
                                }}
                                placeholder="Search venue address..."
                                required
                                bangaloreOnly={false}
                              />
                              {editForm?.venueAddress && (
                                <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                  <p className="text-xs text-green-700">
                                    ✓ Location set: {editForm.venueAddress}
                                  </p>
                                </div>
                              )}
                              {!editForm?.venueLatitude && !editForm?.venueAddress && (
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1" data-listing-guide="venue-location-missing">
                                  <AlertCircle className="h-3 w-3" />
                                  Venue location is required
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </div>
              </Card>
            )}

            {/* 4. EVENT TYPES */}
            {isEditMode && (
              <Card className="overflow-hidden border border-slate-200 shadow-none bg-white">
                <button type="button" onClick={() => toggleSection('eventTypes')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">Event Types</h3>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", expandedSections.eventTypes ? "rotate-180" : "")} />
                </button>
                <div className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  expandedSections.eventTypes ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <CardContent className="p-3">
                    {true ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                          {eventTypes.map((et: any) => {
                            const sel = (editForm?.eventTypeIds || []).includes(et.id);
                            const isLastSelected = sel && (editForm?.eventTypeIds || []).length === 1;
                            const eventIcons: Record<string, string> = {
                              'Wedding': '💒', 'Birthday': '🎂', 'Anniversary': '💝', 
                              'Corporate': '🏢', 'Corporate Event': '🏢',
                              'Engagement': '💍', 'Baby Shower': '👶', 
                              'Nightlife': '🌙', 'Nightlife & Parties': '🌙',
                              'Concert': '🎵', 'Concerts & Live Shows': '🎵',
                              'Other': '✨'
                            };
                            const icon = eventIcons[et.name] || eventIcons[et.displayName] || '🎉';
                            return (
                              <button
                                key={et.id}
                                type="button"
                                onClick={() => !isLastSelected && toggleEventType(et.id)}
                                disabled={isLastSelected}
                                className={cn(
                                  "relative overflow-hidden rounded-lg p-2 text-left transition-all duration-200 border",
                                  sel 
                                    ? "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-300" 
                                    : "bg-slate-50 border-slate-200 hover:border-slate-300",
                                  isLastSelected && "opacity-60 cursor-not-allowed"
                                )}
                              >
                                {sel && (
                                  <div className="absolute top-1 right-1">
                                    <CheckCircle2 className="h-3 w-3 text-violet-600" />
                                  </div>
                                )}
                                <div className="text-base mb-0.5">{icon}</div>
                                <p className={cn(
                                  "text-[10px] font-medium truncate",
                                  sel ? "text-violet-800" : "text-slate-700"
                                )}>{et.displayName || et.name}</p>
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Custom Event Type Input - shown when "Other" is selected */}
                        {(() => {
                          const otherEventType = eventTypes.find((et: any) => 
                            et.name === 'Other' || et.displayName === 'Other'
                          );
                          const isOtherSelected = otherEventType && (editForm?.eventTypeIds || []).includes(otherEventType.id);
                          
                          if (!isOtherSelected) return null;
                          
                          // Parse custom event types - handle both array and legacy string format
                          const customTypes: string[] = (() => {
                            const val = editForm?.customEventTypeName;
                            if (!val) return [];
                            if (Array.isArray(val)) return val;
                            // Try parsing as JSON array
                            try {
                              const parsed = JSON.parse(val);
                              if (Array.isArray(parsed)) return parsed;
                            } catch {}
                            // Legacy: single string or comma-separated
                            return val.split(',').map((s: string) => s.trim()).filter(Boolean);
                          })();
                          
                          return (
                            <div className="p-3 border border-amber-200 rounded-lg bg-amber-50/50">
                              <Label className="text-xs font-medium text-amber-800">
                                What type of events? *
                              </Label>
                              <p className="text-[10px] text-amber-600 mb-2">
                                Add the event types you're targeting (press Enter to add)
                              </p>
                              
                              {/* Display existing custom event types as tags */}
                              {customTypes.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {customTypes.map((type, idx) => (
                                    <div 
                                      key={idx}
                                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800"
                                    >
                                      <span className="text-xs font-medium">{type}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newTypes = customTypes.filter((_, i) => i !== idx);
                                          setEditForm((p: any) => ({ 
                                            ...p, 
                                            customEventTypeName: newTypes.length > 0 ? newTypes : '' 
                                          }));
                                        }}
                                        className="p-0.5 hover:bg-amber-200 rounded-full transition-colors"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Input for adding new custom event types */}
                              <Input
                                placeholder="Type event name and press Enter..."
                                className="h-8 text-xs bg-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.currentTarget;
                                    const value = input.value.trim();
                                    if (value && !customTypes.includes(value)) {
                                      const newTypes = [...customTypes, value];
                                      setEditForm((p: any) => ({ 
                                        ...p, 
                                        customEventTypeName: newTypes 
                                      }));
                                      input.value = '';
                                    }
                                  }
                                }}
                              />
                              <p className="text-[9px] text-amber-500 mt-1">
                                💡 Examples: Haldi, Mehendi, Sangeet, Reception, House Warming, Puja
                              </p>
                            </div>
                          );
                        })()}
                        
                        {(editForm?.eventTypeIds || []).length === 1 && (
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200">
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                            <p className="text-[10px] text-amber-700">Select another first to change</p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </div>
              </Card>
            )}

            {/* 5. WHAT'S INCLUDED/EXCLUDED */}
            {isEditMode && (
              <Card className="overflow-hidden border border-slate-200 shadow-none bg-white">
                <button type="button" onClick={() => toggleSection('includedExcluded')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <h3 className="text-sm font-semibold text-slate-900">What's Included & Excluded</h3>
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", expandedSections.includedExcluded ? "rotate-180" : "")} />
                </button>
                <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", expandedSections.includedExcluded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
                  <CardContent className="p-3 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-500" /><h4 className="text-xs font-medium text-slate-900">Included</h4></div>
                      <div className="space-y-1 p-2 rounded-lg bg-emerald-50/50 border border-emerald-200/60">
                        {(editForm?.includedItemsText || []).map((item: string, i: number) => (
                          editingIncludedIndex === i ? null : (
                            <div key={i} className="group flex items-center gap-2 p-1.5 rounded bg-white border border-emerald-200 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" /><span className="flex-1 text-slate-700">{item}</span>
                              <Button size="sm" variant="ghost" onClick={() => startEditIncludedItem(i)} className="h-5 w-5 p-0 text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-2.5 w-2.5" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => removeIncludedItem(i)} className="h-5 w-5 p-0 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-2.5 w-2.5" /></Button>
                            </div>
                          )
                        ))}
                        {showIncludedItemInput ? (
                          <div className="flex items-center gap-2 p-1.5 rounded border-2 border-primary bg-white">
                            {editingIncludedIndex !== null ? <Pencil className="h-3 w-3 text-primary" /> : <Plus className="h-3 w-3 text-primary" />}
                            <Input value={draftIncludedItem} onChange={(e) => setDraftIncludedItem(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addIncludedItem(); if (e.key === 'Escape') { setShowIncludedItemInput(false); setDraftIncludedItem(''); setEditingIncludedIndex(null); } }} className="flex-1 h-6 text-xs border-0 bg-transparent focus-visible:ring-0" placeholder={editingIncludedIndex !== null ? "Edit item..." : "Add item..."} autoFocus />
                            <Button size="sm" onClick={addIncludedItem} disabled={!draftIncludedItem.trim()} className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700">{editingIncludedIndex !== null ? 'Save' : 'Add'}</Button>
                          </div>
                        ) : (
                          <Button variant="outline" onClick={() => setShowIncludedItemInput(true)} className="w-full h-7 text-[10px] border-dashed border-emerald-400 text-emerald-700 hover:bg-emerald-100"><Plus className="h-3 w-3 mr-1" />Add</Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5"><XCircle className="h-3 w-3 text-slate-400" /><h4 className="text-xs font-medium text-slate-900">Not Included</h4></div>
                      <div className="space-y-1 p-2 rounded-lg bg-red-50/50 border border-red-200/60">
                        {(editForm?.excludedItemsText || []).map((item: string, i: number) => (
                          editingExcludedIndex === i ? null : (
                            <div key={i} className="group flex items-center gap-2 p-1.5 rounded bg-white border border-red-200 text-xs">
                              <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" /><span className="flex-1 text-slate-700">{item}</span>
                              <Button size="sm" variant="ghost" onClick={() => startEditExcludedItem(i)} className="h-5 w-5 p-0 text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-2.5 w-2.5" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => removeExcludedItem(i)} className="h-5 w-5 p-0 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-2.5 w-2.5" /></Button>
                            </div>
                          )
                        ))}
                        {showExcludedItemInput ? (
                          <div className="flex items-center gap-2 p-1.5 rounded border-2 border-primary bg-white">
                            {editingExcludedIndex !== null ? <Pencil className="h-3 w-3 text-primary" /> : <Plus className="h-3 w-3 text-primary" />}
                            <Input value={draftExcludedItem} onChange={(e) => setDraftExcludedItem(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addExcludedItem(); if (e.key === 'Escape') { setShowExcludedItemInput(false); setDraftExcludedItem(''); setEditingExcludedIndex(null); } }} className="flex-1 h-6 text-xs border-0 bg-transparent focus-visible:ring-0" placeholder={editingExcludedIndex !== null ? "Edit item..." : "Add item..."} autoFocus />
                            <Button size="sm" onClick={addExcludedItem} disabled={!draftExcludedItem.trim()} className="h-6 px-2 text-[10px] bg-red-600 hover:bg-red-700">{editingExcludedIndex !== null ? 'Save' : 'Add'}</Button>
                          </div>
                        ) : (
                          <Button variant="outline" onClick={() => setShowExcludedItemInput(true)} className="w-full h-7 text-[10px] border-dashed border-red-400 text-red-700 hover:bg-red-100"><Plus className="h-3 w-3 mr-1" />Add</Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5"><IndianRupee className="h-3 w-3 text-slate-400" /><h4 className="text-xs font-medium text-slate-900">Extra Charges</h4></div>
                      <div className="space-y-1 p-2 rounded-lg bg-amber-50/50 border border-amber-200/60">
                        {(editForm?.extraChargesDetailed || []).map((c: any, i: number) => (
                          editingExtraChargeIndex === i ? null : (
                            <div key={i} className="group flex items-center gap-2 p-1.5 rounded bg-white border border-amber-200">
                              <span className="text-amber-600 font-bold text-xs">+</span><span className="flex-1 text-xs text-slate-700">{c.name}</span>
                              <span className="text-xs font-bold text-amber-700">₹{Number(c.price).toLocaleString('en-IN')}</span>
                              <Button size="sm" variant="ghost" onClick={() => startEditExtraCharge(i)} className="h-5 w-5 p-0 text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-2.5 w-2.5" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => removeExtraCharge(i)} className="h-5 w-5 p-0 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-2.5 w-2.5" /></Button>
                            </div>
                          )
                        ))}
                        {showExtraChargeInput ? (
                          <div className="flex items-center gap-1.5 p-1.5 rounded border-2 border-primary bg-white">
                            {editingExtraChargeIndex !== null ? <Pencil className="h-3 w-3 text-primary" /> : <Plus className="h-3 w-3 text-primary" />}
                            <Input value={draftExtraCharge.name} onChange={(e) => setDraftExtraCharge(p => ({ ...p, name: e.target.value }))} className="flex-1 h-6 text-xs border-0 bg-transparent focus-visible:ring-0" placeholder="Name..." autoFocus />
                            <div className="flex items-center gap-0.5 bg-slate-100 rounded px-1.5 py-0.5">
                              <span className="text-xs text-slate-600">₹</span>
                              <Input type="number" value={draftExtraCharge.price} onChange={(e) => setDraftExtraCharge(p => ({ ...p, price: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') addExtraCharge(); if (e.key === 'Escape') { setShowExtraChargeInput(false); setDraftExtraCharge({ name: '', price: '' }); setEditingExtraChargeIndex(null); } }} className="w-16 h-6 text-xs border-0 bg-transparent focus-visible:ring-0 p-0" placeholder="0" />
                            </div>
                            <Button size="sm" onClick={addExtraCharge} disabled={!draftExtraCharge.name.trim() || !draftExtraCharge.price} className="h-6 px-2 text-[10px] bg-amber-600 hover:bg-amber-700">{editingExtraChargeIndex !== null ? 'Save' : 'Add'}</Button>
                          </div>
                        ) : (
                          <Button variant="outline" onClick={() => setShowExtraChargeInput(true)} className="w-full h-7 text-[10px] border-dashed border-amber-400 text-amber-700 hover:bg-amber-100"><Plus className="h-3 w-3 mr-1" />Add Charge</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}

            {/* 6. ADDITIONAL NOTES */}
            {isEditMode && (
              <Card className="overflow-hidden border border-slate-200 shadow-none bg-white">
                <button type="button" onClick={() => toggleSection('additionalNotes')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <h3 className="text-sm font-semibold text-slate-900">Additional Notes</h3>
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", expandedSections.additionalNotes ? "rotate-180" : "")} />
                </button>
                <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", expandedSections.additionalNotes ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                  <CardContent className="p-3">
                    <Textarea value={editForm?.customNotes || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, customNotes: e.target.value }))} rows={3} className="text-xs resize-none" placeholder="Add any additional terms or notes..." />
                  </CardContent>
                </div>
              </Card>
            )}
            </div>
          </div>

          {/* Right - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border border-slate-200/80 shadow-lg relative overflow-hidden rounded-2xl bg-white">
                {/* Preview Overlay */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">Preview Mode</p>
                    <p className="text-xs text-slate-400 mt-0.5">Booking disabled</p>
                  </div>
                </div>

                <CardHeader className="p-6 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-slate-900 tracking-tight">₹{displayPrice.toLocaleString('en-IN')}</span>
                        {priceLabel && <span className="text-sm text-slate-500">{priceLabel}</span>}
                        {isItem && listing.unit && !priceLabel && <span className="text-sm text-slate-500">/{listing.unit}</span>}
                      </div>
                      {listing.openForNegotiation && (
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Price negotiable</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-3 space-y-5">
                  <div>
                    <Label className="text-xs font-medium text-slate-700">Event Date</Label>
                    <Button variant="outline" className="w-full justify-start text-left h-11 text-sm mt-2 text-slate-400 border-slate-200" disabled>
                      <CalendarIcon className="mr-2 h-4 w-4" />Select date
                    </Button>
                  </div>

                  {isItem && (
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Quantity</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" disabled><span className="text-lg">−</span></Button>
                        <Input value={listing.minimumQuantity || 1} className="w-16 h-10 text-center text-lg font-semibold" disabled />
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" disabled><span className="text-lg">+</span></Button>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Base price</span><span className="font-medium">₹{displayPrice.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Service fee</span><span className="font-medium">₹{Math.round(displayPrice * 0.05).toLocaleString('en-IN')}</span></div>
                    <Separator />
                    <div className="flex justify-between text-base font-semibold"><span>Total</span><span>₹{Math.round(displayPrice * 1.05).toLocaleString('en-IN')}</span></div>
                  </div>

                  <Button className="w-full h-12 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl" disabled>
                    <ShoppingCart className="mr-2 h-4 w-4" />Add to Cart
                  </Button>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    <p className="text-xs text-slate-500 flex items-center gap-2.5"><CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />Free cancellation up to 48 hours</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2.5"><AlertCircle className="h-3.5 w-3.5 text-slate-400" />Pay only after vendor confirms</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Card */}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {showAllPhotos && listing.images?.length > 0 && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <span className="text-white/70 text-sm">{selectedImageIndex + 1} / {listing.images.length}</span>
            <button onClick={() => setShowAllPhotos(false)} className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-16">
            {listing.images.length > 1 && (
              <button onClick={() => setSelectedImageIndex(i => (i - 1 + listing.images.length) % listing.images.length)} className="absolute left-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors">
                <span className="text-2xl font-light">‹</span>
              </button>
            )}
            <img src={listing.images[selectedImageIndex]} alt={`${listing.name} ${selectedImageIndex + 1}`} className="max-h-[80vh] max-w-full object-contain rounded-lg" />
            {listing.images.length > 1 && (
              <button onClick={() => setSelectedImageIndex(i => (i + 1) % listing.images.length)} className="absolute right-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors">
                <span className="text-2xl font-light">›</span>
              </button>
            )}
          </div>
          <div className="flex justify-center gap-2 p-4 overflow-x-auto">
            {listing.images.map((img: string, i: number) => (
              <button key={i} onClick={() => setSelectedImageIndex(i)} className={cn("w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all", selectedImageIndex === i ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80")}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={deleteListing}
        title="Delete Listing"
        description={
          listing.isDraft
            ? "Are you sure you want to delete this draft? This action cannot be undone."
            : "Are you sure you want to delete this listing? This will remove it from customer view."
        }
        itemName={listing.name}
        isDeleting={isDeleting}
      />
      {/* Listing guide — continues from VendorListings flow */}
      <ListingGuide />

      {showPublishCelebration && createPortal(
        <>
          <style>{`
@keyframes pub-confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-80px) rotate(360deg); opacity: 0; } }
@keyframes pub-pop { 0% { transform: scale(0) rotate(-20deg); opacity: 0; } 60% { transform: scale(1.15) rotate(3deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes pub-float-1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(8px,-10px); } }
@keyframes pub-float-2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-6px,8px); } }
@keyframes pub-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          `}</style>
          <div className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-[3px]" />
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 pointer-events-none">
            <div className={cn(
              "bg-white dark:bg-card border border-border/40 rounded-2xl shadow-2xl max-w-[420px] w-full overflow-hidden pointer-events-auto",
              "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-400"
            )}>
              <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 px-6 pt-8 pb-10 overflow-hidden text-center">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-6 right-8 w-16 h-16 rounded-full bg-white/[0.06]" style={{ animation: 'pub-float-1 4s ease-in-out infinite' }} />
                  <div className="absolute bottom-4 left-6 w-10 h-10 rounded-full bg-white/[0.08]" style={{ animation: 'pub-float-2 5s ease-in-out infinite' }} />
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 4 + (i % 3) * 2,
                        height: 4 + (i % 3) * 2,
                        left: `${15 + i * 13}%`,
                        top: '50%',
                        background: ['#fbbf24', '#f472b6', '#60a5fa', '#a78bfa', '#34d399', '#fb923c'][i],
                        animation: `pub-confetti ${0.8 + i * 0.15}s ease-out both ${0.5 + i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative">
                  <div
                    className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 mx-auto"
                    style={{ width: 72, height: 72, animation: 'pub-pop 0.6s ease-out both 0.3s' }}
                  >
                    <Rocket className="h-9 w-9 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    You're live!
                  </h2>
                  <p className="text-sm text-white/80 mt-2 leading-relaxed max-w-[300px] mx-auto">
                    Your listing is now visible to customers and ready for bookings
                  </p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">{listing?.name || 'Your listing'}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Published and active</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Share profile', desc: 'Get discovered' },
                    { label: 'Add more listings', desc: 'Grow your catalog' },
                    { label: 'Check leads', desc: 'Stay on top' },
                  ].map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-muted/40 border border-border/30">
                      <p className="text-[11px] font-medium text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    setShowPublishCelebration(false);
                    navigate('/vendor/listings');
                  }}
                  className="w-full h-11 bg-[#5950b3] hover:bg-[#4a42a0] active:scale-[0.98] text-white font-semibold rounded-xl shadow-md shadow-[#5950b3]/20 transition-all duration-150"
                >
                  Go to My Listings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
