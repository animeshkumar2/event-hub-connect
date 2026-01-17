import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PhotoGallery } from '@/features/listing/PhotoGallery';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  User,
  Package,
  AlertCircle,
  Loader2,
  ExternalLink,
  IndianRupee,
  Edit,
  Eye
} from 'lucide-react';
import { useListingDetails, useVendorListings, useVendorReviews } from '@/shared/hooks/useApi';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { ScrollReveal } from '@/shared/components/ScrollReveal';

interface ExtraCharge {
  name: string;
  price: number;
}

export default function ListingPreview() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { data: listing, loading, error } = useListingDetails(listingId || null);
  
  const vendorId = listing?.vendorId;
  const { data: vendorListingsData } = useVendorListings(vendorId || null);
  const vendorListings = Array.isArray(vendorListingsData) ? vendorListingsData : (vendorListingsData?.data || vendorListingsData || []);

  const { data: reviewsData } = useVendorReviews(vendorId || null, 0, 5);
  const reviews = reviewsData?.data?.content || [];

  const isPackage = listing?.type?.toLowerCase() === 'package' || listing?.type === 'PACKAGE';
  const isItem = listing?.type?.toLowerCase() === 'item' || listing?.type === 'ITEM';

  const parsedExtraCharges: ExtraCharge[] = useMemo(() => {
    if (listing?.extraChargesJson) {
      try {
        return JSON.parse(listing.extraChargesJson);
      } catch {
        return [];
      }
    }
    return [];
  }, [listing?.extraChargesJson]);

  const linkedItems = useMemo(() => {
    if (!listing?.includedItemIds || !listing.includedItemIds.length) return [];
    if (!vendorListings || !vendorListings.length) return [];
    return vendorListings.filter((l: any) => listing.includedItemIds.includes(l.id));
  }, [listing?.includedItemIds, vendorListings]);

  const displayHighlights = listing?.highlights?.length > 0 
    ? listing.highlights 
    : listing?.includedItemsText?.slice(0, 4) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/vendor/listings')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!loading && (error || !listing)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/vendor/listings')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "The listing you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => navigate('/vendor/listings')} variant="default">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Listings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Back Button - No Navbar */}
      <div className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/vendor/listings')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
        </div>
      </div>

      {/* Main Content - Same Layout as Customer View (2-column grid, but only showing left column) */}
      <div className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-20 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Content (same as customer view) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Photo Gallery */}
          <ScrollReveal animation="fadeInUp">
            <PhotoGallery 
              images={listing.images || []} 
              title={listing.name}
            />
          </ScrollReveal>

          {/* Header Section */}
          <ScrollReveal animation="fadeInUp" delay={100}>
            <section>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isPackage && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Package className="h-3 w-3 mr-1" />
                        Package
                      </Badge>
                    )}
                    {isItem && (
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                        Individual Item
                      </Badge>
                    )}
                    {listing.isPopular && (
                      <Badge className="bg-orange-500 text-white">🔥 Popular</Badge>
                    )}
                    {listing.isTrending && (
                      <Badge className="bg-purple-500 text-white">⭐ Trending</Badge>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 leading-tight">
                    {listing.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">{listing.vendorName}</span>
                    </div>
                    {listing.vendorCity && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{listing.vendorCity}</span>
                        </div>
                      </>
                    )}
                    {/* Hide rating if it's 0 or no reviews */}
                    {listing.vendorRating !== undefined && 
                     listing.vendorRating !== null && 
                     listing.vendorRating > 0 && 
                     listing.vendorReviewCount > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{listing.vendorRating.toFixed(1)}</span>
                          <span>({listing.vendorReviewCount})</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Price Display */}
          <ScrollReveal animation="fadeInUp" delay={150}>
            <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary flex items-center">
                        <IndianRupee className="h-6 w-6" />
                        {Number(listing.price).toLocaleString('en-IN')}
                      </span>
                      {isItem && listing.unit && (
                        <span className="text-sm text-muted-foreground">per {listing.unit}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Listing Highlights */}
          {displayHighlights.length > 0 && (
            <ScrollReveal animation="fadeInUp" delay={200}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Listing Highlights</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {displayHighlights.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

          {/* Description */}
          <ScrollReveal animation="fadeInUp" delay={300}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">About this {isPackage ? 'package' : 'item'}</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {listing.description || 'No description available.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Included Items */}
          {isPackage && linkedItems.length > 0 && (
            <ScrollReveal animation="fadeInUp" delay={350}>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Bundled Items ({linkedItems.length})</h2>
                        <p className="text-sm text-muted-foreground">This package includes the following items</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {linkedItems.map((item: any) => (
                        <div key={item.id} className="rounded-xl border-2 border-border overflow-hidden">
                          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            {item.images?.[0] ? (
                              <>
                                <img 
                                  src={item.images[0]} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-10 w-10 text-muted-foreground/40" />
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2">
                              <Badge className="bg-white text-foreground font-bold shadow-lg">
                                ₹{Number(item.price).toLocaleString('en-IN')}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-card">
                            <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.description || 'Individual item included in this package'}
                            </p>
                            {item.unit && (
                              <p className="text-xs text-primary mt-2">Per {item.unit}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

          {/* What's Included */}
          {isPackage && listing.includedItemsText && listing.includedItemsText.length > 0 && (
            <ScrollReveal animation="fadeInUp" delay={400}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">What's Included</h2>
                  <div className="space-y-2">
                    {listing.includedItemsText.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

          {/* What's Not Included */}
          {isPackage && listing.excludedItemsText && listing.excludedItemsText.length > 0 && (
            <ScrollReveal animation="fadeInUp" delay={500}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">What's Not Included</h2>
                  <div className="space-y-2">
                    {listing.excludedItemsText.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

          {/* Extra Charges */}
          {(parsedExtraCharges.length > 0 || (listing.extraCharges && listing.extraCharges.length > 0)) && (
            <ScrollReveal animation="fadeInUp" delay={600}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Extra Charges</h2>
                  <div className="space-y-2">
                    {parsedExtraCharges.map((charge, index) => (
                      <div key={`detailed-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">{charge.name}</span>
                        <span className="text-sm font-semibold text-primary flex items-center">
                          <IndianRupee className="h-3 w-3 mr-0.5" />
                          {Number(charge.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    {parsedExtraCharges.length === 0 && listing.extraCharges?.map((charge: string, index: number) => (
                      <div key={`text-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm">{charge}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

          {/* Service Details */}
          <ScrollReveal animation="fadeInUp" delay={650}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Service Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.deliveryTime && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Delivery Time</p>
                        <p className="text-sm text-muted-foreground">{listing.deliveryTime}</p>
                      </div>
                    </div>
                  )}
                  {isItem && listing.unit && (
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Unit</p>
                        <p className="text-sm text-muted-foreground">{listing.unit}</p>
                      </div>
                    </div>
                  )}
                  {isItem && listing.minimumQuantity && (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Minimum Quantity</p>
                        <p className="text-sm text-muted-foreground">{listing.minimumQuantity}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Reviews */}
          {reviews.length > 0 && (
            <ScrollReveal animation="fadeInUp" delay={700}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                      Reviews
                      {listing.vendorRating !== undefined && listing.vendorRating !== null && (
                        <span className="ml-2 text-lg font-normal text-muted-foreground">
                          ({listing.vendorRating.toFixed(1)})
                        </span>
                      )}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review: any) => (
                      <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{review.customerName || 'Anonymous'}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < (review.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {review.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.createdAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}
          </div>
          {/* Right Column - Empty (where booking widget would be for customers) */}
          <div className="lg:col-span-1 hidden lg:block">
            {/* Intentionally empty - this space is reserved for booking widget in customer view */}
          </div>
        </div>
      </div>
    </div>
  );
}
