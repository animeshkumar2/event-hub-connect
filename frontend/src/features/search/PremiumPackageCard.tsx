import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Check, X, Clock, AlertCircle, ShoppingCart, Settings, Grid3x3 } from 'lucide-react';
import { Package, categories } from '@/shared/constants/mockData';
import { cn } from '@/shared/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog';
import { PackageCustomization } from '@/features/vendor/PackageCustomization';
import { useNavigate } from 'react-router-dom';

interface PremiumPackageCardProps {
  pkg: Package;
  vendorId: string;
  vendorName: string;
  vendorCategory?: string; // Vendor's category for fallback
  onBook: (pkg: Package, addOns: any[], customizations: any[]) => void;
  theme?: 'wedding' | 'dj' | 'birthday' | 'corporate';
  showOtherPackagesButton?: boolean;
  onShowOtherPackages?: () => void;
}

const themeColors = {
  wedding: {
    accent: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  dj: {
    accent: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  birthday: {
    accent: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  corporate: {
    accent: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
};

export const PremiumPackageCard = ({ 
  pkg, 
  vendorId, 
  vendorName,
  vendorCategory,
  onBook,
  theme = 'wedding',
  showOtherPackagesButton = false,
  onShowOtherPackages
}: PremiumPackageCardProps) => {
  const navigate = useNavigate();
  const colors = themeColors[theme];
  const packageCategory = pkg.category || vendorCategory || '';
  const categoryName = categories.find(c => c.id === packageCategory)?.name || packageCategory;

  const handleCardClick = () => {
    // Navigate to listing detail page
    if (pkg.id) {
      navigate(`/listing/${pkg.id}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden rounded-xl border-border cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="relative aspect-video overflow-hidden group">
        <img
          src={pkg.images?.[0] || 'https://via.placeholder.com/400x300'}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {/* Subtle gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges Container - Top Left */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white font-semibold px-2 py-0.5 rounded-full shadow-lg border-0 text-[10px] backdrop-blur-sm">
            📦 Package
          </Badge>
          {categoryName && (
            <Badge className="bg-white/90 backdrop-blur-md text-foreground font-medium px-2 py-0.5 rounded-full shadow-md border border-white/20 text-[10px]">
              {categoryName}
            </Badge>
          )}
        </div>
        
        {/* Price Badge - Top Right */}
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-white/95 backdrop-blur-md text-foreground font-bold text-base px-3 py-1 rounded-full shadow-xl border-0">
            ₹{pkg.price.toLocaleString()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{pkg.name}</h3>
          {pkg.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
          )}
        </div>

        {/* Included Items */}
        {(pkg.includedItems || []).length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-1.5 text-xs">
              <Check className={cn('h-3 w-3 text-green-600')} />
              What's Included:
            </h4>
            <ul className="space-y-1">
              {(pkg.includedItems || []).slice(0, 3).map((item, index) => (
                <li key={index} className="flex items-start gap-1.5 text-xs">
                  <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
              {(pkg.includedItems || []).length > 3 && (
                <li className="text-[10px] text-muted-foreground pl-4.5">
                  +{(pkg.includedItems || []).length - 3} more items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Excluded Items */}
        {pkg.excludedItems && pkg.excludedItems.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-1.5 text-xs">
              <X className="h-3 w-3 text-red-600" />
              Not Included:
            </h4>
            <ul className="space-y-1">
              {(pkg.excludedItems || []).slice(0, 2).map((item, index) => (
                <li key={index} className="flex items-start gap-1.5 text-xs">
                  <X className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delivery Time */}
        {pkg.deliveryTime && (
          <div className={cn('p-2 rounded-lg', colors.bg)}>
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className={cn('h-3 w-3', colors.accent)} />
              <span className={cn('font-medium', colors.accent)}>
                Delivery: {pkg.deliveryTime}
              </span>
            </div>
          </div>
        )}

        {/* Extra Charges */}
        {pkg.extraCharges && pkg.extraCharges.length > 0 && (
          <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-1.5 text-xs">
              <AlertCircle className="h-3 w-3 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-900 mb-0.5">Extra Charges:</div>
                <ul className="space-y-0.5">
                  {pkg.extraCharges.slice(0, 2).map((charge, index) => (
                    <li key={index} className="text-[10px] text-yellow-800">• {charge}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Add-ons Preview */}
        {pkg.addOns && pkg.addOns.length > 0 && (
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">
              {pkg.addOns.length} add-on{pkg.addOns.length > 1 ? 's' : ''} available
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(pkg.addOns || []).slice(0, 3).map((addon) => (
                <Badge key={addon.id} variant="outline" className="text-[10px]">
                  {addon.title} (+₹{addon.price.toLocaleString()})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Show Other Packages Button */}
        {showOtherPackagesButton && onShowOtherPackages && (
          <div className="pt-2 border-t" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onShowOtherPackages}
            >
              <Grid3x3 className="mr-2 h-3 w-3" />
              Show Other Packages
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="mr-1.5 h-3.5 w-3.5" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <PackageCustomization
                pkg={pkg}
                onCustomize={(addOns, customizations) => {
                  const totalPrice =
                    pkg.price +
                    addOns.reduce((sum, a) => sum + a.price, 0) +
                    customizations.reduce((sum, c) => sum + c.price, 0);
                  onBook(pkg, addOns, customizations);
                }}
              />
            </DialogContent>
          </Dialog>
          <Button 
            size="sm"
            className="flex-1"
            onClick={() => onBook(pkg, [], [])}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

