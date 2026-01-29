import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/features/home/Navbar';
import { BookingWidget } from './BookingWidget';
import { PackageCard } from '@/features/search/PackageCard';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Star, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Heart,
  ArrowLeft,
  User,
  Package,
  AlertCircle,
  Loader2,
  IndianRupee,
  Edit,
  Eye,
  MessageSquare,
  HandCoins
} from 'lucide-react';
import { useListingDetails, useVendorListings, useVendorReviews } from '@/shared/hooks/useApi';
import { cn } from '@/shared/lib/utils';
import { ScrollReveal } from '@/shared/components/ScrollReveal';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/shared/components/ui/dialog';
import { PremiumChatWindow } from '@/features/vendor/PremiumChatWindow';

import { CategorySpecificDisplay } from './CategorySpecificDisplay';
import { PackageDetailView } from './PackageDetailView';

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

  // Extract display price - prioritize category-specific price over main price
  const displayPrice = useMemo(() => {
    if (!listing) return 0;
    
    // If main price is valid (not draft marker), use it
    if (listing.price && Number(listing.price) > 0.01) {
      return Number(listing.price);
    }

    // Otherwise, try to extract from category-specific data
    if (listing.categorySpecificData) {
      try {
        const categoryData = JSON.parse(listing.categorySpecificData);
        
        // Extract based on category
        switch (listing.categoryId) {
          case 'caterer':
            return categoryData.pricePerPlateVeg || categoryData.pricePerPlateNonVeg || 0;
          case 'photographer':
          case 'cinematographer':
          case 'videographer':
            return categoryData.photographyPrice || categoryData.videographyPrice || categoryData.price || 0;
          case 'decorator':
          case 'venue':
          case 'dj':
          case 'live-music':
          case 'sound-lights':
            return categoryData.price || 0;
          case 'mua':
            return categoryData.bridalPrice || categoryData.nonBridalPrice || 0;
          default:
            return categoryData.price || 0;
        }
      } catch {
        return Number(listing.price) || 0;
      }
    }

    return Number(listing.price) || 0;
  }, [listing]);

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

  // Use enhanced PackageDetailView for packages with bundled items
  if (isPackage && listing.includedItemIds && listing.includedItemIds.length > 0) {
    return (
      <PackageDetailView 
        listing={listing} 
        isOwner={isOwner}
        reviews={reviews}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      {/* Vendor Owner Banner - Customer's View */}
      {isOwner && (
        <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-b border-primary/20">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/15">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">👁️ Customer's View</p>
                  <p className="text-[10px] text-primary/70">How customers see this listing</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/vendor/listings')}
                  className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate(`/vendor/listings?edit=${listingId}`)}
                  className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Back Button - hidden for vendor preview since they have their own back button */}
      {!isOwner && (
      <div className="max-w-6xl mx-auto px-4 pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/search');
            }
          }}
          className="h-7 text-xs mb-2"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back
        </Button>
      </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-3">
            {/* Photo Gallery - Compact */}
            <ScrollReveal animation="fadeInUp">
              <div className="relative rounded-lg overflow-hidden bg-slate-200 aspect-[2/1]">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                {listing.images?.length > 1 && (
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {listing.images.slice(1, 4).map((img: string, i: number) => (
                      <div key={i} className="w-10 h-10 rounded border-2 border-white shadow overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {listing.images.length > 4 && (
                      <div className="w-10 h-10 rounded bg-black/60 flex items-center justify-center border-2 border-white">
                        <span className="text-white text-[10px] font-bold">+{listing.images.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  {isPackage && (
                    <Badge className="bg-primary/90 text-white text-[10px] h-5 px-1.5">
                      <Package className="h-2.5 w-2.5 mr-0.5" />Package
                    </Badge>
                  )}
                  {isItem && (
                    <Badge className="bg-emerald-500/90 text-white text-[10px] h-5 px-1.5">Service</Badge>
                  )}
                  {listing.isPopular && (
                    <Badge className="bg-orange-500/90 text-white text-[10px] h-5 px-1.5">🔥 Popular</Badge>
                  )}
                  {listing.isTrending && (
                    <Badge className="bg-purple-500/90 text-white text-[10px] h-5 px-1.5">⭐ Trending</Badge>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Header Section - Compact */}
            <ScrollReveal animation="fadeInUp" delay={100}>
              <section>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                    {listing.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                    <Link 
                      to={`/vendor/${listing.vendorId}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <User className="h-3 w-3" />
                      <span className="font-medium">{listing.vendorName}</span>
                    </Link>
                    {listing.vendorCity && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.vendorCity}
                        </span>
                      </>
                    )}
                    {listing.vendorRating !== undefined && listing.vendorRating !== null && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{listing.vendorRating.toFixed(1)}</span>
                          {listing.vendorReviewCount && (
                            <span>({listing.vendorReviewCount})</span>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    <Heart className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              </section>
            </ScrollReveal>

            {/* Listing Highlights - Compact */}
            {displayHighlights.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={200}>
                <section>
                <Card>
                  <CardContent className="p-3">
                    <h2 className="text-xs font-semibold mb-2">Highlights</h2>
                    <div className="grid grid-cols-2 gap-1">
                      {displayHighlights.map((item: string, index: number) => (
                        <div key={index} className="flex items-start gap-1.5 text-[11px]">
                          <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Description - Compact */}
            <ScrollReveal animation="fadeInUp" delay={300}>
              <section>
              <Card>
                <CardContent className="p-3">
                  <h2 className="text-xs font-semibold mb-2">About this {isPackage ? 'package' : 'service'}</h2>
                  <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
                    {listing.description || 'No description available.'}
                  </p>
                </CardContent>
              </Card>
              </section>
            </ScrollReveal>

            {/* Included Items - Clickable linked items - Compact */}
            {isPackage && linkedItems.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={350}>
                <section>
                <Card>
                  <CardContent className="p-3">
                    <h2 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-primary" />
                      Bundled Items ({linkedItems.length})
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {linkedItems.map((item: any) => (
                        <Link key={item.id} to={`/listing/${item.id}`} className="group block">
                          <div className="rounded border overflow-hidden bg-white hover:border-primary transition-colors">
                            <div className="aspect-square bg-slate-100 relative">
                              {item.images?.[0] ? (
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-slate-300" />
                                </div>
                              )}
                              <Badge className="absolute bottom-0.5 right-0.5 bg-white/90 text-slate-900 text-[9px] h-4 px-1 shadow">
                                ₹{Number(item.price).toLocaleString('en-IN')}
                              </Badge>
                            </div>
                            <p className="text-[10px] font-medium p-1 truncate group-hover:text-primary">{item.name}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-2 p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-slate-600">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {linkedItems.length} items included
                        </span>
                        <span className="text-slate-500">
                          Value: ₹{linkedItems.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Included/Excluded - Side by side - Compact */}
            <div className="grid grid-cols-2 gap-3">
              {/* What's Included */}
              {isPackage && listing.includedItemsText && listing.includedItemsText.length > 0 && (
                <ScrollReveal animation="fadeInUp" delay={400}>
                  <Card>
                    <CardContent className="p-3">
                      <h2 className="text-xs font-semibold mb-2 text-green-700">✓ Included</h2>
                      <div className="space-y-0.5">
                        {listing.includedItemsText.map((item: string, index: number) => (
                          <p key={index} className="text-[10px] text-slate-600 flex items-start gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </p>
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
                    <CardContent className="p-3">
                      <h2 className="text-xs font-semibold mb-2 text-red-700">✗ Not Included</h2>
                      <div className="space-y-0.5">
                        {listing.excludedItemsText.map((item, index) => (
                          <p key={index} className="text-[10px] text-slate-600 flex items-start gap-1">
                            <XCircle className="h-2.5 w-2.5 text-red-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )}
            </div>

            {/* Extra Charges - Compact */}
            {(parsedExtraCharges.length > 0 || (listing.extraCharges && listing.extraCharges.length > 0)) && (
              <ScrollReveal animation="fadeInUp" delay={600}>
                <section>
                  <Card>
                    <CardContent className="p-3">
                      <h2 className="text-xs font-semibold mb-2">Extra Charges</h2>
                      <div className="space-y-0.5">
                        {parsedExtraCharges.map((charge, index) => (
                          <div key={`detailed-${index}`} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-slate-50">
                            <span className="text-slate-600">{charge.name}</span>
                            <span className="font-medium text-primary flex items-center">
                              <IndianRupee className="h-2.5 w-2.5 mr-0.5" />
                              {Number(charge.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                        {parsedExtraCharges.length === 0 && listing.extraCharges?.map((charge: string, index: number) => (
                          <div key={`text-${index}`} className="text-[10px] p-1.5 rounded bg-slate-50 text-slate-600">
                            {charge}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Service Details - Compact */}
            <ScrollReveal animation="fadeInUp" delay={650}>
              <section>
                <Card>
                  <CardContent className="p-3">
                    <h2 className="text-xs font-semibold mb-2">Service Details</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                      {listing.deliveryTime && (
                        <div>
                          <p className="text-slate-400">Delivery</p>
                          <p className="font-medium">{listing.deliveryTime}</p>
                        </div>
                      )}
                      {isItem && listing.unit && (
                        <div>
                          <p className="text-slate-400">Unit</p>
                          <p className="font-medium">{listing.unit}</p>
                        </div>
                      )}
                      {isItem && listing.minimumQuantity && (
                        <div>
                          <p className="text-slate-400">Min. Qty</p>
                          <p className="font-medium">{listing.minimumQuantity}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </ScrollReveal>

            {/* Category-Specific Details - Compact */}
            {listing.categorySpecificData && (
              <ScrollReveal animation="fadeInUp" delay={675}>
                <section>
                  <CategorySpecificDisplay 
                    categoryId={listing.categoryId} 
                    categorySpecificData={listing.categorySpecificData}
                  />
                </section>
              </ScrollReveal>
            )}

            {/* Reviews Section - Compact */}
            {reviews.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={700}>
                <section>
                  <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xs font-semibold">
                        Reviews
                        {listing.vendorRating !== undefined && listing.vendorRating !== null && (
                          <span className="ml-1 font-normal text-slate-400">
                            ({listing.vendorRating.toFixed(1)})
                          </span>
                        )}
                      </h2>
                      <Link to={`/vendor/${listing.vendorId}?tab=reviews`}>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]">
                          View All
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {reviews.slice(0, 2).map((review: any) => (
                        <div key={review.id} className="border-b last:border-0 pb-2 last:pb-0">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-medium">{review.customerName || 'Anonymous'}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-2.5 w-2.5",
                                    i < (review.rating || 0)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Vendor Profile Card - Compact */}
            {!isOwner && (
            <ScrollReveal animation="fadeInUp" delay={800}>
              <section>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-semibold mb-1">Meet your vendor</h2>
                      <p className="text-[11px] font-medium">{listing.vendorName}</p>
                      {listing.vendorRating !== undefined && listing.vendorRating !== null && (
                        <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{listing.vendorRating.toFixed(1)}</span>
                          {listing.vendorReviewCount && (
                            <span className="text-slate-400">({listing.vendorReviewCount})</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Link to={`/vendor/${listing.vendorId}`}>
                      <Button variant="outline" size="sm" className="h-7 text-[10px]">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              </section>
            </ScrollReveal>
            )}

            {/* Similar Listings - Compact */}
            {similarListings.length > 0 && !isOwner && (
              <ScrollReveal animation="fadeInUp" delay={900}>
                <section>
                <div className="mb-2">
                  <h2 className="text-sm font-semibold">More from {listing.vendorName}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {similarListings.slice(0, 3).map((similarListing: any) => (
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

          {/* Right Column - Booking Widget - Compact */}
          {!isOwner && (
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-16 space-y-2">
              {/* Chat/Offer Button - Compact */}
              {listing && (listing.openForNegotiation !== false) && (() => {
                const finalListingId = listing?.id 
                  ? String(listing.id).trim() 
                  : (listingId ? String(listingId).trim() : undefined);
                
                if (!finalListingId || finalListingId === '') {
                  return null;
                }
                
                return (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow h-9 text-xs" size="sm">
                        <HandCoins className="mr-1.5 h-3.5 w-3.5" />
                        Chat & Make Offer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0 [&>button]:top-2 [&>button]:right-2 [&>button]:z-50 [&>button]:bg-background/80 [&>button]:rounded-full [&>button]:p-1">
                      <DialogTitle className="sr-only">Chat with {listing?.vendorName || 'Vendor'}</DialogTitle>
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
              
              {/* Regular Chat Button - Compact */}
              {listing && !listing.openForNegotiation && (() => {
                const finalListingId = listing?.id 
                  ? String(listing.id).trim() 
                  : (listingId ? String(listingId).trim() : undefined);
                
                return (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full rounded-lg h-9 text-xs" size="sm">
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                        Chat with Vendor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0 [&>button]:top-2 [&>button]:right-2 [&>button]:z-50 [&>button]:bg-background/80 [&>button]:rounded-full [&>button]:p-1">
                      <DialogTitle className="sr-only">Chat with {listing.vendorName || 'Vendor'}</DialogTitle>
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
                  price: displayPrice,
                  type: listing.type || 'ITEM',
                  unit: listing.unit,
                  minimumQuantity: listing.minimumQuantity,
                  vendorId: listing.vendorId || '',
                  vendorName: listing.vendorName || '',
                  addOns: [],
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

