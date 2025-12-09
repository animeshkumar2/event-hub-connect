import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/features/home/Navbar';
import { PhotoGallery } from './PhotoGallery';
import { BookingWidget } from './BookingWidget';
import { PackageCard } from '@/features/search/PackageCard';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Heart,
  ArrowLeft,
  User,
  Award,
  Calendar,
  Package,
  AlertCircle,
  Loader2,
  ExternalLink,
  IndianRupee
} from 'lucide-react';
import { useListingDetails, useVendorListings, useVendorReviews } from '@/shared/hooks/useApi';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { ScrollReveal } from '@/shared/components/ScrollReveal';

// Type for extra charges
interface ExtraCharge {
  name: string;
  price: number;
}

export default function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { data: listingData, loading, error } = useListingDetails(listingId || null);
  
  // Debug logging
  useEffect(() => {
    if (listingId) {
      console.log('🔍 ListingDetail Debug:', {
        listingId,
        loading,
        error,
        rawData: listingData,
        extractedListing: listing,
        hasListing: !!listing,
        listingType: listing?.type,
      });
    }
  }, [listingId, loading, error, listingData]);
  
  // Handle API response structure
  // The API returns { success: true, data: ListingDTO } or { success: false, message: string, data: null }
  // listingData is already the unwrapped data from useApi hook
  const listing = listingData;
  const vendorId = listing?.vendorId;

  // Fetch vendor listings for similar listings
  const { data: vendorListingsData } = useVendorListings(vendorId || null);
  const vendorListings = vendorListingsData?.data || [];

  // Fetch reviews
  const { data: reviewsData } = useVendorReviews(vendorId || null, 0, 5);
  const reviews = reviewsData?.data?.content || [];

  // Similar listings (same vendor, different listing)
  const similarListings = useMemo(() => {
    if (!vendorListings || !listing) return [];
    return vendorListings
      .filter((l: any) => l.id !== listing.id)
      .slice(0, 6);
  }, [vendorListings, listing]);

  // Backend returns lowercase 'package' or 'item', but also handle uppercase
  const isPackage = listing?.type?.toLowerCase() === 'package' || listing?.type === 'PACKAGE';
  const isItem = listing?.type?.toLowerCase() === 'item' || listing?.type === 'ITEM';

  // Parse extra charges JSON if available
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

  // Get linked items from vendor listings
  const linkedItems = useMemo(() => {
    if (!listing?.includedItemIds || !vendorListings.length) return [];
    return vendorListings.filter((l: any) => 
      listing.includedItemIds.includes(l.id)
    );
  }, [listing?.includedItemIds, vendorListings]);

  // Use highlights if available, otherwise fall back to includedItemsText for highlights
  const displayHighlights = listing?.highlights?.length > 0 
    ? listing.highlights 
    : listing?.includedItemsText?.slice(0, 4) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Check if we have an error or if listing is null/undefined after loading
  if (!loading && (error || !listing)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "The listing you're looking for doesn't exist or has been removed."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/search')} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Search
                </Button>
                <Button onClick={() => navigate('/')} variant="default">
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                  <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
                    {listing.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link 
                      to={`/vendor/${listing.vendorId}`}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span className="font-semibold">{listing.vendorName}</span>
                    </Link>
                    {listing.vendorCity && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{listing.vendorCity}</span>
                        </div>
                      </>
                    )}
                    {listing.vendorRating !== undefined && listing.vendorRating !== null && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{listing.vendorRating.toFixed(1)}</span>
                          {listing.vendorReviewCount && (
                            <span>({listing.vendorReviewCount})</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              </section>
            </ScrollReveal>

            {/* Listing Highlights (for packages and items with highlights) */}
            {displayHighlights.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={200}>
                <section>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Listing Highlights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {displayHighlights.map((item: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Description */}
            <ScrollReveal animation="fadeInUp" delay={300}>
              <section>
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
              </section>
            </ScrollReveal>

            {/* Included Items - Clickable linked items */}
            {isPackage && linkedItems.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={350}>
                <section>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Items Included in This Package</h2>
                    <p className="text-sm text-muted-foreground mb-4">Click on any item to see its full details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {linkedItems.map((item: any) => (
                        <Link 
                          key={item.id} 
                          to={`/listing/${item.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-all group"
                        >
                          {item.images?.[0] ? (
                            <img 
                              src={item.images[0]} 
                              alt={item.name}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-xs text-muted-foreground">₹{Number(item.price).toLocaleString('en-IN')}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </section>
              </ScrollReveal>
            )}

            {/* What's Included (text-based - packages only) */}
            {isPackage && listing.includedItemsText && listing.includedItemsText.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={400}>
                <section>
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
                </section>
              </ScrollReveal>
            )}

            {/* What's Not Included (packages only) */}
            {isPackage && listing.excludedItemsText && listing.excludedItemsText.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={500}>
                <section>
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
                </section>
              </ScrollReveal>
            )}

            {/* Extra Charges - with pricing if available */}
            {(parsedExtraCharges.length > 0 || (listing.extraCharges && listing.extraCharges.length > 0)) && (
              <ScrollReveal animation="fadeInUp" delay={600}>
                <section>
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">Extra Charges</h2>
                      <div className="space-y-2">
                        {/* Show structured charges with prices first */}
                        {parsedExtraCharges.map((charge, index) => (
                          <div key={`detailed-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span className="text-sm font-medium">{charge.name}</span>
                            <span className="text-sm font-semibold text-primary flex items-center">
                              <IndianRupee className="h-3 w-3 mr-0.5" />
                              {Number(charge.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                        {/* Show legacy text-based charges if no structured charges */}
                        {parsedExtraCharges.length === 0 && listing.extraCharges?.map((charge: string, index: number) => (
                          <div key={`text-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span className="text-sm">{charge}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Service Details */}
            <ScrollReveal animation="fadeInUp" delay={650}>
              <section>
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
              </section>
            </ScrollReveal>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={700}>
                <section>
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
                      <Link to={`/vendor/${listing.vendorId}?tab=reviews`}>
                        <Button variant="ghost" size="sm">
                          View All
                        </Button>
                      </Link>
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
                </section>
              </ScrollReveal>
            )}

            {/* Vendor Profile Card */}
            <ScrollReveal animation="fadeInUp" delay={800}>
              <section>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">Meet your vendor</h2>
                      <p className="text-lg font-semibold mb-1">{listing.vendorName}</p>
                      {listing.vendorRating !== undefined && listing.vendorRating !== null && (
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{listing.vendorRating.toFixed(1)}</span>
                          {listing.vendorReviewCount && (
                            <span className="text-sm text-muted-foreground">
                              ({listing.vendorReviewCount} reviews)
                            </span>
                          )}
                        </div>
                      )}
                      <Link to={`/vendor/${listing.vendorId}`}>
                        <Button variant="outline" className="mt-4">
                          View Full Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </section>
            </ScrollReveal>

            {/* Similar Listings */}
            {similarListings.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={900}>
                <section>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">Similar Listings</h2>
                  <p className="text-sm text-muted-foreground">
                    More from {listing.vendorName}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarListings.map((similarListing: any) => (
                    <PackageCard
                      key={similarListing.id}
                      package={{
                        id: similarListing.id,
                        packageId: similarListing.id,
                        name: similarListing.name,
                        packageName: similarListing.name,
                        price: similarListing.price,
                        images: similarListing.images || [],
                        vendorId: similarListing.vendorId,
                        vendorName: similarListing.vendorName || listing.vendorName,
                        vendorCity: listing.vendorCity,
                        vendorRating: listing.vendorRating,
                        vendorReviewCount: listing.vendorReviewCount,
                        category: similarListing.categoryName || listing.categoryName,
                        type: similarListing.type?.toLowerCase() || 'item',
                        deliveryTime: similarListing.deliveryTime,
                        isPopular: similarListing.isPopular,
                        isTrending: similarListing.isTrending,
                        availability: 'available',
                        includedItems: similarListing.includedItemsText || [],
                      }}
                    />
                  ))}
                </div>
                </section>
              </ScrollReveal>
            )}
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget
                listing={{
                  id: listing.id || listingId || '',
                  name: listing.name || '',
                  price: typeof listing.price === 'number' ? listing.price : parseFloat(listing.price || '0'),
                  type: listing.type || 'ITEM',
                  unit: listing.unit,
                  minimumQuantity: listing.minimumQuantity,
                  vendorId: listing.vendorId || '',
                  vendorName: listing.vendorName || '',
                  addOns: [], // TODO: Fetch add-ons from API
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

