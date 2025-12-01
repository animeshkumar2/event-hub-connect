import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { FlattenedPackage } from '@/utils/packageUtils';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { getVendorById } from '@/data/mockData';

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

  const handleVendorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/vendor/${pkg.vendorId}?tab=packages`);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(pkg.packageId, pkg.vendorId);
    } else {
      // Navigate to vendor profile with package highlighted in packages tab
      navigate(`/vendor/${pkg.vendorId}?tab=packages&packageId=${pkg.packageId}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookNow) {
      onBookNow(pkg.packageId, pkg.vendorId);
    } else {
      // Add to cart functionality
      const vendor = getVendorById(pkg.vendorId);
      const vendorPackage = vendor?.packages.find(p => p.id === pkg.packageId);
      
      if (vendorPackage) {
        addToCart({
          vendorId: pkg.vendorId,
          vendorName: pkg.vendorName,
          packageId: pkg.packageId,
          packageName: pkg.packageName,
          price: pkg.price,
          basePrice: vendorPackage.price,
          addOns: [],
          quantity: 1,
        });

        toast({
          title: 'Added to Cart!',
          description: `${pkg.packageName} has been added to your cart`,
        });
      }
    }
  };

  // Get first 5 inclusions or all if less than 5
  const displayedInclusions = pkg.includedItems.slice(0, 5);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={pkg.images[0] || 'https://via.placeholder.com/400x300'}
          alt={pkg.packageName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex gap-1">
          {pkg.isPopular && (
            <Badge className="bg-orange-500 text-white border-none shadow-md text-xs px-2 py-0.5">
              🔥 Popular
            </Badge>
          )}
          {pkg.isTrending && (
            <Badge className="bg-purple-500 text-white border-none shadow-md text-xs px-2 py-0.5">
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

      <CardContent className="p-4">
        {/* Vendor Name - Clickable */}
        <button
          onClick={handleVendorClick}
          className="text-xs text-primary font-semibold hover:underline mb-1 text-left"
        >
          {pkg.vendorName}
        </button>

        {/* Package Name */}
        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-1">
          {pkg.packageName}
        </h3>

        {/* Rating, Location, and High Rating Badge - All in one line */}
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground">{pkg.vendorRating.toFixed(1)}</span>
            <span>({pkg.vendorReviewCount})</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{pkg.vendorCity}</span>
          </div>
          {pkg.vendorRating > 4.5 && (
            <>
              <span>•</span>
              <span className="text-yellow-600 font-medium">⭐ Highly Rated</span>
            </>
          )}
        </div>

        {/* Price and Delivery Time */}
        <div className="mb-3 flex items-baseline justify-between">
          <div className="text-xl font-bold text-primary">
            ₹{pkg.price.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="line-clamp-1">{pkg.deliveryTime}</span>
          </div>
        </div>

        {/* Key Inclusions - Horizontal */}
        <div className="mb-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
            {displayedInclusions.slice(0, 3).map((item, index) => (
              <React.Fragment key={index}>
                <span className="line-clamp-1">{item}</span>
                {index < Math.min(2, displayedInclusions.length - 1) && <span>•</span>}
              </React.Fragment>
            ))}
            {pkg.includedItems.length > 3 && (
              <span className="text-primary font-medium">
                +{pkg.includedItems.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={handleViewDetails}
          >
            Details
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
