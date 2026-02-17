import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/features/home/Navbar';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { 
  Star, MapPin, ShoppingCart, AlertCircle, Loader2, 
  Award, TrendingUp, Calendar, Shield, CheckCircle2, 
  Phone, Heart, Share2, ChevronRight, Sparkles, Camera,
  ThumbsUp, Quote, Eye, ArrowRight, Play, ImageIcon, Users,
  X, ChevronLeft, ZoomIn, Download, Grid3X3
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { useCart } from '@/shared/contexts/CartContext';
import { cn } from '@/shared/lib/utils';
import { PremiumPackageCard } from '@/features/search/PremiumPackageCard';
import { BookExactSetup } from '@/features/vendor/BookExactSetup';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { RequestCallbackModal } from '@/features/listing/RequestCallbackModal';
import { 
  useVendor, 
  useVendorListings,
  useVendorPackages,
  useVendorReviews, 
  useVendorFAQs, 
  useVendorPastEvents, 
  useVendorBookableSetups,
  useCategories
} from '@/shared/hooks/useApi';

// Fullscreen Gallery Lightbox Component
const GalleryLightbox = ({ 
  images, 
  isOpen, 
  onClose, 
  initialIndex = 0,
  vendorName 
}: { 
  images: string[]; 
  isOpen: boolean; 
  onClose: () => void; 
  initialIndex?: number;
  vendorName: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-zinc-900 via-black to-zinc-900">
      {/* Ambient glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-3xl transition-all duration-700"
          style={{
            background: `radial-gradient(circle, rgba(89, 80, 179, 0.4) 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-5">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-white">
            <p className="text-xs text-white/50 uppercase tracking-wider">{vendorName}</p>
            <p className="text-lg font-semibold">{currentIndex + 1} <span className="text-white/40 font-normal">/ {images.length}</span></p>
          </div>
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            viewMode === 'grid' 
              ? "bg-white text-black" 
              : "bg-white/10 hover:bg-white/20 text-white"
          )}
        >
          {viewMode === 'grid' ? 'Single View' : 'View All'}
        </button>
      </div>

      {viewMode === 'single' ? (
        <>
          {/* Main Image with cinematic framing */}
          <div className="absolute inset-0 flex items-center justify-center px-4 pt-20 pb-44">
            <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
              <img
                src={images[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Navigation Arrows - Netflix style */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={() => setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Netflix-style Thumbnail Carousel */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-8">
              <div className="px-6">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-4 font-medium">Gallery</p>
                <div className="relative">
                  {/* Fade edges */}
                  <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                  
                  {/* Scrollable container */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          "relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 group",
                          currentIndex === idx 
                            ? "w-32 h-20 ring-2 ring-white shadow-lg shadow-white/20 scale-105" 
                            : "w-28 h-[72px] opacity-60 hover:opacity-100 hover:scale-105"
                        )}
                      >
                        <img 
                          src={img} 
                          alt={`Thumb ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        {/* Hover overlay */}
                        <div className={cn(
                          "absolute inset-0 transition-all",
                          currentIndex === idx 
                            ? "bg-transparent" 
                            : "bg-black/20 group-hover:bg-transparent"
                        )} />
                        {/* Active indicator */}
                        {currentIndex === idx && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5950b3] to-[#7867dc]" />
                        )}
                        {/* Number badge */}
                        <div className={cn(
                          "absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                          currentIndex === idx 
                            ? "bg-white text-black" 
                            : "bg-black/60 text-white/80"
                        )}>
                          {idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Grid View - Netflix style */
        <div className="absolute inset-0 overflow-y-auto pt-24 pb-8 px-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-6 font-medium">All Photos</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode('single');
                  }}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden group"
                >
                  <img 
                    src={img} 
                    alt={`Photo ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Number badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold">
                    {idx + 1}
                  </div>
                  {/* Hover play indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <ZoomIn className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [highlightedPackageId, setHighlightedPackageId] = useState<string | null>(null);
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  // Fetch data from API
  const { data: vendorData, loading: vendorLoading, error: vendorError } = useVendor(vendorId || null);
  const { data: packagesData, loading: packagesLoading } = useVendorPackages(vendorId || null);
  const { data: listingsData, loading: listingsLoading } = useVendorListings(vendorId || null);
  const { data: reviewsData, loading: reviewsLoading } = useVendorReviews(vendorId || null);
  const { data: faqsData, loading: faqsLoading } = useVendorFAQs(vendorId || null);
  const { data: pastEventsData, loading: pastEventsLoading } = useVendorPastEvents(vendorId || null);
  const { data: bookableSetupsData, loading: bookableSetupsLoading } = useVendorBookableSetups(vendorId || null);
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  // Transform API data
  const vendor = useMemo(() => {
    if (!vendorData) return null;

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
      profileImage: vendorData.profileImage || '',
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
    };
  }, [vendorData, packagesData, listingsData, reviewsData, faqsData, pastEventsData, bookableSetupsData]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) {
      const params = new URLSearchParams(searchParams);
      params.set('tab', 'overview');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5950b3] to-[#7867dc] animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#5950b3]" />
              </div>
            </div>
            <p className="text-gray-500 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (vendorError || !vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Vendor not found</h1>
            <p className="text-gray-500 mb-6">{vendorError || 'The vendor you are looking for does not exist.'}</p>
            <Button asChild className="bg-gradient-to-r from-[#5950b3] to-[#7867dc] hover:opacity-90">
              <Link to="/search">Back to Search</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleBookPackage = (packageId: string) => {
    navigate(`/listing/${packageId}`);
  };

  const totalPackages = vendor.packages.length;
  const totalListings = vendor.listings?.length || 0;
  const totalReviews = vendor.reviews.length;
  const averageRating = vendor.rating;
  const verifiedBadge = vendor.isVerified;
  const categoryDisplayName = vendor.categoryName || categories.find(c => c.id === vendor.category)?.name || vendor.category;
  const firstPackage = vendor.packages[0];

  // Used for gallery navigation
  const handleGalleryClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'portfolio');
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <Navbar />

      {/* ========== IMMERSIVE HERO GALLERY ========== */}
      <div className="relative">
        {/* Full-Width Cinematic Gallery */}
        <div className="relative h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden bg-gray-900">
          {/* Gallery Grid - Only show if we have images */}
          {(vendor.coverImage || (vendor.portfolioImages && vendor.portfolioImages.length > 0)) ? (
            <div className="h-full">
              {/* Masonry-style Gallery Layout */}
              <div className="grid grid-cols-12 grid-rows-6 h-full gap-2 p-2">
                {/* Main Cover - Large hero image (left side) */}
                <div 
                  className="col-span-12 md:col-span-7 row-span-6 relative group cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() => {
                    setGalleryStartIndex(0);
                    setGalleryOpen(true);
                  }}
                >
                  <img
                    src={vendor.coverImage || vendor.portfolioImages?.[0] || ''}
                    alt="Cover"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>

                {/* Right Column - Stacked portfolio images */}
                <div className="hidden md:grid col-span-5 row-span-6 grid-rows-3 gap-2">
                  {/* Top Right - Large */}
                  <div 
                    className="row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-800"
                    onClick={() => {
                      setGalleryStartIndex(1);
                      setGalleryOpen(true);
                    }}
                  >
                    {vendor.portfolioImages?.[0] ? (
                      <img 
                        src={vendor.portfolioImages[0]} 
                        alt="Portfolio 1"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                        <ImageIcon className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Bottom Right - Two smaller images */}
                  <div className="row-span-1 grid grid-cols-2 gap-2">
                    {[1, 2].map((idx) => {
                      const img = vendor.portfolioImages?.[idx];
                      const isLast = idx === 2;
                      const remainingCount = (vendor.portfolioImages?.length || 0) - 3;
                      
                      return (
                        <div 
                          key={idx}
                          className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-800"
                          onClick={() => {
                            setGalleryStartIndex(idx + 1);
                            setGalleryOpen(true);
                          }}
                        >
                          {img ? (
                            <>
                              <img 
                                src={img} 
                                alt={`Portfolio ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              
                              {/* Show +X more overlay on last image if more photos exist */}
                              {isLast && remainingCount > 0 && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                                  <span className="text-2xl font-bold">+{remainingCount}</span>
                                  <span className="text-xs text-white/70">more photos</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                              <ImageIcon className="h-8 w-8 text-gray-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No images at all - show beautiful placeholder */
            <div className="w-full h-full bg-gradient-to-br from-[#3d3891] via-[#5950b3] to-[#7867dc] flex items-center justify-center relative overflow-hidden">
              {/* Animated decorative elements */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl" />
              </div>
              
              <div className="text-center text-white relative z-10 px-4">
                <div className="w-28 h-28 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-5 border border-white/20">
                  <Camera className="h-12 w-12 text-white/70" />
                </div>
                <p className="text-white/60 text-lg">No photos uploaded yet</p>
              </div>
            </div>
          )}

          {/* Top Navigation Bar */}
          <div className="absolute top-4 left-4 z-20">
            <Link 
              to="/search" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-sm text-gray-700 text-sm font-medium hover:bg-white transition-all shadow-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          {/* View All Photos Button */}
          {vendor.portfolioImages && vendor.portfolioImages.length > 0 && (
            <button
              onClick={() => {
                setGalleryStartIndex(0);
                setGalleryOpen(true);
              }}
              className="absolute bottom-4 right-4 px-5 py-2.5 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg text-gray-800 text-sm font-medium hover:bg-white transition-all flex items-center gap-2 z-20"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Gallery Lightbox */}
      <GalleryLightbox
        images={[vendor.coverImage, ...(vendor.portfolioImages || [])].filter(Boolean)}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={galleryStartIndex}
        vendorName={vendor.businessName}
      />

      {/* ========== MAIN CONTENT AREA ========== */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tab Content (2 columns) */}
          <div className="lg:col-span-2">
            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
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
            <div className="border-b border-gray-100">
              <div className="px-6">
                <TabsList className="h-auto bg-transparent p-0 gap-0">
                  {[
                    { value: 'overview', label: 'Overview', icon: Sparkles },
                    { value: 'listings', label: 'Packages', icon: ShoppingCart },
                    { value: 'portfolio', label: 'Portfolio', icon: ImageIcon },
                    { value: 'reviews', label: 'Reviews', icon: Star },
                    { value: 'faqs', label: 'FAQs', icon: Quote },
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      className={cn(
                        "relative px-6 py-4 rounded-none border-b-2 border-transparent",
                        "data-[state=active]:border-[#5950b3] data-[state=active]:text-[#5950b3]",
                        "text-gray-500 hover:text-gray-700 transition-colors font-medium",
                        "flex items-center gap-2"
                      )}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* ========== OVERVIEW TAB ========== */}
              <TabsContent value="overview" className="mt-0 space-y-8">
                {/* About Section */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    About {vendor.businessName}
                  </h2>
                  {vendor.bio ? (
                    <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{vendor.bio}</p>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <p className="text-gray-400 italic">No description available yet.</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Star, label: 'Rating', value: averageRating.toFixed(1), color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
                    { icon: ThumbsUp, label: 'Reviews', value: totalReviews.toString(), color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
                    { icon: ShoppingCart, label: 'Packages', value: totalPackages.toString(), color: 'from-[#5950b3] to-[#7867dc]', bg: 'bg-purple-50' },
                    { icon: Calendar, label: 'Events Done', value: (vendor.pastEvents?.length || 0).toString(), color: 'from-green-400 to-emerald-500', bg: 'bg-green-50' },
                  ].map((stat, idx) => (
                    <div key={idx} className={cn("rounded-2xl p-5", stat.bg)}>
                      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3", stat.color)}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Featured Packages */}
                {vendor.packages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                        Featured Packages
                      </h2>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('tab', 'listings');
                          setSearchParams(params, { replace: true });
                        }}
                        className="text-[#5950b3] font-medium hover:underline flex items-center gap-1"
                      >
                        View all <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {vendor.packages.slice(0, 2).map((pkg) => (
                        <div 
                          key={pkg.id} 
                          className="group relative bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-[#5950b3]/30 hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.set('tab', 'listings');
                            params.set('packageId', pkg.id);
                            setSearchParams(params, { replace: true });
                          }}
                        >
                          {/* Trending/Popular Badge */}
                          {(pkg.isTrending || pkg.isPopular) && (
                            <div className="absolute -top-3 left-6">
                              <Badge className={cn(
                                "shadow-lg px-3 py-1",
                                pkg.isTrending 
                                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                                  : "bg-gradient-to-r from-[#5950b3] to-[#7867dc] text-white"
                              )}>
                                {pkg.isTrending ? (
                                  <><TrendingUp className="h-3 w-3 mr-1" /> Trending</>
                                ) : (
                                  <><Award className="h-3 w-3 mr-1" /> Popular</>
                                )}
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#5950b3] transition-colors">
                                {pkg.name}
                              </h3>
                              <p className="text-gray-500 line-clamp-2 mb-4">{pkg.description}</p>
                              <p className="text-2xl font-bold text-[#5950b3]">
                                ₹{pkg.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#5950b3] transition-colors shrink-0">
                              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Exact Setups */}
                {vendor.bookableSetups && vendor.bookableSetups.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                      Book This Exact Setup
                    </h2>
                    <p className="text-gray-500 mb-5">Click on any setup to book it directly</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vendor.bookableSetups.map((setup) => (
                        <BookExactSetup
                          key={setup.id}
                          setup={setup}
                          vendorName={vendor.businessName}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Events Gallery */}
                {vendor.pastEvents && vendor.pastEvents.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      Past Events
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {vendor.pastEvents.slice(0, 8).map((event) => (
                        <div key={event.id} className="group cursor-pointer">
                          <div className="aspect-square rounded-2xl overflow-hidden relative">
                            <img
                              src={event.image}
                              alt={event.eventType}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white font-medium truncate">{event.eventType}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Review */}
                {vendor.reviews.length > 0 && (
                  <div className="bg-gradient-to-br from-[#5950b3]/5 via-purple-50/50 to-[#7867dc]/5 rounded-2xl p-6 md:p-8">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center shrink-0">
                        <Quote className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-5 w-5",
                                i < Math.floor(vendor.reviews[0].rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-200"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 text-lg italic mb-4 leading-relaxed">"{vendor.reviews[0].comment}"</p>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">— {vendor.reviews[0].userName}</p>
                          <button
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              params.set('tab', 'reviews');
                              setSearchParams(params, { replace: true });
                            }}
                            className="text-[#5950b3] font-medium hover:underline flex items-center gap-1"
                          >
                            Read all reviews <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ========== PACKAGES TAB ========== */}
              <TabsContent value="listings" id="listings-section" className="mt-0 space-y-8">
                {/* Packages Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      All Packages
                      <span className="ml-2 text-base font-normal text-gray-500">
                        ({totalPackages} available)
                      </span>
                    </h2>
                  </div>
                  
                  {vendor.packages.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {vendor.packages.map((pkg) => {
                        const themeMap: Record<string, 'wedding' | 'dj' | 'birthday' | 'corporate'> = {
                          photographer: 'wedding',
                          decorator: 'wedding',
                          dj: 'dj',
                          'sound-lights': 'dj',
                          caterer: 'corporate',
                          mua: 'wedding',
                          'event-planner': 'wedding',
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
                              onBook={(pkg) => handleBookPackage(pkg.id)}
                              theme={theme}
                              showOtherPackagesButton={isHighlighted && !showAllPackages && !!highlightedPackageId}
                              onShowOtherPackages={() => setShowAllPackages(true)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-12 text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No packages available yet.</p>
                    </div>
                  )}
                </div>

                {/* Individual Listings */}
                {vendor.listings && vendor.listings.length > 0 && (
                  <div className="pt-8 border-t border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Individual Items
                      <span className="ml-2 text-base font-normal text-gray-500">
                        ({totalListings} available)
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {vendor.listings.map((listing) => {
                        const listingCategory = listing.category || vendor.category;
                        const categoryName = categories.find(c => c.id === listingCategory)?.name || listingCategory;
                        return (
                          <div 
                            key={listing.id} 
                            className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-[#5950b3]/30 hover:shadow-lg transition-all group"
                          >
                            <div className="relative aspect-video">
                              <img
                                src={listing.images?.[0] || 'https://via.placeholder.com/400x300'}
                                alt={listing.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300';
                                }}
                              />
                              <Badge className="absolute top-3 left-3 bg-white/90 text-gray-700 backdrop-blur-sm">
                                {categoryName}
                              </Badge>
                            </div>
                            <div className="p-5">
                              <h3 className="font-bold text-gray-900 mb-2">{listing.name}</h3>
                              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{listing.description}</p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xl font-bold text-[#5950b3]">
                                    ₹{listing.price.toLocaleString('en-IN')}
                                  </p>
                                  {listing.unit && (
                                    <p className="text-xs text-gray-400">per {listing.unit}</p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-[#5950b3] to-[#7867dc] hover:opacity-90 rounded-xl"
                                  onClick={() => navigate(`/listing/${listing.id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ========== PORTFOLIO TAB ========== */}
              <TabsContent value="portfolio" className="mt-0">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Portfolio Gallery</h2>
                  <p className="text-gray-500">
                    {vendor.portfolioImages?.length || 0} photos showcasing our work
                  </p>
                </div>
                
                {vendor.portfolioImages && vendor.portfolioImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {vendor.portfolioImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
                      >
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No portfolio images available yet.</p>
                  </div>
                )}
              </TabsContent>

              {/* ========== REVIEWS TAB ========== */}
              <TabsContent value="reviews" className="mt-0">
                {/* Reviews Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
                    <p className="text-gray-500">{totalReviews} verified reviews</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                      <span className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-gray-500">out of 5</p>
                  </div>
                </div>
                
                {vendor.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {vendor.reviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-gray-100">
                            <AvatarFallback className="bg-gradient-to-br from-[#5950b3] to-[#7867dc] text-white font-semibold">
                              {review.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{review.userName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "h-4 w-4",
                                          i < Math.floor(review.rating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-200"
                                        )}
                                      />
                                    ))}
                                  </div>
                                  {review.eventType && (
                                    <Badge variant="outline" className="text-xs">
                                      {review.eventType}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-400">
                                {new Date(review.date).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 mt-4">
                                {review.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Review image ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded-xl"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100';
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-2">No reviews yet</p>
                    <p className="text-sm text-gray-400">Be the first to review this vendor!</p>
                  </div>
                )}
              </TabsContent>

              {/* ========== FAQS TAB ========== */}
              <TabsContent value="faqs" className="mt-0">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
                  <p className="text-gray-500">{vendor.faqs.length} questions answered</p>
                </div>
                
                {vendor.faqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {vendor.faqs.map((faq) => (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className="border-2 border-gray-100 rounded-2xl px-5 data-[state=open]:border-[#5950b3]/20 data-[state=open]:bg-purple-50/30 transition-all"
                      >
                        <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-5">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-2">No FAQs available</p>
                    <p className="text-sm text-gray-400">Contact the vendor for more information.</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
          </div>
          </div>

          {/* Right: Vendor Card Sidebar (1 column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {/* Vendor Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Profile Header */}
                <div className="p-6 text-center border-b border-gray-100">
                  {/* Profile Picture */}
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#5950b3]/20 mx-auto bg-gradient-to-br from-[#5950b3] to-[#7867dc]">
                      {vendor.profileImage ? (
                        <img 
                          src={vendor.profileImage} 
                          alt={vendor.businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {vendor.businessName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {verifiedBadge && (
                      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name & Category */}
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{vendor.businessName}</h2>
                  <p className="text-sm text-gray-500 mb-3">{categoryDisplayName}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({totalReviews} reviews)</span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-[#5950b3]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.city}</p>
                      {vendor.coverageRadius > 0 && (
                        <p className="text-xs text-gray-500">Travels up to {vendor.coverageRadius}km</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.pastEvents?.length || 0} events completed</p>
                      <p className="text-xs text-gray-500">Experienced professional</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{totalPackages} packages available</p>
                      <p className="text-xs text-gray-500">Multiple options to choose</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="p-4 pt-0">
                  {firstPackage && (
                    <RequestCallbackModal
                      listingId={firstPackage.id}
                      listingName={firstPackage.name}
                      vendorId={vendor.id}
                      vendorName={vendor.businessName}
                      category={categoryDisplayName}
                    />
                  )}
                </div>

                {/* Trust Badge */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg py-2">
                    <Shield className="h-3.5 w-3.5 text-green-500" />
                    <span>100% secure · No spam calls</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating CTA for Mobile */}
        {firstPackage && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 lg:hidden z-50">
            <RequestCallbackModal
              listingId={firstPackage.id}
              listingName={firstPackage.name}
              vendorId={vendor.id}
              vendorName={vendor.businessName}
              category={categoryDisplayName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetails;
