import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/features/home/Navbar';
import { BookingWidget } from './BookingWidget';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
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
  Clock,
  IndianRupee,
  Edit,
  Eye,
  Users,
  Target,
  Shield,
  Sparkles,
  ChevronRight,
  Camera,
  Palette,
  UtensilsCrossed,
  Building2,
  Music,
  Speaker,
  MoreHorizontal
} from 'lucide-react';
import { publicApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';
import { ScrollReveal } from '@/shared/components/ScrollReveal';
import { CategorySpecificDisplay } from './CategorySpecificDisplay';

// Category icon mapping
const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'photography-videography':
    case 'photographer':
    case 'cinematographer':
    case 'videographer':
      return Camera;
    case 'decorator':
      return Palette;
    case 'caterer':
      return UtensilsCrossed;
    case 'venue':
      return Building2;
    case 'mua':
      return Sparkles;
    case 'dj-entertainment':
    case 'dj':
    case 'live-music':
      return Music;
    case 'sound-lights':
      return Speaker;
    default:
      return MoreHorizontal;
  }
};

interface PackageDetailViewProps {
  listing: any;
  isOwner: boolean;
  reviews?: any[];
}

export function PackageDetailView({ listing, isOwner, reviews = [] }: PackageDetailViewProps) {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expandedServices, setExpandedServices] = useState<string[]>([]);

  // Fetch full details of bundled items
  const { data: bundledItemsData } = useQuery({
    queryKey: ['bundledItems', listing?.includedItemIds],
    queryFn: async () => {
      if (!listing?.includedItemIds || listing.includedItemIds.length === 0) return [];
      const response = await publicApi.getListingsByIds(listing.includedItemIds);
      return response && typeof response === 'object' && 'data' in response 
        ? (response as any).data 
        : response;
    },
    enabled: !!(listing?.includedItemIds && listing.includedItemIds.length > 0),
    staleTime: 5 * 60 * 1000,
  });

  const linkedItems = useMemo(() => 
    Array.isArray(bundledItemsData) ? bundledItemsData : [], 
    [bundledItemsData]
  );

  // Calculate savings
  const { individualTotal, packagePrice, savings, savingsPercent } = useMemo(() => {
    const individual = linkedItems.reduce((sum: number, item: any) => {
      const price = Number(item.price) || 0;
      return sum + price;
    }, 0);
    const pkg = Number(listing?.price) || 0;
    const save = individual - pkg;
    const percent = individual > 0 ? Math.round((save / individual) * 100) : 0;
    return {
      individualTotal: individual,
      packagePrice: pkg,
      savings: save > 0 ? save : 0,
      savingsPercent: percent > 0 ? percent : 0
    };
  }, [linkedItems, listing?.price]);

  // Parse extra charges
  const parsedExtraCharges = useMemo(() => {
    if (listing?.extraChargesJson) {
      try {
        return JSON.parse(listing.extraChargesJson);
      } catch {
        return [];
      }
    }
    return [];
  }, [listing?.extraChargesJson]);

  // Toggle service expansion
  const toggleService = (itemId: string) => {
    setExpandedServices(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Expand all services
  const expandAllServices = () => {
    setExpandedServices(linkedItems.map((item: any) => item.id));
  };

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      {/* Vendor Owner Banner */}
      {isOwner && (
        <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-b border-primary/20">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/15">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">Customer's View</p>
                  <p className="text-[10px] text-primary/70">How customers see this package</p>
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
                  onClick={() => navigate(`/vendor/listings/preview/${listing.id}?edit=true`)}
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

      {/* Back Button */}
      {!isOwner && (
        <div className="max-w-6xl mx-auto px-4 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
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
          <div className="lg:col-span-2 space-y-4">
            
            {/* Hero Image */}
            <ScrollReveal animation="fadeInUp">
              <div className="relative rounded-xl overflow-hidden bg-slate-200 aspect-[16/9]">
                {listing.images?.[selectedImageIndex] ? (
                  <img 
                    src={listing.images[selectedImageIndex]} 
                    alt={listing.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : listing.images?.[0] ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-slate-400" />
                  </div>
                )}
                
                {/* Package Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-white text-xs px-2 py-1">
                    <Package className="h-3 w-3 mr-1" />
                    Package Deal
                  </Badge>
                </div>

                {/* Share/Save */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image Counter */}
                {listing.images?.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {selectedImageIndex + 1} / {listing.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {listing.images?.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {listing.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                        selectedImageIndex === i 
                          ? "border-primary ring-2 ring-primary/30" 
                          : "border-transparent hover:border-slate-300"
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </ScrollReveal>

            {/* Package Title & Vendor Info */}
            <ScrollReveal animation="fadeInUp" delay={100}>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {listing.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-slate-500">
                  <Link 
                    to={`/vendor/${listing.vendorId}`}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">{listing.vendorName}</span>
                  </Link>
                  {listing.vendorCity && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing.vendorCity}
                      </span>
                    </>
                  )}
                  {listing.vendorRating > 0 && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{listing.vendorRating.toFixed(1)}</span>
                        {listing.vendorReviewCount && (
                          <span className="text-slate-400">({listing.vendorReviewCount} reviews)</span>
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Section 1: Package Overview - What's Included */}
            <ScrollReveal animation="fadeInUp" delay={150}>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    This Package Includes
                  </h2>
                  
                  {/* Service Thumbnails Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {linkedItems.map((item: any, index: number) => {
                      const CategoryIcon = getCategoryIcon(item.categoryId);
                      const itemPrice = Number(item.price) || 0;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            toggleService(item.id);
                            // Scroll to the service card
                            document.getElementById(`service-${item.id}`)?.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center' 
                            });
                          }}
                          className="group text-left p-2 rounded-lg border bg-white hover:border-primary hover:shadow-md transition-all"
                        >
                          <div className="aspect-square rounded-md overflow-hidden bg-slate-100 mb-2 relative">
                            {item.images?.[0] ? (
                              <img 
                                src={item.images[0]} 
                                alt={item.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <CategoryIcon className="h-6 w-6 text-slate-300" />
                              </div>
                            )}
                            <div className="absolute top-1 left-1">
                              <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-white/90">
                                {index + 1}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs font-medium truncate group-hover:text-primary">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            ₹{itemPrice.toLocaleString('en-IN')}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Savings Banner */}
                  {savings > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-green-100">
                            <IndianRupee className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-green-800">
                              You Save ₹{savings.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-green-600">
                              {savingsPercent}% off compared to booking individually
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 line-through">
                            ₹{individualTotal.toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm font-bold text-green-700">
                            ₹{packagePrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 mt-3 text-center">
                    Click any service to see full details below
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Section 2: Why This Package */}
            <ScrollReveal animation="fadeInUp" delay={200}>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold mb-3">Why Book This Package?</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs font-medium">One-Stop Solution</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">All needs in one place</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs font-medium">Single Contact</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">One vendor for all</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-xs font-medium">Bundle Discount</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {savingsPercent > 0 ? `Save ${savingsPercent}%` : 'Better value'}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs font-medium">Less Stress</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Coordinated service</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Section 3: Detailed Service Cards */}
            <ScrollReveal animation="fadeInUp" delay={250}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Included Services - Detailed View
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={expandAllServices}
                      className="h-7 text-xs"
                    >
                      Expand All
                    </Button>
                  </div>

                  <Accordion 
                    type="multiple" 
                    value={expandedServices}
                    onValueChange={setExpandedServices}
                    className="space-y-3"
                  >
                    {linkedItems.map((item: any, index: number) => {
                      const CategoryIcon = getCategoryIcon(item.categoryId);
                      const itemPrice = Number(item.price) || 0;
                      
                      // Parse item's extra charges
                      let itemExtraCharges: any[] = [];
                      if (item.extraChargesJson) {
                        try { itemExtraCharges = JSON.parse(item.extraChargesJson); } catch {}
                      }

                      return (
                        <AccordionItem 
                          key={item.id} 
                          value={item.id}
                          id={`service-${item.id}`}
                          className="border rounded-lg overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50">
                            <div className="flex items-center gap-3 text-left w-full">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                {item.images?.[0] ? (
                                  <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <CategoryIcon className="h-5 w-5 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[9px] h-4 px-1">
                                    Service {index + 1} of {linkedItems.length}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium truncate mt-0.5">{item.name}</p>
                                <p className="text-xs text-slate-500">
                                  Individual Price: ₹{itemPrice.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4 pt-2">
                              {/* Image Gallery */}
                              {item.images?.length > 0 && (
                                <div>
                                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 mb-2">
                                    <img 
                                      src={item.images[0]} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                  {item.images.length > 1 && (
                                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                                      {item.images.slice(1, 5).map((img: string, i: number) => (
                                        <div key={i} className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                                          <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                      ))}
                                      {item.images.length > 5 && (
                                        <div className="w-14 h-14 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                                          <span className="text-xs text-slate-500">+{item.images.length - 5}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Description */}
                              {item.description && (
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {item.description}
                                </p>
                              )}

                              {/* Included/Excluded */}
                              {(item.includedItemsText?.length > 0 || item.excludedItemsText?.length > 0) && (
                                <div className="grid grid-cols-2 gap-3">
                                  {item.includedItemsText?.length > 0 && (
                                    <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                                      <p className="text-xs font-medium text-green-800 mb-2">Included</p>
                                      <div className="space-y-1">
                                        {item.includedItemsText.map((text: string, i: number) => (
                                          <p key={i} className="text-[10px] text-green-700 flex items-start gap-1">
                                            <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                            {text}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {item.excludedItemsText?.length > 0 && (
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                                      <p className="text-xs font-medium text-red-800 mb-2">Not Included</p>
                                      <div className="space-y-1">
                                        {item.excludedItemsText.map((text: string, i: number) => (
                                          <p key={i} className="text-[10px] text-red-700 flex items-start gap-1">
                                            <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                            {text}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Service Details */}
                              <div className="grid grid-cols-3 gap-2">
                                {item.deliveryTime && (
                                  <div className="p-2 rounded-lg bg-slate-50 text-center">
                                    <Clock className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                                    <p className="text-[10px] text-slate-500">Delivery</p>
                                    <p className="text-xs font-medium">{item.deliveryTime}</p>
                                  </div>
                                )}
                                {item.serviceMode && (
                                  <div className="p-2 rounded-lg bg-slate-50 text-center">
                                    <MapPin className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                                    <p className="text-[10px] text-slate-500">Service Mode</p>
                                    <p className="text-xs font-medium">
                                      {item.serviceMode === 'VENDOR_TRAVELS' ? 'They come to you' : 
                                       item.serviceMode === 'CUSTOMER_VISITS' ? 'Visit them' : 'Both options'}
                                    </p>
                                  </div>
                                )}
                                <div className="p-2 rounded-lg bg-slate-50 text-center">
                                  <IndianRupee className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                                  <p className="text-[10px] text-slate-500">Negotiable</p>
                                  <p className="text-xs font-medium">
                                    {item.openForNegotiation ? 'Yes' : 'Fixed'}
                                  </p>
                                </div>
                              </div>

                              {/* Category Specific Data */}
                              {item.categorySpecificData && (
                                <CategorySpecificDisplay 
                                  categoryId={item.categoryId} 
                                  categorySpecificData={item.categorySpecificData}
                                />
                              )}

                              {/* View Separately Link */}
                              <div className="pt-2 border-t">
                                <Link 
                                  to={`/listing/${item.id}`}
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  View this service separately
                                  <ChevronRight className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Section 4: Extra Charges */}
            {parsedExtraCharges.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={300}>
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-sm font-semibold mb-3">Additional Charges (Optional)</h2>
                    <p className="text-[10px] text-slate-500 mb-3">
                      These are optional add-ons you can choose at checkout
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {parsedExtraCharges.map((charge: any, index: number) => (
                        <div 
                          key={index}
                          className="p-3 rounded-lg border bg-amber-50/50 border-amber-200"
                        >
                          <p className="text-xs font-medium">{charge.name}</p>
                          <p className="text-sm font-bold text-amber-700 mt-1">
                            +₹{Number(charge.price).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            )}

            {/* Section 5: Package Highlights */}
            {listing.highlights?.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={350}>
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Package Highlights
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      {listing.highlights.map((highlight: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            )}

            {/* Section 6: About This Package */}
            {listing.description && (
              <ScrollReveal animation="fadeInUp" delay={400}>
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-sm font-semibold mb-2">About This Package</h2>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {listing.description}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            )}

            {/* Section 7: Vendor Info */}
            {!isOwner && (
              <ScrollReveal animation="fadeInUp" delay={450}>
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-sm font-semibold mb-3">About the Vendor</h2>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{listing.vendorName}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          {listing.vendorCity && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {listing.vendorCity}
                            </span>
                          )}
                          {listing.vendorRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {listing.vendorRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Link to={`/vendor/${listing.vendorId}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            )}

            {/* Section 8: Reviews */}
            {reviews.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={500}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold">
                        Customer Reviews
                        {listing.vendorRating > 0 && (
                          <span className="ml-1 font-normal text-slate-400">
                            ({listing.vendorRating.toFixed(1)})
                          </span>
                        )}
                      </h2>
                      <Link to={`/vendor/${listing.vendorId}?tab=reviews`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          View All
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {reviews.slice(0, 3).map((review: any) => (
                        <div key={review.id} className="border-b last:border-0 pb-3 last:pb-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium">{review.customerName || 'Anonymous'}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-3 w-3",
                                    i < (review.rating || 0)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            )}
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <BookingWidget
                listing={{
                  id: listing.id,
                  name: listing.name,
                  price: packagePrice,
                  type: 'PACKAGE',
                  vendorId: listing.vendorId,
                  vendorName: listing.vendorName,
                }}
              />

              {/* Package Summary Card */}
              <Card className="mt-3 border-dashed">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold mb-2">Package Summary</h3>
                  <div className="space-y-1.5 text-[10px]">
                    {linkedItems.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-slate-600 truncate flex-1 mr-2">{item.name}</span>
                        <span className="text-slate-400 line-through">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Individual Total</span>
                      <span className="line-through text-slate-400">
                        ₹{individualTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                      <span>Package Price</span>
                      <span className="text-primary">
                        ₹{packagePrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="flex items-center justify-between text-green-600 font-medium">
                        <span>You Save</span>
                        <span>₹{savings.toLocaleString('en-IN')} ({savingsPercent}%)</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 z-50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold">₹{packagePrice.toLocaleString('en-IN')}</p>
            {savings > 0 && (
              <p className="text-[10px] text-green-600">
                Save ₹{savings.toLocaleString('en-IN')} ({savingsPercent}% off)
              </p>
            )}
          </div>
          <Button className="flex-1 max-w-[200px]">
            Add to Cart
          </Button>
        </div>
      </div>
      
      {/* Bottom padding for mobile sticky bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
