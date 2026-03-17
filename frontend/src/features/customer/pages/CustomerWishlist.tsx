import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../components/CustomerLayout';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Heart,
  Trash2,
  ExternalLink,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { customerApi } from '@/shared/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/hooks/use-toast';

export default function CustomerWishlist() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['customerWishlist'],
    queryFn: async () => {
      const response = await customerApi.getWishlist();
      return response.success ? response.data : [];
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: (listingId: string) => customerApi.removeFromWishlist(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerWishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistCount'] });
      toast({ title: 'Removed from wishlist' });
    },
    onError: () => {
      toast({ title: 'Failed to remove item', variant: 'destructive' });
    },
  });

  const items = wishlistData || [];

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">My Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-1">Services you've saved for later</p>
        </div>

        {isLoading ? (
          <Card className="shadow-sm border">
            <CardContent className="p-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading your wishlist...</p>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="shadow-sm border">
            <CardContent className="p-10 text-center">
              <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">Your wishlist is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">Browse vendors and save your favorite services!</p>
              <Button onClick={() => navigate('/search')} size="sm" className="gap-1.5">
                <Search className="h-4 w-4" />
                Browse Vendors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item: any) => {
              const listing = item.listing;
              if (!listing) return null;

              const imageUrl = listing.images?.[0] || listing.coverImage;
              const vendorName = listing.vendor?.businessName || listing.vendorName || 'Vendor';
              const category = listing.customCategoryName || listing.categoryName || listing.listingCategory?.name || '';

              return (
                <Card key={item.id} className="overflow-hidden border hover:shadow-md transition-all group">
                  {/* Image */}
                  <div className="relative h-40 bg-muted">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={listing.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist.mutate(listing.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-2">
                      {category && (
                        <Badge variant="secondary" className="text-[10px] mb-1.5">
                          {category}
                        </Badge>
                      )}
                      <h3 className="text-sm font-semibold line-clamp-1">{listing.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{vendorName}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {listing.price && (
                        <p className="text-base font-bold text-primary">
                          ₹{Number(listing.price).toLocaleString()}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 h-7 text-xs"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
