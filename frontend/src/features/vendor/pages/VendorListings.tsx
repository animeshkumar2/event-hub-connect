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
import { useMyVendorListings, useVendorProfile, useEventTypes, useCategories } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';

export default function VendorListings() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listingType, setListingType] = useState<'PACKAGE' | 'ITEM'>('PACKAGE');
  const [editingListing, setEditingListing] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch data
  const { data: listingsData, loading: listingsLoading, error: listingsError, refetch } = useMyVendorListings();
  const { data: profileData } = useVendorProfile();
  const { data: eventTypesData } = useEventTypes();
  const { data: categoriesData } = useCategories();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    eventTypeIds: [] as number[],
    images: [] as string[],
    // Package fields
    includedItemsText: [] as string[],
    excludedItemsText: [] as string[],
    deliveryTime: '',
    extraCharges: [] as string[],
    // Item fields
    unit: '',
    minimumQuantity: 1,
  });

  // Get vendor category
  const vendorCategoryId = profileData?.vendorCategory?.id || profileData?.categoryId || '';
  const vendorCategoryName = profileData?.vendorCategory?.name || profileData?.categoryName || '';

  // Filter listings
  const filteredListings = useMemo(() => {
    if (!listingsData || !Array.isArray(listingsData)) return [];
    if (!searchQuery) return listingsData;
    const query = searchQuery.toLowerCase();
    return listingsData.filter((listing: any) =>
      listing.name?.toLowerCase().includes(query) ||
      listing.description?.toLowerCase().includes(query)
    );
  }, [listingsData, searchQuery]);

  const packages = useMemo(() => filteredListings.filter((l: any) => l.type === 'PACKAGE'), [filteredListings]);
  const items = useMemo(() => filteredListings.filter((l: any) => l.type === 'ITEM'), [filteredListings]);

  // Initialize form when editing
  useEffect(() => {
    if (editingListing) {
      setFormData({
        name: editingListing.name || '',
        description: editingListing.description || '',
        price: editingListing.price?.toString() || '',
        categoryId: editingListing.listingCategory?.id || editingListing.categoryId || vendorCategoryId,
        eventTypeIds: editingListing.eventTypes?.map((et: any) => et.id || et) || [],
        images: editingListing.images || [],
        includedItemsText: editingListing.includedItemsText || [],
        excludedItemsText: editingListing.excludedItemsText || [],
        deliveryTime: editingListing.deliveryTime || '',
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
        includedItemsText: [],
        excludedItemsText: [],
        deliveryTime: '',
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
      };

      if (listingType === 'PACKAGE') {
        payload.includedItemsText = formData.includedItemsText;
        payload.excludedItemsText = formData.excludedItemsText;
        payload.deliveryTime = formData.deliveryTime;
        payload.extraCharges = formData.extraCharges;
      } else {
        payload.unit = formData.unit;
        payload.minimumQuantity = formData.minimumQuantity;
        payload.deliveryTime = formData.deliveryTime;
        payload.extraCharges = formData.extraCharges;
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

  const addIncludedItem = () => {
    const item = prompt('Enter included item:');
    if (item) {
      setFormData({ ...formData, includedItemsText: [...formData.includedItemsText, item] });
    }
  };

  const removeIncludedItem = (index: number) => {
    setFormData({ ...formData, includedItemsText: formData.includedItemsText.filter((_, i) => i !== index) });
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
                placeholder="Search listings..."
                className="pl-10 bg-background border-border text-foreground w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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

                  {listingType === 'PACKAGE' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-foreground">Included Items</Label>
                        <div className="space-y-2">
                          {formData.includedItemsText.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Input value={item} disabled className="flex-1" />
                              <Button size="sm" variant="ghost" onClick={() => removeIncludedItem(i)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" onClick={addIncludedItem}>
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Delivery Time</Label>
                        <Input
                          value={formData.deliveryTime}
                          onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                          className="bg-background border-border text-foreground"
                          placeholder="e.g., 2-3 weeks"
                        />
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
                  <h3 className="text-foreground font-semibold text-lg mb-1">{listing.name}</h3>
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
                  <h3 className="text-foreground font-semibold text-lg mb-1">{listing.name}</h3>
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
