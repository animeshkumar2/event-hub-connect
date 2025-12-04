import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/features/home/Navbar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Star, MapPin, Check, X, Clock, MessageCircle, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { useCart } from '@/shared/contexts/CartContext';
import { cn } from '@/shared/lib/utils';
import { AvailabilityCalendar } from '@/features/vendor/AvailabilityCalendar';
import { PremiumChatWindow } from '@/features/vendor/PremiumChatWindow';
import { PremiumPackageCard } from '@/features/search/PremiumPackageCard';
import { PackageCustomization } from '@/features/vendor/PackageCustomization';
import { BookExactSetup } from '@/features/vendor/BookExactSetup';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { 
  useVendor, 
  useVendorListings, 
  useVendorReviews, 
  useVendorFAQs, 
  useVendorPastEvents, 
  useVendorBookableSetups,
  useVendorAvailability,
  useCategories
} from '@/shared/hooks/useApi';

const VendorDetails = () => {
  const { vendorId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [showChat, setShowChat] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [highlightedPackageId, setHighlightedPackageId] = useState<string | null>(null);
  const [showAllPackages, setShowAllPackages] = useState(false);

  // Fetch data from API
  const { data: vendorData, loading: vendorLoading, error: vendorError } = useVendor(vendorId || null);
  const { data: listingsData, loading: listingsLoading } = useVendorListings(vendorId || null);
  const { data: reviewsData, loading: reviewsLoading } = useVendorReviews(vendorId || null);
  const { data: faqsData, loading: faqsLoading } = useVendorFAQs(vendorId || null);
  const { data: pastEventsData, loading: pastEventsLoading } = useVendorPastEvents(vendorId || null);
  const { data: bookableSetupsData, loading: bookableSetupsLoading } = useVendorBookableSetups(vendorId || null);
  const { data: availabilityData } = useVendorAvailability(vendorId || null);
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  // Transform API data to match component expectations
  const vendor = useMemo(() => {
    if (!vendorData) return null;

    // Separate packages and items from listings
    const allListings = listingsData || [];
    const packages = allListings
      .filter((l: any) => l.type === 'package')
      .map((l: any) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        price: parseFloat(l.price),
        images: l.images || [],
        includedItems: l.includedItemsText || [],
        excludedItems: l.excludedItemsText || [],
        deliveryTime: l.deliveryTime,
        extraCharges: l.extraCharges || [],
        category: l.categoryId,
        isPopular: l.isPopular,
        isTrending: l.isTrending,
      }));

    const listings = allListings
      .filter((l: any) => l.type === 'item')
      .map((l: any) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        price: parseFloat(l.price),
        images: l.images || [],
        category: l.categoryId,
        unit: l.unit,
        minimumQuantity: l.minimumQuantity,
      }));

    return {
      id: vendorData.id,
      businessName: vendorData.businessName,
      category: vendorData.categoryId || vendorData.categoryName || '',
      city: vendorData.cityName || '',
      bio: vendorData.bio || '',
      rating: parseFloat(vendorData.rating || 0),
      reviewCount: vendorData.reviewCount || 0,
      startingPrice: parseFloat(vendorData.startingPrice || 0),
      coverImage: vendorData.coverImage || '',
      portfolioImages: vendorData.portfolioImages || [],
      coverageRadius: vendorData.coverageRadius || 0,
      isVerified: vendorData.isVerified || false,
      packages,
      listings,
      reviews: (reviewsData || []).map((r: any) => ({
        id: r.id,
        userName: r.userName || 'Anonymous',
        rating: parseFloat(r.rating || 0),
        comment: r.comment || '',
        eventType: r.eventType,
        date: r.createdAt || r.date,
        images: r.images || [],
      })),
      faqs: (faqsData || []).map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      })),
      pastEvents: (pastEventsData || []).map((e: any) => ({
        id: e.id,
        image: e.image,
        eventType: e.eventType,
        date: e.eventDate || e.date,
      })),
      bookableSetups: (bookableSetupsData || []).map((s: any) => ({
        id: s.id,
        image: s.image,
        title: s.title,
        description: s.description,
        price: parseFloat(s.price || 0),
        category: s.categoryId,
      })),
      availability: availabilityData || [],
    };
  }, [vendorData, listingsData, reviewsData, faqsData, pastEventsData, bookableSetupsData, availabilityData]);

  // Handle URL parameters for tab and package highlighting
  useEffect(() => {
    const tab = searchParams.get('tab');
    const packageId = searchParams.get('packageId') || searchParams.get('package');
    
    if (packageId && tab !== 'listings') {
      const params = new URLSearchParams(searchParams);
      params.set('tab', 'listings');
      params.set('packageId', packageId);
      params.delete('package');
      setSearchParams(params, { replace: true });
      return;
    }
    
    if (tab === 'listings') {
      if (packageId) {
        setHighlightedPackageId(packageId);
        setShowAllPackages(false);
      }
      setTimeout(() => {
        const listingsSection = document.getElementById('listings-section');
        if (listingsSection) {
          listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      setHighlightedPackageId(null);
      setShowAllPackages(false);
    }
  }, [searchParams, setSearchParams]);

  // Loading state
  if (vendorLoading || listingsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (vendorError || !vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">Vendor not found</h1>
          <p className="text-muted-foreground mb-6">{vendorError || 'The vendor you are looking for does not exist.'}</p>
          <Button asChild>
            <Link to="/search">Back to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleBookPackage = (
    packageId: string,
    packageName: string,
    price: number,
    addOns: any[] = [],
    customizations: any[] = []
  ) => {
    const pkg = vendor.packages.find((p) => p.id === packageId);
    if (!pkg) return;

    addToCart({
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      packageId: pkg.id,
      packageName: pkg.name,
      price: price,
      basePrice: pkg.price,
      addOns: addOns,
      customizations: customizations,
      quantity: 1,
      eventDate: selectedDate,
      eventTime: selectedTime,
    });

    toast({
      title: 'Added to Cart',
      description: `${packageName} has been added to your cart`,
    });
  };

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Premium Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={vendor.coverImage || 'https://via.placeholder.com/1200x500'}
          alt={vendor.businessName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-4 capitalize text-sm px-3 py-1">
                {vendor.category}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                {vendor.businessName}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{vendor.city}</span>
                  {vendor.coverageRadius && (
                    <span className="text-white/80 text-sm">
                      · {vendor.coverageRadius}km radius
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">{vendor.rating.toFixed(1)}</span>
                  <span className="text-white/80">({vendor.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-xl shadow-elegant hover-lift bg-white text-foreground hover:bg-white/90">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0">
                <PremiumChatWindow
                  vendorId={vendor.id}
                  vendorName={vendor.businessName}
                  onClose={() => setShowChat(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={searchParams.get('tab') || 'overview'} className="w-full" onValueChange={(value) => {
              const params = new URLSearchParams(searchParams);
              if (value === 'overview') {
                params.delete('tab');
                params.delete('packageId');
              } else {
                params.set('tab', value);
              }
              setSearchParams(params, { replace: true });
            }}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="listings">Listings</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{vendor.bio || 'No description available.'}</p>
                  </CardContent>
                </Card>

                {/* Book Exact Setups */}
                {vendor.bookableSetups && vendor.bookableSetups.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Book This Exact Setup</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Click on any setup to book it directly
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendor.bookableSetups.map((setup) => (
                          <BookExactSetup
                            key={setup.id}
                            setup={setup}
                            vendorName={vendor.businessName}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Past Events */}
                {vendor.pastEvents && vendor.pastEvents.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Past Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {vendor.pastEvents.map((event) => (
                          <div key={event.id} className="space-y-2">
                            <div className="aspect-square overflow-hidden rounded-lg">
                              <img
                                src={event.image}
                                alt={event.eventType}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-sm">
                              <div className="font-medium">{event.eventType}</div>
                              <div className="text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="listings" id="listings-section" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">All Listings</h2>
                  <p className="text-muted-foreground">
                    {vendor.packages.length + (vendor.listings?.length || 0)} listing{(vendor.packages.length + (vendor.listings?.length || 0)) !== 1 ? 's' : ''} available
                  </p>
                </div>
                
                {/* Packages Section - Top */}
                {vendor.packages.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold">Packages</h3>
                      <p className="text-muted-foreground">{vendor.packages.length} package{vendor.packages.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {vendor.packages.map((pkg) => {
                        const themeMap: Record<string, 'wedding' | 'dj' | 'birthday' | 'corporate'> = {
                          photographer: 'wedding',
                          decorator: 'wedding',
                          dj: 'dj',
                          'sound-lights': 'dj',
                          caterer: 'corporate',
                          mua: 'wedding',
                        };
                        const theme = themeMap[vendor.category] || 'wedding';
                        const isHighlighted = highlightedPackageId === pkg.id;
                        const shouldShow = showAllPackages || !highlightedPackageId || isHighlighted;
                        
                        if (!shouldShow) return null;
                        
                        return (
                          <div
                            key={pkg.id}
                            className={cn(
                              "transition-all duration-500",
                              highlightedPackageId && !showAllPackages && !isHighlighted
                                ? "opacity-30 blur-sm pointer-events-none"
                                : ""
                            )}
                          >
                            <PremiumPackageCard
                              pkg={pkg}
                              vendorId={vendor.id}
                              vendorName={vendor.businessName}
                              vendorCategory={vendor.category}
                              onBook={(pkg, addOns, customizations) => {
                                const totalPrice =
                                  pkg.price +
                                  addOns.reduce((sum, a) => sum + a.price, 0) +
                                  customizations.reduce((sum, c) => sum + c.price, 0);
                                handleBookPackage(pkg.id, pkg.name, totalPrice, addOns, customizations);
                              }}
                              theme={theme}
                              showOtherPackagesButton={isHighlighted && !showAllPackages && highlightedPackageId}
                              onShowOtherPackages={() => setShowAllPackages(true)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Individual Listings Section - Bottom */}
                {vendor.listings && vendor.listings.length > 0 && (
                  <div className="space-y-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold">Individual Listings</h3>
                      <p className="text-muted-foreground">{vendor.listings.length} listing{vendor.listings.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {vendor.listings.map((listing) => {
                        const listingCategory = listing.category || vendor.category;
                        const categoryName = categories.find(c => c.id === listingCategory)?.name || listingCategory;
                        return (
                          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-all group">
                            <div className="relative aspect-video">
                              <img
                                src={listing.images?.[0] || 'https://via.placeholder.com/400x300'}
                                alt={listing.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <Badge className="absolute top-2 left-2 bg-green-500/90 text-white">
                                Individual
                              </Badge>
                              <Badge className="absolute top-2 right-2 bg-secondary/90 text-white">
                                {categoryName}
                              </Badge>
                              {listing.unit && (
                                <Badge className="absolute bottom-2 right-2 bg-primary/90 text-white">
                                  {listing.unit}
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-bold text-lg mb-2">{listing.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {listing.description}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div>
                                  <div className="text-2xl font-bold text-primary">
                                    ₹{listing.price.toLocaleString('en-IN')}
                                  </div>
                                  {listing.minimumQuantity && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Min: {listing.minimumQuantity} {listing.unit || 'items'}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    addToCart({
                                      vendorId: vendor.id,
                                      vendorName: vendor.businessName,
                                      packageId: listing.id,
                                      packageName: listing.name,
                                      price: listing.price,
                                      basePrice: listing.price,
                                      addOns: [],
                                      quantity: 1,
                                      eventDate: selectedDate,
                                      eventTime: selectedTime,
                                    });
                                    toast({
                                      title: 'Added to Cart',
                                      description: `${listing.name} has been added to your cart`,
                                    });
                                  }}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {vendor.packages.length === 0 && (!vendor.listings || vendor.listings.length === 0) && (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">No listings available yet.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vendor.portfolioImages && vendor.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {vendor.portfolioImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
                          >
                            <img
                              src={image}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No portfolio images available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews ({vendor.reviews.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vendor.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {vendor.reviews.map((review) => (
                          <div key={review.id} className="flex gap-4 pb-6 border-b last:border-0">
                            <Avatar>
                              <AvatarFallback>
                                {review.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{review.userName}</span>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.floor(review.rating)
                                          ? 'fill-secondary text-secondary'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.eventType && (
                                  <Badge variant="outline" className="text-xs">
                                    {review.eventType}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground mb-2">{review.comment}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faqs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vendor.faqs.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {vendor.faqs.map((faq) => (
                          <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No FAQs available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Starting Price</div>
                  <div className="text-2xl font-bold text-primary">
                    ₹{vendor.startingPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Location</div>
                  <div className="font-semibold">{vendor.city}</div>
                  {vendor.coverageRadius && (
                    <div className="text-xs text-muted-foreground">
                      Coverage: {vendor.coverageRadius}km radius
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Category</div>
                  <Badge variant="secondary" className="capitalize">
                    {vendor.category}
                  </Badge>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full rounded-xl shadow-md hover-lift" size="lg">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat with Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0">
                    <PremiumChatWindow
                      vendorId={vendor.id}
                      vendorName={vendor.businessName}
                      onClose={() => setShowChat(false)}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Availability Calendar */}
            <AvailabilityCalendar
              availability={vendor.availability}
              onSlotSelect={handleSlotSelect}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
