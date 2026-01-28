import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { ImageUpload, PendingImageChanges } from '@/shared/components/ImageUpload';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { uploadImage, deleteImages } from '@/shared/utils/storage';
import { 
  Star, MapPin, Clock, CheckCircle2, XCircle, ArrowLeft, User, Users, Package,
  IndianRupee, Loader2, Save, X, Plus, Pencil, Eye, Box, AlertCircle,
  CalendarIcon, Camera, Trash2,
  Target, Shield, Sparkles, Palette, UtensilsCrossed,
  Building2, Music, Speaker, MoreHorizontal, ChevronRight, Lock
} from 'lucide-react';
import { useEventTypes, useVendorListingsData, useVendorProfile } from '@/shared/hooks/useApi';
import { publicApi, vendorApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { CategorySpecificDisplay } from '@/features/listing/CategorySpecificDisplay';

// Category icon mapping
const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'photography-videography':
    case 'photographer':
    case 'cinematographer':
    case 'videographer':
      return Camera;
    case 'decorator':
      return Palette;
    case 'caterer':
      return UtensilsCrossed;
    case 'venue':
      return Building2;
    case 'mua':
      return Sparkles;
    case 'dj-entertainment':
    case 'dj':
    case 'live-music':
      return Music;
    case 'sound-lights':
      return Speaker;
    default:
      return MoreHorizontal;
  }
};

interface VendorPackagePreviewProps {
  listing: any;
  listingId: string;
  onBack: () => void;
}

