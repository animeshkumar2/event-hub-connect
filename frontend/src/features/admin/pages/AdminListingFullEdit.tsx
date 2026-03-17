import { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Switch } from '@/shared/components/ui/switch';
import { Separator } from '@/shared/components/ui/separator';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { ImageUpload, PendingImageChanges } from '@/shared/components/ImageUpload';
import { uploadImage, deleteImages } from '@/shared/utils/storage';
import { 
  Star, MapPin, Clock, CheckCircle2, XCircle, ArrowLeft, User, Package,
  AlertCircle, Loader2, Save, X, Plus, Pencil, Eye, Camera, Zap,
  ChevronDown, Shield, Building2, Sparkles, TrendingUp
} from 'lucide-react';
import { publicApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { CategorySpecificDisplay } from '@/features/listing/CategorySpecificDisplay';
import { CategoryFieldRenderer } from '@/features/vendor/components/CategoryFields';
import { DeliveryTimeInput } from '@/features/vendor/components/DeliveryTimeInput';
import { ServiceModeSelector } from '@/shared/components/ServiceModeSelector';

interface ExtraCharge { name: string; price: number; }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Admin API helper
const adminApi = {
  getListing: async (listingId: string) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/admin/listings/${listingId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch listing');
    return response.json();
  },
  updateListing: async (listingId: string, data: any) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/admin/listings/${listingId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update listing');
    return response.json();
  },
};

export default function AdminListingFullEdit() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch listing data
  const { data: listingResponse, isLoading, error } = useQuery({
    queryKey: ['adminListing', listingId],
    queryFn: () => adminApi.getListing(listingId!),
    enabled: !!listingId,
  });
  
  const listing = listingResponse?.data;
  
  // Fetch event types for the event type selector
  const { data: eventTypesResponse } = useQuery({
    queryKey: ['eventTypes'],
    queryFn: async () => {
      const response = await publicApi.getEventTypes();
      return response.success ? response.data : [];
    },
  });
  const eventTypes = useMemo(() => eventTypesResponse || [], [eventTypesResponse]);
  
  const [isEditMode, setIsEditMode] = useState(true); // Start in edit mode for admin
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Highlight editing state
  const [draftHighlight, setDraftHighlight] = useState('');
  const [showHighlightInput, setShowHighlightInput] = useState(false);
  const [editingHighlightIndex, setEditingHighlightIndex] = useState<number | null>(null);
  
  // Included items state
  const [draftIncludedItem, setDraftIncludedItem] = useState('');
  const [showIncludedItemInput, setShowIncludedItemInput] = useState(false);
  const [editingIncludedIndex, setEditingIncludedIndex] = useState<number | null>(null);
  
  // Excluded items state
  const [draftExcludedItem, setDraftExcludedItem] = useState('');
  const [showExcludedItemInput, setShowExcludedItemInput] = useState(false);
  const [editingExcludedIndex, setEditingExcludedIndex] = useState<number | null>(null);
  
  // Extra charges state
  const [draftExtraCharge, setDraftExtraCharge] = useState({ name: '', price: '' });
  const [showExtraChargeInput, setShowExtraChargeInput] = useState(false);
  const [editingExtraChargeIndex, setEditingExtraChargeIndex] = useState<number | null>(null);
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    serviceDetails: true,
    eventTypes: true,
    includedExcluded: false,
    additionalNotes: false,
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Pending image changes
  const [pendingImageChanges, setPendingImageChanges] = useState<PendingImageChanges | null>(null);

  const isPackage = listing?.type?.toLowerCase() === 'package' || listing?.type === 'PACKAGE';
  const isItem = listing?.type?.toLowerCase() === 'item' || listing?.type === 'ITEM';
  
  // Initialize edit form when listing loads
  useEffect(() => {
    if (listing && !editForm) {
      let extraChargesDetailed: { name: string; price: string }[] = [];
      if (listing.extraChargesJson) { 
        try { 
          extraChargesDetailed = JSON.parse(listing.extraChargesJson).map((ec: any) => ({ 
            name: ec.name, 
            price: ec.price?.toString() || '' 
          })); 
        } catch {} 
      }
      
      // Parse category-specific data
      let parsedCategoryData: Record<string, any> = {};
      if (listing.categorySpecificData) { 
        try { 
          let data = listing.categorySpecificData;
          while (typeof data === 'string') {
            data = JSON.parse(data);
          }
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            parsedCategoryData = data;
          }
        } catch (e) {
          console.error('Failed to parse categorySpecificData:', e);
        }
      }
      
      let eventTypeIds: number[] = listing.eventTypeIds || 
        (listing.eventTypes?.map((et: any) => typeof et === 'object' ? et.id : et).filter(Boolean) || []);
      
      setEditForm({
        name: listing.name || '',
        description: listing.description || '',
        price: listing.price?.toString() || '',
        images: listing.images || [],
        highlights: listing.highlights || [],
        includedItemsText: listing.includedItemsText || [],
        excludedItemsText: listing.excludedItemsText || [],
        extraChargesDetailed,
        deliveryTime: listing.deliveryTime || '',
        customNotes: listing.customNotes || '',
        serviceMode: listing.serviceMode || 'BOTH',
        openForNegotiation: listing.openForNegotiation || false,
        eventTypeIds,
        minimumQuantity: listing.minimumQuantity || 0,
        // Admin-specific fields
        isActive: listing.isActive ?? true,
        isDraft: listing.isDraft ?? false,
        isPopular: listing.isPopular ?? false,
        isTrending: listing.isTrending ?? false,
      });
      setCategorySpecificData(parsedCategoryData);
    }
  }, [listing, editForm]);
  
  // Publish requirements checker
  const getPublishRequirements = useCallback((listingData: any, formData?: any, catData?: Record<string, any>) => {
    const requirements: { id: string; label: string; met: boolean }[] = [];
    const data = formData || listingData;
    const categoryData = catData || {};
    
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
    const catId = listingData?.categoryId || listingData?.listingCategory?.id;
    if (catId === 'other') {
      hasPrice = true;
    } else if (catId === 'caterer') {
      hasPrice = (categoryData?.pricePerPlate && parseFloat(categoryData.pricePerPlate) > 0) || (categoryData?.pricePerPlateVeg && parseFloat(categoryData.pricePerPlateVeg) > 0);
    } else if (catId === 'mua') {
      hasPrice = categoryData?.bridalPrice && parseFloat(categoryData.bridalPrice) > 0;
    } else {
      hasPrice = categoryData?.price && parseFloat(categoryData.price) > 0;
    }
    requirements.push({ id: 'price', label: 'Pricing details', met: hasPrice });
    
    return requirements;
  }, [pendingImageChanges]);
  
  const publishRequirements = useMemo(() => {
    if (!listing) return [];
    return getPublishRequirements(listing, editForm, categorySpecificData);
  }, [listing, editForm, categorySpecificData, getPublishRequirements]);
  
  const canPublish = useMemo(() => publishRequirements.every(r => r.met), [publishRequirements]);
  const missingRequirements = useMemo(() => publishRequirements.filter(r => !r.met), [publishRequirements]);

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!listing || !editForm) return;
    
    // Get price for payload
    let finalPrice = editForm.price;
    const catId = listing.categoryId || listing.listingCategory?.id;
    if (isItem && catId !== 'other') {
      const p = categorySpecificData;
      finalPrice = p.pricePerPlate || p.pricePerPlateVeg || p.price || p.photographyPrice || p.videographyPrice || p.bridalPrice || editForm.price;
    }
    
    setIsSaving(true);
    try {
      let finalImages = editForm.images || [];
      
      // Process pending image changes
      if (pendingImageChanges) {
        const vendorId = listing.vendor?.id || listing.vendorId || 'unknown';
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
        
        // Build final URLs array
        finalImages = pendingImageChanges.finalOrder.map(item => {
          if (typeof item === 'string') return item;
          return uploadedUrls.get(item) || '';
        }).filter(url => url !== '');
        
        // Delete removed images
        if (pendingImageChanges.urlsToDelete.length > 0) {
          deleteImages(pendingImageChanges.urlsToDelete).catch(console.error);
        }
      }
      
      const payload: any = {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(finalPrice) || 0,
        images: finalImages,
        highlights: editForm.highlights.filter((h: string) => h.trim()),
        includedItemsText: editForm.includedItemsText,
        excludedItemsText: editForm.excludedItemsText,
        extraChargesJson: JSON.stringify(editForm.extraChargesDetailed.filter((ec: any) => ec.name.trim() && ec.price).map((ec: any) => ({ name: ec.name, price: parseFloat(ec.price) || 0 }))),
        deliveryTime: editForm.deliveryTime,
        customNotes: editForm.customNotes,
        serviceMode: editForm.serviceMode,
        openForNegotiation: editForm.openForNegotiation,
        categorySpecificData: isItem && catId !== 'other' && Object.keys(categorySpecificData).length > 0 ? JSON.stringify(categorySpecificData) : undefined,
        // Admin-specific fields
        isActive: editForm.isActive,
        isDraft: editForm.isDraft,
        isPopular: editForm.isPopular,
        isTrending: editForm.isTrending,
      };
      
      const response = await adminApi.updateListing(listing.id, payload);
      if (response.success) {
        setPendingImageChanges(null);
        toast.success('Listing updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['adminListing', listingId] });
        queryClient.invalidateQueries({ queryKey: ['adminListings'] });
      } else {
        toast.error(response.message || 'Failed to update');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  }, [listing, editForm, categorySpecificData, isItem, listingId, queryClient, pendingImageChanges]);
  
  // Highlight functions
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
  
  // Included items functions
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

  // Excluded items functions
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
  
  // Extra charges functions
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
  
  // Event type toggle
  const toggleEventType = (id: number) => setEditForm((p: any) => {
    const isSelected = p.eventTypeIds.includes(id);
    if (isSelected && p.eventTypeIds.length === 1) return p;
    return { ...p, eventTypeIds: isSelected ? p.eventTypeIds.filter((x: number) => x !== id) : [...p.eventTypeIds, id] };
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><BrandedLoader fullScreen={false} message="Loading listing..." /></div>;
  }
  
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-sm"><CardContent className="p-6 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">Not Found</h2>
          <p className="text-sm text-muted-foreground mb-4">Listing doesn't exist or you don't have access.</p>
          <Button size="sm" onClick={() => navigate('/admin/listings')}><ArrowLeft className="mr-1 h-4 w-4" />Back to Listings</Button>
        </CardContent></Card>
      </div>
    );
  }

  const catId = listing.categoryId || listing.listingCategory?.id;
  const displayHighlights = listing?.highlights?.length > 0 ? listing.highlights : listing?.includedItemsText?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/10 border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Shield className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-800">Admin Edit Mode</p>
                <p className="text-[10px] text-amber-700/70">Full editing access to this listing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="h-7 text-xs border-amber-500/30 text-amber-800 hover:bg-amber-500/10">
                <ArrowLeft className="h-3 w-3 mr-1" />Back
              </Button>
              {!listing.isDraft && (
                <Button variant="outline" size="sm" onClick={() => window.open(`/listing/${listing.id}`, '_blank')} className="h-7 text-xs border-amber-500/30 text-amber-800 hover:bg-amber-500/10">
                  <Eye className="h-3 w-3 mr-1" />Customer View
                </Button>
              )}
              <Button size="sm" onClick={saveChanges} disabled={isSaving} className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white">
                {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Status Bar */}
      <div className={cn(
        "border-b-2 py-2 px-4",
        canPublish ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"
      )}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3 flex-wrap">
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
            <div className="flex items-center gap-2 flex-wrap">
              {publishRequirements.map((req) => (
                <div key={req.id} className={cn(
                  "flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border",
                  req.met ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"
                )}>
                  {req.met ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {req.label}
                </div>
              ))}
            </div>
            {canPublish ? (
              <span className="text-[11px] text-green-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />All fields complete
              </span>
            ) : (
              <span className="text-[11px] text-amber-700 font-medium">Complete to save</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left - Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Images */}
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
                  <AlertCircle className="h-3 w-3" />Add at least one image
                </p>
              )}
            </CardContent></Card>

            {/* Name & Description */}
            <Card><CardContent className="p-4 space-y-3">
              <div>
                <Label className="text-xs">Name <span className="text-red-500">*</span></Label>
                <Input value={editForm?.name || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} className="h-9 text-sm mt-1" />
                {(!editForm?.name || !editForm.name.trim()) && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />Service name is required
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={editForm?.description || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} className="text-sm mt-1" />
              </div>
            </CardContent></Card>

            {/* Key Highlights */}
            <Card className="overflow-hidden border-0 shadow-md bg-white">
              <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                    <Zap className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Key Highlights</h3>
                  {(editForm?.highlights?.length || 0) > 0 && (
                    <Badge className="ml-auto bg-white/20 text-white border-0 text-[10px] h-5 px-2">
                      {editForm?.highlights?.length}
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-3">
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
                    <Button variant="outline" onClick={() => setShowHighlightInput(true)} className="w-full h-8 text-xs border border-dashed border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 rounded-lg">
                      <Plus className="h-3 w-3 mr-1" />Add Highlight
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Details */}
            {catId && catId !== 'other' && (
              <Card className="overflow-hidden border-0 shadow-md bg-white">
                <div className="bg-gradient-to-r from-primary via-violet-600 to-purple-600 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      <Package className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-white">Category Details</h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] text-white font-medium">Required</span>
                  </div>
                </div>
                <CardContent className="p-3">
                  <CategoryFieldRenderer 
                    categoryId={catId} 
                    values={categorySpecificData} 
                    onChange={setCategorySpecificData} 
                    errors={{}} 
                    listingType={listing.type}
                    hidePackageDetails={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Service Details - Collapsible */}
            <Card className="overflow-hidden border-0 shadow-md bg-white">
              <button
                type="button"
                onClick={() => toggleSection('serviceDetails')}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-2.5 flex items-center justify-between group hover:from-slate-700 hover:to-slate-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Service Details</h3>
                </div>
                <div className={cn("p-1 rounded bg-white/10 transition-transform duration-300", expandedSections.serviceDetails ? "rotate-180" : "")}>
                  <ChevronDown className="h-4 w-4 text-white" />
                </div>
              </button>
              <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", expandedSections.serviceDetails ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
                <CardContent className="p-3 space-y-3">
                  {/* Delivery Time */}
                  {catId !== 'dj-entertainment' && (
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Delivery Time</Label>
                      <DeliveryTimeInput
                        value={editForm?.deliveryTime || ''}
                        onChange={(val) => setEditForm((p: any) => ({ ...p, deliveryTime: val }))}
                      />
                    </div>
                  )}
                  {/* Service Mode */}
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Service Mode</Label>
                    <ServiceModeSelector
                      value={editForm?.serviceMode || 'BOTH'}
                      onChange={(val) => setEditForm((p: any) => ({ ...p, serviceMode: val }))}
                    />
                  </div>
                  {/* Open for Negotiation */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border">
                    <Checkbox
                      id="negotiation"
                      checked={editForm?.openForNegotiation || false}
                      onCheckedChange={(checked) => setEditForm((p: any) => ({ ...p, openForNegotiation: checked }))}
                    />
                    <Label htmlFor="negotiation" className="text-xs cursor-pointer">Open for negotiation</Label>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Event Types - Collapsible */}
            <Card className="overflow-hidden border-0 shadow-md bg-white">
              <button
                type="button"
                onClick={() => toggleSection('eventTypes')}
                className="w-full bg-gradient-to-r from-violet-700 to-purple-700 px-4 py-2.5 flex items-center justify-between group hover:from-violet-600 hover:to-purple-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                    <Star className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Event Types</h3>
                  {(editForm?.eventTypeIds?.length || 0) > 0 && (
                    <Badge className="bg-white/20 text-white border-0 text-[10px] h-5 px-2">
                      {editForm?.eventTypeIds?.length} selected
                    </Badge>
                  )}
                </div>
                <div className={cn("p-1 rounded bg-white/10 transition-transform duration-300", expandedSections.eventTypes ? "rotate-180" : "")}>
                  <ChevronDown className="h-4 w-4 text-white" />
                </div>
              </button>
              <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", expandedSections.eventTypes ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {eventTypes.map((et: any) => (
                      <button
                        key={et.id}
                        type="button"
                        onClick={() => toggleEventType(et.id)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all",
                          editForm?.eventTypeIds?.includes(et.id)
                            ? "bg-violet-100 border-violet-300 text-violet-800"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center",
                          editForm?.eventTypeIds?.includes(et.id) ? "bg-violet-600 border-violet-600" : "border-slate-300"
                        )}>
                          {editForm?.eventTypeIds?.includes(et.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        {et.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Included/Excluded Items - Collapsible */}
            <Card className="overflow-hidden border-0 shadow-md bg-white">
              <button
                type="button"
                onClick={() => toggleSection('includedExcluded')}
                className="w-full bg-gradient-to-r from-teal-700 to-cyan-700 px-4 py-2.5 flex items-center justify-between group hover:from-teal-600 hover:to-cyan-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Included / Excluded Items</h3>
                </div>
                <div className={cn("p-1 rounded bg-white/10 transition-transform duration-300", expandedSections.includedExcluded ? "rotate-180" : "")}>
                  <ChevronDown className="h-4 w-4 text-white" />
                </div>
              </button>
              <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", expandedSections.includedExcluded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
                <CardContent className="p-3 space-y-4">
                  {/* Included Items */}
                  <div>
                    <Label className="text-xs font-medium mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> What's Included
                    </Label>
                    <div className="space-y-1.5">
                      {(editForm?.includedItemsText || []).map((item: string, i: number) => (
                        <div key={i} className="group flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="flex-1 text-xs">{item}</span>
                          <Button size="sm" variant="ghost" onClick={() => startEditIncludedItem(i)} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><Pencil className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => removeIncludedItem(i)} className="h-6 w-6 p-0 text-red-500 opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></Button>
                        </div>
                      ))}
                      {showIncludedItemInput ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border-2 border-green-500 bg-green-50">
                          <Input value={draftIncludedItem} onChange={(e) => setDraftIncludedItem(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addIncludedItem(); if (e.key === 'Escape') { setShowIncludedItemInput(false); setDraftIncludedItem(''); } }} className="flex-1 h-7 text-xs" placeholder="Add included item..." autoFocus />
                          <Button size="sm" onClick={addIncludedItem} disabled={!draftIncludedItem.trim()} className="h-7 px-3 text-xs bg-green-600">Add</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setShowIncludedItemInput(false); setDraftIncludedItem(''); }} className="h-7 w-7 p-0"><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => setShowIncludedItemInput(true)} className="w-full h-8 text-xs border-dashed border-green-300 text-green-700">
                          <Plus className="h-3 w-3 mr-1" />Add Included Item
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Excluded Items */}
                  <div>
                    <Label className="text-xs font-medium mb-2 flex items-center gap-1">
                      <X className="h-3 w-3 text-red-500" /> What's Not Included
                    </Label>
                    <div className="space-y-1.5">
                      {(editForm?.excludedItemsText || []).map((item: string, i: number) => (
                        <div key={i} className="group flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
                          <X className="h-3 w-3 text-red-600" />
                          <span className="flex-1 text-xs">{item}</span>
                          <Button size="sm" variant="ghost" onClick={() => startEditExcludedItem(i)} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><Pencil className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => removeExcludedItem(i)} className="h-6 w-6 p-0 text-red-500 opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></Button>
                        </div>
                      ))}
                      {showExcludedItemInput ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border-2 border-red-500 bg-red-50">
                          <Input value={draftExcludedItem} onChange={(e) => setDraftExcludedItem(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addExcludedItem(); if (e.key === 'Escape') { setShowExcludedItemInput(false); setDraftExcludedItem(''); } }} className="flex-1 h-7 text-xs" placeholder="Add excluded item..." autoFocus />
                          <Button size="sm" onClick={addExcludedItem} disabled={!draftExcludedItem.trim()} className="h-7 px-3 text-xs bg-red-600">Add</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setShowExcludedItemInput(false); setDraftExcludedItem(''); }} className="h-7 w-7 p-0"><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => setShowExcludedItemInput(true)} className="w-full h-8 text-xs border-dashed border-red-300 text-red-700">
                          <Plus className="h-3 w-3 mr-1" />Add Excluded Item
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Extra Charges */}
                  <div>
                    <Label className="text-xs font-medium mb-2 flex items-center gap-1">
                      <Plus className="h-3 w-3 text-orange-500" /> Extra Charges
                    </Label>
                    <div className="space-y-1.5">
                      {(editForm?.extraChargesDetailed || []).map((charge: any, i: number) => (
                        <div key={i} className="group flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
                          <Plus className="h-3 w-3 text-orange-600" />
                          <span className="flex-1 text-xs">{charge.name}</span>
                          <span className="text-xs font-medium">₹{Number(charge.price).toLocaleString('en-IN')}</span>
                          <Button size="sm" variant="ghost" onClick={() => startEditExtraCharge(i)} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><Pencil className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => removeExtraCharge(i)} className="h-6 w-6 p-0 text-red-500 opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></Button>
                        </div>
                      ))}
                      {showExtraChargeInput ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border-2 border-orange-500 bg-orange-50">
                          <Input value={draftExtraCharge.name} onChange={(e) => setDraftExtraCharge(p => ({ ...p, name: e.target.value }))} className="flex-1 h-7 text-xs" placeholder="Charge name..." autoFocus />
                          <div className="flex items-center bg-white rounded border px-2">
                            <span className="text-xs">₹</span>
                            <Input type="number" value={draftExtraCharge.price} onChange={(e) => setDraftExtraCharge(p => ({ ...p, price: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') addExtraCharge(); }} className="w-20 h-7 text-xs border-0" placeholder="Price" />
                          </div>
                          <Button size="sm" onClick={addExtraCharge} disabled={!draftExtraCharge.name.trim() || !draftExtraCharge.price} className="h-7 px-3 text-xs bg-orange-600">Add</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setShowExtraChargeInput(false); setDraftExtraCharge({ name: '', price: '' }); }} className="h-7 w-7 p-0"><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => setShowExtraChargeInput(true)} className="w-full h-8 text-xs border-dashed border-orange-300 text-orange-700">
                          <Plus className="h-3 w-3 mr-1" />Add Extra Charge
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Custom Notes */}
            <Card><CardContent className="p-4">
              <Label className="text-xs font-medium mb-2 block">Custom Notes (Internal)</Label>
              <Textarea 
                value={editForm?.customNotes || ''} 
                onChange={(e) => setEditForm((p: any) => ({ ...p, customNotes: e.target.value }))} 
                rows={2} 
                className="text-sm" 
                placeholder="Internal notes about this listing..."
              />
            </CardContent></Card>
          </div>

          {/* Right Sidebar - Admin Controls */}
          <div className="space-y-4">
            {/* Admin Status Controls */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-amber-800">Admin Controls</h3>
                </div>
                <Separator />
                
                {/* Active Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Active Status</Label>
                    <p className="text-[10px] text-muted-foreground">Visible to customers</p>
                  </div>
                  <Switch
                    checked={editForm?.isActive ?? true}
                    onCheckedChange={(checked) => setEditForm((p: any) => ({ ...p, isActive: checked }))}
                  />
                </div>
                
                {/* Draft Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Draft Mode</Label>
                    <p className="text-[10px] text-muted-foreground">Not published yet</p>
                  </div>
                  <Switch
                    checked={editForm?.isDraft ?? false}
                    onCheckedChange={(checked) => setEditForm((p: any) => ({ ...p, isDraft: checked }))}
                  />
                </div>
                
                <Separator />
                
                {/* Popular */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <div>
                      <Label className="text-xs font-medium">Popular</Label>
                      <p className="text-[10px] text-muted-foreground">Featured listing</p>
                    </div>
                  </div>
                  <Switch
                    checked={editForm?.isPopular ?? false}
                    onCheckedChange={(checked) => setEditForm((p: any) => ({ ...p, isPopular: checked }))}
                  />
                </div>
                
                {/* Trending */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <div>
                      <Label className="text-xs font-medium">Trending</Label>
                      <p className="text-[10px] text-muted-foreground">Show in trending</p>
                    </div>
                  </div>
                  <Switch
                    checked={editForm?.isTrending ?? false}
                    onCheckedChange={(checked) => setEditForm((p: any) => ({ ...p, isTrending: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vendor Info */}
            {listing.vendor && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Vendor</h3>
                  </div>
                  <p className="text-sm font-medium">{listing.vendor.businessName}</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs"
                    onClick={() => navigate(`/admin/vendors/${listing.vendor?.id}`)}
                  >
                    View Vendor Profile →
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Listing Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">Listing Info</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline">{listing.type === 'PACKAGE' ? 'Package' : 'Service'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{listing.listingCategory?.displayName || listing.listingCategory?.name || catId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-mono text-[10px]">{listing.id?.substring(0, 8)}...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold mb-2">Quick Actions</h3>
                {listing.isDraft ? (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Draft listings are not visible to customers. Publish to enable customer view.
                  </div>
                ) : (
                  <Button variant="outline" className="w-full justify-start text-xs h-8" onClick={() => window.open(`/listing/${listing.id}`, '_blank')}>
                    <Eye className="h-3 w-3 mr-2" /> View as Customer
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start text-xs h-8" onClick={() => navigate(`/admin/vendors/${listing.vendor?.id}`)}>
                  <Building2 className="h-3 w-3 mr-2" /> Go to Vendor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
