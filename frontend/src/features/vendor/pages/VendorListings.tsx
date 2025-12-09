import { useState, useEffect, useMemo } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
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
  X
} from 'lucide-react';
import { ImageUpload } from '@/shared/components/ImageUpload';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useVendorListingsData } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';

export default function VendorListings() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listingType, setListingType] = useState<'PACKAGE' | 'ITEM'>('PACKAGE');
  const [editingListing, setEditingListing] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Fetch data in parallel using optimized hook
  const { listings, profile, eventTypes, categories, loading: dataLoading } = useVendorListingsData();
  const listingsData = listings.data;
  const listingsLoading = listings.loading || dataLoading;
  const listingsError = listings.error;
  const refetch = listings.refetch;
  const profileData = profile.data;
  const eventTypesData = eventTypes.data;
  const categoriesData = categories.data;

  // Extra charge with pricing type
  type ExtraCharge = { name: string; price: string };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
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

  const packages = useMemo(() => filteredListings.filter((l: any) => l.type === 'PACKAGE'), [filteredListings]);
  const items = useMemo(() => filteredListings.filter((l: any) => l.type === 'ITEM'), [filteredListings]);

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
    } else {
      // Reset form
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
      });
      setListingType('PACKAGE');
    }
  }, [editingListing, vendorCategoryId]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.categoryId || formData.eventTypeIds.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
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
      };

      if (listingType === 'PACKAGE') {
        payload.includedItemsText = formData.includedItemsText;
        payload.includedItemIds = formData.includedItemIds;
        payload.excludedItemsText = formData.excludedItemsText;
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
    }
  };

  const handleDelete = async (listing: any) => {
    if (!confirm(`Are you sure you want to delete "${listing.name}"?`)) return;

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

  // Highlight helpers
  const addHighlight = () => {
    const highlight = prompt('Enter highlight (e.g., "Mandap decoration", "Stage decoration"):');
    if (highlight) {
      setFormData({ ...formData, highlights: [...formData.highlights, highlight] });
    }
  };

  const removeHighlight = (index: number) => {
    setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== index) });
  };

  // Included item text helpers
  const addIncludedItem = () => {
    const item = prompt('Enter included item:');
    if (item) {
      setFormData({ ...formData, includedItemsText: [...formData.includedItemsText, item] });
    }
  };

  const removeIncludedItem = (index: number) => {
    setFormData({ ...formData, includedItemsText: formData.includedItemsText.filter((_, i) => i !== index) });
  };

  // Linked item helpers (actual items from vendor's inventory)
  const toggleLinkedItem = (itemId: string) => {
    if (formData.includedItemIds.includes(itemId)) {
      setFormData({ ...formData, includedItemIds: formData.includedItemIds.filter(id => id !== itemId) });
    } else {
      setFormData({ ...formData, includedItemIds: [...formData.includedItemIds, itemId] });
    }
  };

  // Extra charge helpers
  const addExtraCharge = () => {
    const name = prompt('Enter extra charge name (e.g., "Additional lighting"):');
    if (name) {
      const priceStr = prompt('Enter price for this charge (₹):');
      const price = priceStr || '0';
      setFormData({ 
        ...formData, 
        extraChargesDetailed: [...formData.extraChargesDetailed, { name, price }] 
      });
    }
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

  if (listingsLoading) {
    return (
      <VendorLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Packages & Listings</h1>
            <p className="text-muted-foreground">
              {filteredListings.length} listings • {filteredListings.filter((l: any) => l.isActive).length} active
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, or category..."
                className="pl-10 bg-background border-border text-foreground w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-48 bg-background border-border text-foreground">
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
              setShowCreateModal(open);
              if (!open) setEditingListing(null);
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
                </DialogHeader>
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
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Event Types *</Label>
                    <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-lg bg-background max-h-40 overflow-y-auto">
                      {eventTypesData && Array.isArray(eventTypesData) && eventTypesData.map((et: any) => (
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
                            {et.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.eventTypeIds.length === 0 && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ Please select at least one event type
                      </p>
                    )}
                  </div>

                  {/* Highlights Section (for both PACKAGE and ITEM) */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Listing Highlights</Label>
                    <p className="text-xs text-muted-foreground">Key features shown at the top of your listing</p>
                    <div className="space-y-2">
                      {formData.highlights.map((highlight, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input 
                            value={highlight} 
                            onChange={(e) => {
                              const updated = [...formData.highlights];
                              updated[i] = e.target.value;
                              setFormData({ ...formData, highlights: updated });
                            }}
                            className="flex-1 bg-background border-border text-foreground" 
                          />
                          <Button size="sm" variant="ghost" onClick={() => removeHighlight(i)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={addHighlight}>
                        <Plus className="h-4 w-4 mr-2" /> Add Highlight
                      </Button>
                    </div>
                  </div>

                  {listingType === 'PACKAGE' && (
                    <>
                      {/* Link Existing Items Section */}
                      {items.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-foreground">Link Existing Items</Label>
                          <p className="text-xs text-muted-foreground">Select items from your inventory to include in this package (users can click them to see details)</p>
                          <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-lg bg-background max-h-40 overflow-y-auto">
                            {items.map((item: any) => (
                              <div key={item.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={formData.includedItemIds.includes(item.id)}
                                  onChange={() => toggleLinkedItem(item.id)}
                                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <Label className="text-sm font-normal text-foreground cursor-pointer flex-1 truncate">
                                  {item.name} (₹{Number(item.price).toLocaleString('en-IN')})
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Text-based Inclusions */}
                      <div className="space-y-2">
                        <Label className="text-foreground">What's Included (Text)</Label>
                        <p className="text-xs text-muted-foreground">Add custom inclusions not linked to items</p>
                        <div className="space-y-2">
                          {formData.includedItemsText.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Input 
                                value={item} 
                                onChange={(e) => {
                                  const updated = [...formData.includedItemsText];
                                  updated[i] = e.target.value;
                                  setFormData({ ...formData, includedItemsText: updated });
                                }}
                                className="flex-1 bg-background border-border text-foreground" 
                              />
                              <Button size="sm" variant="ghost" onClick={() => removeIncludedItem(i)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" onClick={addIncludedItem}>
                            <Plus className="h-4 w-4 mr-2" /> Add Inclusion
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
                    <Label className="text-foreground">Extra Charges</Label>
                    <p className="text-xs text-muted-foreground">Optional add-ons with pricing</p>
                    <div className="space-y-2">
                      {formData.extraChargesDetailed.map((charge, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input 
                            value={charge.name} 
                            onChange={(e) => updateExtraCharge(i, 'name', e.target.value)}
                            className="flex-1 bg-background border-border text-foreground" 
                            placeholder="Charge name"
                          />
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-1">₹</span>
                            <Input 
                              type="number"
                              value={charge.price} 
                              onChange={(e) => updateExtraCharge(i, 'price', e.target.value)}
                              className="w-28 bg-background border-border text-foreground" 
                              placeholder="Price"
                            />
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeExtraCharge(i)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={addExtraCharge}>
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

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-border hover:bg-muted"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingListing(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow"
                      onClick={handleSubmit}
                    >
                      {editingListing ? 'Update' : 'Create'} Listing
                    </Button>
                  </div>
                </div>
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

        {/* Packages Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Packages ({packages.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((listing: any) => (
              <Card key={listing.id} className="border-border overflow-hidden group hover:shadow-elegant transition-all">
                <div className="relative aspect-video">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className={listing.isActive ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}>
                      {listing.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-black/30 backdrop-blur-sm hover:bg-black/50">
                          <MoreVertical className="h-4 w-4 text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card border-border">
                        <DropdownMenuItem onClick={() => {
                          setEditingListing(listing);
                          setShowCreateModal(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(listing)}>
                          {listing.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(listing)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge className="bg-background/90 text-foreground font-bold text-lg px-3 py-1">
                      ₹{Number(listing.price).toLocaleString('en-IN')}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-foreground font-semibold text-lg flex-1">{listing.name}</h3>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {getCategoryName(listing.listingCategory?.id || listing.categoryId || '') || 'Other'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">{listing.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Items Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Box className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-semibold text-foreground">Items ({items.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((listing: any) => (
              <Card key={listing.id} className="border-border overflow-hidden group hover:shadow-elegant transition-all">
                <div className="relative aspect-video">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Box className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className={listing.isActive ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}>
                      {listing.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-black/30 backdrop-blur-sm hover:bg-black/50">
                          <MoreVertical className="h-4 w-4 text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card border-border">
                        <DropdownMenuItem onClick={() => {
                          setEditingListing(listing);
                          setShowCreateModal(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(listing)}>
                          {listing.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(listing)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge className="bg-background/90 text-foreground font-bold text-lg px-3 py-1">
                      ₹{Number(listing.price).toLocaleString('en-IN')}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-foreground font-semibold text-lg flex-1">{listing.name}</h3>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {getCategoryName(listing.listingCategory?.id || listing.categoryId || '') || 'Other'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">{listing.description}</p>
                  {listing.unit && (
                    <p className="text-xs text-muted-foreground mt-1">{listing.unit}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredListings.length === 0 && (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-4">Create your first package or item to get started</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Listing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </VendorLayout>
  );
}