export function VendorPackagePreview({ listing, listingId, onBack }: VendorPackagePreviewProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // Fetch vendor profile for display name and profile picture
  const { data: vendorProfile } = useVendorProfile();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expandedServices, setExpandedServices] = useState<string[]>([]);
  
  // Draft states for inline editing
  const [draftHighlight, setDraftHighlight] = useState('');
  const [showHighlightInput, setShowHighlightInput] = useState(false);
  const [draftIncludedItem, setDraftIncludedItem] = useState('');
  const [showIncludedItemInput, setShowIncludedItemInput] = useState(false);
  const [draftExcludedItem, setDraftExcludedItem] = useState('');
  const [showExcludedItemInput, setShowExcludedItemInput] = useState(false);
  const [draftExtraCharge, setDraftExtraCharge] = useState({ name: '', price: '' });
  const [showExtraChargeInput, setShowExtraChargeInput] = useState(false);
  
  // Pending image changes
  const [pendingImageChanges, setPendingImageChanges] = useState<PendingImageChanges | null>(null);
  
  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data: eventTypesData } = useEventTypes();
  const eventTypes = useMemo(() => eventTypesData || [], [eventTypesData]);

  // Fetch vendor's items for bundle selection in edit mode
  const { listings: vendorListingsQuery, categories: categoriesQuery } = useVendorListingsData();
  const allVendorItems = useMemo(() => {
    const items = vendorListingsQuery.data || [];
    // Filter to only show ITEM type listings (not packages) and exclude current listing
    return items.filter((item: any) => 
      (item.type === 'ITEM' || item.type === 'item') && 
      item.id !== listing?.id &&
      !item.isDraft // Only show published items
    );
  }, [vendorListingsQuery.data, listing?.id]);

  const getCategoryName = useCallback((categoryId: string) => {
    const cats = categoriesQuery.data || [];
    const cat = cats.find((c: any) => c.id === categoryId);
    return cat?.displayName || cat?.name || categoryId || 'Other';
  }, [categoriesQuery.data]);

  // Fetch bundled items
  const { data: bundledItemsData } = useQuery({
    queryKey: ['bundledItems', listing?.includedItemIds],
    queryFn: async () => {
      if (!listing?.includedItemIds || listing.includedItemIds.length === 0) return [];
      const response = await publicApi.getListingsByIds(listing.includedItemIds);
      return response && typeof response === 'object' && 'data' in response 
        ? (response as any).data 
        : response;
    },
    enabled: !!(listing?.includedItemIds && listing.includedItemIds.length > 0),
    staleTime: 2 * 60 * 1000,
  });

  const linkedItems = useMemo(() => 
    Array.isArray(bundledItemsData) ? bundledItemsData : [], 
    [bundledItemsData]
  );

  // Calculate savings
  const { individualTotal, packagePrice, savings, savingsPercent } = useMemo(() => {
    const individual = linkedItems.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);
    const pkg = Number(listing?.price) || 0;
    const save = individual - pkg;
    const percent = individual > 0 ? Math.round((save / individual) * 100) : 0;
    return { individualTotal: individual, packagePrice: pkg, savings: save > 0 ? save : 0, savingsPercent: percent > 0 ? percent : 0 };
  }, [linkedItems, listing?.price]);

  // Parse extra charges
  const parsedExtraCharges = useMemo(() => {
    if (listing?.extraChargesJson) { try { return JSON.parse(listing.extraChargesJson); } catch { return []; } }
    return [];
  }, [listing?.extraChargesJson]);

  // Check if template-based
  const isTemplateBased = useMemo(() => listing?.customNotes?.startsWith('__TEMPLATE__:'), [listing?.customNotes]);
  const templateId = useMemo(() => isTemplateBased && listing?.customNotes ? listing.customNotes.replace('__TEMPLATE__:', '') : null, [isTemplateBased, listing?.customNotes]);

  // Toggle service expansion
  const toggleService = (itemId: string) => setExpandedServices(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  const expandAllServices = () => setExpandedServices(linkedItems.map((item: any) => item.id));

  // Enter edit mode
  const enterEditMode = useCallback(() => {
    if (!listing) return;
    let extraChargesDetailed: { name: string; price: string }[] = [];
    if (listing.extraChargesJson) { try { extraChargesDetailed = JSON.parse(listing.extraChargesJson).map((ec: any) => ({ name: ec.name, price: ec.price?.toString() || '' })); } catch {} }
    let eventTypeIds: number[] = listing.eventTypeIds || (listing.eventTypes?.map((et: any) => typeof et === 'object' ? et.id : et).filter(Boolean) || []);
    setEditForm({
      name: listing.name || '', description: listing.description || '', price: listing.price?.toString() || '',
      images: listing.images || [], highlights: listing.highlights || [],
      includedItemsText: listing.includedItemsText || [], excludedItemsText: listing.excludedItemsText || [],
      extraChargesDetailed, deliveryTime: listing.deliveryTime || '', customNotes: listing.customNotes || '',
      serviceMode: listing.serviceMode || 'BOTH', openForNegotiation: listing.openForNegotiation || false, eventTypeIds,
      includedItemIds: listing.includedItemIds || [], // Add bundled item IDs
    });
    setIsEditMode(true);
  }, [listing]);

  // Auto-enter edit mode if ?edit=true
  useEffect(() => {
    const shouldEdit = searchParams.get('edit') === 'true';
    if (shouldEdit && listing && !isEditMode) { enterEditMode(); searchParams.delete('edit'); setSearchParams(searchParams, { replace: true }); }
  }, [searchParams, listing, isEditMode, enterEditMode, setSearchParams]);

  // Cancel edit mode
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false); setEditForm(null);
    setDraftHighlight(''); setShowHighlightInput(false);
    setDraftIncludedItem(''); setShowIncludedItemInput(false);
    setDraftExcludedItem(''); setShowExcludedItemInput(false);
    setDraftExtraCharge({ name: '', price: '' }); setShowExtraChargeInput(false);
    setPendingImageChanges(null);
  }, []);

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!listing || !editForm) return;
    
    // Get valid item IDs (items that actually exist)
    const validItemIds = (editForm.includedItemIds || []).filter((id: string) => 
      allVendorItems.some((item: any) => item.id === id)
    );
    
    // Validate minimum 2 services for package
    if (validItemIds.length < 2) {
      toast.error('A package must have at least 2 services');
      return;
    }
    
    setIsSaving(true);
    try {
      let finalImages = editForm.images || [];
      if (pendingImageChanges) {
        const vendorId = localStorage.getItem('vendor_id') || 'unknown';
        const folder = `vendors/${vendorId}/listings/${listing.id}`;
        const uploadedUrls: Map<File, string> = new Map();
        for (const file of pendingImageChanges.filesToUpload) {
          try { const url = await uploadImage(file, folder); uploadedUrls.set(file, url); }
          catch (error: any) { toast.error(`Failed to upload ${file.name}: ${error.message}`); throw error; }
        }
        finalImages = pendingImageChanges.finalOrder.map(item => typeof item === 'string' ? item : uploadedUrls.get(item) || '').filter(url => url !== '');
        if (pendingImageChanges.urlsToDelete.length > 0) deleteImages(pendingImageChanges.urlsToDelete).catch(console.error);
      }
      const payload: any = {
        name: editForm.name, description: editForm.description, price: parseFloat(editForm.price) || 0,
        images: finalImages, highlights: editForm.highlights.filter((h: string) => h.trim()),
        includedItemsText: editForm.includedItemsText, excludedItemsText: editForm.excludedItemsText,
        extraChargesDetailed: editForm.extraChargesDetailed.filter((ec: any) => ec.name.trim() && ec.price).map((ec: any) => ({ name: ec.name, price: parseFloat(ec.price) || 0 })),
        deliveryTime: editForm.deliveryTime, customNotes: editForm.customNotes,
        serviceMode: editForm.serviceMode, openForNegotiation: editForm.openForNegotiation, eventTypeIds: editForm.eventTypeIds,
        includedItemIds: validItemIds, // Only include valid item IDs
      };
      const response = await vendorApi.updateListing(listing.id, payload);
      if (response.success) {
        queryClient.setQueryData(['vendorListingDetails', listingId], { ...listing, ...payload, extraChargesJson: JSON.stringify(payload.extraChargesDetailed || []) });
        setPendingImageChanges(null); setIsEditMode(false); setEditForm(null);
        toast.success('Package updated!');
        queryClient.invalidateQueries({ queryKey: ['vendorListingDetails', listingId] });
        queryClient.invalidateQueries({ queryKey: ['vendorListings'] });
        queryClient.invalidateQueries({ queryKey: ['myVendorListings'] });
      } else toast.error(response.message || 'Failed to update');
    } catch (err: any) { toast.error(err.message || 'Failed to update'); }
    finally { setIsSaving(false); }
  }, [listing, editForm, pendingImageChanges, listingId, queryClient, allVendorItems]);

  // Publish listing
  const publishListing = useCallback(async () => {
    if (!listing) return;
    if (!listing.images || listing.images.length === 0) { toast.error('Please add at least one photo before publishing'); return; }
    if (isTemplateBased) {
      const { getTemplateById } = await import('@/shared/constants/listingTemplates');
      const originalTemplate = templateId ? getTemplateById(templateId) : null;
      if (originalTemplate && listing.name === originalTemplate.name) { toast.error('Please customize the listing name before publishing'); return; }
    }
    setIsPublishing(true);
    try {
      const response = await vendorApi.updateListing(listing.id, { isDraft: false, isActive: true, customNotes: isTemplateBased ? '' : listing.customNotes });
      if (response.success) { toast.success('Package published!'); queryClient.invalidateQueries({ queryKey: ['vendorListingDetails', listingId] }); queryClient.invalidateQueries({ queryKey: ['vendorListings'] }); queryClient.invalidateQueries({ queryKey: ['myVendorListings'] }); navigate('/vendor/listings'); }
      else toast.error(response.message || 'Failed to publish');
    } catch (err: any) { toast.error(err.message || 'Failed to publish'); }
    finally { setIsPublishing(false); }
  }, [listing, isTemplateBased, templateId, listingId, queryClient, navigate]);

  // Delete listing
  const deleteListing = useCallback(async () => {
    if (!listing) return;
    setIsDeleting(true);
    try {
      const response = await vendorApi.deleteListing(listing.id);
      if (response.success) { toast.success('Package deleted!'); queryClient.invalidateQueries({ queryKey: ['vendorListings'] }); queryClient.invalidateQueries({ queryKey: ['myVendorListings'] }); navigate('/vendor/listings'); }
      else toast.error(response.message || 'Failed to delete');
    } catch (err: any) { toast.error(err.message || 'Failed to delete'); }
    finally { setIsDeleting(false); setShowDeleteDialog(false); }
  }, [listing, queryClient, navigate]);

  // Inline editing helpers
  const addHighlight = () => { if (draftHighlight.trim()) { setEditForm((p: any) => ({ ...p, highlights: [...(p.highlights || []), draftHighlight.trim()] })); setDraftHighlight(''); setShowHighlightInput(false); } };
  const removeHighlight = (i: number) => setEditForm((p: any) => ({ ...p, highlights: p.highlights.filter((_: any, idx: number) => idx !== i) }));
  const addIncludedItem = () => { if (draftIncludedItem.trim()) { setEditForm((p: any) => ({ ...p, includedItemsText: [...(p.includedItemsText || []), draftIncludedItem.trim()] })); setDraftIncludedItem(''); setShowIncludedItemInput(false); } };
  const removeIncludedItem = (i: number) => setEditForm((p: any) => ({ ...p, includedItemsText: p.includedItemsText.filter((_: any, idx: number) => idx !== i) }));
  const addExcludedItem = () => { if (draftExcludedItem.trim()) { setEditForm((p: any) => ({ ...p, excludedItemsText: [...(p.excludedItemsText || []), draftExcludedItem.trim()] })); setDraftExcludedItem(''); setShowExcludedItemInput(false); } };
  const removeExcludedItem = (i: number) => setEditForm((p: any) => ({ ...p, excludedItemsText: p.excludedItemsText.filter((_: any, idx: number) => idx !== i) }));
  const addExtraCharge = () => { if (draftExtraCharge.name.trim() && draftExtraCharge.price) { setEditForm((p: any) => ({ ...p, extraChargesDetailed: [...(p.extraChargesDetailed || []), { ...draftExtraCharge }] })); setDraftExtraCharge({ name: '', price: '' }); setShowExtraChargeInput(false); } };
  const removeExtraCharge = (i: number) => setEditForm((p: any) => ({ ...p, extraChargesDetailed: p.extraChargesDetailed.filter((_: any, idx: number) => idx !== i) }));
  const toggleEventType = (id: number) => setEditForm((p: any) => ({ ...p, eventTypeIds: p.eventTypeIds.includes(id) ? p.eventTypeIds.filter((x: number) => x !== id) : [...p.eventTypeIds, id] }));
  
  // Toggle bundled item selection (minimum 2 required)
  const toggleBundledItem = (itemId: string) => {
    setEditForm((p: any) => {
      const currentIds = p.includedItemIds || [];
      const isCurrentlySelected = currentIds.includes(itemId);
      
      // Prevent deselecting if it would go below 2 items (this is also enforced in UI)
      if (isCurrentlySelected && currentIds.length <= 2) {
        return p; // Silently prevent - UI already shows why
      }
      
      return {
        ...p,
        includedItemIds: isCurrentlySelected
          ? currentIds.filter((id: string) => id !== itemId)
          : [...currentIds, itemId]
      };
    });
  };

  // Calculate edit mode totals based on selected items
  const editModeTotal = useMemo(() => {
    if (!isEditMode || !editForm?.includedItemIds) return { total: 0, items: [], validCount: 0 };
    // Only count items that exist in allVendorItems (valid/available items)
    const selectedItems = allVendorItems.filter((item: any) => editForm.includedItemIds.includes(item.id));
    const total = selectedItems.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);
    return { total, items: selectedItems, validCount: selectedItems.length };
  }, [isEditMode, editForm?.includedItemIds, allVendorItems]);

  if (!listing) return null;

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
                <p className="text-[10px] text-primary/70">How customers see this package</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={cancelEditMode} disabled={isSaving} className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                    <X className="h-3 w-3 mr-1" />Cancel
                  </Button>
                  <Button size="sm" onClick={saveChanges} disabled={isSaving} className="h-7 text-xs bg-green-600 hover:bg-green-700">
                    {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}Save
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={onBack} className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                    <ArrowLeft className="h-3 w-3 mr-1" />Back
                  </Button>
                  <Button size="sm" variant="outline" onClick={enterEditMode} className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                    <Pencil className="h-3 w-3 mr-1" />Edit
                  </Button>
                  {listing.isDraft && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setShowDeleteDialog(true)} className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                        <Trash2 className="h-3 w-3 mr-1" />Delete
                      </Button>
                      <Button size="sm" onClick={publishListing} disabled={isPublishing} className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                        {isPublishing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}Publish
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditMode && (
        <div className="bg-amber-50 border-b border-amber-200 py-1">
          <p className="text-[10px] text-amber-700 text-center">✏️ Edit Mode - Make changes and save</p>
        </div>
      )}

      {listing.isDraft && !isEditMode && (
        <div className="bg-blue-50 border-b border-blue-200 py-1.5 px-4">
          <p className="text-[11px] text-blue-700 text-center">📝 This is a draft. Add photos and customize, then publish to go live.</p>
        </div>
      )}

      {/* Main Content - Same layout as customer view */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Hero Image */}
            {isEditMode ? (
              <Card><CardContent className="p-4">
                <Label className="text-xs font-medium mb-2 block">Package Photos</Label>
                <ImageUpload images={editForm?.images || []} onChange={(imgs) => setEditForm((p: any) => ({ ...p, images: imgs }))} onPendingChanges={setPendingImageChanges} maxImages={10} />
              </CardContent></Card>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-slate-200 aspect-[16/9]">
                {listing.images?.[selectedImageIndex] ? (
                  <img src={listing.images[selectedImageIndex]} alt={listing.name} className="w-full h-full object-cover" />
                ) : listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="h-12 w-12 text-slate-400" /></div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-white text-xs px-2 py-1"><Package className="h-3 w-3 mr-1" />Package Deal</Badge>
                </div>
                {listing.images?.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">{selectedImageIndex + 1} / {listing.images.length}</div>
                )}
              </div>
            )}

            {/* Thumbnail Gallery */}
            {!isEditMode && listing.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImageIndex(i)} className={cn("flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all", selectedImageIndex === i ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-slate-300")}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Package Title & Vendor Info */}
            {isEditMode ? (
              <Card><CardContent className="p-4 space-y-4">
                <div><Label className="text-xs font-medium">Package Name *</Label><Input value={editForm?.name || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} className="h-9 text-sm mt-1" /></div>
                <div><Label className="text-xs font-medium">Description</Label><Textarea value={editForm?.description || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} className="text-sm mt-1" /></div>
                
                {/* Enhanced Package Price Section - Like Form */}
                <div className="space-y-3 pt-2 border-t">
                  {/* Bundled Items Summary */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Bundled Items ({editModeTotal.items.length})
                    </Label>
                    <div className="border rounded-lg overflow-hidden bg-slate-50/50">
                      {editModeTotal.items.length > 0 ? (
                        <>
                          {editModeTotal.items.map((item: any, index: number) => (
                            <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 border-b last:border-b-0 bg-white">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-slate-400 text-xs">{index + 1}.</span>
                                <span className="text-xs font-medium truncate">{item.name}</span>
                              </div>
                              <span className="text-xs font-semibold text-slate-700">₹{Number(item.price).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-t-2">
                            <span className="text-xs font-bold">Base Price Total</span>
                            <span className="text-sm font-bold">₹{editModeTotal.total.toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      ) : (
                        <div className="px-3 py-4 text-center text-xs text-slate-500">
                          No services selected. Select services below.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Package Price Input */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Your Package Price *
                    </Label>
                    <p className="text-[10px] text-slate-500">Set your final package price. You can offer a discount or add a markup.</p>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</div>
                      <Input 
                        type="number" 
                        value={editForm?.price || ''} 
                        onChange={(e) => setEditForm((p: any) => ({ ...p, price: e.target.value }))} 
                        className="h-11 text-base font-semibold pl-8 border-2 border-primary/30" 
                        placeholder="Enter package price"
                      />
                    </div>

                    {/* Price Comparison - Discount/Markup Indicator */}
                    {editForm?.price && Number(editForm.price) > 0 && (() => {
                      const pkgPrice = Number(editForm.price);
                      const baseTotal = editModeTotal.total;
                      const diff = pkgPrice - baseTotal;
                      const pct = baseTotal > 0 ? ((diff / baseTotal) * 100) : 0;
                      const isDiscount = diff < 0;
                      const isMarkup = diff > 0;
                      const isEqual = diff === 0;

                      return (
                        <div className="space-y-2">
                          {isDiscount && (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200">
                              <div className="p-1 rounded bg-green-100"><IndianRupee className="h-3 w-3 text-green-600" /></div>
                              <div className="flex-1 flex items-center justify-between">
                                <span className="text-xs font-semibold text-green-700">{Math.abs(pct).toFixed(1)}% Discount</span>
                                <span className="text-xs text-green-600">Save ₹{Math.abs(diff).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                          {isMarkup && (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-50 border border-orange-200">
                              <div className="p-1 rounded bg-orange-100"><IndianRupee className="h-3 w-3 text-orange-600" /></div>
                              <div className="flex-1 flex items-center justify-between">
                                <span className="text-xs font-semibold text-orange-700">{pct.toFixed(1)}% Markup</span>
                                <span className="text-xs text-orange-600">+₹{diff.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                          {isEqual && (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="p-1 rounded bg-slate-100"><IndianRupee className="h-3 w-3 text-slate-500" /></div>
                              <span className="text-xs font-semibold text-slate-600">No Discount or Markup</span>
                            </div>
                          )}

                          {/* Price Breakdown */}
                          <div className="grid grid-cols-2 gap-2 p-2.5 border rounded-lg bg-slate-50/50">
                            <div>
                              <p className="text-[10px] text-slate-500">Base Price</p>
                              <p className="text-xs font-semibold">₹{baseTotal.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500">Package Price</p>
                              <p className="text-xs font-semibold text-primary">₹{pkgPrice.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent></Card>
            ) : (
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{listing.name}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><User className="h-4 w-4" /><span className="font-medium">{listing.vendorName}</span></span>
                  {listing.vendorCity && <><span className="text-slate-300">•</span><span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{listing.vendorCity}</span></>}
                  {listing.vendorRating > 0 && <><span className="text-slate-300">•</span><span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="font-medium">{listing.vendorRating.toFixed(1)}</span></span></>}
                </div>
              </div>
            )}

            {/* This Package Includes / Bundle Selection */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    {isEditMode ? 'Bundle Your Services' : 'This Package Includes'}
                  </h2>
                  {isEditMode ? (
                    editModeTotal.validCount > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{editModeTotal.validCount} selected</Badge>
                    )
                  ) : (
                    linkedItems.length > 0 && <Badge variant="secondary" className="text-[10px]">{linkedItems.length} Services</Badge>
                  )}
                </div>
                
                {/* Edit Mode - Service Selection */}
                {isEditMode ? (
                  <div className="space-y-3">
                    {/* Prerequisite Check - Need at least 2 services available to select from */}
                    {allVendorItems.length < 2 && editModeTotal.validCount < 2 && (
                      <Alert className="border-orange-500/50 bg-orange-500/10">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <AlertDescription className="text-sm text-orange-700">
                          You need at least 2 services to create a package. Please create some services first!
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Validation Messages */}
                    {editModeTotal.validCount < 2 && allVendorItems.length >= 2 && (
                      <Alert className="border-yellow-500/50 bg-yellow-500/10">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-sm text-yellow-700">
                          Please select at least 2 services to create a package
                        </AlertDescription>
                      </Alert>
                    )}
                    {editModeTotal.validCount >= 2 && (
                      <Alert className="border-green-500/50 bg-green-500/10">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm text-green-700">
                          Great! You've selected {editModeTotal.validCount} services for this package
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Items Selection List */}
                    {allVendorItems.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                        {allVendorItems.map((item: any) => {
                          const isSelected = editForm?.includedItemIds?.includes(item.id);
                          const categoryName = getCategoryName(item.listingCategory?.id || item.categoryId || '');
                          const CategoryIcon = getCategoryIcon(item.categoryId);
                          // Check if this item can be deselected (only if more than 2 are selected)
                          const selectedCount = editForm?.includedItemIds?.length || 0;
                          const canDeselect = !isSelected || selectedCount > 2;
                          
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-center gap-3 p-3 transition-all border-b last:border-b-0",
                                isSelected && "bg-primary/5 border-l-4 border-l-primary",
                                canDeselect ? "cursor-pointer hover:bg-slate-50" : "cursor-not-allowed"
                              )}
                              onClick={() => canDeselect && toggleBundledItem(item.id)}
                            >
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!canDeselect}
                                  onChange={() => {}}
                                  className={cn(
                                    "w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary flex-shrink-0",
                                    canDeselect ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                  )}
                                />
                                {isSelected && !canDeselect && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center" title="Minimum 2 services required">
                                    <Lock className="h-2 w-2 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              {item.images?.[0] ? (
                                <img src={item.images[0]} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 border">
                                  <CategoryIcon className="h-5 w-5 text-slate-400" />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium truncate", isSelected && "text-primary")}>{item.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Badge variant="outline" className="text-[10px]">{categoryName}</Badge>
                                  {isSelected && !canDeselect && (
                                    <span className="text-[9px] text-amber-600 flex items-center gap-0.5">
                                      <Lock className="h-2.5 w-2.5" />
                                      Required
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <p className={cn("text-sm font-bold flex-shrink-0", isSelected && "text-primary")}>
                                ₹{Number(item.price).toLocaleString('en-IN')}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 border-2 border-dashed rounded-lg bg-slate-50 text-center">
                        <Box className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-600">No services available</p>
                        <p className="text-[10px] text-slate-400 mt-1">Create some services first to bundle them</p>
                      </div>
                    )}

                    {/* Edit Mode Total */}
                    {editModeTotal.validCount > 0 && (
                      <div className="bg-slate-100 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-600">Base Price Total</span>
                          <span className="text-sm font-bold">₹{editModeTotal.total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* View Mode - Service Thumbnails Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {linkedItems.map((item: any, index: number) => {
                        const CategoryIcon = getCategoryIcon(item.categoryId);
                        const itemPrice = Number(item.price) || 0;
                        return (
                          <button key={item.id} onClick={() => { toggleService(item.id); document.getElementById(`service-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} className="group text-left p-2 rounded-lg border bg-white hover:border-primary hover:shadow-md transition-all">
                            <div className="aspect-square rounded-md overflow-hidden bg-slate-100 mb-2 relative">
                              {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center"><CategoryIcon className="h-6 w-6 text-slate-300" /></div>}
                              <Badge variant="secondary" className="absolute top-1 left-1 text-[9px] h-4 px-1 bg-white/90">{index + 1}</Badge>
                            </div>
                            <p className="text-xs font-medium truncate group-hover:text-primary">{item.name}</p>
                            <p className="text-[10px] text-slate-500">₹{itemPrice.toLocaleString('en-IN')}</p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Pricing Banner - Only in view mode */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        {/* Individual Total */}
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-100">
                            <span className="text-green-600 font-bold text-sm">%</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500">Individual Total</p>
                            <p className="text-sm font-semibold text-slate-400 line-through">₹{individualTotal.toLocaleString('en-IN')}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                          <div>
                            <p className="text-[10px] text-slate-500">Package Price</p>
                            <p className="text-lg font-bold text-slate-800">₹{packagePrice.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        {/* Savings Badge */}
                        {savings > 0 ? (
                          <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-center">
                            <p className="text-sm font-bold">Save ₹{savings.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] font-medium">{savingsPercent}% OFF</p>
                          </div>
                        ) : (
                          <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-center">
                            <p className="text-xs font-medium">No Discount</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <p className="text-[10px] text-slate-500 mt-3 text-center">
                  {isEditMode ? 'Select services to include in this package' : 'Click any service above or scroll down to see full details'}
                </p>
              </CardContent>
            </Card>

            {/* Why Book This Package */}
            {!isEditMode && (
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold mb-3">Why Book This Package?</h2>
                  <div className={cn(
                    "grid gap-3",
                    savingsPercent > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"
                  )}>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2"><Target className="h-4 w-4 text-primary" /></div>
                      <p className="text-xs font-medium">Seamless Coordination</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">All services work together</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2"><Users className="h-4 w-4 text-primary" /></div>
                      <p className="text-xs font-medium">Single Contact</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">One vendor for all queries</p>
                    </div>
                    {savingsPercent > 0 && (
                      <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2"><IndianRupee className="h-4 w-4 text-green-600" /></div>
                        <p className="text-xs font-medium text-green-700">Bundle Discount</p>
                        <p className="text-[10px] text-green-600 mt-0.5 font-medium">Save {savingsPercent}%</p>
                      </div>
                    )}
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2"><Shield className="h-4 w-4 text-primary" /></div>
                      <p className="text-xs font-medium">Less Stress</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">No hassle for bookings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Included Services - Detailed View */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold flex items-center gap-2"><Package className="h-4 w-4 text-primary" />Included Services - Detailed View</h2>
                  <Button variant="ghost" size="sm" onClick={expandAllServices} className="h-7 text-xs">Expand All</Button>
                </div>

                <Accordion type="multiple" value={expandedServices} onValueChange={setExpandedServices} className="space-y-3">
                  {linkedItems.map((item: any, index: number) => {
                    const CategoryIcon = getCategoryIcon(item.categoryId);
                    const itemPrice = Number(item.price) || 0;
                    let itemExtraCharges: any[] = [];
                    if (item.extraChargesJson) { try { itemExtraCharges = JSON.parse(item.extraChargesJson); } catch {} }

                    return (
                      <AccordionItem key={item.id} value={item.id} id={`service-${item.id}`} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50">
                          <div className="flex items-center gap-3 text-left w-full">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              {item.images?.[0] ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><CategoryIcon className="h-5 w-5 text-slate-400" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2"><Badge variant="outline" className="text-[9px] h-4 px-1">Service {index + 1} of {linkedItems.length}</Badge></div>
                              <p className="text-sm font-medium truncate mt-0.5">{item.name}</p>
                              <p className="text-xs text-slate-500">₹{itemPrice.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4 pt-2">
                            {item.images?.length > 0 && (
                              <div>
                                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 mb-2 flex items-center justify-center p-4" style={{ maxHeight: '420px' }}>
                                  <img src={item.images[0]} alt={item.name} className="max-w-full max-h-[380px] object-contain rounded-lg shadow-md" />
                                </div>
                                {item.images.length > 1 && (
                                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    {item.images.slice(1, 5).map((img: string, i: number) => <div key={i} className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0"><img src={img} alt="" className="w-full h-full object-cover" /></div>)}
                                    {item.images.length > 5 && <div className="w-14 h-14 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0"><span className="text-xs text-slate-500">+{item.images.length - 5}</span></div>}
                                  </div>
                                )}
                              </div>
                            )}
                            {item.description && <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>}
                            {(item.includedItemsText?.length > 0 || item.excludedItemsText?.length > 0) && (
                              <div className="grid grid-cols-2 gap-3">
                                {item.includedItemsText?.length > 0 && (
                                  <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                                    <p className="text-xs font-medium text-green-800 mb-2">Included</p>
                                    <div className="space-y-1">{item.includedItemsText.map((text: string, i: number) => <p key={i} className="text-[10px] text-green-700 flex items-start gap-1"><CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />{text}</p>)}</div>
                                  </div>
                                )}
                                {item.excludedItemsText?.length > 0 && (
                                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                                    <p className="text-xs font-medium text-red-800 mb-2">Not Included</p>
                                    <div className="space-y-1">{item.excludedItemsText.map((text: string, i: number) => <p key={i} className="text-[10px] text-red-700 flex items-start gap-1"><XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />{text}</p>)}</div>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="grid grid-cols-3 gap-2">
                              {item.deliveryTime && <div className="p-2 rounded-lg bg-slate-50 text-center"><Clock className="h-4 w-4 text-slate-400 mx-auto mb-1" /><p className="text-[10px] text-slate-500">Delivery</p><p className="text-xs font-medium">{item.deliveryTime}</p></div>}
                              {item.serviceMode && <div className="p-2 rounded-lg bg-slate-50 text-center"><MapPin className="h-4 w-4 text-slate-400 mx-auto mb-1" /><p className="text-[10px] text-slate-500">Service Mode</p><p className="text-xs font-medium">{item.serviceMode === 'VENDOR_TRAVELS' ? 'They come to you' : item.serviceMode === 'CUSTOMER_VISITS' ? 'Visit them' : 'Both options'}</p></div>}
                              <div className="p-2 rounded-lg bg-slate-50 text-center"><IndianRupee className="h-4 w-4 text-slate-400 mx-auto mb-1" /><p className="text-[10px] text-slate-500">Negotiable</p><p className="text-xs font-medium">{item.openForNegotiation ? 'Yes' : 'Fixed'}</p></div>
                            </div>
                            {item.categorySpecificData && <CategorySpecificDisplay categoryId={item.categoryId} categorySpecificData={item.categorySpecificData} />}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>

            {/* About This Package */}
            {!isEditMode && listing.description && (
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold mb-2">About This Package</h2>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
                </CardContent>
              </Card>
            )}

            {/* About the Vendor */}
            {!isEditMode && (
              <Card className="relative overflow-hidden">
                {/* Preview Mode Indicator */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="text-[9px] bg-slate-100 text-slate-500">
                    <Eye className="h-2.5 w-2.5 mr-1" />Preview
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><User className="h-4 w-4 text-primary" />About the Vendor</h2>
                  <div className="flex items-start gap-4">
                    {/* Profile Picture */}
                    <div className="relative">
                      {vendorProfile?.profileImage ? (
                        <img 
                          src={vendorProfile.profileImage} 
                          alt={vendorProfile.displayName || vendorProfile.businessName || 'Vendor'} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                          <User className="h-7 w-7 text-primary/60" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    
                    {/* Vendor Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-slate-900 truncate">
                        {vendorProfile?.displayName || vendorProfile?.businessName || listing.vendorName || 'Your Business'}
                      </p>
                      {(vendorProfile?.city || listing.vendorCity) && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {vendorProfile?.city || listing.vendorCity}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(vendorProfile?.rating || listing.vendorRating) > 0 && (
                          <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                            <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                            {(vendorProfile?.rating || listing.vendorRating).toFixed(1)}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />Verified
                        </Badge>
                      </div>
                    </div>
                    
                    {/* View Profile Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs opacity-50 cursor-not-allowed flex-shrink-0" 
                      disabled
                      title="Disabled in preview mode"
                    >
                      View Profile <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Widget (Disabled for vendor preview) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Package Price Card */}
              <Card className="border-primary/20 overflow-hidden relative">
                {/* Preview Mode Overlay */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="bg-white rounded-2xl shadow-xl p-5 text-center border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Preview Mode</p>
                    <p className="text-xs text-slate-500 mt-1">Booking is disabled in preview</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4">
                  <Badge className="bg-white/20 text-white text-[10px] mb-2">PACKAGE DEAL</Badge>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">₹{packagePrice.toLocaleString('en-IN')}</span>
                    {individualTotal > packagePrice && <span className="text-sm line-through opacity-70">₹{individualTotal.toLocaleString('en-IN')}</span>}
                  </div>
                  {savings > 0 && <p className="text-xs mt-1 text-white/90">Save ₹{savings.toLocaleString('en-IN')} ({savingsPercent}% off)</p>}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Package includes:</p>
                    <div className="space-y-1.5">
                      {linkedItems.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 truncate flex-1">{item.name}</span>
                          <span className="text-slate-500 ml-2">₹{Number(item.price).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-xs font-medium">Event Date *</Label>
                    <Button variant="outline" className="w-full justify-start text-left h-9 text-xs mt-1.5 text-slate-400" disabled>
                      <CalendarIcon className="mr-2 h-3 w-3" />Pick date
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Base</span><span>₹{packagePrice.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Service fee</span><span>₹{Math.round(packagePrice * 0.05).toLocaleString('en-IN')}</span></div>
                    <Separator />
                    <div className="flex justify-between font-bold text-sm"><span>Total</span><span className="text-primary">₹{Math.round(packagePrice * 1.05).toLocaleString('en-IN')}</span></div>
                  </div>
                  <Button className="w-full h-10 text-sm bg-primary hover:bg-primary/90" disabled>Add to Cart</Button>
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500" />Free cancellation before event</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500" />Pay after booking confirmed</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500" />Secure checkout</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Card - Only for vendor */}
              <Card className="border-dashed">
                <CardContent className="p-3">
                  <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wide">Listing Status</p>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded bg-slate-50">
                      <p className="text-[10px] text-slate-400">Status</p>
                      {listing.isActive ? <Badge className="bg-green-500 text-white text-[9px] h-4 px-1 mt-1">Live</Badge> : <Badge variant="secondary" className="text-[9px] h-4 px-1 mt-1">{listing.isDraft ? 'Draft' : 'Inactive'}</Badge>}
                    </div>
                    <div className="p-2 rounded bg-slate-50">
                      <p className="text-[10px] text-slate-400">Type</p>
                      <p className="text-xs font-medium mt-1">Package</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={deleteListing}
        title="Delete Package"
        description={listing.isDraft ? "Are you sure you want to delete this draft? This action cannot be undone." : "Are you sure you want to delete this package? This will remove it from customer view."}
        itemName={listing.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
