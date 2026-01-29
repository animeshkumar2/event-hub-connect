import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ArrowLeft, Search, Package } from 'lucide-react';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { ListingCard } from '@/features/vendor/components/ListingCard';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { useVendorListingsData } from '@/shared/hooks/useApi';
import { toast } from 'sonner';
import { vendorApi } from '@/shared/services/api';

export default function VendorListingsPackages() {
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

  // Filter packages (exclude drafts)
  const packages = useMemo(() => {
    return listingsData?.filter((l: any) => 
      l.type === 'PACKAGE' && l.isDraft !== true
    ) || [];
  }, [listingsData]);
  
  // Apply filters
  const filteredPackages = useMemo(() => {
    return packages.filter((listing: any) => {
      const matchesSearch = listing.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const listingCategoryId = listing.listingCategory?.id || listing.categoryId || '';
      const coreCategoryId = getCoreCategoryId(listingCategoryId);
      const matchesCategory = selectedCategoryFilter === 'all' || coreCategoryId === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [packages, searchQuery, selectedCategoryFilter]);

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
      toast.success('Package deleted successfully');
      setDeleteDialog({ open: false, listing: null });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete package');
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
      toast.success(`Package ${listing.isActive ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update package');
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <BrandedLoader fullScreen={false} message="Bundling your packages..." />
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
            <Package className="h-7 w-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Packages</h1>
            <Badge variant="secondary" className="text-base">{packages.length}</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
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
        {filteredPackages.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery || selectedCategoryFilter !== 'all' ? 'No packages found' : 'No packages yet'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedCategoryFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first package to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((listing: any) => (
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
        title="Delete Package"
        description="Are you sure you want to delete this package? This will remove it from customer view and cannot be undone."
        itemName={deleteDialog.listing?.name}
        isDeleting={isDeleting !== null}
      />
    </VendorLayout>
  );
}
