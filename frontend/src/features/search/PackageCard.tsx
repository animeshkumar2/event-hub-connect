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
    // Navigate to listing detail page
    navigate(`/listing/${itemId}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const itemId = pkg.packageId || pkg.id;
    
    // Navigate to listing detail page where user can select date
    navigate(`/listing/${itemId}`);
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
  
  const handleCardClick = () => {
    const itemId = pkg.packageId || pkg.id;
    navigate(`/listing/${itemId}`);
  };

  return (
    <>
      <Card 
        className={cn(
          "group transition-all duration-300 overflow-hidden cursor-pointer",
          isPackage 
            ? "hover:shadow-2xl hover:-translate-y-2 border-2 border-primary/20 hover:border-primary/40 rounded-xl" // More prominent for packages
            : "hover:shadow-xl hover:-translate-y-1 rounded-lg" // Standard for listings
        )}
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={pkg.images[0] || 'https://via.placeholder.com/400x300'}
            alt={pkg.packageName || pkg.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Availability badge - Subtle */}
          {pkg.availability && (
            <div className="absolute top-2 right-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full shadow-sm',
                  pkg.availability === 'available' && 'bg-green-500',
                  pkg.availability === 'limited' && 'bg-yellow-500',
                  pkg.availability === 'booked' && 'bg-red-500'
                )}
                title={pkg.availability === 'available' ? 'Available' : pkg.availability === 'limited' ? 'Limited' : 'Booked'}
              />
            </div>
          )}
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Badges Row - Compact */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {pkg.type === 'package' && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
              <Package className="h-2.5 w-2.5 mr-0.5" />
              Package
            </Badge>
          )}
          {pkg.isPopular && (
            <Badge className="bg-orange-500/10 text-orange-600 border-orange-200 text-[10px] px-1.5 py-0 h-4 font-medium">
              🔥 Popular
            </Badge>
          )}
          {pkg.isTrending && (
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 text-[10px] px-1.5 py-0 h-4 font-medium">
              ⭐ Trending
            </Badge>
          )}
        </div>

        {/* Listing Name - Prominent */}
        <h3 className={cn(
          "font-bold text-foreground line-clamp-2 leading-tight",
          isPackage ? "text-sm" : "text-sm"
        )}>
          {pkg.packageName || pkg.name}
        </h3>

        {/* Vendor Name - Subtle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleVendorClick(e);
          }}
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors text-left"
        >
          by {pkg.vendorName}
        </button>

        {/* Rating & Location - Compact */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {pkg.vendorRating !== undefined && pkg.vendorRating !== null && (
            <>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">{pkg.vendorRating.toFixed(1)}</span>
              {pkg.vendorReviewCount !== undefined && pkg.vendorReviewCount !== null && (
                <span>({pkg.vendorReviewCount})</span>
              )}
            </>
          )}
          {pkg.vendorCity && (
            <>
              <span className="mx-0.5">•</span>
              <MapPin className="h-3 w-3" />
              <span>{pkg.vendorCity}</span>
            </>
          )}
        </div>

        {/* Price - Prominent */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="font-bold text-primary text-base">
            ₹{(pkg.price || 0).toLocaleString('en-IN')}
          </div>
          {pkg.deliveryTime && (
            <div className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              <span>{pkg.deliveryTime}</span>
            </div>
          )}
        </div>

        {/* Key Inclusions - Compact (only for packages) */}
        {pkg.type === 'package' && displayedInclusions.length > 0 && (
          <div className="pt-1 border-t border-border/50">
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap">
              <CheckCircle2 className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
              <span className="line-clamp-1">
                {displayedInclusions.slice(0, 2).join(' • ')}
                {displayedInclusions.length > 2 && ` +${displayedInclusions.length - 2} more`}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons - Compact */}
        <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-[11px] px-2"
            onClick={handleViewDetails}
          >
            View
          </Button>
          <Button
            size="sm"
            className="flex-1 h-7 text-[11px] px-2"
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
