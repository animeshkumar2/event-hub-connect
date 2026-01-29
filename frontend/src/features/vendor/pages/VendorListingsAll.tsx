import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { 
  ArrowLeft, 
  Search, 
  LayoutGrid, 
  Package, 
  Box, 
  Filter,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Plus,
  Camera,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Tag,
  Palette,
  UtensilsCrossed,
  MapPin,
  Music,
  Lightbulb
} from 'lucide-react';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { useVendorListingsData } from '@/shared/hooks/useApi';
import { toast } from 'sonner';
import { vendorApi } from '@/shared/services/api';

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

export default function VendorListingsAll() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; listing: any | null }>({
    open: false,
    listing: null,
  });
  
  const { listings, categories, loading } = useVendorListingsData();
  const listingsData = listings.data;
  const categoriesData = categories.data;
  const refetch = listings.refetch;

  // Core categories for display
  const coreCategories = [
    { id: 'photography-videography', name: 'Photography & Videography' },
    { id: 'decorator', name: 'Décor' },
    { id: 'caterer', name: 'Catering' },
    { id: 'venue', name: 'Venue' },
    { id: 'mua', name: 'Makeup & Styling' },
    { id: 'dj-entertainment', name: 'DJ & Entertainment' },
    { id: 'sound-lights', name: 'Sound & Lights' },
    { id: 'other', name: 'Other' },
  ];

  const CORE_CATEGORY_MAP: Record<string, string[]> = {
    'photography-videography': ['photo-video'],
    'decorator': ['decorator'],
    'caterer': ['caterer'],
    'venue': ['venue'],
    'mua': ['mua'],
    'dj-entertainment': ['dj-entertainment'],
    'sound-lights': ['sound-lights'],
    'artists': ['artists'],
    'other': ['other'],
  };

  const getCoreCategoryId = (dbCategoryId: string): string => {
    for (const [coreId, dbIds] of Object.entries(CORE_CATEGORY_MAP)) {
      if (dbIds.includes(dbCategoryId)) {
        return coreId;
      }
    }
    return 'other';
  };

  const getCategoryName = (categoryId: string): string => {
    if (!categoryId) return 'Other';
    const category = categoriesData?.find((c: any) => c.id === categoryId);
    return category?.displayName || category?.name || 'Other';
  };

  // Helper function to extract display price from listing
  const getDisplayPrice = useCallback((listing: any): number => {
    if (!listing) return 0;
    
    // Try to extract from category-specific data first
    if (listing.categorySpecificData) {
      try {
        const categoryData = typeof listing.categorySpecificData === 'string' 
          ? JSON.parse(listing.categorySpecificData)
          : listing.categorySpecificData;
        
        const categoryId = listing.listingCategory?.id || listing.categoryId;
        
        let extractedPrice = 0;
        switch (categoryId) {
          case 'caterer':
            extractedPrice = categoryData.pricePerPlateVeg || categoryData.pricePerPlateNonVeg || 0;
            break;
          case 'photographer':
          case 'cinematographer':
          case 'videographer':
            extractedPrice = categoryData.photographyPrice || categoryData.videographyPrice || categoryData.price || 0;
            break;
          case 'decorator':
          case 'venue':
          case 'dj':
          case 'live-music':
          case 'sound-lights':
            extractedPrice = categoryData.price || 0;
            break;
          case 'mua':
            extractedPrice = categoryData.bridalPrice || categoryData.nonBridalPrice || 0;
            break;
          default:
            extractedPrice = categoryData.price || 0;
        }
        
        if (extractedPrice > 0) {
          return extractedPrice;
        }
      } catch (e) {
        console.error('Error parsing category data:', e);
      }
    }

    return Number(listing.price) || 0;
  }, []);

  // Filter all listings (exclude drafts)
  const allListings = useMemo(() => {
    return listingsData?.filter((l: any) => l.isDraft !== true) || [];
  }, [listingsData]);

  // Count by type and status
  const packageCount = useMemo(() => allListings.filter((l: any) => l.type === 'PACKAGE').length, [allListings]);
  const itemCount = useMemo(() => allListings.filter((l: any) => l.type === 'ITEM').length, [allListings]);
  const activeCount = useMemo(() => allListings.filter((l: any) => l.isActive).length, [allListings]);
  
  // Apply filters
  const filteredListings = useMemo(() => {
    return allListings.filter((listing: any) => {
      const matchesSearch = listing.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const listingCategoryId = listing.listingCategory?.id || listing.categoryId || '';
      const coreCategoryId = getCoreCategoryId(listingCategoryId);
      const matchesCategory = selectedCategoryFilter === 'all' || coreCategoryId === selectedCategoryFilter;
      const matchesType = selectedTypeFilter === 'all' || listing.type === selectedTypeFilter;
      const matchesStatus = selectedStatusFilter === 'all' || 
        (selectedStatusFilter === 'active' && listing.isActive) ||
        (selectedStatusFilter === 'inactive' && !listing.isActive);
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });
  }, [allListings, searchQuery, selectedCategoryFilter, selectedTypeFilter, selectedStatusFilter]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategoryFilter !== 'all' || selectedTypeFilter !== 'all' || selectedStatusFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setSelectedTypeFilter('all');
    setSelectedStatusFilter('all');
  };

  const handleEdit = (listing: any) => {
    navigate(`/vendor/listings/preview/${listing.id}?edit=true`);
  };

  const handleDelete = async (listing: any) => {
    setDeleteDialog({ open: true, listing });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.listing) return;
    
    setIsDeleting(deleteDialog.listing.id);
    try {
      await vendorApi.deleteListing(deleteDialog.listing.id);
      toast.success('Listing deleted successfully');
      setDeleteDialog({ open: false, listing: null });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleActive = async (listing: any) => {
    try {
      await vendorApi.updateListing(listing.id, {
        ...listing,
        isActive: !listing.isActive,
      });
      toast.success(`Listing ${listing.isActive ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing');
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <BrandedLoader fullScreen={false} message="Loading your listings..." />
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4 sm:p-6 lg:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative space-y-5">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">All Listings</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Manage all your packages and services
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/vendor/listings')}
                className="border-primary/30 hover:bg-primary hover:text-white hover:border-primary w-fit"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            {/* Stats Cards - 2x2 on mobile/tablet, 4 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTypeFilter('all')}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{allListings.length}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors cursor-pointer ${selectedTypeFilter === 'PACKAGE' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'PACKAGE' ? 'all' : 'PACKAGE')}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{packageCount}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Packages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`bg-background/60 backdrop-blur-sm border-primary/10 hover:border-emerald-500/30 transition-colors cursor-pointer ${selectedTypeFilter === 'ITEM' ? 'ring-2 ring-emerald-500' : ''}`}
                    onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'ITEM' ? 'all' : 'ITEM')}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Box className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{itemCount}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`bg-background/60 backdrop-blur-sm border-primary/10 hover:border-green-500/30 transition-colors cursor-pointer ${selectedStatusFilter === 'active' ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'active' ? 'all' : 'active')}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{activeCount}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Live</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-card rounded-xl border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {[searchQuery, selectedCategoryFilter !== 'all', selectedTypeFilter !== 'all', selectedStatusFilter !== 'all'].filter(Boolean).length} active
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                Clear all
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PACKAGE">📦 Packages</SelectItem>
                <SelectItem value="ITEM">🏷️ Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {coreCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">🟢 Live</SelectItem>
                <SelectItem value="inactive">⚫ Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredListings.length}</span> of {allListings.length} listings
          </p>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Filter className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {hasActiveFilters ? 'No listings match your filters' : 'No listings yet'}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                {hasActiveFilters 
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for' 
                  : 'Create your first listing to start showcasing your services'}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => navigate('/vendor/listings')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((listing: any) => {
              const isPackage = listing.type === 'PACKAGE';
              
              // Get all items for looking up bundled items
              const allItems = listingsData?.filter((l: any) => l.type === 'ITEM') || [];
              
              // For packages, extract unique categories from bundled items
              let packageCategories: string[] = [];
              if (isPackage && listing.includedItemIds?.length > 0) {
                const uniqueCategories = new Set<string>();
                listing.includedItemIds.forEach((itemId: string) => {
                  const item = allItems.find((i: any) => i.id === itemId);
                  if (item) {
                    const categoryId = item.listingCategory?.id || item.categoryId;
                    if (categoryId) {
                      uniqueCategories.add(getCategoryName(categoryId));
                    }
                  }
                });
                packageCategories = Array.from(uniqueCategories);
              }
              
              const displayCategory = isPackage && packageCategories.length > 0 
                ? packageCategories[0] 
                : getCategoryName(listing.listingCategory?.id || listing.categoryId || '');
              const CategoryIcon = getCategoryIcon(displayCategory);
              
              return (
                <Card 
                  key={listing.id} 
                  className="group overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-card"
                >
                  {/* Image Section */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {listing.images?.[0] ? (
                      <>
                        <img
                          src={listing.images[0]}
                          alt={listing.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        {isPackage ? <Package className="h-10 w-10 text-muted-foreground/30" /> : <Box className="h-10 w-10 text-muted-foreground/30" />}
                      </div>
                    )}
                    
                    {/* Type Badge - Top Left */}
                    <Badge 
                      className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 ${
                        isPackage 
                          ? 'bg-primary text-white' 
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {isPackage ? '📦 Package' : '🏷️ Service'}
                    </Badge>
                    
                    {/* Status Badge - Top Right */}
                    <Badge 
                      className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 ${
                        listing.isActive 
                          ? 'bg-green-500/90 text-white' 
                          : 'bg-gray-500/90 text-white'
                      }`}
                    >
                      {listing.isActive ? '● Live' : '○ Off'}
                    </Badge>
                    
                    {/* Price - Bottom Right */}
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-white/95 text-foreground font-bold text-sm px-2 py-1 shadow-md">
                        ₹{getDisplayPrice(listing).toLocaleString('en-IN')}
                      </Badge>
                    </div>
                    
                    {/* Image Count - Bottom Left */}
                    {listing.images?.length > 1 && (
                      <Badge variant="secondary" className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5">
                        <Camera className="h-3 w-3 mr-0.5" /> {listing.images.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Content Section */}
                  <CardContent className="p-3">
                    {/* Title & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                          {listing.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          {isPackage && packageCategories.length > 1 ? (
                            <div className="flex flex-wrap gap-1">
                              {packageCategories.slice(0, 3).map((catName, idx) => {
                                const CatIcon = getCategoryIcon(catName);
                                return (
                                  <span key={idx} className="flex items-center gap-0.5 text-[9px] text-muted-foreground bg-muted/50 px-1 py-0.5 rounded">
                                    <CatIcon className="h-2.5 w-2.5" />
                                    {catName.split(' ')[0]}
                                  </span>
                                );
                              })}
                              {packageCategories.length > 3 && (
                                <span className="text-[9px] text-muted-foreground">+{packageCategories.length - 3}</span>
                              )}
                            </div>
                          ) : (
                            <>
                              <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground truncate">
                                {displayCategory}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => navigate(`/vendor/listings/preview/${listing.id}`)}>
                            <Eye className="mr-2 h-3.5 w-3.5" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(listing)}>
                            <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(listing)}>
                            {listing.isActive ? '○ Deactivate' : '● Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(listing)} 
                            className="text-red-600"
                            disabled={isDeleting === listing.id}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Package Items Count */}
                    {isPackage && listing.includedItemIds?.length > 0 && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Package className="h-3 w-3" /> {listing.includedItemIds.length} services bundled
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, listing: null })}
        onConfirm={confirmDelete}
        title="Delete Listing"
        description="Are you sure you want to delete this listing? This will remove it from customer view and cannot be undone."
        itemName={deleteDialog.listing?.name}
        isDeleting={isDeleting !== null}
      />
    </VendorLayout>
  );
}
