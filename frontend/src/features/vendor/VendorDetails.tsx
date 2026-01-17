import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/features/home/Navbar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Star, MapPin, Check, X, Clock, MessageCircle, ShoppingCart, AlertCircle, Loader2, Award, TrendingUp, Users, Calendar, DollarSign, Shield, CheckCircle2 } from 'lucide-react';
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
  useVendorPackages,
  useVendorReviews, 
  useVendorFAQs, 
  useVendorPastEvents, 
  useVendorBookableSetups,
  useVendorAvailability,
  useCategories
} from '@/shared/hooks/useApi';

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
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
  const { data: packagesData, loading: packagesLoading } = useVendorPackages(vendorId || null);
  const { data: listingsData, loading: listingsLoading } = useVendorListings(vendorId || null);
  const { data: reviewsData, loading: reviewsLoading } = useVendorReviews(vendorId || null);
  const { data: faqsData, loading: faqsLoading } = useVendorFAQs(vendorId || null);
  const { data: pastEventsData, loading: pastEventsLoading } = useVendorPastEvents(vendorId || null);
  const { data: bookableSetupsData, loading: bookableSetupsLoading } = useVendorBookableSetups(vendorId || null);
  const { data: availabilityData, loading: availabilityLoading, error: availabilityError } = useVendorAvailability(vendorId || null);
  
  // Debug availability data
  useEffect(() => {
    console.log('[VendorDetails] Availability hook state:', {
      vendorId,
      availabilityData,
      availabilityLoading,
      availabilityError,
      dataType: typeof availabilityData,
      isArray: Array.isArray(availabilityData),
      length: Array.isArray(availabilityData) ? availabilityData.length : 'N/A'
    });
  }, [vendorId, availabilityData, availabilityLoading, availabilityError]);
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  // Transform API data to match component expectations
  const vendor = useMemo(() => {
    if (!vendorData) return null;

    // Packages come from the packages endpoint
    const packages = (packagesData || []).map((l: any) => ({
      id: l.id,
      vendorId: vendorId || '',
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
      addOns: l.addOns || [],
    }));

    // Individual listings/items come from the listings endpoint
    const listings = (listingsData || []).map((l: any) => ({
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
      categoryName: vendorData.categoryName || vendorData.categoryId || '',
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
        vendorId: vendorId || '',
        image: s.image,
        title: s.title,
        description: s.description,
        price: parseFloat(s.price || 0),
        category: s.categoryId,
      })),
      availability: transformAvailabilityData(availabilityData || []),
    };
  }, [vendorData, packagesData, listingsData, reviewsData, faqsData, pastEventsData, bookableSetupsData, availabilityData]);

  // Transform backend availability data to frontend format
  // Groups slots by date for day-level availability display
  function transformAvailabilityData(apiAvailability: any[]): any[] {
    if (!apiAvailability || apiAvailability.length === 0) {
      return [];
    }
    
    // Group by date
    const groupedByDate = new Map<string, any[]>();
    
    apiAvailability.forEach((slot: any) => {
      // Handle different possible field names from API
      const date = slot.date || slot.dateSlot;
      const timeSlot = slot.timeSlot || slot.time;
      const status = slot.status || slot.slotStatus;
      
      // If date is missing, skip this slot
      if (!date) return;
      
      // Convert date to YYYY-MM-DD format
      let dateStr: string;
      if (date instanceof Date) {
        dateStr = date.toISOString().split('T')[0];
      } else if (typeof date === 'string') {
        if (date.includes('T')) {
          dateStr = date.split('T')[0];
        } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateStr = date;
        } else {
          try {
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) {
              dateStr = parsed.toISOString().split('T')[0];
            } else {
              return; // Invalid date, skip
            }
          } catch {
            return; // Invalid date, skip
          }
        }
      } else {
        return; // Invalid date type, skip
      }
      
      // Validate time slot
      if (!timeSlot || typeof timeSlot !== 'string') {
        return; // Invalid time slot, skip
      }
      
      // Normalize status - only available or booked
      const normalizedStatus = status ? String(status).toLowerCase() : 'available';
      const finalStatus = normalizedStatus === 'available' 
        ? 'available' 
        : 'booked'; // Everything else (booked, blocked, busy) is treated as booked
      
      if (!groupedByDate.has(dateStr)) {
        groupedByDate.set(dateStr, []);
      }
      
      groupedByDate.get(dateStr)!.push({
        time: timeSlot,
        status: finalStatus
      });
    });
    
    // Convert to frontend format and sort by date
    return Array.from(groupedByDate.entries())
      .map(([date, slots]) => ({
        date,
        slots: slots
          .filter(s => s && s.time) // Remove invalid slots
          .sort((a, b) => {
            // Sort time slots chronologically
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            if (timeA[0] !== timeB[0]) {
              return timeA[0] - timeB[0];
            }
            return timeA[1] - timeB[1];
          })
      }))
      .filter(item => item.slots.length > 0) // Remove dates with no valid slots
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Set default tab to 'overview' if no tab is specified
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) {
      const params = new URLSearchParams(searchParams);
      params.set('tab', 'overview');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Handle URL parameters for tab and package highlighting
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
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
  if (vendorLoading || packagesLoading || listingsLoading) {
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
    // Navigate to listing detail page where user can select date
    navigate(`/listing/${packageId}`);
  };

  const handleSlotSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // No time selection needed
  };

  // Calculate statistics
  const totalPackages = vendor.packages.length;
  const totalListings = vendor.listings?.length || 0;
  const totalReviews = vendor.reviews.length;
  const averageRating = vendor.rating;
  const verifiedBadge = vendor.isVerified;

  // Get category display name
  const categoryDisplayName = vendor.categoryName || categories.find(c => c.id === vendor.category)?.name || vendor.category;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Premium Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={vendor.coverImage || 'https://via.placeholder.com/1200x500'}
          alt={vendor.businessName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x500';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                  {categoryDisplayName}
                </Badge>
                {verifiedBadge && (
                  <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                {vendor.businessName}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">{vendor.city}</span>
                  {vendor.coverageRadius && (
                    <span className="text-white/80 text-sm">
                      · {vendor.coverageRadius}km radius
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
                  <span className="text-white/80">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                </div>
                {vendor.startingPrice > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-white/80">Starting from ₹{vendor.startingPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-xl shadow-elegant hover-lift bg-white text-foreground hover:bg-white/90">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0 [&>button]:top-2 [&>button]:right-2 [&>button]:z-50 [&>button]:bg-background/80 [&>button]:rounded-full [&>button]:p-1">
                <PremiumChatWindow
                  vendorId={vendor.id}
                  vendorName={vendor.businessName}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs 
              defaultValue="overview"
              value={searchParams.get('tab') || 'overview'} 
              className="w-full" 
              onValueChange={(value) => {
                const params = new URLSearchParams(searchParams);
                params.set('tab', value);
                setSearchParams(params, { replace: true });
              }}
            >
              <TabsList className="grid w-full grid-cols-5 h-9">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="listings" className="text-xs">Listings</TabsTrigger>
                <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
                <TabsTrigger value="faqs" className="text-xs">FAQs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3 mt-3">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Card>
                    <CardContent className="p-2">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-primary/10 rounded">
                          <Award className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Rating</p>
                          <p className="text-sm font-bold">{averageRating.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-2">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-green-500/10 rounded">
                          <Users className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Reviews</p>
                          <p className="text-sm font-bold">{totalReviews}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-2">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-blue-500/10 rounded">
                          <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Packages</p>
                          <p className="text-sm font-bold">{totalPackages}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-2">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-purple-500/10 rounded">
                          <Calendar className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Past Events</p>
                          <p className="text-sm font-bold">{vendor.pastEvents?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* About */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">About {vendor.businessName}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {vendor.bio ? (
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{vendor.bio}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No description available.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Quick Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs font-medium">Location</p>
                          <p className="text-xs text-muted-foreground">{vendor.city}</p>
                          {vendor.coverageRadius > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Coverage: {vendor.coverageRadius}km radius
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs font-medium">Starting Price</p>
                          <p className="text-xs text-muted-foreground">
                            ₹{vendor.startingPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs font-medium">Category</p>
                          <Badge variant="secondary" className="capitalize mt-1 text-xs">
                            {categoryDisplayName}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs font-medium">Status</p>
                          <p className="text-xs text-muted-foreground">
                            {verifiedBadge ? 'Verified Vendor' : 'Active Vendor'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Packages Preview */}
                {vendor.packages.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-semibold">Featured Packages</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {totalPackages} package{totalPackages > 1 ? 's' : ''} available
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.set('tab', 'listings');
                            setSearchParams(params, { replace: true });
                          }}
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {vendor.packages.slice(0, 2).map((pkg) => {
                          const themeMap: Record<string, 'wedding' | 'dj' | 'birthday' | 'corporate'> = {
                            photographer: 'wedding',
                            decorator: 'wedding',
                            dj: 'dj',
                            'sound-lights': 'dj',
                            caterer: 'corporate',
                            mua: 'wedding',
                          };
                          const theme = themeMap[vendor.category] || 'wedding';
                          
                          return (
                            <div key={pkg.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-lg">{pkg.name}</h4>
                                {pkg.isTrending && (
                                  <Badge className="bg-orange-500">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Trending
                                  </Badge>
                                )}
                                {pkg.isPopular && !pkg.isTrending && (
                                  <Badge variant="secondary">
                                    <Award className="h-3 w-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {pkg.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-primary">
                                  ₹{pkg.price.toLocaleString('en-IN')}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    params.set('tab', 'listings');
                                    params.set('packageId', pkg.id);
                                    setSearchParams(params, { replace: true });
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">Past Events</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Showcasing our previous work
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {vendor.pastEvents.map((event) => (
                          <div key={event.id} className="space-y-2 group cursor-pointer">
                            <div className="aspect-square overflow-hidden rounded-lg relative">
                              <img
                                src={event.image}
                                alt={event.eventType}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                            <div className="text-sm">
                              <div className="font-medium">{event.eventType}</div>
                              <div className="text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="listings" id="listings-section" className="space-y-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">All Listings</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {totalPackages + totalListings} listing{(totalPackages + totalListings) !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                
                {/* Packages Section - Top */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Packages</h3>
                    <p className="text-xs text-muted-foreground">{totalPackages} package{totalPackages > 1 ? 's' : ''}</p>
                  </div>
                  {vendor.packages.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                              showOtherPackagesButton={isHighlighted && !showAllPackages && !!highlightedPackageId}
                              onShowOtherPackages={() => setShowAllPackages(true)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No packages available.</p>
                    </Card>
                  )}
                </div>

                {/* Individual Listings Section - Bottom */}
                {vendor.listings && vendor.listings.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Individual Listings</h3>
                      <p className="text-xs text-muted-foreground">{totalListings} listing{totalListings > 1 ? 's' : ''}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300';
                                }}
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
                                    // Navigate to listing detail page where user can select date
                                    navigate(`/listing/${listing.id}`);
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
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No listings available yet.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Portfolio Gallery</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {vendor.portfolioImages?.length || 0} image{(vendor.portfolioImages?.length || 0) !== 1 ? 's' : ''} available
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {vendor.portfolioImages && vendor.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {vendor.portfolioImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
                          >
                            <img
                              src={image}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400';
                              }}
                            />
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-xs text-muted-foreground">No portfolio images available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold">Customer Reviews</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} from verified customers
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-base font-bold">{averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {vendor.reviews.length > 0 ? (
                      <div className="space-y-3">
                        {vendor.reviews.map((review) => (
                          <div key={review.id} className="flex gap-2.5 pb-3 border-b last:border-0">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {review.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="font-semibold text-sm">{review.userName}</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < Math.floor(review.rating)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.eventType && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                    {review.eventType}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-1.5 leading-relaxed">{review.comment}</p>
                              {review.images && review.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                                  {review.images.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt={`Review image ${idx + 1}`}
                                      className="w-full h-16 object-cover rounded"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100';
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(review.date).toLocaleDateString('en-IN', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-xs text-muted-foreground">No reviews yet.</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Be the first to review this vendor!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faqs" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Frequently Asked Questions</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {vendor.faqs.length} {vendor.faqs.length === 1 ? 'question' : 'questions'} answered
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {vendor.faqs.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {vendor.faqs.map((faq) => (
                          <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger className="text-left text-sm py-2">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-xs text-muted-foreground">No FAQs available.</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Contact the vendor for more information.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Starting Price</div>
                  <div className="text-lg font-bold text-primary">
                    ₹{vendor.startingPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Location</div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {vendor.city}
                  </div>
                  {vendor.coverageRadius > 0 && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Coverage: {vendor.coverageRadius}km radius
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Category</div>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {categoryDisplayName}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Rating</div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({totalReviews} reviews)</span>
                  </div>
                </div>
                {verifiedBadge && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Verification</div>
                    <Badge className="bg-green-500 text-white text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified Vendor
                    </Badge>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Listings</div>
                  <div className="text-xs font-medium">
                    {totalPackages} package{totalPackages !== 1 ? 's' : ''}
                    {totalListings > 0 && `, ${totalListings} item${totalListings !== 1 ? 's' : ''}`}
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full rounded-xl shadow-md hover-lift mt-2" size="sm">
                      <MessageCircle className="mr-2 h-3.5 w-3.5" />
                      Chat with Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 [&>button]:top-2 [&>button]:right-2 [&>button]:z-50 [&>button]:bg-background/80 [&>button]:rounded-full [&>button]:p-1">
                    <PremiumChatWindow
                      vendorId={vendor.id}
                      vendorName={vendor.businessName}
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
                 />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
