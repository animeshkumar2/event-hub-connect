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
import { ImageUpload } from '@/shared/components/ImageUpload';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { 
  Star, MapPin, Clock, CheckCircle2, XCircle, ArrowLeft, User, Users, Package,
  AlertCircle, IndianRupee, Loader2, Save, X, Plus, Pencil, Eye, Heart, Share2,
  ShoppingCart, CalendarIcon, Lock, Camera, Trash2
} from 'lucide-react';
import { useVendorListingDetails, useVendorReviews, useEventTypes } from '@/shared/hooks/useApi';
import { publicApi, vendorApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { CategorySpecificDisplay } from '@/features/listing/CategorySpecificDisplay';
import { CategoryFieldRenderer } from '@/features/vendor/components/CategoryFields';
import { DeliveryTimeInput } from '@/features/vendor/components/DeliveryTimeInput';
import { ServiceModeSelector } from '@/shared/components/ServiceModeSelector';

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
  1: 'Wedding', 2: 'Birthday', 3: 'Corporate', 4: 'Anniversary', 5: 'Engagement',
  6: 'Baby Shower', 7: 'Housewarming', 8: 'Festival', 9: 'Concert', 10: 'Conference', 11: 'Other'
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
  const [draftIncludedItem, setDraftIncludedItem] = useState('');
  const [showIncludedItemInput, setShowIncludedItemInput] = useState(false);
  const [draftExcludedItem, setDraftExcludedItem] = useState('');
  const [showExcludedItemInput, setShowExcludedItemInput] = useState(false);
  const [draftExtraCharge, setDraftExtraCharge] = useState({ name: '', price: '' });
  const [showExtraChargeInput, setShowExtraChargeInput] = useState(false);
  
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
  const { data: reviewsData } = useVendorReviews(vendorId || null, 0, 5);
  const reviews = useMemo(() => {
    if (!reviewsData) return [];
    if (Array.isArray(reviewsData)) return reviewsData;
    return (reviewsData as any)?.content || [];
  }, [reviewsData]);

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
        // Handle both string and object cases
        if (typeof listing.categorySpecificData === 'string') {
          parsedCategoryData = JSON.parse(listing.categorySpecificData);
        } else if (typeof listing.categorySpecificData === 'object') {
          parsedCategoryData = listing.categorySpecificData;
        }
        // Debug: Log parsed data
        console.log('[EditMode] Parsed categorySpecificData:', parsedCategoryData);
      } catch (e) {
        console.error('[EditMode] Failed to parse categorySpecificData:', e);
      }
    } else {
      console.log('[EditMode] No categorySpecificData on listing');
    }
    
    let eventTypeIds: number[] = listing.eventTypeIds || (listing.eventTypes?.map((et: any) => typeof et === 'object' ? et.id : et).filter(Boolean) || []);
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
    setDraftHighlight(''); setShowHighlightInput(false);
    setDraftIncludedItem(''); setShowIncludedItemInput(false);
    setDraftExcludedItem(''); setShowExcludedItemInput(false);
    setDraftExtraCharge({ name: '', price: '' }); setShowExtraChargeInput(false);
  }, []);

  const saveChanges = useCallback(async () => {
    if (!listing || !editForm) return;
    setIsSaving(true);
    try {
      let finalPrice = editForm.price;
      if (isItem && listing.categoryId !== 'other') {
        const p = categorySpecificData;
        finalPrice = p.pricePerPlateVeg || p.price || p.photographyPrice || p.videographyPrice || p.bridalPrice || editForm.price;
      }
      const payload: any = {
        name: editForm.name, description: editForm.description, price: parseFloat(finalPrice) || 0,
        images: editForm.images, highlights: editForm.highlights.filter((h: string) => h.trim()),
        includedItemsText: editForm.includedItemsText, excludedItemsText: editForm.excludedItemsText,
        extraChargesDetailed: editForm.extraChargesDetailed.filter((ec: any) => ec.name.trim() && ec.price).map((ec: any) => ({ name: ec.name, price: parseFloat(ec.price) || 0 })),
        deliveryTime: editForm.deliveryTime, customNotes: editForm.customNotes,
        serviceMode: editForm.serviceMode, openForNegotiation: editForm.openForNegotiation,
        eventTypeIds: editForm.eventTypeIds,
        minimumQuantity: listing.categoryId === 'caterer' ? (editForm.minimumQuantity || 0) : undefined,
        categorySpecificData: isItem && listing.categoryId !== 'other' && Object.keys(categorySpecificData).length > 0 ? JSON.stringify(categorySpecificData) : undefined,
      };
      const response = await vendorApi.updateListing(listing.id, payload);
      if (response.success) {
        // Optimistic update - directly set the cache with new data
        const updatedListing = {
          ...listing,
          ...payload,
          extraChargesJson: JSON.stringify(payload.extraChargesDetailed || []),
        };
        queryClient.setQueryData(['vendorListingDetails', listingId], updatedListing);
        
        // Exit edit mode immediately with optimistic data
        setIsEditMode(false);
        setEditForm(null);
        
        // Show success toast
        toast.success('Listing updated!');
        
        // Background refetch to sync with server (won't block UI)
        queryClient.invalidateQueries({ queryKey: ['vendorListingDetails', listingId] });
      } else { toast.error(response.message || 'Failed to update'); }
    } catch (err: any) { toast.error(err.message || 'Failed to update'); }
    finally { setIsSaving(false); }
  }, [listing, editForm, categorySpecificData, isItem, listingId, queryClient]);

  const addHighlight = () => { if (draftHighlight.trim()) { setEditForm((p: any) => ({ ...p, highlights: [...(p.highlights || []), draftHighlight.trim()] })); setDraftHighlight(''); setShowHighlightInput(false); } };
  const removeHighlight = (i: number) => setEditForm((p: any) => ({ ...p, highlights: p.highlights.filter((_: any, idx: number) => idx !== i) }));
  const addIncludedItem = () => { if (draftIncludedItem.trim()) { setEditForm((p: any) => ({ ...p, includedItemsText: [...(p.includedItemsText || []), draftIncludedItem.trim()] })); setDraftIncludedItem(''); setShowIncludedItemInput(false); } };
  const removeIncludedItem = (i: number) => setEditForm((p: any) => ({ ...p, includedItemsText: p.includedItemsText.filter((_: any, idx: number) => idx !== i) }));
  const addExcludedItem = () => { if (draftExcludedItem.trim()) { setEditForm((p: any) => ({ ...p, excludedItemsText: [...(p.excludedItemsText || []), draftExcludedItem.trim()] })); setDraftExcludedItem(''); setShowExcludedItemInput(false); } };
  const removeExcludedItem = (i: number) => setEditForm((p: any) => ({ ...p, excludedItemsText: p.excludedItemsText.filter((_: any, idx: number) => idx !== i) }));
  const addExtraCharge = () => { if (draftExtraCharge.name.trim() && draftExtraCharge.price) { setEditForm((p: any) => ({ ...p, extraChargesDetailed: [...(p.extraChargesDetailed || []), { ...draftExtraCharge }] })); setDraftExtraCharge({ name: '', price: '' }); setShowExtraChargeInput(false); } };
  const removeExtraCharge = (i: number) => setEditForm((p: any) => ({ ...p, extraChargesDetailed: p.extraChargesDetailed.filter((_: any, idx: number) => idx !== i) }));
  const toggleEventType = (id: number) => setEditForm((p: any) => ({ ...p, eventTypeIds: p.eventTypeIds.includes(id) ? p.eventTypeIds.filter((x: number) => x !== id) : [...p.eventTypeIds, id] }));

  // Publish draft listing
  const publishListing = useCallback(async () => {
    if (!listing) return;
    
    // Validation: Must have images
    if (!listing.images || listing.images.length === 0) {
      toast.error('Please add at least one photo before publishing');
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
        navigate('/vendor/listings');
      } else {
        toast.error(response.message || 'Failed to publish');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  }, [listing, isTemplateBased, templateId, listingId, queryClient, navigate]);

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

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/vendor/listings')} className="h-8 px-2"><ArrowLeft className="h-4 w-4" /></Button>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary hidden sm:inline">Customer Preview</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button variant="ghost" size="sm" onClick={cancelEditMode} disabled={isSaving} className="h-7 text-xs"><X className="h-3 w-3 mr-1" />Cancel</Button>
                <Button size="sm" onClick={saveChanges} disabled={isSaving} className="h-7 text-xs bg-green-600 hover:bg-green-700">
                  {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}Save
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={enterEditMode} className="h-7 text-xs"><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                {listing.isDraft && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowDeleteDialog(true)}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={publishListing} 
                      disabled={isPublishing}
                      className="h-7 text-xs bg-primary hover:bg-primary/90"
                    >
                      {isPublishing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                      Publish
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {isEditMode && <div className="bg-amber-50 border-t border-amber-200 py-1"><p className="text-[10px] text-amber-700 text-center">✏️ Edit Mode</p></div>}
        {listing.isDraft && !isEditMode && (
          <div className="bg-blue-50 border-t border-blue-200 py-1.5 px-4">
            <p className="text-[11px] text-blue-700 text-center">
              📝 This is a draft. Add your photos and customize details, then publish to make it live.
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left - Main */}
          <div className="lg:col-span-2 space-y-3">

            {/* Images */}
            {isEditMode ? (
              <Card><CardContent className="p-3">
                <Label className="text-xs font-medium mb-2 block">Photos</Label>
                <ImageUpload images={editForm?.images || []} onChange={(imgs) => setEditForm((p: any) => ({ ...p, images: imgs }))} maxImages={10} />
              </CardContent></Card>
            ) : (
              <div className="space-y-2">
                {/* Main Image */}
                <div className="relative rounded-lg overflow-hidden bg-slate-200 aspect-[2/1]">
                  {listing.images?.[selectedImageIndex] ? (
                    <img src={listing.images[selectedImageIndex]} alt={listing.name} className="w-full h-full object-cover" />
                  ) : listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Camera className="h-8 w-8 text-slate-400" /></div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {isPackage && <Badge className="bg-primary/90 text-white text-[10px] h-5 px-1.5"><Package className="h-2.5 w-2.5 mr-0.5" />Package</Badge>}
                    {isItem && <Badge className="bg-emerald-500/90 text-white text-[10px] h-5 px-1.5">Item</Badge>}
                  </div>
                  {/* Image counter */}
                  {listing.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                      {selectedImageIndex + 1} / {listing.images.length}
                    </div>
                  )}
                </div>
                {/* Thumbnail Gallery - Show all images */}
                {listing.images?.length > 1 && (
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                    {listing.images.map((img: string, i: number) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedImageIndex(i)}
                        className={cn(
                          "aspect-square rounded-md overflow-hidden border-2 bg-slate-100 cursor-pointer transition-all",
                          selectedImageIndex === i ? "border-primary ring-1 ring-primary" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <img src={img} alt={`${listing.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Header */}
            {isEditMode ? (
              <Card><CardContent className="p-3 space-y-2">
                <div><Label className="text-xs">Name *</Label><Input value={editForm?.name || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} className="h-8 text-sm mt-1" /></div>
                <div><Label className="text-xs">Description</Label><Textarea value={editForm?.description || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))} rows={2} className="text-sm mt-1" /></div>
              </CardContent></Card>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">{listing.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{listing.vendorName}</span>
                    {listing.vendorCity && <><span>•</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.vendorCity}</span></>}
                    {listing.vendorRating > 0 && <><span>•</span><span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{listing.vendorRating.toFixed(1)}</span></>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7 opacity-50" disabled><Share2 className="h-3 w-3" /></Button>
                  <Button variant="outline" size="icon" className="h-7 w-7 opacity-50" disabled><Heart className="h-3 w-3" /></Button>
                </div>
              </div>
            )}

            {/* Description (view only) */}
            {!isEditMode && listing.description && (
              <Card><CardContent className="p-3">
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{listing.description}</p>
              </CardContent></Card>
            )}

            {/* Highlights */}
            {(displayHighlights.length > 0 || isEditMode) && (
              <Card><CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2">Highlights</h3>
                {isEditMode ? (
                  <div className="space-y-1.5">
                    {(editForm?.highlights || []).map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 p-1.5 rounded bg-green-50 border border-green-200 text-[11px]">
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" /><span className="flex-1 truncate">{item}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeHighlight(i)} className="h-5 w-5 p-0 text-red-500"><X className="h-2.5 w-2.5" /></Button>
                      </div>
                    ))}
                    {showHighlightInput ? (
                      <div className="flex items-center gap-1 p-1.5 rounded border-2 border-primary">
                        <Input value={draftHighlight} onChange={(e) => setDraftHighlight(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addHighlight(); if (e.key === 'Escape') { setShowHighlightInput(false); setDraftHighlight(''); } }} className="h-6 text-[11px] border-0 p-0 focus-visible:ring-0" placeholder="Add..." autoFocus />
                        <Button size="sm" variant="ghost" onClick={addHighlight} disabled={!draftHighlight.trim()} className="h-5 w-5 p-0 text-green-600"><CheckCircle2 className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowHighlightInput(false); setDraftHighlight(''); }} className="h-5 w-5 p-0 text-red-500"><X className="h-3 w-3" /></Button>
                      </div>
                    ) : <Button size="sm" variant="outline" onClick={() => setShowHighlightInput(true)} className="w-full h-6 text-[10px] border-dashed"><Plus className="h-2.5 w-2.5 mr-1" />Add</Button>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1">
                    {displayHighlights.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px]"><CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" /><span className="text-slate-700">{item}</span></div>
                    ))}
                  </div>
                )}
              </CardContent></Card>
            )}

            {/* Bundled Items */}
            {isPackage && linkedItems.length > 0 && !isEditMode && (
              <Card><CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Package className="h-3 w-3 text-primary" />Bundled Items ({linkedItems.length})</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {linkedItems.map((item: any) => (
                    <div key={item.id} className="rounded border overflow-hidden bg-white">
                      <div className="aspect-square bg-slate-100 relative">
                        {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-slate-300" /></div>}
                        <Badge className="absolute bottom-0.5 right-0.5 bg-white/90 text-slate-900 text-[9px] h-4 px-1 shadow">₹{Number(item.price).toLocaleString('en-IN')}</Badge>
                      </div>
                      <p className="text-[10px] font-medium p-1 truncate">{item.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            )}

            {/* Included/Excluded - Side by side (only show in edit mode OR when there's content) */}
            {(isEditMode || listing.includedItemsText?.length > 0 || listing.excludedItemsText?.length > 0) && (
              <div className={cn("grid gap-3", isEditMode ? "grid-cols-2" : (listing.includedItemsText?.length > 0 && listing.excludedItemsText?.length > 0) ? "grid-cols-2" : "grid-cols-1")}>
                {/* Included - show in edit mode OR when has content */}
                {(isEditMode || listing.includedItemsText?.length > 0) && (
                  <Card><CardContent className="p-3">
                    <h3 className="text-xs font-semibold mb-2 text-green-700">✓ Included</h3>
                    {isEditMode ? (
                      <div className="space-y-1">
                        {(editForm?.includedItemsText || []).map((item: string, i: number) => (
                          <div key={i} className="flex items-center gap-1 p-1 rounded bg-green-50 text-[10px]">
                            <span className="flex-1 truncate">{item}</span>
                            <Button size="sm" variant="ghost" onClick={() => removeIncludedItem(i)} className="h-4 w-4 p-0 text-red-500"><X className="h-2 w-2" /></Button>
                          </div>
                        ))}
                        {showIncludedItemInput ? (
                          <div className="flex items-center gap-1 p-1 rounded border border-primary">
                            <Input value={draftIncludedItem} onChange={(e) => setDraftIncludedItem(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addIncludedItem(); if (e.key === 'Escape') { setShowIncludedItemInput(false); setDraftIncludedItem(''); } }} className="h-5 text-[10px] border-0 p-0 focus-visible:ring-0" placeholder="Add..." autoFocus />
                            <Button size="sm" variant="ghost" onClick={addIncludedItem} className="h-4 w-4 p-0 text-green-600"><CheckCircle2 className="h-2.5 w-2.5" /></Button>
                          </div>
                        ) : <Button size="sm" variant="ghost" onClick={() => setShowIncludedItemInput(true)} className="w-full h-5 text-[9px] text-green-600"><Plus className="h-2 w-2 mr-0.5" />Add</Button>}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {listing.includedItemsText.map((item: string, i: number) => (
                          <p key={i} className="text-[10px] text-slate-600 flex items-start gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-green-500 mt-0.5 flex-shrink-0" />{item}</p>
                        ))}
                      </div>
                    )}
                  </CardContent></Card>
                )}

                {/* Excluded - show in edit mode OR when has content */}
                {(isEditMode || listing.excludedItemsText?.length > 0) && (
                  <Card><CardContent className="p-3">
                    <h3 className="text-xs font-semibold mb-2 text-red-700">✗ Not Included</h3>
                    {isEditMode ? (
                      <div className="space-y-1">
                        {(editForm?.excludedItemsText || []).map((item: string, i: number) => (
                          <div key={i} className="flex items-center gap-1 p-1 rounded bg-red-50 text-[10px]">
                            <span className="flex-1 truncate">{item}</span>
                            <Button size="sm" variant="ghost" onClick={() => removeExcludedItem(i)} className="h-4 w-4 p-0 text-red-500"><X className="h-2 w-2" /></Button>
                          </div>
                        ))}
                        {showExcludedItemInput ? (
                          <div className="flex items-center gap-1 p-1 rounded border border-primary">
                            <Input value={draftExcludedItem} onChange={(e) => setDraftExcludedItem(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addExcludedItem(); if (e.key === 'Escape') { setShowExcludedItemInput(false); setDraftExcludedItem(''); } }} className="h-5 text-[10px] border-0 p-0 focus-visible:ring-0" placeholder="Add..." autoFocus />
                            <Button size="sm" variant="ghost" onClick={addExcludedItem} className="h-4 w-4 p-0 text-green-600"><CheckCircle2 className="h-2.5 w-2.5" /></Button>
                          </div>
                        ) : <Button size="sm" variant="ghost" onClick={() => setShowExcludedItemInput(true)} className="w-full h-5 text-[9px] text-red-600"><Plus className="h-2 w-2 mr-0.5" />Add</Button>}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {listing.excludedItemsText.map((item: string, i: number) => (
                          <p key={i} className="text-[10px] text-slate-600 flex items-start gap-1"><XCircle className="h-2.5 w-2.5 text-red-500 mt-0.5 flex-shrink-0" />{item}</p>
                        ))}
                      </div>
                    )}
                  </CardContent></Card>
                )}
              </div>
            )}

            {/* Extra Charges */}
            {(isEditMode || parsedExtraCharges.length > 0) && (
              <Card><CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2">Extra Charges</h3>
                {isEditMode ? (
                  <div className="space-y-1">
                    {(editForm?.extraChargesDetailed || []).map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-1 p-1 rounded bg-amber-50 text-[10px]">
                        <span className="flex-1 truncate">{c.name}</span><span className="font-medium">₹{Number(c.price).toLocaleString('en-IN')}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeExtraCharge(i)} className="h-4 w-4 p-0 text-red-500"><X className="h-2 w-2" /></Button>
                      </div>
                    ))}
                    {showExtraChargeInput ? (
                      <div className="flex items-center gap-1 p-1 rounded border border-primary">
                        <Input value={draftExtraCharge.name} onChange={(e) => setDraftExtraCharge(p => ({ ...p, name: e.target.value }))} className="flex-1 h-5 text-[10px] border-0 p-0 focus-visible:ring-0" placeholder="Name" autoFocus />
                        <div className="flex items-center bg-slate-100 rounded px-1"><span className="text-[10px]">₹</span><Input type="number" value={draftExtraCharge.price} onChange={(e) => setDraftExtraCharge(p => ({ ...p, price: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') addExtraCharge(); }} className="w-12 h-5 text-[10px] border-0 p-0 bg-transparent focus-visible:ring-0" /></div>
                        <Button size="sm" variant="ghost" onClick={addExtraCharge} className="h-4 w-4 p-0 text-green-600"><CheckCircle2 className="h-2.5 w-2.5" /></Button>
                      </div>
                    ) : <Button size="sm" variant="ghost" onClick={() => setShowExtraChargeInput(true)} className="w-full h-5 text-[9px]"><Plus className="h-2 w-2 mr-0.5" />Add</Button>}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {parsedExtraCharges.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] p-1 rounded bg-slate-50">
                        <span className="text-slate-600">{c.name}</span><span className="font-medium text-primary">₹{Number(c.price).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent></Card>
            )}

            {/* Service Details */}
            {isEditMode ? (
              <Card><CardContent className="p-3 space-y-2">
                <h3 className="text-xs font-semibold">Service Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-[10px]">Delivery Time</Label><DeliveryTimeInput value={editForm?.deliveryTime || ''} onChange={(v) => setEditForm((p: any) => ({ ...p, deliveryTime: v }))} /></div>
                  <div><Label className="text-[10px]">Service Mode</Label><ServiceModeSelector value={editForm?.serviceMode || 'BOTH'} onChange={(v) => setEditForm((p: any) => ({ ...p, serviceMode: v }))} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="neg" checked={editForm?.openForNegotiation || false} onCheckedChange={(c) => setEditForm((p: any) => ({ ...p, openForNegotiation: c }))} className="h-3 w-3" />
                  <Label htmlFor="neg" className="text-[10px] cursor-pointer">Open for negotiation</Label>
                </div>
                {listing.categoryId === 'caterer' && (
                  <div><Label className="text-[10px]">Min. Order (plates)</Label><Input type="number" value={editForm?.minimumQuantity || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, minimumQuantity: parseInt(e.target.value) || 0 }))} className="h-7 text-xs w-24 mt-1" /></div>
                )}
              </CardContent></Card>
            ) : (listing.deliveryTime || listing.serviceMode) && (
              <Card><CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2">Service Details</h3>
                <div className="space-y-2">
                  {listing.deliveryTime && (() => {
                    const delivery = formatDeliveryTime(listing.deliveryTime);
                    return (
                      <div className="flex items-start gap-2 p-2 rounded bg-slate-50">
                        <Clock className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-medium text-slate-700">Delivery: {delivery.label}</p>
                          {delivery.description && <p className="text-[9px] text-slate-500">{delivery.description}</p>}
                        </div>
                      </div>
                    );
                  })()}
                  {listing.serviceMode && (() => {
                    const mode = getServiceModeWithDescription(listing.serviceMode);
                    return (
                      <div className="flex items-start gap-2 p-2 rounded bg-slate-50">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-medium text-slate-700">Service Mode: {mode.label}</p>
                          {mode.description && <p className="text-[9px] text-slate-500">{mode.description}</p>}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="flex items-start gap-2 p-2 rounded bg-slate-50">
                    <IndianRupee className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-medium text-slate-700">Negotiation: {listing.openForNegotiation ? 'Yes' : 'No'}</p>
                      <p className="text-[9px] text-slate-500">{listing.openForNegotiation ? 'Price is negotiable - feel free to discuss' : 'Fixed pricing'}</p>
                    </div>
                  </div>
                  {listing.categoryId === 'caterer' && listing.minimumQuantity > 0 && (
                    <div className="flex items-start gap-2 p-2 rounded bg-slate-50">
                      <Users className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-medium text-slate-700">Minimum Order: {listing.minimumQuantity} plates</p>
                        <p className="text-[9px] text-slate-500">Minimum quantity required for booking</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent></Card>
            )}

            {/* Category Details */}
            {(isEditMode || listing.categorySpecificData) && (
              isEditMode ? (
                <Card><CardContent className="p-3">
                  <h3 className="text-xs font-semibold mb-2">Category Details</h3>
                  <CategoryFieldRenderer 
                    categoryId={listing.categoryId} 
                    values={categorySpecificData} 
                    onChange={setCategorySpecificData} 
                    errors={{}} 
                    listingType={listing.type} 
                  />
                </CardContent></Card>
              ) : listing.categorySpecificData ? (
                <CategorySpecificDisplay categoryId={listing.categoryId} categorySpecificData={listing.categorySpecificData} />
              ) : null
            )}

            {/* Event Types */}
            {(isEditMode || listing.eventTypeIds?.length > 0) && (
              <Card><CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2">Event Types</h3>
                {isEditMode ? (
                  <div className="flex flex-wrap gap-1">
                    {eventTypes.map((et: any) => {
                      const sel = (editForm?.eventTypeIds || []).includes(et.id);
                      return <Badge key={et.id} variant={sel ? 'default' : 'outline'} className={cn('cursor-pointer text-[10px] h-5 px-1.5', sel ? 'bg-primary' : 'hover:bg-primary/10')} onClick={() => toggleEventType(et.id)}>{sel && <CheckCircle2 className="h-2 w-2 mr-0.5" />}{et.displayName || et.name}</Badge>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {listing.eventTypeIds?.map((id: number) => <Badge key={id} variant="secondary" className="text-[10px] h-5 px-1.5">{eventTypeNames[id] || `Event ${id}`}</Badge>)}
                  </div>
                )}
              </CardContent></Card>
            )}

            {/* Notes */}
            {(isEditMode || listing.customNotes) && (
              <Card><CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2">Additional Notes</h3>
                {isEditMode ? <Textarea value={editForm?.customNotes || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, customNotes: e.target.value }))} rows={2} className="text-xs" placeholder="Terms, notes..." />
                : <p className="text-[10px] text-slate-600 whitespace-pre-line">{listing.customNotes}</p>}
              </CardContent></Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 && !isEditMode && (
              <Card><CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2">Reviews {listing.vendorRating > 0 && <span className="font-normal text-slate-400">({listing.vendorRating.toFixed(1)})</span>}</h3>
                <div className="space-y-2">
                  {reviews.slice(0, 2).map((r: any) => (
                    <div key={r.id} className="border-b last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-medium">{r.customerName || 'Anonymous'}</p>
                        <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={cn('h-2.5 w-2.5', i < (r.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />)}</div>
                      </div>
                      {r.comment && <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            )}
          </div>

          {/* Right - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-16">
              <Card className="border shadow-lg relative overflow-hidden">
                {/* Preview Overlay */}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-md p-3 text-center">
                    <Lock className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-[10px] font-medium">Preview Mode</p>
                    <p className="text-[9px] text-slate-500">Booking disabled</p>
                  </div>
                </div>

                <CardHeader className="p-3 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xl font-bold">₹{displayPrice.toLocaleString('en-IN')}</span>
                      {priceLabel && <span className="text-[10px] text-slate-500 ml-1">{priceLabel}</span>}
                      {isItem && listing.unit && !priceLabel && <span className="text-[10px] text-slate-500 ml-1">/{listing.unit}</span>}
                    </div>
                    {isPackage && <Badge className="bg-primary/10 text-primary text-[9px] h-4 px-1">Package</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="p-3 pt-0 space-y-3">
                  <div>
                    <Label className="text-[10px] font-medium">Event Date *</Label>
                    <Button variant="outline" className="w-full justify-start text-left h-8 text-xs mt-1 text-slate-400" disabled>
                      <CalendarIcon className="mr-1.5 h-3 w-3" />Pick date
                    </Button>
                  </div>

                  {isItem && (
                    <div>
                      <Label className="text-[10px] font-medium">Quantity</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" disabled><span>−</span></Button>
                        <Input value={listing.minimumQuantity || 1} className="w-14 h-7 text-xs text-center" disabled />
                        <Button variant="outline" size="icon" className="h-7 w-7" disabled><span>+</span></Button>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-500">Base</span><span>₹{displayPrice.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Service fee</span><span>₹{Math.round(displayPrice * 0.05).toLocaleString('en-IN')}</span></div>
                    <Separator />
                    <div className="flex justify-between font-bold text-xs"><span>Total</span><span className="text-primary">₹{Math.round(displayPrice * 1.05).toLocaleString('en-IN')}</span></div>
                  </div>

                  <Button className="w-full h-9 text-xs" disabled><ShoppingCart className="mr-1.5 h-3 w-3" />Add to Cart</Button>

                  <div className="pt-2 border-t space-y-1">
                    <p className="text-[9px] text-slate-500 flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-green-500" />Free cancellation</p>
                    <p className="text-[9px] text-slate-500 flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5 text-amber-500" />Pay after confirmation</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card className="mt-3 border-dashed"><CardContent className="p-3">
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div><p className="text-slate-400">Status</p>{listing.isActive ? <Badge className="bg-green-500 text-white text-[9px] h-4 px-1">Active</Badge> : <Badge variant="secondary" className="text-[9px] h-4 px-1">Inactive</Badge>}</div>
                  <div><p className="text-slate-400">Type</p><p className="font-medium capitalize">{listing.type?.toLowerCase()}</p></div>
                  <div><p className="text-slate-400">Category</p><p className="font-medium truncate">{listing.categoryName || listing.categoryId}</p></div>
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
