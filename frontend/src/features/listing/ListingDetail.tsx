import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  IndianRupee,
  Edit,
  Eye,
  Settings,
  MessageSquare,
  HandCoins
} from 'lucide-react';
import { useListingDetails, useVendorListings, useVendorReviews } from '@/shared/hooks/useApi';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { ScrollReveal } from '@/shared/components/ScrollReveal';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog';
import { PremiumChatWindow } from '@/features/vendor/PremiumChatWindow';

// Type for extra charges
interface ExtraCharge {
  name: string;
  price: number;
}

export default function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { data: listingData, loading, error } = useListingDetails(listingId || null);
  
  // Check if vendor wants to see customer view
  const forceCustomerView = searchParams.get('view') === 'customer';
  
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
  
  // Check if current user is the vendor owner of this listing
  const isOwnerRaw = useMemo(() => {
    if (!isAuthenticated || !user || !listing) return false;
    // Check multiple conditions to determine ownership:
    // 1. user.vendorId matches listing's vendorId
    // 2. user has role VENDOR and their vendor profile's userId matches
    // 3. Check via stored vendorId in localStorage (set during vendor login)
    const storedVendorId = localStorage.getItem('vendor_id');
    return (
      (user as any).vendorId === vendorId || 
      user.id === listing.vendor?.userId ||
      storedVendorId === vendorId
    );
  }, [isAuthenticated, user, listing, vendorId]);
  
  // If forceCustomerView is true, show customer view even if user is owner
  const isOwner = forceCustomerView ? false : isOwnerRaw;

  // Fetch vendor listings for similar listings
  const { data: vendorListingsData } = useVendorListings(vendorId || null);
  // vendorListingsData is already the unwrapped array from useVendorListings
  const vendorListings = Array.isArray(vendorListingsData) ? vendorListingsData : ((vendorListingsData as any)?.data || vendorListingsData || []);

  // Fetch reviews
  const { data: reviewsData } = useVendorReviews(vendorId || null, 0, 5);
  const reviews = (reviewsData as any)?.data?.content || [];

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
    if (!listing?.includedItemIds || !listing.includedItemIds.length) {
      return [];
    }
    if (!vendorListings || !vendorListings.length) {
      return [];
    }
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
      
      {/* Vendor Owner Banner - Customer's View */}
      {isOwner && (
        <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-b border-primary/20 mb-6">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/15">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">👁️ Customer's View</p>
                  <p className="text-xs text-primary/70">This is how your customers see this listing</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/vendor/listings')}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Back to Listings
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate(`/vendor/listings?edit=${listingId}`)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit Listing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Back Button - hidden for vendor preview since they have their own back button */}
      {!isOwner && (
      <div className="container mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          onClick={() => {
            // Try to go back, but if no history, go to search
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/search');
            }
          }}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Content */}
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
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
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
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Bundled Items ({linkedItems.length})</h2>
                          <p className="text-sm text-muted-foreground">This package includes the following items • Click to view details</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Items Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {linkedItems.map((item: any) => (
                          <Link 
                            key={item.id} 
                            to={`/listing/${item.id}`}
                            className="group block"
                          >
                            <div className="rounded-xl border-2 border-border hover:border-primary overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                              {/* Item Image */}
                              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                {item.images?.[0] ? (
                                  <>
                                    <img 
                                      src={item.images[0]} 
                                      alt={item.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-10 w-10 text-muted-foreground/40" />
                                  </div>
                                )}
                                {/* Click indicator */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-xs font-medium text-primary shadow-lg">
                                    <ExternalLink className="h-3 w-3" />
                                    View Details
                                  </div>
                                </div>
                                {/* Price Badge */}
                                <div className="absolute bottom-2 right-2">
                                  <Badge className="bg-white text-foreground font-bold shadow-lg">
                                    ₹{Number(item.price).toLocaleString('en-IN')}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Item Info */}
                              <div className="p-4 bg-card">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
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
                          </Link>
                        ))}
                      </div>
                      
                      {/* Summary */}
                      <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium">
                              {linkedItems.length} item{linkedItems.length > 1 ? 's' : ''} included in this package
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Combined value: ₹{linkedItems.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
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

            {/* Vendor Profile Card - hidden for vendor preview */}
            {!isOwner && (
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
            )}

            {/* Similar Listings - hidden for vendor preview */}
            {similarListings.length > 0 && !isOwner && (
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
                        description: similarListing.description || '',
                        price: similarListing.price,
                        images: similarListing.images || [],
                        vendorId: similarListing.vendorId,
                        vendorName: similarListing.vendorName || listing.vendorName,
                        vendorCity: listing.vendorCity,
                        vendorCoverageRadius: listing.vendorCoverageRadius || 0,
                        vendorRating: listing.vendorRating,
                        vendorReviewCount: listing.vendorReviewCount,
                        category: similarListing.customCategoryName || similarListing.categoryName || listing.categoryName,
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

          {/* Right Column - Booking Widget - Hidden for vendor preview */}
          {!isOwner && (
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-20 lg:top-24 z-10 space-y-4">
              {/* Chat/Offer Button - Only show if not owner and negotiation enabled (defaults to true) */}
              {listing && (listing.openForNegotiation !== false) && (() => {
                // Ensure we always have a valid listingId - try listing.id first, then fallback to listingId from params
                const finalListingId = listing?.id 
                  ? String(listing.id).trim() 
                  : (listingId ? String(listingId).trim() : undefined);
                
                console.log('🔍 ListingDetail: About to render PremiumChatWindow (Chat & Make Offer)', {
                  listingIdFromParams: listingId,
                  listingIdFromParamsType: typeof listingId,
                  listingIdFromListing: listing?.id,
                  listingIdFromListingType: typeof listing?.id,
                  listingIdFromListingValue: listing?.id,
                  finalListingId,
                  finalListingIdType: typeof finalListingId,
                  finalListingIdLength: finalListingId?.length,
                  listingExists: !!listing,
                  listingKeys: listing ? Object.keys(listing) : [],
                });
                
                // Only render if we have a valid listingId
                if (!finalListingId || finalListingId === '') {
                  console.error('❌ ListingDetail: Cannot render PremiumChatWindow - no valid listingId', {
                    listingIdFromParams: listingId,
                    listingIdFromListing: listing?.id,
                  });
                  return null;
                }
                
                return (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full rounded-xl shadow-md hover:shadow-lg transition-shadow" size="lg">
                        <HandCoins className="mr-2 h-5 w-5" />
                        Chat & Make Offer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0 [&>button]:top-2 [&>button]:right-2 [&>button]:z-50 [&>button]:bg-background/80 [&>button]:rounded-full [&>button]:p-1">
                      <PremiumChatWindow
                        key={`chat-${finalListingId}`}
                        vendorId={listing?.vendorId || ''}
                        vendorName={listing?.vendorName || ''}
                        listingId={finalListingId}
                        listingPrice={typeof listing?.price === 'number' ? listing.price : parseFloat(String(listing?.price || '0'))}
                        openForNegotiation={listing?.openForNegotiation !== false}
                      />
                    </DialogContent>
                  </Dialog>
                );
              })()}
              
              {/* Regular Chat Button - If negotiation not enabled, but still pass listingId for context */}
              {listing && !listing.openForNegotiation && (() => {
                // Even when negotiation is disabled, pass listingId for context
                const finalListingId = listing?.id 
                  ? String(listing.id).trim() 
                  : (listingId ? String(listingId).trim() : undefined);
                
                console.log('🔍 ListingDetail: About to render PremiumChatWindow (Chat with Vendor)', {
                  listingIdFromParams: listingId,
                  listingIdFromListing: listing?.id,
                  finalListingId,
                  openForNegotiation: listing?.openForNegotiation,
                });
                
                return (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full rounded-xl" size="lg">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Chat with Vendor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0 [&>button]:top-2 [&>button]:right-2 [&>button]:z-50 [&>button]:bg-background/80 [&>button]:rounded-full [&>button]:p-1">
                      <PremiumChatWindow
                        key={`chat-${finalListingId || 'no-listing'}`}
                        vendorId={listing.vendorId || ''}
                        vendorName={listing.vendorName || ''}
                        listingId={finalListingId}
                        listingPrice={typeof listing.price === 'number' ? listing.price : parseFloat(String(listing.price || '0'))}
                        openForNegotiation={false}
                      />
                    </DialogContent>
                  </Dialog>
                );
              })()}
              
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
                isVendorPreview={false}
              />
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

