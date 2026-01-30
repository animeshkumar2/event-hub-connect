import { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Separator } from '@/shared/components/ui/separator';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { ImageUpload, PendingImageChanges } from '@/shared/components/ImageUpload';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { uploadImage, deleteImages } from '@/shared/utils/storage';
import { 
  Star, MapPin, Clock, CheckCircle2, XCircle, ArrowLeft, User, Users, Package,
  AlertCircle, IndianRupee, Loader2, Save, X, Plus, Pencil, Eye,
  ShoppingCart, CalendarIcon, Lock, Camera, Trash2, Sparkles,
  ChevronDown, ChevronUp, Gift, FileText, Calendar, PartyPopper, Zap
} from 'lucide-react';
import { useVendorListingDetails, useEventTypes } from '@/shared/hooks/useApi';
import { publicApi, vendorApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { CategorySpecificDisplay } from '@/features/listing/CategorySpecificDisplay';
import { CategoryFieldRenderer } from '@/features/vendor/components/CategoryFields';
import { DeliveryTimeInput } from '@/features/vendor/components/DeliveryTimeInput';
import { ServiceModeSelector } from '@/shared/components/ServiceModeSelector';
import { VendorPackagePreview } from './VendorPackagePreview';

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
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    serviceDetails: false,
    eventTypes: false,
    includedExcluded: false,
    additionalNotes: false,
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Pending image changes for deferred upload
  const [pendingImageChanges, setPendingImageChanges] = useState<PendingImageChanges | null>(null);
  
  const { data: eventTypesData } = useEventTypes();
  const eventTypes = useMemo(() => eventTypesData || [], [eventTypesData]);
  const vendorId = listing?.vendorId || listing?.vendor?.id || null;
  
  // Check if this is a template-based listing
  const isTemplateBased = useMemo(() => {
    return listing?.customNotes?.startsWith('__TEMPLATE__:');
  }, [listing?.customNotes]);
  
  const templateId = useMemo(() => {
    if (!isTemplateBased || !listing?.customNotes) return null;
    return listing.customNotes.replace('__TEMPLATE__:', '');
  }, [isTemplateBased, listing?.customNotes]);
  
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
          case 'caterer': return d.pricePerPlateVeg || d.pricePerPlateNonVeg || 0;
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
        case 'caterer': return displayPrice === d.pricePerPlateVeg ? '/plate (Veg)' : '/plate (Non-Veg)';
        case 'mua': return displayPrice === d.bridalPrice ? '(Bridal)' : '(Non-Bridal)';
        default: return null;
      }
    } catch { return null; }
  }, [listing?.categorySpecificData, listing?.categoryId, displayPrice]);

  const enterEditMode = useCallback(() => {
    if (!listing) return;
    
    let extraChargesDetailed: { name: string; price: string }[] = [];
    if (listing.extraChargesJson) { try { extraChargesDetailed = JSON.parse(listing.extraChargesJson).map((ec: any) => ({ name: ec.name, price: ec.price?.toString() || '' })); } catch {} }
    
    // Parse category-specific data
    let parsedCategoryData: Record<string, any> = {};
    if (listing.categorySpecificData) { 
      try { 
        let data = listing.categorySpecificData;
        console.log('[EditMode] Raw categorySpecificData:', data, 'type:', typeof data);
        
        // Keep parsing while it's a string (handles multiple levels of stringification)
        while (typeof data === 'string') {
          data = JSON.parse(data);
        }
        
        // Ensure it's an object
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          parsedCategoryData = data;
        }
        
        console.log('[EditMode] Parsed categorySpecificData:', parsedCategoryData);
      } catch (e) {
        console.error('[EditMode] Failed to parse categorySpecificData:', e);
        console.error('[EditMode] Raw value was:', listing.categorySpecificData);
      }
    } else {
      console.log('[EditMode] No categorySpecificData on listing');
    }
    
    let eventTypeIds: number[] = listing.eventTypeIds || (listing.eventTypes?.map((et: any) => typeof et === 'object' ? et.id : et).filter(Boolean) || []);
    console.log('[EditMode] Event types debug:', {
      'listing.eventTypeIds': listing.eventTypeIds,
      'listing.eventTypes': listing.eventTypes,
      'computed eventTypeIds': eventTypeIds
    });
    setEditForm({
      name: listing.name || '', description: listing.description || '', price: listing.price?.toString() || '',
      images: listing.images || [], highlights: listing.highlights || [],
      includedItemsText: listing.includedItemsText || [], excludedItemsText: listing.excludedItemsText || [],
      extraChargesDetailed, deliveryTime: listing.deliveryTime || '', customNotes: listing.customNotes || '',
      serviceMode: listing.serviceMode || 'BOTH', openForNegotiation: listing.openForNegotiation || false,
      eventTypeIds, minimumQuantity: listing.minimumQuantity || 0,
    });
    setCategorySpecificData(parsedCategoryData);
    setIsEditMode(true);
  }, [listing]);

  // Auto-enter edit mode if ?edit=true query param
  useEffect(() => {
    const shouldEdit = searchParams.get('edit') === 'true';
    if (shouldEdit && listing && !isEditMode) {
      enterEditMode();
      // Clear the query param
      searchParams.delete('edit');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, listing, isEditMode, enterEditMode, setSearchParams]);

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
    
    // 3. Price is required
    let hasPrice = false;
    const catId = listingData?.categoryId;
    if (catId === 'other') {
      hasPrice = true; // Skip price check for 'other' category
    } else if (catId === 'caterer') {
      hasPrice = categoryData?.pricePerPlateVeg && parseFloat(categoryData.pricePerPlateVeg) > 0;
    } else if (catId === 'mua') {
      hasPrice = categoryData?.bridalPrice && parseFloat(categoryData.bridalPrice) > 0;
    } else {
      // All other categories use the generic 'price' field
      hasPrice = categoryData?.price && parseFloat(categoryData.price) > 0;
    }
    requirements.push({ id: 'price', label: 'Pricing details', met: hasPrice });
    
    return requirements;
  }, [pendingImageChanges]);
  
  // Check if ready to publish
  const publishRequirements = useMemo(() => {
    if (!listing) return [];
    return getPublishRequirements(listing, isEditMode ? editForm : null, isEditMode ? categorySpecificData : undefined);
  }, [listing, editForm, categorySpecificData, isEditMode, getPublishRequirements]);
  
  const canPublish = useMemo(() => publishRequirements.every(r => r.met), [publishRequirements]);
  const missingRequirements = useMemo(() => publishRequirements.filter(r => !r.met), [publishRequirements]);

  const saveChanges = useCallback(async () => {
    if (!listing || !editForm) return;
    
    // For PUBLISHED listings, require all validations to pass
    // For DRAFT listings, allow saving incomplete
    if (!listing.isDraft && !canPublish) {
      toast.error('Please complete all required fields before saving');
      missingRequirements.forEach(r => toast.error(`Missing: ${r.label}`));
      return;
    }
    
    // Get price for payload
    let finalPrice = editForm.price;
    if (isItem && listing.categoryId !== 'other') {
      const p = categorySpecificData;
      finalPrice = p.pricePerPlateVeg || p.price || p.photographyPrice || p.videographyPrice || p.bridalPrice || editForm.price;
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
        extraChargesDetailed: editForm.extraChargesDetailed.filter((ec: any) => ec.name.trim() && ec.price).map((ec: any) => ({ name: ec.name, price: parseFloat(ec.price) || 0 })),
        deliveryTime: editForm.deliveryTime, customNotes: editForm.customNotes,
        serviceMode: editForm.serviceMode, openForNegotiation: editForm.openForNegotiation,
        eventTypeIds: editForm.eventTypeIds,
        minimumQuantity: listing.categoryId === 'caterer' ? (editForm.minimumQuantity || 0) : undefined,
        categorySpecificData: isItem && listing.categoryId !== 'other' && Object.keys(categorySpecificData).length > 0 ? JSON.stringify(categorySpecificData) : undefined,
        // Explicitly preserve draft status - don't accidentally publish
        isDraft: listing.isDraft,
      };
      
      console.log('💾 Saving listing payload:', { 
        eventTypeIds: payload.eventTypeIds,
        editFormEventTypeIds: editForm.eventTypeIds,
        images: payload.images?.length 
      });
      
      const response = await vendorApi.updateListing(listing.id, payload);
      if (response.success) {
        // Optimistic update - directly set the cache with new data
        const updatedListing = {
          ...listing,
          ...payload,
          extraChargesJson: JSON.stringify(payload.extraChargesDetailed || []),
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
        
        // Refetch queries to ensure fresh data everywhere
        queryClient.invalidateQueries({ queryKey: ['vendorListingDetails', listingId] });
        queryClient.invalidateQueries({ queryKey: ['vendorListings'] });
        queryClient.invalidateQueries({ queryKey: ['myVendorListings'] });
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
    
    // Check publish requirements
    if (!canPublish) {
      missingRequirements.forEach(r => toast.error(`Missing: ${r.label}`));
      return;
    }
    
    // Validation: If template-based, name must be changed
    if (isTemplateBased) {
      // Import template names to check
      const { getTemplateById } = await import('@/shared/constants/listingTemplates');
      const originalTemplate = templateId ? getTemplateById(templateId) : null;
      if (originalTemplate && listing.name === originalTemplate.name) {
        toast.error('Please customize the listing name before publishing');
        return;
      }
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
        toast.success('Listing published successfully!');
        queryClient.invalidateQueries({ queryKey: ['vendorListingDetails', listingId] });
        queryClient.invalidateQueries({ queryKey: ['vendorListings'] });
        queryClient.invalidateQueries({ queryKey: ['myVendorListings'] });
        // Force immediate refetch before navigation
        await queryClient.refetchQueries({ queryKey: ['myVendorListings'] });
        navigate('/vendor/listings');
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

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Vendor Owner Banner - Like customer view but with edit controls */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-b border-primary/20">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/15">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">Customer's View</p>
                <p className="text-[10px] text-primary/70">How customers see this service</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={cancelEditMode} disabled={isSaving} className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                    <X className="h-3 w-3 mr-1" />Cancel
                  </Button>
                  {listing.isDraft ? (
                    // Draft: Always allow saving
                    <Button size="sm" onClick={saveChanges} disabled={isSaving} className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white">
                      {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                      Save Draft
                    </Button>
                  ) : (
                    // Published: Only allow saving when all requirements met
                    <div className="relative group">
                      <Button 
                        size="sm" 
                        onClick={saveChanges} 
                        disabled={isSaving || !canPublish} 
                        className={cn(
                          "h-7 text-xs",
                          canPublish 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "bg-slate-300 text-slate-500 cursor-not-allowed"
                        )}
                      >
                        {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                        Save
                      </Button>
                      {!canPublish && (
                        <div className="absolute top-full right-0 mt-1 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          <p className="font-medium mb-1">Complete to save:</p>
                          {missingRequirements.map(r => (
                            <p key={r.id} className="flex items-center gap-1">
                              <AlertCircle className="h-2.5 w-2.5 text-amber-400" />
                              {r.label}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate('/vendor/listings')} className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                    <ArrowLeft className="h-3 w-3 mr-1" />Back
                  </Button>
                  <Button size="sm" variant="outline" onClick={enterEditMode} className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                    <Pencil className="h-3 w-3 mr-1" />Edit
                  </Button>
                  {listing.isDraft && (
                    <div className="relative group">
                      <Button 
                        size="sm" 
                        onClick={publishListing} 
                        disabled={isPublishing || !canPublish} 
                        className={cn(
                          "h-7 text-xs",
                          canPublish 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "bg-slate-300 text-slate-500 cursor-not-allowed"
                        )}
                      >
                        {isPublishing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                        Publish
                      </Button>
                      {!canPublish && (
                        <div className="absolute top-full right-0 mt-1 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          <p className="font-medium mb-1">Complete to publish:</p>
                          {missingRequirements.map(r => (
                            <p key={r.id} className="flex items-center gap-1">
                              <AlertCircle className="h-2.5 w-2.5 text-amber-400" />
                              {r.label}
                            </p>
                          ))}
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
        <div className={cn(
          "border-b-2 py-2 px-4",
          canPublish 
            ? "bg-green-50 border-green-300" 
            : "bg-amber-50 border-amber-300"
        )}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left: Edit mode indicator */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
                  canPublish ? "bg-green-200" : "bg-amber-200"
                )}>
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">EDITING</span>
                </div>
                {listing.isDraft && (
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Draft</span>
                )}
              </div>

              {/* Center: Checklist items */}
              <div className="flex items-center gap-2 flex-wrap">
                {publishRequirements.map((req) => (
                  <div key={req.id} className={cn(
                    "flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border",
                    req.met 
                      ? "bg-green-100 text-green-700 border-green-300" 
                      : "bg-red-100 text-red-700 border-red-300"
                  )}>
                    {req.met ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {req.label}
                  </div>
                ))}
              </div>

              {/* Right: Status */}
              {canPublish ? (
                <span className="text-[11px] text-green-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All fields complete
                </span>
              ) : (
                <span className="text-[11px] text-amber-700 font-medium">
                  {listing.isDraft ? 'Complete to publish' : 'Complete to save'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {listing.isDraft && !isEditMode && (
        <div className="bg-amber-50 border-b-2 border-amber-300 py-3 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Left: Draft status with progress */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-amber-200 px-3 py-1.5 rounded-lg">
                  <span className="text-lg">📝</span>
                  <span className="text-sm font-bold text-amber-900">DRAFT</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <div className="w-24 h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300" 
                      style={{ width: `${(publishRequirements.filter(r => r.met).length / publishRequirements.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-amber-800">
                    {publishRequirements.filter(r => r.met).length}/{publishRequirements.length}
                  </span>
                </div>
              </div>

              {/* Center: Checklist items */}
              <div className="flex items-center gap-2 flex-wrap">
                {publishRequirements.map((req) => (
                  <div key={req.id} className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border-2 transition-all",
                    req.met 
                      ? "bg-green-100 text-green-800 border-green-300" 
                      : "bg-red-100 text-red-800 border-red-300 animate-pulse"
                  )}>
                    {req.met ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {req.label}
                  </div>
                ))}
              </div>

              {/* Right: Status message */}
              {canPublish ? (
                <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-1.5 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-bold">Ready to Publish!</span>
                </div>
              ) : (
                <div className="text-xs text-amber-800 font-medium max-w-[150px] text-right">
                  Complete missing items to publish
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left - Main */}
          <div className="lg:col-span-2 space-y-4">

            {/* Images */}
            {isEditMode ? (
              <Card><CardContent className="p-4">
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
            ) : (
              <div className="space-y-2">
                {/* Main Image */}
                <div className="relative rounded-xl overflow-hidden bg-slate-100 min-h-[200px] max-h-[500px] flex items-center justify-center">
                  {listing.images?.[selectedImageIndex] ? (
                    <img src={listing.images[selectedImageIndex]} alt={listing.name} className="max-w-full max-h-[500px] object-contain" />
                  ) : listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.name} className="max-w-full max-h-[500px] object-contain" />
                  ) : (
                    <div className="w-full h-[200px] flex items-center justify-center"><Camera className="h-12 w-12 text-slate-400" /></div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {isPackage && <Badge className="bg-primary text-white text-xs px-2 py-1"><Package className="h-3 w-3 mr-1" />Package</Badge>}
                    {isItem && <Badge className="bg-emerald-500 text-white text-xs px-2 py-1">Service</Badge>}
                  </div>
                  {listing.images?.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">{selectedImageIndex + 1} / {listing.images.length}</div>
                  )}
                </div>
                {/* Thumbnail Gallery */}
                {listing.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {listing.images.map((img: string, i: number) => (
                      <button key={i} onClick={() => setSelectedImageIndex(i)} className={cn("flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all", selectedImageIndex === i ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-slate-300")}>
                        <img src={img} alt={`${listing.name} ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Header */}
            {isEditMode ? (
              <Card><CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs">Name <span className="text-red-500">*</span></Label>
                  <Input value={editForm?.name || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} className="h-9 text-sm mt-1" />
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
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{listing.name}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><User className="h-4 w-4" /><span className="font-medium">{listing.vendorName}</span></span>
                  {listing.vendorCity && <><span className="text-slate-300">•</span><span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{listing.vendorCity}</span></>}
                  {listing.vendorRating > 0 && <><span className="text-slate-300">•</span><span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{listing.vendorRating.toFixed(1)}</span></>}
                </div>
              </div>
            )}

            {/* Description (view only) */}
            {!isEditMode && listing.description && (
              <Card><CardContent className="p-4">
                <p className="text-sm text-slate-600 leading-relaxed">{listing.description}</p>
              </CardContent></Card>
            )}

            {/* 1. KEY HIGHLIGHTS - Compact Design (NOT collapsible) */}
            {(displayHighlights.length > 0 || isEditMode) && (
              <Card className="overflow-hidden border-0 shadow-md bg-white">
                <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-4 py-3 relative overflow-hidden">
                  <div className="relative flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      <Zap className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Key Highlights</h3>
                    </div>
                    {!isEditMode && displayHighlights.length > 0 && (
                      <Badge className="ml-auto bg-white/20 text-white border-0 backdrop-blur-sm text-[10px] h-5 px-2">
                        {displayHighlights.length}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-3">
                  {isEditMode ? (
                    <div className="space-y-1.5">
                      {(editForm?.highlights || []).map((item: string, i: number) => (
                        editingHighlightIndex === i ? null : (
                          <div key={i} className="group flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 hover:shadow-sm transition-all">
                            <div className="p-1 rounded bg-emerald-100">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="flex-1 text-xs font-medium text-emerald-900">{item}</span>
                            <Button size="sm" variant="ghost" onClick={() => startEditHighlight(i)} className="h-6 w-6 p-0 text-slate-500 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeHighlight(i)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      ))}
                      {showHighlightInput ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border-2 border-primary bg-primary/5">
                          <div className="p-1 rounded bg-primary/20">
                            {editingHighlightIndex !== null ? <Pencil className="h-3 w-3 text-primary" /> : <Plus className="h-3 w-3 text-primary" />}
                          </div>
                          <Input 
                            value={draftHighlight} 
                            onChange={(e) => setDraftHighlight(e.target.value)} 
                            onKeyDown={(e) => { 
                              if (e.key === 'Enter') addHighlight(); 
                              if (e.key === 'Escape') { setShowHighlightInput(false); setDraftHighlight(''); setEditingHighlightIndex(null); } 
                            }} 
                            className="flex-1 h-7 text-xs border-0 bg-transparent focus-visible:ring-0" 
                            placeholder={editingHighlightIndex !== null ? "Edit highlight..." : "Type a highlight..."} 
                            autoFocus 
                          />
                          <Button size="sm" onClick={addHighlight} disabled={!draftHighlight.trim()} className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">
                            {editingHighlightIndex !== null ? 'Save' : 'Add'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setShowHighlightInput(false); setDraftHighlight(''); setEditingHighlightIndex(null); }} className="h-7 w-7 p-0 text-slate-500">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={() => setShowHighlightInput(true)} 
                          className="w-full h-8 text-xs border border-dashed border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 rounded-lg"
                        >
                          <Plus className="h-3 w-3 mr-1" />Add Highlight
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {displayHighlights.map((item: string, i: number) => (
                        <div 
                          key={i} 
                          className="flex items-start gap-2 p-2 rounded-lg bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200/40"
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mt-0.5">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 2. CATEGORY DETAILS - NOT collapsible (always visible) */}
            {(isEditMode || listing.categorySpecificData || (listing.isDraft && listing.categoryId && listing.categoryId !== 'other')) && (
              isEditMode ? (
                <Card className="overflow-hidden border-0 shadow-md bg-white">
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
                    {/* Price validation message */}
                    {(() => {
                      const p = categorySpecificData;
                      const hasPrice = 
                        (listing.categoryId === 'caterer' && p.pricePerPlateVeg && parseFloat(p.pricePerPlateVeg) > 0) ||
                        (listing.categoryId === 'mua' && p.bridalPrice && parseFloat(p.bridalPrice) > 0) ||
                        (['photographer', 'photography-videography', 'photo-video', 'venue', 'decorator', 'dj', 'dj-entertainment', 'sound-lights', 'live-music', 'cinematographer', 'videographer'].includes(listing.categoryId) && p.price && parseFloat(p.price) > 0);
                      
                      if (!hasPrice && listing.categoryId !== 'other') {
                        return (
                          <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-100">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-amber-800">Price is required</p>
                              <p className="text-[10px] text-amber-600">Fill in pricing above to continue</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              ) : listing.categorySpecificData ? (
                <CategorySpecificDisplay categoryId={listing.categoryId} categorySpecificData={listing.categorySpecificData} />
              ) : listing.isDraft && listing.categoryId && listing.categoryId !== 'other' ? (
                <Card className="border-dashed border-2 border-amber-300 bg-amber-50/50 shadow-md">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <p className="text-sm font-semibold text-amber-800">Category Details Missing</p>
                    <p className="text-xs text-amber-600 mt-0.5">Click Edit to add pricing</p>
                  </CardContent>
                </Card>
              ) : null
            )}

            {/* Bundled Items - Enhanced (for packages only) */}
            {isPackage && linkedItems.length > 0 && !isEditMode && (
              <Card className="border-primary/20 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 px-5 py-3 border-b border-primary/20">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <Package className="h-4 w-4" />
                    What's Included ({linkedItems.length} services)
                  </h3>
                </div>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {linkedItems.map((item: any, index: number) => (
                      <div key={item.id} className="group rounded-xl border-2 border-slate-100 overflow-hidden bg-white hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                        <div className="aspect-square bg-slate-100 relative overflow-hidden">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-slate-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Badge className="absolute top-2 left-2 bg-white/90 text-slate-700 text-[10px] h-5 px-1.5 shadow-sm">
                            #{index + 1}
                          </Badge>
                          <Badge className="absolute bottom-2 right-2 bg-primary text-white text-xs h-6 px-2 shadow-lg">
                            ₹{Number(item.price).toLocaleString('en-IN')}
                          </Badge>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{item.categoryName || 'Service'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. SERVICE DETAILS - Collapsible (collapsed by default) */}
            {(isEditMode || listing.deliveryTime || listing.serviceMode) && (
              <Card className="overflow-hidden border-0 shadow-md bg-white">
                {/* Collapsible Header */}
                <button
                  type="button"
                  onClick={() => toggleSection('serviceDetails')}
                  className="w-full bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-2.5 flex items-center justify-between group hover:from-slate-700 hover:to-slate-600 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      <Clock className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-white">Service Details</h3>
                    </div>
                  </div>
                  <div className={cn(
                    "p-1 rounded bg-white/10 transition-transform duration-300",
                    expandedSections.serviceDetails ? "rotate-180" : ""
                  )}>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </div>
                </button>
                
                {/* Collapsible Content */}
                <div className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  expandedSections.serviceDetails ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <CardContent className="p-3">
                    {isEditMode ? (
                      <div className="space-y-3">
                        {/* Delivery Time Section */}
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

                        {/* Service Mode Section */}
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
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {/* Delivery Time Card */}
                        {listing.deliveryTime && (() => {
                          const delivery = formatDeliveryTime(listing.deliveryTime);
                          return (
                            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 rounded bg-blue-100">
                                  <Clock className="h-3 w-3 text-blue-600" />
                                </div>
                                <p className="text-[10px] font-medium text-blue-600/80 uppercase">Delivery</p>
                              </div>
                              <p className="text-xs font-bold text-blue-900">{delivery.label}</p>
                            </div>
                          );
                        })()}
                        
                        {/* Service Mode Card */}
                        {listing.serviceMode && (() => {
                          const mode = getServiceModeWithDescription(listing.serviceMode);
                          const modeIcons = {
                            'CUSTOMER_VISITS': MapPin,
                            'VENDOR_TRAVELS': Users,
                            'BOTH': Sparkles
                          };
                          const ModeIcon = modeIcons[listing.serviceMode as keyof typeof modeIcons] || MapPin;
                          return (
                            <div className="rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/60 p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 rounded bg-violet-100">
                                  <ModeIcon className="h-3 w-3 text-violet-600" />
                                </div>
                                <p className="text-[10px] font-medium text-violet-600/80 uppercase">Mode</p>
                              </div>
                              <p className="text-xs font-bold text-violet-900">{mode.label}</p>
                            </div>
                          );
                        })()}
                        
                        {/* Negotiation Card */}
                        <div className={cn(
                          "rounded-lg border p-3",
                          listing.openForNegotiation 
                            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/60" 
                            : "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200/60"
                        )}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              "p-1 rounded",
                              listing.openForNegotiation ? "bg-emerald-100" : "bg-slate-100"
                            )}>
                              <IndianRupee className={cn(
                                "h-3 w-3",
                                listing.openForNegotiation ? "text-emerald-600" : "text-slate-500"
                              )} />
                            </div>
                            <p className={cn(
                              "text-[10px] font-medium uppercase",
                              listing.openForNegotiation ? "text-emerald-600/80" : "text-slate-500/80"
                            )}>Pricing</p>
                          </div>
                          <p className={cn(
                            "text-xs font-bold",
                            listing.openForNegotiation ? "text-emerald-900" : "text-slate-700"
                          )}>
                            {listing.openForNegotiation ? 'Negotiable' : 'Fixed'}
                          </p>
                        </div>
                        
                        {/* Minimum Order for Caterers */}
                        {listing.categoryId === 'caterer' && listing.minimumQuantity > 0 && (
                          <div className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="p-1 rounded bg-amber-100">
                                <Users className="h-3 w-3 text-amber-600" />
                              </div>
                              <p className="text-[10px] font-medium text-amber-600/80 uppercase">Min Order</p>
                            </div>
                            <p className="text-xs font-bold text-amber-900">{listing.minimumQuantity} plates</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            )}

            {/* 4. EVENT TYPES - Collapsible (collapsed by default) */}
            {(isEditMode || listing.eventTypeIds?.length > 0) && (
              <Card className="overflow-hidden border-0 shadow-md bg-white">
                {/* Collapsible Header */}
                <button
                  type="button"
                  onClick={() => toggleSection('eventTypes')}
                  className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-4 py-2.5 flex items-center justify-between group hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      <Calendar className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-white">Event Types</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditMode && listing.eventTypeIds?.length > 0 && (
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-[10px] h-5 px-2">
                        {listing.eventTypeIds.length}
                      </Badge>
                    )}
                    <div className={cn(
                      "p-1 rounded bg-white/10 transition-transform duration-300",
                      expandedSections.eventTypes ? "rotate-180" : ""
                    )}>
                      <ChevronDown className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </button>
                
                {/* Collapsible Content */}
                <div className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  expandedSections.eventTypes ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <CardContent className="p-3">
                    {isEditMode ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                          {eventTypes.map((et: any) => {
                            const sel = (editForm?.eventTypeIds || []).includes(et.id);
                            const isLastSelected = sel && (editForm?.eventTypeIds || []).length === 1;
                            const eventIcons: Record<number, string> = {
                              1: '💒', 2: '🎂', 3: '💝', 4: '🏢', 5: '💍',
                              6: '👶', 7: '🌙', 8: '🎵', 9: '✨'
                            };
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
                                <div className="text-base mb-0.5">{eventIcons[et.id] || '🎉'}</div>
                                <p className={cn(
                                  "text-[10px] font-medium truncate",
                                  sel ? "text-violet-800" : "text-slate-700"
                                )}>{et.displayName || et.name}</p>
                              </button>
                            );
                          })}
                        </div>
                        {(editForm?.eventTypeIds || []).length === 1 && (
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200">
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                            <p className="text-[10px] text-amber-700">Select another first to change</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {listing.eventTypeIds?.map((id: number) => {
                          const eventIcons: Record<number, string> = {
                            1: '💒', 2: '🎂', 3: '💝', 4: '🏢', 5: '💍',
                            6: '👶', 7: '🌙', 8: '🎵', 9: '✨'
                          };
                          return (
                            <div 
                              key={id} 
                              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/60 px-2 py-1.5"
                            >
                              <span className="text-sm">{eventIcons[id] || '🎉'}</span>
                              <span className="text-xs font-medium text-violet-800">{eventTypeNames[id] || `Event ${id}`}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            )}

            {/* 5. WHAT'S INCLUDED/EXCLUDED - Collapsible (collapsed by default) */}
            {(isEditMode || listing.includedItemsText?.length > 0 || listing.excludedItemsText?.length > 0 || parsedExtraCharges.length > 0) && (
              <Card className="overflow-hidden border-0 shadow-md bg-white">
                {/* Collapsible Header */}
                <button
                  type="button"
                  onClick={() => toggleSection('includedExcluded')}
                  className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 px-4 py-2.5 flex items-center justify-between group hover:from-teal-500 hover:via-emerald-500 hover:to-green-500 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      <Gift className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-white">What's Included & Excluded</h3>
                    </div>
                  </div>
                  <div className={cn(
                    "p-1 rounded bg-white/10 transition-transform duration-300",
                    expandedSections.includedExcluded ? "rotate-180" : ""
                  )}>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </div>
                </button>
                
                {/* Collapsible Content */}
                <div className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  expandedSections.includedExcluded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <CardContent className="p-3 space-y-3">
                    {/* Included Section */}
                    {(isEditMode || listing.includedItemsText?.length > 0) && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 rounded bg-emerald-100">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          </div>
                          <h4 className="text-xs font-medium text-emerald-800">Included</h4>
                          {!isEditMode && listing.includedItemsText?.length > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] h-4 px-1.5">{listing.includedItemsText.length}</Badge>
                          )}
                        </div>
                        {isEditMode ? (
                          <div className="space-y-1 p-2 rounded-lg bg-emerald-50/50 border border-emerald-200/60">
                            {(editForm?.includedItemsText || []).map((item: string, i: number) => (
                              editingIncludedIndex === i ? null : (
                                <div key={i} className="group flex items-center gap-2 p-1.5 rounded bg-white border border-emerald-200 text-xs">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                                  <span className="flex-1 text-slate-700">{item}</span>
                                  <Button size="sm" variant="ghost" onClick={() => startEditIncludedItem(i)} className="h-5 w-5 p-0 text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Pencil className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => removeIncludedItem(i)} className="h-5 w-5 p-0 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-2.5 w-2.5" />
                                  </Button>
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
                              <Button variant="outline" onClick={() => setShowIncludedItemInput(true)} className="w-full h-7 text-[10px] border-dashed border-emerald-400 text-emerald-700 hover:bg-emerald-100">
                                <Plus className="h-3 w-3 mr-1" />Add
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {listing.includedItemsText.map((item: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60">
                                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                </div>
                                <span className="text-xs text-slate-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Excluded Section */}
                    {(isEditMode || listing.excludedItemsText?.length > 0) && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 rounded bg-red-100">
                            <XCircle className="h-3 w-3 text-red-600" />
                          </div>
                          <h4 className="text-xs font-medium text-red-800">Not Included</h4>
                          {!isEditMode && listing.excludedItemsText?.length > 0 && (
                            <Badge className="bg-red-100 text-red-700 border-0 text-[10px] h-4 px-1.5">{listing.excludedItemsText.length}</Badge>
                          )}
                        </div>
                        {isEditMode ? (
                          <div className="space-y-1 p-2 rounded-lg bg-red-50/50 border border-red-200/60">
                            {(editForm?.excludedItemsText || []).map((item: string, i: number) => (
                              editingExcludedIndex === i ? null : (
                                <div key={i} className="group flex items-center gap-2 p-1.5 rounded bg-white border border-red-200 text-xs">
                                  <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                  <span className="flex-1 text-slate-700">{item}</span>
                                  <Button size="sm" variant="ghost" onClick={() => startEditExcludedItem(i)} className="h-5 w-5 p-0 text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Pencil className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => removeExcludedItem(i)} className="h-5 w-5 p-0 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-2.5 w-2.5" />
                                  </Button>
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
                              <Button variant="outline" onClick={() => setShowExcludedItemInput(true)} className="w-full h-7 text-[10px] border-dashed border-red-400 text-red-700 hover:bg-red-100">
                                <Plus className="h-3 w-3 mr-1" />Add
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {listing.excludedItemsText.map((item: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60">
                                <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <XCircle className="h-2.5 w-2.5 text-red-600" />
                                </div>
                                <span className="text-xs text-slate-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Extra Charges Section */}
                    {(isEditMode || parsedExtraCharges.length > 0) && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 rounded bg-amber-100">
                            <IndianRupee className="h-3 w-3 text-amber-600" />
                          </div>
                          <h4 className="text-xs font-medium text-amber-800">Extra Charges</h4>
                          {!isEditMode && parsedExtraCharges.length > 0 && (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] h-4 px-1.5">{parsedExtraCharges.length}</Badge>
                          )}
                        </div>
                        {isEditMode ? (
                          <div className="space-y-1 p-2 rounded-lg bg-amber-50/50 border border-amber-200/60">
                            {(editForm?.extraChargesDetailed || []).map((c: any, i: number) => (
                              editingExtraChargeIndex === i ? null : (
                                <div key={i} className="group flex items-center gap-2 p-1.5 rounded bg-white border border-amber-200">
                                  <span className="text-amber-600 font-bold text-xs">+</span>
                                  <span className="flex-1 text-xs text-slate-700">{c.name}</span>
                                  <span className="text-xs font-bold text-amber-700">₹{Number(c.price).toLocaleString('en-IN')}</span>
                                  <Button size="sm" variant="ghost" onClick={() => startEditExtraCharge(i)} className="h-5 w-5 p-0 text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Pencil className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => removeExtraCharge(i)} className="h-5 w-5 p-0 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-2.5 w-2.5" />
                                  </Button>
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
                              <Button variant="outline" onClick={() => setShowExtraChargeInput(true)} className="w-full h-7 text-[10px] border-dashed border-amber-400 text-amber-700 hover:bg-amber-100">
                                <Plus className="h-3 w-3 mr-1" />Add Charge
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {parsedExtraCharges.map((c, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-amber-600 font-bold text-xs">+</span>
                                  <span className="text-xs text-slate-700">{c.name}</span>
                                </div>
                                <span className="text-xs font-bold text-amber-700">₹{Number(c.price).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            )}

            {/* 6. ADDITIONAL NOTES - Collapsible (collapsed by default) */}
            {(isEditMode || listing.customNotes) && (
              <Card className="overflow-hidden border-0 shadow-md bg-white">
                {/* Collapsible Header */}
                <button
                  type="button"
                  onClick={() => toggleSection('additionalNotes')}
                  className="w-full bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 px-4 py-2.5 flex items-center justify-between group hover:from-slate-500 hover:via-slate-600 hover:to-slate-700 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      <FileText className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-white">Additional Notes</h3>
                    </div>
                  </div>
                  <div className={cn(
                    "p-1 rounded bg-white/10 transition-transform duration-300",
                    expandedSections.additionalNotes ? "rotate-180" : ""
                  )}>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </div>
                </button>
                
                {/* Collapsible Content */}
                <div className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  expandedSections.additionalNotes ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <CardContent className="p-3">
                    {isEditMode ? (
                      <Textarea 
                        value={editForm?.customNotes || ''} 
                        onChange={(e) => setEditForm((p: any) => ({ ...p, customNotes: e.target.value }))} 
                        rows={3} 
                        className="text-xs resize-none" 
                        placeholder="Add any additional terms or notes..."
                      />
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{listing.customNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            )}
          </div>

          {/* Right - Booking Widget - Enhanced */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2 border-slate-200 shadow-xl relative overflow-hidden rounded-2xl">
                {/* Preview Overlay - Enhanced */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="bg-white rounded-2xl shadow-xl p-5 text-center border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Preview Mode</p>
                    <p className="text-xs text-slate-500 mt-1">Booking is disabled in preview</p>
                  </div>
                </div>

                <CardHeader className="p-5 pb-3 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900">₹{displayPrice.toLocaleString('en-IN')}</span>
                        {priceLabel && <span className="text-sm text-slate-500">{priceLabel}</span>}
                        {isItem && listing.unit && !priceLabel && <span className="text-sm text-slate-500">/{listing.unit}</span>}
                      </div>
                      {listing.openForNegotiation && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />Price negotiable
                        </p>
                      )}
                    </div>
                    {isPackage && (
                      <Badge className="bg-gradient-to-r from-primary to-violet-600 text-white text-xs h-7 px-3">
                        <Package className="h-3 w-3 mr-1" />Package
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-3 space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Event Date *</Label>
                    <Button variant="outline" className="w-full justify-start text-left h-11 text-sm mt-2 text-slate-400 border-slate-200" disabled>
                      <CalendarIcon className="mr-2 h-4 w-4" />Select your event date
                    </Button>
                  </div>

                  {isItem && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Quantity</Label>
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
                    <div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-primary">₹{Math.round(displayPrice * 1.05).toLocaleString('en-IN')}</span></div>
                  </div>

                  <Button className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 shadow-lg" disabled>
                    <ShoppingCart className="mr-2 h-4 w-4" />Add to Cart
                  </Button>

                  <div className="pt-3 border-t space-y-2">
                    <p className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Free cancellation up to 48 hours</p>
                    <p className="text-xs text-slate-600 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" />Pay only after vendor confirms</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Card - Enhanced */}
              <Card className="mt-4 border-dashed border-2 border-slate-200 rounded-xl"><CardContent className="p-4">
                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Listing Status</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-400 mb-1">Status</p>
                    {listing.isActive ? (
                      <Badge className="bg-green-100 text-green-700 text-xs h-6 px-2">
                        <CheckCircle2 className="h-3 w-3 mr-1" />Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs h-6 px-2">Inactive</Badge>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-400 mb-1">Type</p>
                    <p className="text-sm font-semibold text-slate-700">{listing.type === 'PACKAGE' ? 'Package' : 'Service'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-400 mb-1">Category</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{listing.categoryName || listing.categoryId}</p>
                  </div>
                </div>
              </CardContent></Card>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
