import { useState, useEffect, useCallback, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Loader2,
  Package,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Trash2,
  ImagePlus,
  Sparkles,
  Check,
  Search,
} from 'lucide-react';
import { vendorApi } from '@/shared/services/api';
import { toast } from 'sonner';
import { ADD_ON_CATALOG, CATALOG_BY_ID, type CatalogAddOn } from '@/shared/constants/addOnCatalog';
import { cn } from '@/shared/lib/utils';
import { uploadImage, compressImage } from '@/shared/utils/storage';

/** What's persisted in DB */
interface LiveAddOn {
  id: string;
  title: string;
  price: number;
  category?: string;
  imageUrl?: string;
  catalogId?: string;
}

/** A custom add-on the vendor is creating (not yet saved) */
interface PendingCustomAddOn {
  tempId: string;
  title: string;
  price: number;
  category: string;
  description: string;
  imageFile?: File;
  imagePreview?: string;
}

export interface AddOnManagerHandle {
  saveAddOns: () => Promise<void>;
  hasChanges: () => boolean;
  openModal: () => void;
}

interface AddOnManagerProps {
  listingId: string;
  listingType: string;
  isEditMode: boolean;
}

export const AddOnManager = forwardRef<AddOnManagerHandle, AddOnManagerProps>(
  function AddOnManager({ listingId, isEditMode }, ref) {
  // ── Server state ──
  const [serverAddOns, setServerAddOns] = useState<LiveAddOn[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Local edit state ──
  const [localEnabled, setLocalEnabled] = useState<Set<string>>(new Set());
  const [localPrices, setLocalPrices] = useState<Record<string, number>>({});
  const [localDeletedIds, setLocalDeletedIds] = useState<Set<string>>(new Set());
  const [pendingCustom, setPendingCustom] = useState<PendingCustomAddOn[]>([]);

  // ── UI state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'addon' | 'activity'>('addon');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({ title: '', price: '', category: '', description: '' });
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shouldRender = !!listingId;

  // ── Fetch server state ──
  const fetchAddOns = useCallback(async () => {
    if (!listingId) return;
    try {
      setLoading(true);
      const response = await vendorApi.getPackageAddOns(listingId);
      const data = response && typeof response === 'object' && 'data' in response
        ? (response as any).data : response;
      const addOns: LiveAddOn[] = Array.isArray(data) ? data.map((a: any) => ({
        id: a.id,
        title: a.title,
        price: typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0,
        category: a.category || '',
        imageUrl: a.imageUrl || '',
        catalogId: a.description || '',
      })) : [];
      setServerAddOns(addOns);
      const enabled = new Set<string>();
      const prices: Record<string, number> = {};
      addOns.forEach(a => {
        if (a.catalogId && CATALOG_BY_ID.has(a.catalogId)) {
          enabled.add(a.catalogId);
          prices[a.catalogId] = a.price;
        }
      });
      setLocalEnabled(enabled);
      setLocalPrices(prices);
      setLocalDeletedIds(new Set());
      setPendingCustom([]);
    } catch {
      setServerAddOns([]);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => { fetchAddOns(); }, [fetchAddOns]);

  useEffect(() => {
    if (!isEditMode) {
      const enabled = new Set<string>();
      const prices: Record<string, number> = {};
      serverAddOns.forEach(a => {
        if (a.catalogId && CATALOG_BY_ID.has(a.catalogId)) {
          enabled.add(a.catalogId);
          prices[a.catalogId] = a.price;
        }
      });
      setLocalEnabled(enabled);
      setLocalPrices(prices);
      setLocalDeletedIds(new Set());
      setPendingCustom([]);
      setShowCustomForm(false);
    }
  }, [isEditMode, serverAddOns]);

  // ── Derived state ──
  const serverBySlug = useMemo(() => {
    const m = new Map<string, LiveAddOn>();
    serverAddOns.forEach(a => { if (a.catalogId) m.set(a.catalogId, a); });
    return m;
  }, [serverAddOns]);

  const serverCustomAddOns = useMemo(() => {
    return serverAddOns.filter(a => !a.catalogId || !CATALOG_BY_ID.has(a.catalogId));
  }, [serverAddOns]);

  const effectiveEnabled = useMemo(() => {
    if (isEditMode) return localEnabled;
    const s = new Set<string>();
    serverAddOns.forEach(a => { if (a.catalogId) s.add(a.catalogId); });
    return s;
  }, [isEditMode, localEnabled, serverAddOns]);

  const effectiveCustomAddOns = useMemo(() => {
    if (isEditMode) {
      const kept = serverCustomAddOns.filter(a => !localDeletedIds.has(a.id));
      const pendingAsLive: LiveAddOn[] = pendingCustom.map(p => ({
        id: p.tempId, title: p.title, price: p.price,
        category: p.category, imageUrl: p.imagePreview || '', catalogId: '',
      }));
      return [...kept, ...pendingAsLive];
    }
    return serverCustomAddOns;
  }, [isEditMode, serverCustomAddOns, localDeletedIds, pendingCustom]);

  const getPrice = (catalogId: string, defaultPrice: number) => {
    if (isEditMode) return localPrices[catalogId] ?? defaultPrice;
    const server = serverBySlug.get(catalogId);
    return server?.price ?? defaultPrice;
  };

  // ── Local edit handlers ──
  const toggleAddOn = (item: CatalogAddOn) => {
    setLocalEnabled(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) { next.delete(item.id); }
      else {
        next.add(item.id);
        if (!localPrices[item.id]) setLocalPrices(p => ({ ...p, [item.id]: item.defaultPrice }));
      }
      return next;
    });
  };

  const updateLocalPrice = (catalogId: string, price: number) => {
    if (price > 0) setLocalPrices(p => ({ ...p, [catalogId]: price }));
  };

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const toggleSelectAll = (items: CatalogAddOn[]) => {
    const allEnabled = items.every(i => localEnabled.has(i.id));
    setLocalEnabled(prev => {
      const next = new Set(prev);
      if (allEnabled) { items.forEach(i => next.delete(i.id)); }
      else {
        items.forEach(i => {
          next.add(i.id);
          if (!localPrices[i.id]) setLocalPrices(p => ({ ...p, [i.id]: i.defaultPrice }));
        });
      }
      return next;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomImageFile(file);
    setCustomImagePreview(URL.createObjectURL(file));
  };

  const addCustomItem = () => {
    if (!customForm.title.trim()) { toast.error('Title is required'); return; }
    if (!customForm.price || parseFloat(customForm.price) <= 0) { toast.error('Price must be > 0'); return; }
    const newItem: PendingCustomAddOn = {
      tempId: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: customForm.title.trim(),
      price: parseFloat(customForm.price),
      category: customForm.category.trim() || (activeTab === 'activity' ? 'Custom Activity' : 'Custom Add-On'),
      description: customForm.description.trim(),
      imageFile: customImageFile || undefined,
      imagePreview: customImagePreview || undefined,
    };
    setPendingCustom(prev => [...prev, newItem]);
    setCustomForm({ title: '', price: '', category: '', description: '' });
    setCustomImageFile(null);
    setCustomImagePreview(null);
    setShowCustomForm(false);
    toast.success('Added — will be saved when you save the listing');
  };

  const removeCustomItem = (id: string) => {
    if (id.startsWith('pending-')) setPendingCustom(prev => prev.filter(p => p.tempId !== id));
    else setLocalDeletedIds(prev => new Set(prev).add(id));
  };

  // ── Save handler ──
  const saveAddOns = useCallback(async () => {
    setSaving(true);
    let triggerError = false;
    try {
      for (const id of localDeletedIds) {
        try { await vendorApi.deleteAddOn(listingId, id); } catch { /* ignore */ }
      }
      for (const serverAddOn of serverAddOns) {
        if (serverAddOn.catalogId && CATALOG_BY_ID.has(serverAddOn.catalogId) && !localEnabled.has(serverAddOn.catalogId)) {
          try { await vendorApi.deleteAddOn(listingId, serverAddOn.id); } catch { /* ignore */ }
        }
      }
      for (const catalogId of localEnabled) {
        const existing = serverBySlug.get(catalogId);
        const catalogItem = CATALOG_BY_ID.get(catalogId);
        if (!catalogItem) continue;
        const price = localPrices[catalogId] ?? catalogItem.defaultPrice;
        if (!existing) {
          try {
            await vendorApi.createAddOn(listingId, {
              title: catalogItem.title, description: catalogId, price,
              category: catalogItem.category, maxQuantity: 10,
            });
          } catch (e: any) {
            const msg = e?.message || e?.response?.data?.message || '';
            if (msg.toLowerCase().includes('package') || msg.toLowerCase().includes('only be added')) {
              triggerError = true;
            } else {
              console.error(`Failed to create add-on ${catalogId}:`, e);
            }
          }
        } else if (existing.price !== price) {
          await vendorApi.updateAddOn(listingId, existing.id, { price });
        }
      }
      for (const custom of pendingCustom) {
        let imageUrl: string | null = null;
        if (custom.imageFile) {
          const compressed = await compressImage(custom.imageFile);
          imageUrl = await uploadImage(compressed, `addons/${listingId}`);
        }
        try {
          await vendorApi.createAddOn(listingId, {
            title: custom.title, description: custom.description || null,
            price: custom.price, category: custom.category, maxQuantity: 10, imageUrl,
          });
        } catch (e: any) {
          const msg = e?.message || e?.response?.data?.message || '';
          if (msg.toLowerCase().includes('package') || msg.toLowerCase().includes('only be added')) {
            triggerError = true;
          } else {
            console.error(`Failed to create custom add-on ${custom.title}:`, e);
          }
        }
      }
      if (triggerError) {
        toast.error('Add-ons blocked by database rule. Run the migration: database/migrations/add_on_columns_and_fix_trigger.sql', { duration: 8000 });
      }
      await fetchAddOns();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save add-ons');
      throw err;
    } finally { setSaving(false); }
  }, [listingId, localEnabled, localPrices, localDeletedIds, serverAddOns, serverBySlug, pendingCustom, fetchAddOns]);

  const hasChanges = useCallback(() => {
    const serverEnabled = new Set<string>();
    serverAddOns.forEach(a => { if (a.catalogId && CATALOG_BY_ID.has(a.catalogId)) serverEnabled.add(a.catalogId); });
    if (localEnabled.size !== serverEnabled.size) return true;
    for (const id of localEnabled) { if (!serverEnabled.has(id)) return true; }
    for (const id of serverEnabled) { if (!localEnabled.has(id)) return true; }
    for (const [catalogId, price] of Object.entries(localPrices)) {
      const server = serverBySlug.get(catalogId);
      if (server && server.price !== price) return true;
    }
    if (localDeletedIds.size > 0) return true;
    if (pendingCustom.length > 0) return true;
    return false;
  }, [localEnabled, localPrices, localDeletedIds, pendingCustom, serverAddOns, serverBySlug]);

  useImperativeHandle(ref, () => ({ saveAddOns, hasChanges, openModal: () => setModalOpen(true) }), [saveAddOns, hasChanges]);

  if (!shouldRender) return null;

  const filteredCatalog = ADD_ON_CATALOG.filter(c => c.type === activeTab);
  const totalEnabled = effectiveEnabled.size + effectiveCustomAddOns.length;

  const displayCatalog = filteredCatalog
    .map(cat => {
      const q = searchQuery.toLowerCase().trim();
      if (!isEditMode) return { ...cat, items: cat.items.filter(i => effectiveEnabled.has(i.id)) };
      if (!q) return cat;
      return {
        ...cat,
        items: cat.items.filter(i =>
          i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
        ),
      };
    })
    .filter(cat => cat.items.length > 0);

  const isSearching = searchQuery.trim().length > 0;

  // ── Modal catalog content (shared between inline & modal) ──
  const catalogContent = (
    <>
      {/* Tabs */}
      <div className="flex border-b bg-gray-50/50 sticky top-0 z-10">
        {(['addon', 'activity'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all relative",
              activeTab === tab ? "text-violet-700 bg-white" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            )}
          >
            {tab === 'addon' ? '🎨 Add-Ons' : '🎭 Activities'}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />}
          </button>
        ))}
      </div>

      {/* Search bar */}
      {isEditMode && !loading && (
        <div className="px-4 py-2.5 border-b bg-white sticky top-[45px] z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search add-ons & activities..."
              className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="divide-y">
            {isEditMode && isSearching && displayCatalog.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">
                No results for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
            {!isEditMode && displayCatalog.length === 0 && effectiveCustomAddOns.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">
                No {activeTab === 'activity' ? 'activities' : 'add-ons'} available
              </div>
            )}

            {/* Catalog categories */}
            {displayCatalog.map(cat => {
              const isExpanded = isEditMode ? (isSearching || expandedCategories.has(cat.name)) : true;
              const enabledInCat = cat.items.filter(i => effectiveEnabled.has(i.id)).length;
              const allInCatEnabled = cat.items.length > 0 && cat.items.every(i => localEnabled.has(i.id));
              const someInCatEnabled = cat.items.some(i => localEnabled.has(i.id));
              // Get first few items with images for preview thumbnails
              const previewItems = cat.items.filter(i => i.imageUrl).slice(0, 4);
              return (
                <div key={cat.name} className={cn(
                  "transition-colors",
                  !isExpanded && enabledInCat > 0 && "bg-violet-50/40"
                )}>
                  {/* Category header */}
                  <button
                    type="button"
                    onClick={() => isEditMode && !isSearching && toggleCategory(cat.name)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 transition-colors",
                      isEditMode && !isSearching ? "cursor-pointer hover:bg-gray-50/80" : "cursor-default"
                    )}
                  >
                    {/* Thumbnail preview strip (collapsed only) */}
                    {!isExpanded && previewItems.length > 0 && (
                      <div className="flex -space-x-2 flex-shrink-0">
                        {previewItems.slice(0, 3).map((item, i) => (
                          <div key={item.id} className={cn(
                            "w-9 h-9 rounded-lg overflow-hidden border-2 border-white shadow-sm",
                          )} style={{ zIndex: 3 - i }}>
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ))}
                        {cat.items.length > 3 && (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center" style={{ zIndex: 0 }}>
                            <span className="text-[9px] font-bold text-gray-500">+{cat.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {isEditMode && !isSearching && isExpanded && (
                      <ChevronDown className="h-4 w-4 text-violet-500 flex-shrink-0" />
                    )}
                    {isEditMode && !isSearching && !isExpanded && (
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-gray-900 truncate">{cat.name}</span>
                        <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">{cat.items.length} items</span>
                      </div>
                      {/* Show selected item names when collapsed */}
                      {!isExpanded && enabledInCat > 0 && (
                        <p className="text-[11px] text-violet-600 truncate mt-0.5">
                          {cat.items.filter(i => effectiveEnabled.has(i.id)).map(i => i.title).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      {enabledInCat > 0 && (
                        <Badge className={cn(
                          "border-0 text-[11px] font-semibold",
                          enabledInCat === cat.items.length
                            ? "bg-violet-600 text-white"
                            : "bg-violet-100 text-violet-700"
                        )}>
                          {enabledInCat}/{cat.items.length}
                        </Badge>
                      )}
                      {isEditMode && (
                        <Checkbox
                          checked={allInCatEnabled}
                          ref={(el) => { if (el) (el as any).indeterminate = someInCatEnabled && !allInCatEnabled; }}
                          onCheckedChange={() => toggleSelectAll(cat.items)}
                          className="h-5 w-5 rounded border-2 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                          aria-label={`Select all ${cat.name}`}
                        />
                      )}
                    </div>
                  </button>

                  {/* Items grid */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {cat.items.map(item => {
                          const isEnabled = effectiveEnabled.has(item.id);
                          const currentPrice = getPrice(item.id, item.defaultPrice);
                          return (
                            <div
                              key={item.id}
                              onClick={() => isEditMode && toggleAddOn(item)}
                              className={cn(
                                "relative rounded-xl overflow-hidden transition-all border group",
                                isEditMode && "cursor-pointer border-2",
                                isEditMode && isEnabled
                                  ? "border-violet-500 shadow-md shadow-violet-100 ring-1 ring-violet-200"
                                  : isEditMode
                                    ? "border-gray-100 hover:border-gray-300 hover:shadow-sm"
                                    : "border-gray-200 shadow-sm"
                              )}
                            >
                              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.title}
                                    className={cn("w-full h-full object-cover transition-transform", isEditMode && "group-hover:scale-105")}
                                    loading="lazy" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                    <Package className="h-8 w-8 text-gray-300" />
                                  </div>
                                )}
                                {isEditMode && isEnabled && <div className="absolute inset-0 bg-violet-600/10" />}
                                {isEditMode && (
                                  <div className="absolute top-2 left-2">
                                    <div className={cn(
                                      "h-6 w-6 rounded-lg flex items-center justify-center transition-all shadow-sm",
                                      isEnabled ? "bg-violet-600 text-white" : "bg-white/90 border border-gray-300 text-transparent"
                                    )}>
                                      <Check className="h-3.5 w-3.5" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-2.5 space-y-1.5 bg-white">
                                <div>
                                  <p className="text-[13px] font-semibold leading-tight line-clamp-1 text-gray-800">{item.title}</p>
                                  {item.description && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
                                </div>
                                {isEditMode ? (
                                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <span className="text-[13px] font-bold text-violet-600">₹</span>
                                    <Input type="number" defaultValue={currentPrice}
                                      onBlur={(e) => { const v = parseFloat(e.target.value); if (v > 0 && v !== currentPrice) updateLocalPrice(item.id, v); }}
                                      className="h-7 flex-1 text-[13px] font-bold text-violet-700 border-gray-200 focus:border-violet-400 bg-white"
                                      min={1} />
                                  </div>
                                ) : (
                                  <p className="text-[13px] font-bold text-gray-900">₹{currentPrice.toLocaleString('en-IN')}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom add-ons section */}
            {(isEditMode || effectiveCustomAddOns.length > 0) && (
              <div className="border-t">
                <div className="px-4 py-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-[13px] font-bold text-gray-900">Your Custom Items</span>
                  {effectiveCustomAddOns.length > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-[11px] font-semibold">{effectiveCustomAddOns.length}</Badge>
                  )}
                </div>

                {effectiveCustomAddOns.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {effectiveCustomAddOns.map(item => (
                        <div key={item.id} className={cn(
                          "relative rounded-xl overflow-hidden shadow-sm group",
                          isEditMode ? "border-2 border-amber-200" : "border border-gray-200"
                        )}>
                          <div className="relative aspect-[4/3] bg-amber-50 overflow-hidden">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                                <Package className="h-8 w-8 text-amber-300" />
                              </div>
                            )}
                            {isEditMode && (
                              <button onClick={() => removeCustomItem(item.id)}
                                className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-white/90 border border-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                aria-label={`Delete ${item.title}`}>
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </button>
                            )}
                            {isEditMode && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-amber-500 text-white border-0 text-[10px] px-1.5 py-0 h-5 shadow-sm">Custom</Badge>
                              </div>
                            )}
                          </div>
                          <div className="p-2.5 bg-white space-y-1">
                            <p className="text-[13px] font-semibold text-gray-800 line-clamp-1">{item.title}</p>
                            {item.category && <p className="text-[11px] text-gray-500 line-clamp-1">{item.category}</p>}
                            <p className="text-[13px] font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create custom form */}
                {isEditMode && (
                  <>
                    {showCustomForm ? (
                      <div className="mx-4 mb-4 p-4 border-2 border-dashed border-violet-200 rounded-xl bg-violet-50/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-800">
                            New Custom {activeTab === 'activity' ? 'Activity' : 'Add-On'}
                          </span>
                          <button onClick={() => {
                            setShowCustomForm(false);
                            setCustomForm({ title: '', price: '', category: '', description: '' });
                            setCustomImageFile(null); setCustomImagePreview(null);
                          }} className="p-1 rounded-md hover:bg-gray-200/50">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="flex items-start gap-3">
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            className={cn(
                              "h-20 w-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 flex-shrink-0 transition-colors",
                              customImagePreview ? "border-violet-300 bg-violet-50" : "border-gray-300 hover:border-violet-400 hover:bg-violet-50/50"
                            )}>
                            {customImagePreview ? (
                              <img src={customImagePreview} alt="Preview" className="h-full w-full rounded-xl object-cover" />
                            ) : (
                              <><ImagePlus className="h-5 w-5 text-gray-400" /><span className="text-[10px] text-gray-400">Image</span></>
                            )}
                          </button>
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                          <div className="flex-1 space-y-2">
                            <Input value={customForm.title} onChange={e => setCustomForm(f => ({ ...f, title: e.target.value }))} placeholder="Item name *" className="h-9 text-sm" />
                            <div className="grid grid-cols-2 gap-2">
                              <Input type="number" value={customForm.price} onChange={e => setCustomForm(f => ({ ...f, price: e.target.value }))} placeholder="Price (₹) *" className="h-9 text-sm" min={1} />
                              <Input value={customForm.category} onChange={e => setCustomForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" className="h-9 text-sm" />
                            </div>
                            <Input value={customForm.description} onChange={e => setCustomForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description (optional)" className="h-9 text-sm" />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button size="sm" className="h-9 px-4 bg-violet-600 hover:bg-violet-700" onClick={addCustomItem}>
                            <Plus className="h-4 w-4 mr-2" />Add
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 pb-4">
                        <button onClick={() => setShowCustomForm(true)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/30 transition-all">
                          <Plus className="h-4 w-4" />
                          Add Custom {activeTab === 'activity' ? 'Activity' : 'Add-On'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  // ── Collect selected items for preview thumbnails ──
  const selectedItems = useMemo(() => {
    const items: { id: string; title: string; price: number; imageUrl?: string }[] = [];
    for (const catalogId of effectiveEnabled) {
      const cat = CATALOG_BY_ID.get(catalogId);
      if (cat) {
        items.push({ id: catalogId, title: cat.title, price: localPrices[catalogId] ?? cat.defaultPrice, imageUrl: cat.imageUrl });
      }
    }
    effectiveCustomAddOns.forEach(a => {
      items.push({ id: a.id, title: a.title, price: a.price, imageUrl: a.imageUrl });
    });
    return items;
  }, [effectiveEnabled, effectiveCustomAddOns, localPrices]);

  // ── Render: compact trigger card + modal ──
  return (
    <>
      {/* Compact trigger card — always visible in edit mode */}
      {isEditMode && (
        <div
          id="addon-manager-section"
          className="rounded-xl overflow-hidden shadow-md bg-white cursor-pointer hover:shadow-lg transition-all group border border-violet-200/60"
          onClick={() => setModalOpen(true)}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add-Ons & Activities</h3>
                  <p className="text-white/70 text-[11px]">
                    {totalEnabled > 0
                      ? `Tap to manage your ${totalEnabled} item${totalEnabled !== 1 ? 's' : ''}`
                      : 'Tap to browse the catalog'}
                  </p>
                </div>
              </div>
              {totalEnabled > 0 && (
                <div className="bg-white rounded-full h-7 min-w-[28px] px-2.5 flex items-center justify-center">
                  <span className="text-xs font-bold text-violet-600">{totalEnabled}</span>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          {selectedItems.length > 0 ? (
            <div className="p-3 space-y-3">
              {/* Thumbnail strip of selected items */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {selectedItems.slice(0, 6).map(item => (
                  <div key={item.id} className="flex-shrink-0 w-[72px]">
                    <div className="w-[72px] h-[54px] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
                          <Package className="h-4 w-4 text-violet-300" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1 line-clamp-1 text-center font-medium">{item.title}</p>
                  </div>
                ))}
                {selectedItems.length > 6 && (
                  <div className="flex-shrink-0 w-[72px] flex flex-col items-center justify-center">
                    <div className="w-[72px] h-[54px] rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-violet-500">+{selectedItems.length - 6}</span>
                    </div>
                    <p className="text-[10px] text-violet-500 mt-1 font-medium">more</p>
                  </div>
                )}
              </div>

              {/* Open button */}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-violet-600 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border border-violet-200 transition-all group-hover:border-violet-300">
                Open Catalog
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 text-center space-y-2">
              <div className="flex justify-center gap-1.5">
                {['🎨', '🎭', '🎪', '🎵'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 flex items-center justify-center text-base">
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">No add-ons selected yet</p>
              <button className="flex items-center justify-center gap-1.5 mx-auto py-2 px-5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-sm transition-all">
                <Plus className="h-3.5 w-3.5" /> Browse Catalog
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col">
          <DialogTitle className="sr-only">Add-Ons & Activities</DialogTitle>
          {/* Modal header — fixed */}
          <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add-Ons & Activities</h3>
                <p className="text-white/70 text-xs">Pick from catalog or add your own</p>
              </div>
            </div>
            {totalEnabled > 0 && (
              <div className="bg-white rounded-full h-8 min-w-[32px] px-3 flex items-center justify-center">
                <span className="text-sm font-bold text-violet-600">{totalEnabled} selected</span>
              </div>
            )}
          </div>

          {/* Scrollable catalog content — takes remaining space */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {catalogContent}
          </div>

          {/* Sticky footer — fixed at bottom */}
          <div className="border-t bg-white px-5 py-3 flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-gray-500">
              {totalEnabled > 0
                ? `${totalEnabled} item${totalEnabled !== 1 ? 's' : ''} selected`
                : 'No items selected'}
            </p>
            <Button
              size="sm"
              onClick={() => setModalOpen(false)}
              className="h-9 px-6 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-sm"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
