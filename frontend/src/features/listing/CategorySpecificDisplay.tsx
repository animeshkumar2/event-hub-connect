import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  IndianRupee, Users, Utensils, Camera, Video, Palette, Music, 
  Lightbulb, Sparkles, Clock, MapPin, CheckCircle2, XCircle,
  Car, Volume2, Heart, Star, Zap, Gift, Flower2,
  Building2, PartyPopper, BookOpen, Brush, Crown, Gem,
  ImageIcon, Film, Package, Eye, Timer
} from 'lucide-react';

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

  if (Object.keys(data).length === 0) return null;

  // ============ COMPACT HELPER COMPONENTS ============
  
  const StatCard = ({ icon: Icon, label, value, suffix, highlight = false }: {
    icon: any; label: string; value: any; suffix?: string; highlight?: boolean;
  }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className={`flex flex-col items-center p-2 rounded-lg border ${
        highlight ? 'bg-primary/10 border-primary/20' : 'bg-slate-50 border-slate-200'
      }`}>
        <Icon className={`h-4 w-4 mb-1 ${highlight ? 'text-primary' : 'text-slate-400'}`} />
        <span className="text-sm font-bold text-slate-900">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          {suffix && <span className="text-[10px] font-normal text-slate-500 ml-0.5">{suffix}</span>}
        </span>
        <span className="text-[9px] text-slate-500 text-center leading-tight">{label}</span>
      </div>
    );
  };

  const PriceDisplay = ({ label, value, subtitle }: { label: string; value: any; subtitle?: string }) => {
    if (value === null || value === undefined || value === '' || value === 0) return null;
    return (
      <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200">
        <div>
          <p className="text-[10px] text-slate-500">{label}</p>
          {subtitle && <p className="text-[9px] text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center text-green-600 font-bold text-sm">
          <IndianRupee className="h-3 w-3 mr-0.5" />
          {Number(value).toLocaleString('en-IN')}
        </div>
      </div>
    );
  };

  const FeatureItem = ({ icon: Icon, label, value }: {
    icon?: any; label: string; value: any;
  }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50">
        {Icon && <Icon className="h-3 w-3 text-primary flex-shrink-0" />}
        <span className="text-[10px] text-slate-500 flex-1">{label}</span>
        <span className="text-[10px] font-medium text-slate-700">{value}</span>
      </div>
    );
  };

  const BooleanFeature = ({ label, value }: { label: string; value: any }) => {
    if (value === null || value === undefined) return null;
    return (
      <div className={`flex items-center gap-1.5 p-1.5 rounded text-[10px] ${
        value ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'
      }`}>
        {value ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        <span>{label}</span>
      </div>
    );
  };

  const TagsDisplay = ({ label, icon: Icon, values }: {
    label: string; icon?: any; values: any;
  }) => {
    const items = Array.isArray(values) ? values : (typeof values === 'string' ? values.split(',').map(s => s.trim()) : []);
    if (items.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="h-3 w-3 text-primary" />}
          <span className="text-[10px] font-medium text-slate-700">{label}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {items.map((item: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-[9px] h-5 px-1.5 bg-primary/10 text-primary">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 mb-2">
      <div className="p-1 rounded bg-primary/10">
        <Icon className="h-3 w-3 text-primary" />
      </div>
      <h3 className="text-xs font-semibold text-slate-800">{title}</h3>
    </div>
  );

  // ============ COMPACT CATEGORY RENDERS ============

  const renderCaterer = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Utensils} label="Veg/Plate" value={data.pricePerPlateVeg} suffix="₹" highlight />
        {data.pricePerPlateNonVeg && <StatCard icon={Utensils} label="Non-Veg" value={data.pricePerPlateNonVeg} suffix="₹" />}
        <StatCard icon={Users} label="Min Guests" value={data.minGuests} />
        {data.maxGuests && <StatCard icon={Users} label="Max Guests" value={data.maxGuests} />}
      </div>
      {data.serviceStyle && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
          <PartyPopper className="h-3.5 w-3.5 text-orange-600" />
          <span className="text-[10px] text-slate-500">Style:</span>
          <span className="text-[10px] font-medium text-slate-700">{data.serviceStyle}</span>
        </div>
      )}
      <TagsDisplay label="Cuisines" icon={Utensils} values={data.cuisineType} />
      <TagsDisplay label="Includes" icon={Gift} values={data.includes} />
      {data.liveCounters && (
        <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
          <div className="flex items-center gap-1.5 text-[10px] text-purple-700">
            <Zap className="h-3 w-3" />
            <span className="font-medium">Live Counters Available</span>
          </div>
        </div>
      )}
    </div>
  );


  const renderPhotographer = () => (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-100">
              {data.serviceType?.includes('Video') ? <Film className="h-3.5 w-3.5 text-blue-600" /> : <Camera className="h-3.5 w-3.5 text-blue-600" />}
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Service Type</p>
              <p className="text-xs font-semibold text-slate-800">{data.serviceType || 'Photography'}</p>
            </div>
          </div>
          {data.price && (
            <div className="text-right">
              <p className="text-[9px] text-slate-500">{data.pricingType || 'Package Price'}</p>
              <p className="text-sm font-bold text-primary flex items-center">
                <IndianRupee className="h-3 w-3" />
                {Number(data.price).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {data.durationHours && <StatCard icon={Clock} label="Duration" value={data.durationHours} suffix="hrs" />}
        {data.editedPhotos && <StatCard icon={ImageIcon} label="Edited Photos" value={data.editedPhotos} highlight />}
        {data.teamSize && <StatCard icon={Users} label="Team" value={data.teamSize} />}
      </div>
      <SectionHeader icon={Package} title="What You'll Receive" />
      <div className="grid grid-cols-2 gap-1.5">
        <BooleanFeature label="Raw Photos" value={data.rawPhotos} />
        {data.highlightVideo && (
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-green-50 text-[10px] text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            <span>Highlight Video{data.highlightVideoMinutes ? ` (${data.highlightVideoMinutes} min)` : ''}</span>
          </div>
        )}
        {data.fullVideo && (
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-green-50 text-[10px] text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            <span>Full Video{data.fullVideoMinutes ? ` (${data.fullVideoMinutes} min)` : ''}</span>
          </div>
        )}
        <BooleanFeature label="Drone Coverage" value={data.droneIncluded} />
        {data.albumIncluded && (
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-green-50 text-[10px] text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            <span>Physical Album{data.albumPages ? ` (${data.albumPages} pages)` : ''}</span>
          </div>
        )}
        <BooleanFeature label="Pre-Wedding Shoot" value={data.preWeddingIncluded} />
      </div>
    </div>
  );

  const renderVenue = () => (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-100">
              <Building2 className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Venue Type</p>
              <p className="text-xs font-semibold text-slate-800">{data.venueType || 'Event Venue'}</p>
            </div>
          </div>
          {data.price && (
            <div className="text-right">
              <p className="text-[9px] text-slate-500">{data.pricingType || 'Rental'}</p>
              <p className="text-sm font-bold text-primary flex items-center">
                <IndianRupee className="h-3 w-3" />
                {Number(data.price).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Users} label="Seating" value={data.capacitySeating} highlight />
        {data.capacityStanding && <StatCard icon={Users} label="Standing" value={data.capacityStanding} />}
        {data.areaSquareFeet && <StatCard icon={MapPin} label="Area" value={data.areaSquareFeet} suffix="sqft" />}
        {data.parkingCapacity && <StatCard icon={Car} label="Parking" value={data.parkingCapacity} />}
      </div>
      <TagsDisplay label="Amenities" icon={Star} values={data.amenities} />
      <div className="grid grid-cols-2 gap-1.5">
        {data.cateringPolicy && <FeatureItem icon={Utensils} label="Catering" value={data.cateringPolicy} />}
        {data.alcoholPolicy && <FeatureItem icon={PartyPopper} label="Alcohol" value={data.alcoholPolicy} />}
        <BooleanFeature label="Overnight Events" value={data.overnightAllowed} />
      </div>
    </div>
  );

  const renderDecorator = () => (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-pink-100">
              <Flower2 className="h-3.5 w-3.5 text-pink-600" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Décor Package</p>
              <p className="text-xs font-semibold text-slate-800">{data.theme || 'Custom Decoration'}</p>
            </div>
          </div>
          {data.price && (
            <div className="text-right">
              <p className="text-[9px] text-slate-500">Starting</p>
              <p className="text-sm font-bold text-primary flex items-center">
                <IndianRupee className="h-3 w-3" />
                {Number(data.price).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </div>
      {data.coverageArea && (
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={MapPin} label="Coverage" value={data.coverageArea} suffix="sqft" highlight />
          {data.tableCenterpieces && <StatCard icon={Flower2} label="Centerpieces" value={data.tableCenterpieces} />}
        </div>
      )}
      <TagsDisplay label="Décor Services" icon={Palette} values={data.decorType} />
      <TagsDisplay label="Includes" icon={Gift} values={data.includes} />
      <div className="grid grid-cols-2 gap-1.5">
        <BooleanFeature label="Stage Backdrop" value={data.stageBackdrop} />
        <BooleanFeature label="Entrance Arch" value={data.entranceArch} />
        <BooleanFeature label="Ceiling Draping" value={data.ceilingDraping} />
        <BooleanFeature label="Dismantling" value={data.dismantlingIncluded} />
      </div>
    </div>
  );


  const renderMUA = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {data.bridalPrice && (
          <div className="p-2 rounded-lg bg-pink-50 border border-pink-200 text-center">
            <Crown className="h-3.5 w-3.5 text-pink-600 mx-auto mb-1" />
            <p className="text-[9px] text-slate-500">Bridal</p>
            <p className="text-sm font-bold text-pink-600 flex items-center justify-center">
              <IndianRupee className="h-3 w-3" />
              {Number(data.bridalPrice).toLocaleString('en-IN')}
            </p>
          </div>
        )}
        {data.familyPrice && (
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <Heart className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
            <p className="text-[9px] text-slate-500">Family</p>
            <p className="text-xs font-bold text-slate-700 flex items-center justify-center">
              <IndianRupee className="h-2.5 w-2.5" />
              {Number(data.familyPrice).toLocaleString('en-IN')}
            </p>
          </div>
        )}
        {data.guestPrice && (
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <Users className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
            <p className="text-[9px] text-slate-500">Guest</p>
            <p className="text-xs font-bold text-slate-700 flex items-center justify-center">
              <IndianRupee className="h-2.5 w-2.5" />
              {Number(data.guestPrice).toLocaleString('en-IN')}
            </p>
          </div>
        )}
      </div>
      <TagsDisplay label="Services For" icon={Users} values={data.serviceFor} />
      <TagsDisplay label="Services Included" icon={Brush} values={data.servicesIncluded} />
      <div className="grid grid-cols-2 gap-1.5">
        {data.makeupType && <FeatureItem icon={Gem} label="Type" value={data.makeupType} />}
        {data.productsUsed && <FeatureItem icon={Star} label="Products" value={data.productsUsed} />}
        {data.numberOfLooks && <FeatureItem icon={Eye} label="Looks" value={data.numberOfLooks} />}
        {data.touchupHours && <FeatureItem icon={Clock} label="Touch-up" value={`${data.touchupHours}hrs`} />}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <BooleanFeature label="Trial Session" value={data.trialIncluded} />
        {data.travelIncludedKm && (
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-blue-50 text-[10px] text-blue-700">
            <Car className="h-3 w-3" />
            <span>Travel: {data.travelIncludedKm}km free</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderDJ = () => (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-purple-100">
              <Music className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Entertainment</p>
              <p className="text-xs font-semibold text-slate-800">{data.serviceType || 'DJ Services'}</p>
            </div>
          </div>
          {data.price && (
            <div className="text-right">
              <p className="text-[9px] text-slate-500">{data.pricingType || 'Package'}</p>
              <p className="text-sm font-bold text-primary flex items-center">
                <IndianRupee className="h-3 w-3" />
                {Number(data.price).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {data.durationHours && <StatCard icon={Clock} label="Duration" value={data.durationHours} suffix="hrs" highlight />}
        {data.soundSystemWattage && <StatCard icon={Volume2} label="Sound" value={data.soundSystemWattage} suffix="W" />}
        {data.teamSize && <StatCard icon={Users} label="Team" value={data.teamSize} />}
        {data.extraHourPrice && <StatCard icon={Timer} label="Extra Hr" value={data.extraHourPrice} suffix="₹" />}
      </div>
      <TagsDisplay label="Equipment" icon={Lightbulb} values={data.equipmentIncluded} />
      <TagsDisplay label="Music Genres" icon={Music} values={data.musicGenre} />
      {data.customPlaylist !== undefined && <BooleanFeature label="Custom Playlist Accepted" value={data.customPlaylist} />}
    </div>
  );

  const renderSoundLights = () => (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-yellow-100">
              <Lightbulb className="h-3.5 w-3.5 text-yellow-600" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Sound & Lighting</p>
              <p className="text-xs font-semibold text-slate-800">Professional Equipment</p>
            </div>
          </div>
          {data.price && (
            <div className="text-right">
              <p className="text-[9px] text-slate-500">Per Day</p>
              <p className="text-sm font-bold text-primary flex items-center">
                <IndianRupee className="h-3 w-3" />
                {Number(data.price).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {data.durationDays && <StatCard icon={Clock} label="Days" value={data.durationDays} />}
        {data.coverageArea && <StatCard icon={MapPin} label="Coverage" value={data.coverageArea} suffix="sqft" highlight />}
        {data.powerRequirement && <StatCard icon={Zap} label="Power" value={data.powerRequirement} suffix="KW" />}
        {data.teamSize && <StatCard icon={Users} label="Techs" value={data.teamSize} />}
      </div>
      <TagsDisplay label="Equipment" icon={Lightbulb} values={data.equipmentType} />
      <div className="grid grid-cols-2 gap-1.5">
        <BooleanFeature label="Setup Included" value={data.setupIncluded} />
        <BooleanFeature label="Dismantling" value={data.dismantlingIncluded} />
      </div>
      {data.extraDayPrice && <PriceDisplay label="Extra Day" value={data.extraDayPrice} />}
    </div>
  );


  const renderGeneric = () => (
    <div className="space-y-2">
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined || value === '') return null;
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        if (typeof value === 'boolean') {
          return <BooleanFeature key={key} label={label} value={value} />;
        }
        if (Array.isArray(value)) {
          return <div key={key}><TagsDisplay label={label} values={value} /></div>;
        }
        if (typeof value === 'number' && (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost'))) {
          return <PriceDisplay key={key} label={label} value={value} />;
        }
        return <FeatureItem key={key} label={label} value={String(value)} />;
      })}
    </div>
  );

  // ============ CATEGORY HEADER & ROUTING ============

  const getCategoryInfo = () => {
    switch (categoryId) {
      case 'caterer':
        return { icon: Utensils, title: 'Catering Details', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'photographer':
      case 'photography-videography':
      case 'cinematographer':
      case 'videographer':
        return { icon: Camera, title: 'Photography & Videography', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'venue':
        return { icon: Building2, title: 'Venue Details', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'decorator':
        return { icon: Palette, title: 'Decoration Details', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' };
      case 'mua':
        return { icon: Sparkles, title: 'Makeup & Styling', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' };
      case 'dj':
      case 'dj-entertainment':
      case 'live-music':
        return { icon: Music, title: 'Entertainment Details', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
      case 'sound-lights':
        return { icon: Lightbulb, title: 'Sound & Lighting', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      default:
        return { icon: Sparkles, title: 'Service Details', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
    }
  };

  const renderContent = () => {
    switch (categoryId) {
      case 'caterer': return renderCaterer();
      case 'photographer':
      case 'photography-videography':
      case 'cinematographer':
      case 'videographer': return renderPhotographer();
      case 'venue': return renderVenue();
      case 'decorator': return renderDecorator();
      case 'mua': return renderMUA();
      case 'dj':
      case 'dj-entertainment':
      case 'live-music': return renderDJ();
      case 'sound-lights': return renderSoundLights();
      default: return renderGeneric();
    }
  };

  const categoryInfo = getCategoryInfo();
  const Icon = categoryInfo.icon;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className={`flex items-center gap-2 pb-2 mb-3 border-b ${categoryInfo.border}`}>
          <div className={`p-1.5 rounded-lg ${categoryInfo.bg}`}>
            <Icon className={`h-4 w-4 ${categoryInfo.color}`} />
          </div>
          <h3 className="text-xs font-semibold text-slate-800">{categoryInfo.title}</h3>
        </div>
        {renderContent()}
      </CardContent>
    </Card>
  );
};
