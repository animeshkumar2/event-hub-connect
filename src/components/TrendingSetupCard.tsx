import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BookableSetup, getVendorById } from '@/data/mockData';

interface TrendingSetupCardProps {
  setup: BookableSetup;
  vendorName: string;
  eventType?: string;
  city?: string;
}

export const TrendingSetupCard = ({ setup, vendorName, eventType, city }: TrendingSetupCardProps) => {
  // Try to find matching package
  const vendor = getVendorById(setup.vendorId);
  let packageId = setup.packageId;
  
  if (!packageId && vendor) {
    // Try to find a package that matches the setup title
    const matchingPackage = vendor.packages.find(
      pkg => pkg.name.toLowerCase().includes(setup.title.toLowerCase().split(' ')[0]) ||
             setup.title.toLowerCase().includes(pkg.name.toLowerCase().split(' ')[0])
    );
    if (matchingPackage) {
      packageId = matchingPackage.id;
    }
  }
  
  const detailsUrl = packageId 
    ? `/vendor/${setup.vendorId}?tab=packages&packageId=${packageId}`
    : `/vendor/${setup.vendorId}?tab=packages`;

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-lg hover-lift min-w-[320px]">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={setup.image}
          alt={setup.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Price Tag */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/95 text-foreground font-bold text-base px-4 py-2 rounded-full shadow-lg">
            ₹{setup.price.toLocaleString()} · Book This Setup
          </Badge>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{setup.title}</h3>
          <p className="text-sm text-white/90 mb-3 line-clamp-2">{setup.description}</p>
          
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-medium">{vendorName}</span>
            </div>
            {city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{city}</span>
              </div>
            )}
            {eventType && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{eventType}</span>
              </div>
            )}
          </div>

          <Button 
            className="w-full bg-white text-foreground hover:bg-white/90 font-semibold rounded-xl"
            asChild
          >
            <Link to={detailsUrl}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
