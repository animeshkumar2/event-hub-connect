import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { ArrowLeft, Search, Clock, Loader2 } from 'lucide-react';
import { ListingCard } from '@/features/vendor/components/ListingCard';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { useVendorListingsData } from '@/shared/hooks/useApi';
import { toast } from 'sonner';
import { vendorApi } from '@/shared/services/api';

export default function VendorListingsDrafts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; listing: any | null }>({
    open: false,
    listing: null,
  });
  
  const { listings, loading } = useVendorListingsData();
  const listingsData = listings.data;
  const refetch = listings.refetch;

  // Filter drafts
  const draftListings = listingsData?.filter((l: any) => l.isDraft === true) || [];
  
  // Apply search filter
  const filteredDrafts = draftListings.filter((listing: any) =>
    listing.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      toast.success('Draft deleted successfully');
      setDeleteDialog({ open: false, listing: null });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete draft');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
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
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/vendor/listings')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Clock className="h-7 w-7 text-yellow-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Incomplete Listings</h1>
            <Badge variant="secondary" className="text-base">{draftListings.length}</Badge>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Listings Grid */}
        {filteredDrafts.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No drafts found' : 'No incomplete listings'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'All your listings are complete!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDrafts.map((listing: any) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isDraft={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={isDeleting === listing.id}
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
        title="Delete Draft Listing"
        description="Are you sure you want to delete this draft? This action cannot be undone."
        itemName={deleteDialog.listing?.name}
        isDeleting={isDeleting !== null}
      />
    </VendorLayout>
  );
}
