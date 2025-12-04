import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Star, MapPin, Clock, CheckCircle2, Package } from 'lucide-react';
import { FlattenedPackage } from '@/shared/utils/packageUtils';
import { cn } from '@/shared/lib/utils';
import { useCart } from '@/shared/contexts/CartContext';
import { useToast } from '@/shared/hooks/use-toast';
import { getVendorById } from '@/shared/constants/mockData';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { PremiumPackageCard } from '@/features/search/PremiumPackageCard';

interface PackageCardProps {
  package: FlattenedPackage;
  onViewDetails?: (packageId: string, vendorId: string) => void;
  onBookNow?: (packageId: string, vendorId: string) => void;
  searchQuery?: string;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  onViewDetails,
  onBookNow,
  searchQuery,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [showPackageModal, setShowPackageModal] = useState(false);

  const handleVendorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/vendor/${pkg.vendorId}?tab=packages`);
  };

  const handleViewDetails = () => {
    const itemId = pkg.packageId || pkg.id;
    if (pkg.type === 'package') {
      // Show modal for packages
      setShowPackageModal(true);
    } else if (onViewDetails) {
      onViewDetails(itemId, pkg.vendorId);
    } else {
      // Navigate to vendor profile with listing highlighted
      navigate(`/vendor/${pkg.vendorId}?tab=listings&listingId=${itemId}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const itemId = pkg.packageId || pkg.id;
    const itemName = pkg.packageName || pkg.name;
    
