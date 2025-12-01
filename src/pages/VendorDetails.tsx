import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, MapPin, Check, X, Clock, MessageCircle, ShoppingCart, AlertCircle } from 'lucide-react';
import { getVendorById } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { PremiumChatWindow } from '@/components/PremiumChatWindow';
import { PremiumPackageCard } from '@/components/PremiumPackageCard';
import { PackageCustomization } from '@/components/PackageCustomization';
import { BookExactSetup } from '@/components/BookExactSetup';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  const vendor = vendorId ? getVendorById(vendorId) : null;

  // Handle URL parameters for tab and package highlighting
  useEffect(() => {
    const tab = searchParams.get('tab');
    const packageId = searchParams.get('packageId') || searchParams.get('package'); // Support both 'packageId' and 'package' for backward compatibility
    
    // If packageId is present but tab is not 'packages', switch to packages tab
    if (packageId && tab !== 'packages') {
      const params = new URLSearchParams(searchParams);
      params.set('tab', 'packages');
      params.set('packageId', packageId);
      params.delete('package'); // Remove old parameter if present
      setSearchParams(params, { replace: true });
      return;
    }
    
    if (tab === 'packages') {
      if (packageId) {
        setHighlightedPackageId(packageId);
        setShowAllPackages(false);
      }
      // Scroll to packages section after a brief delay
      setTimeout(() => {
        const packagesSection = document.getElementById('packages-section');
        if (packagesSection) {
          packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      // Reset highlighting when not on packages tab
      setHighlightedPackageId(null);
      setShowAllPackages(false);
    }
  }, [searchParams, setSearchParams]);

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Vendor not found</h1>
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
          src={vendor.coverImage}
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
                <TabsTrigger value="packages">Packages</TabsTrigger>
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
                    <p className="text-muted-foreground">{vendor.bio}</p>
                  </CardContent>
                </Card>

                {/* Book Exact Setups - SOLUTION 4 */}
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
                        {vendor.pastEvents.map((event, index) => (
                          <div key={index} className="space-y-2">
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

              <TabsContent value="packages" id="packages-section" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">Packages</h2>
                  <p className="text-muted-foreground">{vendor.packages.length} package{vendor.packages.length > 1 ? 's' : ''} available</p>
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
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews ({vendor.reviews.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faqs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {vendor.faqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
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
                    ₹{vendor.startingPrice.toLocaleString()}
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

            {/* SOLUTION 5: Availability Calendar */}
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
