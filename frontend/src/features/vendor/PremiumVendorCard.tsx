import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Star, MapPin, ShoppingCart } from 'lucide-react';
import { Vendor } from '@/shared/constants/mockData';
import { useCart } from '@/shared/contexts/CartContext';
import { useToast } from '@/shared/hooks/use-toast';

interface PremiumVendorCardProps {
  vendor: Vendor;
}

export const PremiumVendorCard = ({ vendor }: PremiumVendorCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (vendor.packages.length > 0) {
      const pkg = vendor.packages[0];
      addToCart({
        vendorId: vendor.id,
        vendorName: vendor.businessName,
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        basePrice: pkg.price,
        addOns: [],
        quantity: 1,
      });
      
      toast({
        title: 'Added to Cart',
        description: `${pkg.name} has been added to your cart`,
      });
    }
  };

  return (
    <Link to={`/vendor/${vendor.id}?tab=packages`}>
      <Card className="group overflow-hidden cursor-pointer transition-all duration-500 hover-lift rounded-2xl border-0 shadow-card">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={vendor.coverImage}
            alt={vendor.businessName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className="absolute top-4 right-4 p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white"
          >
            <ShoppingCart className="h-5 w-5 text-foreground" />
          </button>

          {/* Rating Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/95 backdrop-blur-sm text-foreground font-semibold px-3 py-1.5 rounded-full shadow-lg">
              <Star className="h-3 w-3 fill-secondary text-secondary mr-1" />
              {vendor.rating.toFixed(1)}
            </Badge>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="capitalize backdrop-blur-sm bg-white/90">
              {vendor.category}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-xl text-foreground line-clamp-1 mb-1">
                {vendor.businessName}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>{vendor.city}</span>
                {vendor.coverageRadius && (
                  <span className="text-xs">· {vendor.coverageRadius}km radius</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <div className="text-xs text-muted-foreground">Starting at</div>
                <div className="font-bold text-xl text-primary">
                  ₹{vendor.startingPrice.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{vendor.reviewCount} reviews</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(vendor.rating)
                          ? 'fill-secondary text-secondary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