    if (onBookNow) {
      onBookNow(itemId, pkg.vendorId);
    } else {
      // Add to cart functionality
      const vendor = getVendorById(pkg.vendorId);
      
      if (pkg.type === 'package') {
        const vendorPackage = vendor?.packages.find(p => p.id === itemId);
        if (vendorPackage) {
          addToCart({
            vendorId: pkg.vendorId,
            vendorName: pkg.vendorName,
            packageId: itemId,
            packageName: itemName,
            price: pkg.price,
            basePrice: vendorPackage.price,
            addOns: [],
            quantity: 1,
          });

          toast({
            title: 'Added to Cart!',
            description: `${itemName} has been added to your cart`,
          });
        }
      } else {
        // Handle listing
        const listing = vendor?.listings?.find(l => l.id === itemId);
        if (listing) {
          addToCart({
            vendorId: pkg.vendorId,
            vendorName: pkg.vendorName,
            packageId: itemId,
            packageName: itemName,
            price: pkg.price,
            basePrice: listing.price,
            addOns: [],
            quantity: 1,
          });

          toast({
            title: 'Added to Cart!',
            description: `${itemName} has been added to your cart`,
          });
        }
      }
    }
  };

  // Get first 5 inclusions or all if less than 5 (only for packages)
  const displayedInclusions = (pkg.includedItems || []).slice(0, 5);

  // Get the actual package object for PremiumPackageCard
  const vendor = getVendorById(pkg.vendorId);
  const actualPackage = pkg.type === 'package' ? vendor?.packages.find(p => p.id === (pkg.packageId || pkg.id)) : null;
  
  // Determine theme based on category
  const themeMap: Record<string, 'wedding' | 'dj' | 'birthday' | 'corporate'> = {
    photographer: 'wedding',
    decorator: 'wedding',
    dj: 'dj',
    'sound-lights': 'dj',
    caterer: 'corporate',
    mua: 'wedding',
    cinematographer: 'wedding',
  };
  const theme = themeMap[pkg.category] || 'wedding';

  // Enhanced styling for packages vs listings
  const isPackage = pkg.type === 'package';
  
  return (
    <>
      <Card className={cn(
        "group transition-all duration-300 overflow-hidden",
        isPackage 
          ? "hover:shadow-2xl hover:-translate-y-2 border-2 border-primary/20 hover:border-primary/40 rounded-xl" // More prominent for packages
          : "hover:shadow-xl hover:-translate-y-1 rounded-lg" // Standard for listings
      )}>
        {/* Image */}
        <div className={cn(
          "relative overflow-hidden",
          isPackage ? "h-36" : "h-32" // Reduced height for smaller cards
        )}>
          <img
            src={pkg.images[0] || 'https://via.placeholder.com/400x300'}
            alt={pkg.packageName || pkg.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Package Badge - Very prominent styling for packages */}
          {pkg.type === 'package' && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-white font-semibold text-xs px-2.5 py-1 rounded-full shadow-lg border border-white/30 flex items-center gap-1.5 backdrop-blur-sm">
                <Package className="h-3 w-3" />
                <span>Package</span>
              </Badge>
            </div>
          )}
          
          {/* Badges overlay - Position below Package badge for packages */}
          <div className={cn(
            "absolute flex gap-1",
            pkg.type === 'package' ? "top-12 left-2" : "top-2 left-2" // Position below Package badge
          )}>
            {pkg.isPopular && (
              <Badge className="bg-orange-500 text-white border-none shadow-md text-xs px-1.5 py-0.5">
                🔥 Popular
              </Badge>
            )}
            {pkg.isTrending && (
              <Badge className="bg-purple-500 text-white border-none shadow-md text-xs px-1.5 py-0.5">
                ⭐ Trending
              </Badge>
            )}
          </div>

        {/* Availability badge */}
        <div className="absolute top-2 right-2">
          <Badge
            className={cn(
              'shadow-md text-xs px-2 py-0.5',
              pkg.availability === 'available' && 'bg-green-500 text-white border-none',
              pkg.availability === 'limited' && 'bg-yellow-500 text-white border-none',
              pkg.availability === 'booked' && 'bg-red-500 text-white border-none'
            )}
          >
            {pkg.availability === 'available' && '✓'}
            {pkg.availability === 'limited' && '⚠'}
            {pkg.availability === 'booked' && '✕'}
          </Badge>
        </div>
      </div>

      <CardContent className={cn(
        "p-3",
        isPackage && "bg-gradient-to-b from-background to-muted/20" // Subtle gradient for packages
      )}>
        {/* Vendor Name - Clickable */}
        <button
          onClick={handleVendorClick}
          className="text-xs text-primary font-semibold hover:underline mb-1 text-left"
        >
          {pkg.vendorName}
        </button>

        {/* Package/Listing Name */}
        <h3 className={cn(
          "font-bold text-foreground mb-1.5 line-clamp-1",
          isPackage ? "text-base" : "text-sm" // Reduced text size
        )}>
          {pkg.packageName || pkg.name}
        </h3>
        {pkg.type === 'listing' && (
          <Badge variant="outline" className="text-xs mb-2 bg-green-50 border-green-200 text-green-700">
            Individual Listing
          </Badge>
        )}

        {/* Rating, Location, and High Rating Badge - All in one line */}
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground flex-wrap">
          {pkg.vendorRating !== undefined && pkg.vendorRating !== null && (
            <>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">{pkg.vendorRating.toFixed(1)}</span>
                {pkg.vendorReviewCount !== undefined && pkg.vendorReviewCount !== null && (
                  <span>({pkg.vendorReviewCount})</span>
                )}
              </div>
              <span>•</span>
            </>
          )}
          {pkg.vendorCity && (
            <>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{pkg.vendorCity}</span>
              </div>
              {pkg.vendorRating !== undefined && pkg.vendorRating !== null && pkg.vendorRating > 4.5 && (
                <span>•</span>
              )}
            </>
          )}
          {pkg.vendorRating !== undefined && pkg.vendorRating !== null && pkg.vendorRating > 4.5 && (
            <>
              <span>•</span>
              <span className="text-yellow-600 font-medium">⭐ Highly Rated</span>
            </>
          )}
        </div>

        {/* Price and Delivery Time */}
        <div className="mb-2 flex items-baseline justify-between">
          <div className={cn(
            "font-bold text-primary",
            isPackage ? "text-xl" : "text-lg" // Reduced price size
          )}>
            ₹{(pkg.price || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="line-clamp-1 text-xs">{pkg.deliveryTime}</span>
          </div>
        </div>

        {/* Key Inclusions - Horizontal (only for packages) */}
        {pkg.type === 'package' && displayedInclusions.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
              <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
              {displayedInclusions.slice(0, 3).map((item, index) => (
                <React.Fragment key={index}>
                  <span className="line-clamp-1">{item}</span>
                  {index < Math.min(2, displayedInclusions.length - 1) && <span>•</span>}
                </React.Fragment>
              ))}
              {displayedInclusions.length > 3 && (
                <span className="text-primary font-medium">
                  +{displayedInclusions.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs px-2"
            onClick={handleViewDetails}
          >
            Details
          </Button>
          <Button
            size="sm"
            className="flex-1 h-7 text-xs px-2"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Package Modal - Only for packages */}
    {pkg.type === 'package' && actualPackage && (
      <Dialog open={showPackageModal} onOpenChange={setShowPackageModal}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-background border-0 shadow-2xl"
          onInteractOutside={(e) => {
            // Allow closing by clicking outside
          }}
        >
          <div className="p-6">
            <PremiumPackageCard
              pkg={actualPackage}
              vendorId={pkg.vendorId}
              vendorName={pkg.vendorName}
              vendorCategory={pkg.category}
              onBook={(pkgItem, addOns, customizations) => {
                const totalPrice =
                  pkgItem.price +
                  addOns.reduce((sum, a) => sum + a.price, 0) +
                  customizations.reduce((sum, c) => sum + c.price, 0);
                
                addToCart({
                  vendorId: pkg.vendorId,
                  vendorName: pkg.vendorName,
                  packageId: pkgItem.id,
                  packageName: pkgItem.name,
                  price: totalPrice,
                  basePrice: pkgItem.price,
                  addOns: addOns.map(a => ({ id: a.id, title: a.title, price: a.price })),
                  quantity: 1,
                });

                toast({
                  title: 'Added to Cart!',
                  description: `${pkgItem.name} has been added to your cart`,
                });
                
                setShowPackageModal(false);
              }}
              theme={theme}
            />
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};
