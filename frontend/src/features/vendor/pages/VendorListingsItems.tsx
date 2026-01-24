import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ArrowLeft, Search, Box } from 'lucide-react';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { ListingCard } from '@/features/vendor/components/ListingCard';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { useVendorListingsData } from '@/shared/hooks/useApi';
import { toast } from 'sonner';
import { vendorApi } from '@/shared/services/api';

export default function VendorListingsItems() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
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
    { id: 'photography-videography', name: '📸 Photography & Videography' },
    { id: 'decorator', name: '🎨 Décor' },
    { id: 'caterer', name: '🍽️ Catering' },
    { id: 'venue', name: '🏛️ Venue' },
    { id: 'mua', name: '💄 Makeup & Styling' },
    { id: 'dj-entertainment', name: '🎵 DJ & Entertainment' },
    { id: 'sound-lights', name: '💡 Sound & Lights' },
    { id: 'other', name: '📦 Other' },
  ];

  const CORE_CATEGORY_MAP: Record<string, string[]> = {
    'photography-videography': ['photographer', 'cinematographer', 'videographer'],
    'decorator': ['decorator'],
    'caterer': ['caterer'],
    'venue': ['venue'],
    'mua': ['mua'],
    'dj-entertainment': ['dj', 'live-music'],
    'sound-lights': ['sound-lights'],
    'other': ['other', 'return-gifts', 'invitations', 'anchors', 'event-coordinator'],
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

  // Filter items (exclude drafts)
  const items = useMemo(() => {
    const filtered = listingsData?.filter((l: any) => {
      console.log('🔍 Filtering item:', l.name, 'type:', l.type, 'isDraft:', l.isDraft);
      return l.type === 'ITEM' && l.isDraft !== true;
    }) || [];
    console.log('✅ Filtered items count:', filtered.length);
    return filtered;
  }, [listingsData]);
  
  // Apply filters
  const filteredItems = useMemo(() => {
    return items.filter((listing: any) => {
      const matchesSearch = listing.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const listingCategoryId = listing.listingCategory?.id || listing.categoryId || '';
      const coreCategoryId = getCoreCategoryId(listingCategoryId);
      const matchesCategory = selectedCategoryFilter === 'all' || coreCategoryId === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategoryFilter]);

  const handleEdit = (listing: any) => {
    navigate(`/vendor/listings?edit=${listing.id}`);
  };

  const handleDelete = async (listing: any) => {
    setDeleteDialog({ open: true, listing });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.listing) return;
    
    setIsDeleting(deleteDialog.listing.id);
    try {
      await vendorApi.deleteListing(deleteDialog.listing.id);
      toast.success('Item deleted successfully');
      setDeleteDialog({ open: false, listing: null });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item');
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
      toast.success(`Item ${listing.isActive ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update item');
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <BrandedLoader fullScreen={false} message="Fetching your inventory..." />
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/vendor/listings')}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Box className="h-7 w-7 text-secondary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Individual Items</h1>
            <Badge variant="secondary" className="text-base">{items.length}</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {coreCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Listings Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Box className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery || selectedCategoryFilter !== 'all' ? 'No items found' : 'No items yet'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedCategoryFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first item to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((listing: any) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                isDeleting={isDeleting === listing.id}
                getCategoryName={getCategoryName}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, listing: null })}
        onConfirm={confirmDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This will remove it from customer view and cannot be undone."
        itemName={deleteDialog.listing?.name}
        isDeleting={isDeleting !== null}
      />
    </VendorLayout>
  );
}
