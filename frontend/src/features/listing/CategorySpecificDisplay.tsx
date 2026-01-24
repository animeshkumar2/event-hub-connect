import { Card, CardContent } from '@/shared/components/ui/card';
import { IndianRupee, Users, Utensils, Camera, Video, Palette } from 'lucide-react';

interface CategorySpecificDisplayProps {
  categoryId: string;
  categorySpecificData: string | null;
}

export const CategorySpecificDisplay = ({ categoryId, categorySpecificData }: CategorySpecificDisplayProps) => {
  if (!categorySpecificData) return null;

  let data: Record<string, any> = {};
  try {
    data = JSON.parse(categorySpecificData);
  } catch {
    return null;
  }

  // If no data, don't render
  if (Object.keys(data).length === 0) return null;

  const renderField = (label: string, value: any, icon?: React.ReactNode) => {
    if (value === null || value === undefined || value === '') return null;
    
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold text-primary">
          {typeof value === 'number' ? (
            <span className="flex items-center">
              <IndianRupee className="h-3 w-3 mr-0.5" />
              {value.toLocaleString('en-IN')}
            </span>
          ) : (
            value
          )}
        </span>
      </div>
    );
  };

  // Catering-specific fields
  if (categoryId === 'caterer') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Catering Details
          </h2>
          <div className="space-y-2">
            {renderField('Service Type', data.serviceType)}
            {renderField('Cuisine Type', data.cuisineType)}
            {renderField('Veg Price (per plate)', data.pricePerPlateVeg, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Non-Veg Price (per plate)', data.pricePerPlateNonVeg, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Minimum Guests', data.minimumGuests, <Users className="h-4 w-4 text-primary" />)}
            {renderField('Maximum Guests', data.maximumGuests, <Users className="h-4 w-4 text-primary" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Photography/Videography fields
  if (categoryId === 'photographer' || categoryId === 'cinematographer' || categoryId === 'videographer') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            {categoryId === 'photographer' ? <Camera className="h-5 w-5 text-primary" /> : <Video className="h-5 w-5 text-primary" />}
            Service Details
          </h2>
          <div className="space-y-2">
            {renderField('Service Type', data.serviceType)}
            {renderField('Coverage Duration', data.coverageDuration)}
            {renderField('Photography Price', data.photographyPrice, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Videography Price', data.videographyPrice, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Deliverables', data.deliverables)}
            {renderField('Equipment', data.equipment)}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Decorator fields
  if (categoryId === 'decorator') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Decoration Details
          </h2>
          <div className="space-y-2">
            {renderField('Service Type', data.serviceType)}
            {renderField('Decoration Style', data.decorationStyle)}
            {renderField('Price', data.price, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Setup Time', data.setupTime)}
            {renderField('Coverage Area', data.coverageArea)}
          </div>
        </CardContent>
      </Card>
    );
  }

  // MUA fields
  if (categoryId === 'mua') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Makeup & Styling Details</h2>
          <div className="space-y-2">
            {renderField('Service Type', data.serviceType)}
            {renderField('Bridal Price', data.bridalPrice, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Non-Bridal Price', data.nonBridalPrice, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Hair Styling', data.hairStyling)}
            {renderField('Draping', data.draping)}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Venue fields
  if (categoryId === 'venue') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Venue Details</h2>
          <div className="space-y-2">
            {renderField('Venue Type', data.venueType)}
            {renderField('Capacity', data.capacity, <Users className="h-4 w-4 text-primary" />)}
            {renderField('Price', data.price, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Pricing Type', data.pricingType)}
            {renderField('Indoor/Outdoor', data.indoorOutdoor)}
            {renderField('Parking Available', data.parkingAvailable ? 'Yes' : 'No')}
            {renderField('AC Available', data.acAvailable ? 'Yes' : 'No')}
          </div>
        </CardContent>
      </Card>
    );
  }

  // DJ/Entertainment fields
  if (categoryId === 'dj' || categoryId === 'live-music') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Entertainment Details</h2>
          <div className="space-y-2">
            {renderField('Service Type', data.serviceType)}
            {renderField('Performance Duration', data.performanceDuration)}
            {renderField('Price', data.price, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Equipment Included', data.equipmentIncluded ? 'Yes' : 'No')}
            {renderField('Genre/Style', data.genreStyle)}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sound & Lights fields
  if (categoryId === 'sound-lights') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Sound & Lights Details</h2>
          <div className="space-y-2">
            {renderField('Service Type', data.serviceType)}
            {renderField('Price', data.price, <IndianRupee className="h-4 w-4 text-primary" />)}
            {renderField('Equipment Type', data.equipmentType)}
            {renderField('Coverage Area', data.coverageArea)}
            {renderField('Setup Time', data.setupTime)}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generic fallback for other categories
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Service Details</h2>
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => {
            if (value === null || value === undefined || value === '') return null;
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return renderField(label, value);
          })}
        </div>
      </CardContent>
    </Card>
  );
};
