import { useMemo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  IndianRupee, Users, Utensils, Camera, Video, Palette, Music, 
  Lightbulb, Sparkles, Clock, MapPin, CheckCircle2, XCircle,
  Car, Volume2, Heart, Star, Zap, Gift, Flower2,
  Building2, PartyPopper, BookOpen, Brush, Crown, Gem,
  ImageIcon, Film, Package, Eye, Timer, Mic, Cpu,
  Layers, Aperture, ArrowUpRight, Tv, Wand2
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

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

  // ============ BALANCED COLOR PALETTE ============
  // Primary brand color with soft complementary tones
  
  // Hero pricing card - brand gradient
  const HeroPricing = ({ icon: Icon, label, value, sublabel }: {
    icon: any; label: string; value: any; sublabel?: string;
  }) => {
    if (!value) return null;
    return (
      <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-lg shadow-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-white/80">{label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <IndianRupee className="h-5 w-5 text-white/70" />
            <span className="text-2xl font-bold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
            </span>
          </div>
          {sublabel && (
            <p className="text-xs text-white/60 mt-1">{sublabel}</p>
          )}
        </div>
      </div>
    );
  };

  // Stat card - soft background with primary accent
  const StatCard = ({ icon: Icon, label, value, suffix, highlight = false }: {
    icon: any; label: string; value: any; suffix?: string; highlight?: boolean;
  }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className={cn(
        "rounded-xl p-3 border transition-all",
        highlight 
          ? "bg-primary/5 border-primary/20" 
          : "bg-slate-50/80 border-slate-100 hover:border-slate-200"
      )}>
        <div className={cn(
          "inline-flex p-1.5 rounded-lg mb-2",
          highlight ? "bg-primary/10" : "bg-slate-100"
        )}>
          <Icon className={cn("h-3.5 w-3.5", highlight ? "text-primary" : "text-slate-500")} />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-lg font-bold",
              highlight ? "text-primary" : "text-slate-800"
            )}>
              {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
            </span>
            {suffix && (
              <span className="text-xs text-slate-400">{suffix}</span>
            )}
          </div>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    );
  };

  // Feature toggle pill - emerald for included
  const FeaturePill = ({ icon: Icon, label, value, description }: {
    icon?: any; label: string; value: any; description?: string;
  }) => {
    if (value === null || value === undefined) return null;
    const isIncluded = value === true || value === 'yes' || value === 'Yes';
    
    return (
      <div className={cn(
        "flex items-center gap-2.5 p-3 rounded-xl border transition-all",
        isIncluded 
          ? "bg-emerald-50/70 border-emerald-200/70 hover:bg-emerald-50" 
          : "bg-slate-50/50 border-slate-100"
      )}>
        <div className={cn(
          "flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center",
          isIncluded ? "bg-emerald-500" : "bg-slate-200"
        )}>
          {isIncluded ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-xs font-medium truncate",
            isIncluded ? "text-slate-700" : "text-slate-400"
          )}>
            {label}
          </p>
          {description && isIncluded && (
            <p className="text-[10px] text-emerald-600 truncate">{description}</p>
          )}
        </div>
      </div>
    );
  };

  // Tags/badges display - primary tinted
  const TagCloud = ({ label, icon: Icon, values }: {
    label: string; icon?: any; values: any;
  }) => {
    const items = Array.isArray(values) ? values : (typeof values === 'string' ? values.split(',').map(s => s.trim()) : []);
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
          )}
          <h4 className="text-xs font-semibold text-slate-700">{label}</h4>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {items.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Section divider - with primary accent
  const SectionDivider = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2.5 py-3">
      <div className="p-1.5 rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <h3 className="text-xs font-semibold text-slate-700">{title}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent ml-2" />
    </div>
  );

  // Info row
  const InfoRow = ({ icon: Icon, label, value, highlight = false }: {
    icon?: any; label: string; value: any; highlight?: boolean;
  }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className={cn(
        "flex items-center justify-between py-2.5 px-3 rounded-xl",
        highlight ? "bg-primary/5" : "bg-slate-50/50"
      )}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
          <span className="text-xs text-slate-500">{label}</span>
        </div>
        <span className={cn(
          "text-xs font-semibold",
          highlight ? "text-primary" : "text-slate-700"
        )}>
          {value}
        </span>
      </div>
    );
  };

  // Highlight info box - for duration, extra charges etc
  const InfoBox = ({ icon: Icon, label, value, variant = 'default' }: {
    icon: any; label: string; value: string; variant?: 'default' | 'warning' | 'info';
  }) => {
    const variants = {
      default: 'bg-slate-50 border-slate-200 text-slate-600',
      warning: 'bg-amber-50 border-amber-200 text-amber-700',
      info: 'bg-blue-50 border-blue-200 text-blue-700',
    };
    return (
      <div className={cn("flex items-center gap-2.5 p-3 rounded-xl border", variants[variant])}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}: {value}</span>
      </div>
    );
  };

  // ============ CATEGORY-SPECIFIC RENDERS ============

  const renderPhotographer = () => {
    return (
      <div className="space-y-4">
        {/* Hero Pricing Section */}
        <div className="grid grid-cols-2 gap-3">
          <HeroPricing
            icon={data.serviceType?.includes('Video') ? Film : Camera}
            label={data.serviceType || 'Photography'}
            value={data.price}
            sublabel={data.pricingType || 'Per Event'}
          />
          <div className="space-y-2">
            <StatCard icon={ImageIcon} label="Edited Photos" value={data.editedPhotos} highlight />
            {data.teamSize && (
              <StatCard icon={Users} label="Team Size" value={data.teamSize} />
            )}
          </div>
        </div>

        {/* Duration */}
        {data.durationHours && (
          <InfoBox icon={Clock} label="Duration" value={`${data.durationHours} hrs`} variant="info" />
        )}

        {/* Deliverables Grid */}
        <SectionDivider icon={Package} title="Included" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          <FeaturePill icon={ImageIcon} label="Raw Photos" value={data.rawPhotos} />
          <FeaturePill 
            icon={Film} 
            label="Highlight Video" 
            value={data.highlightVideo}
            description={data.highlightVideoMinutes ? `${data.highlightVideoMinutes} min` : undefined}
          />
          <FeaturePill 
            icon={Tv} 
            label="Full Video" 
            value={data.fullVideo}
            description={data.fullVideoMinutes ? `${data.fullVideoMinutes} min` : undefined}
          />
          <FeaturePill icon={Aperture} label="Drone" value={data.droneIncluded} />
          <FeaturePill 
            icon={BookOpen} 
            label="Album" 
            value={data.albumIncluded}
            description={data.albumPages ? `${data.albumPages}p` : undefined}
          />
          <FeaturePill icon={Heart} label="Pre-Wedding" value={data.preWeddingIncluded} />
        </div>
      </div>
    );
  };

  const renderCaterer = () => (
    <div className="space-y-4">
      {/* Pricing Cards */}
      <div className="grid grid-cols-2 gap-3">
        <HeroPricing
          icon={Utensils}
          label="Veg"
          value={data.pricePerPlateVeg}
          sublabel="/plate"
        />
        {data.pricePerPlateNonVeg && (
          <HeroPricing
            icon={Utensils}
            label="Non-Veg"
            value={data.pricePerPlateNonVeg}
            sublabel="/plate"
          />
        )}
      </div>

      {/* Guest Capacity & Style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard icon={Users} label="Min Guests" value={data.minGuests} highlight />
        {data.maxGuests && <StatCard icon={Users} label="Max" value={data.maxGuests} />}
        {data.serviceStyle && (
          <div className="col-span-2">
            <InfoBox icon={PartyPopper} label="Style" value={data.serviceStyle} />
          </div>
        )}
      </div>

      {/* Cuisines */}
      <TagCloud label="Cuisines" icon={Utensils} values={data.cuisineType} />

      {/* What's Included */}
      {data.includes && (
        <TagCloud label="Included" icon={Gift} values={data.includes} />
      )}

      {/* Live Counters */}
      {data.liveCounters && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-amber-100">
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-amber-800">Live Counters</p>
          </div>
          {data.liveCounterTypes && (
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(data.liveCounterTypes) ? data.liveCounterTypes : [data.liveCounterTypes]).map((counter: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-amber-700 border border-amber-200">
                  {counter}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menu Preview */}
      {data.menuItems && (
        <>
          <SectionDivider icon={BookOpen} title="Menu" />
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{data.menuItems}</p>
          </div>
        </>
      )}
    </div>
  );

  const renderVenue = () => (
    <div className="space-y-4">
      {/* Hero with Venue Type and Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HeroPricing
          icon={Building2}
          label={data.venueType || 'Venue'}
          value={data.price}
          sublabel={data.pricingType || 'Per Day'}
        />
        <div className="space-y-2">
          <StatCard icon={Users} label="Seating Capacity" value={data.capacitySeating} highlight />
          {data.capacityStanding && (
            <StatCard icon={Users} label="Standing Capacity" value={data.capacityStanding} />
          )}
        </div>
      </div>

      {/* Venue Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data.areaSquareFeet && (
          <StatCard icon={Layers} label="Area" value={data.areaSquareFeet} suffix="sq ft" />
        )}
        {data.parkingCapacity && (
          <StatCard icon={Car} label="Parking" value={data.parkingCapacity} suffix="vehicles" />
        )}
        {data.timingStart && data.timingEnd && (
          <div className="col-span-2">
            <InfoBox icon={Clock} label="Available" value={`${data.timingStart} - ${data.timingEnd}`} variant="info" />
          </div>
        )}
      </div>

      {/* Amenities */}
      {data.amenities && (
        <TagCloud label="Amenities" icon={Star} values={data.amenities} />
      )}

      {/* Policies */}
      <SectionDivider icon={BookOpen} title="Venue Policies" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.cateringPolicy && (
          <InfoRow icon={Utensils} label="Catering" value={data.cateringPolicy} />
        )}
        {data.alcoholPolicy && (
          <InfoRow icon={PartyPopper} label="Alcohol" value={data.alcoholPolicy} />
        )}
        <FeaturePill icon={Clock} label="Overnight Events" value={data.overnightAllowed} />
        {data.peakSeasonSurcharge > 0 && (
          <InfoBox icon={ArrowUpRight} label="Peak season" value={`+${data.peakSeasonSurcharge}%`} variant="warning" />
        )}
      </div>
    </div>
  );

  const renderDecorator = () => (
    <div className="space-y-4">
      {/* Hero Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <HeroPricing
          icon={Palette}
          label={data.theme || 'Custom Décor'}
          value={data.price}
          sublabel="Starting price"
        />
        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          {data.coverageArea && (
            <StatCard icon={Layers} label="Coverage Area" value={data.coverageArea} suffix="sq ft" highlight />
          )}
          {data.tableCenterpieces && (
            <StatCard icon={Flower2} label="Centerpieces" value={data.tableCenterpieces} />
          )}
        </div>
      </div>

      {/* Décor Types */}
      <TagCloud label="Décor Services" icon={Palette} values={data.decorType} />

      {/* What's Included */}
      {data.includes && (
        <TagCloud label="Materials Included" icon={Gift} values={data.includes} />
      )}

      {/* Features Grid */}
      <SectionDivider icon={Sparkles} title="Package Features" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        <FeaturePill icon={Wand2} label="Stage Backdrop" value={data.stageBackdrop} />
        <FeaturePill icon={Flower2} label="Entrance Arch" value={data.entranceArch} />
        <FeaturePill icon={Layers} label="Ceiling Draping" value={data.ceilingDraping} />
        <FeaturePill icon={Flower2} label="Aisle Decoration" value={data.aisleDecoration} />
        <FeaturePill icon={CheckCircle2} label="Dismantling Included" value={data.dismantlingIncluded} />
        <FeaturePill icon={Sparkles} label="Customization Available" value={data.customizationAvailable} />
      </div>
    </div>
  );

  const renderMUA = () => (
    <div className="space-y-4">
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {data.bridalPrice && (
          <HeroPricing
            icon={Crown}
            label="Bridal"
            value={data.bridalPrice}
            sublabel="Premium bridal package"
          />
        )}
        {data.familyPrice && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/50">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-medium text-rose-600">Family</span>
            </div>
            <div className="flex items-baseline gap-1">
              <IndianRupee className="h-4 w-4 text-rose-600" />
              <span className="text-xl font-bold text-rose-700">{Number(data.familyPrice).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-rose-500 mt-1">per person</p>
          </div>
        )}
        {data.guestPrice && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500">Guest</span>
            </div>
            <div className="flex items-baseline gap-1">
              <IndianRupee className="h-4 w-4 text-slate-600" />
              <span className="text-xl font-bold text-slate-800">{Number(data.guestPrice).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">per person</p>
          </div>
        )}
      </div>

      {/* Service For */}
      <TagCloud label="Service For" icon={Users} values={data.serviceFor} />

      {/* Services Included */}
      <TagCloud label="Services Included" icon={Brush} values={data.servicesIncluded} />

      {/* Details Grid */}
      <SectionDivider icon={Sparkles} title="Service Details" />
      <div className="grid grid-cols-2 gap-2">
        {data.makeupType && (
          <InfoRow icon={Gem} label="Makeup Type" value={data.makeupType} highlight />
        )}
        {data.productsUsed && (
          <InfoRow icon={Star} label="Products/Brands" value={data.productsUsed} />
        )}
        {data.numberOfLooks && (
          <InfoRow icon={Eye} label="Looks Included" value={`${data.numberOfLooks} looks`} />
        )}
        {data.touchupHours && (
          <InfoRow icon={Clock} label="Touch-up Service" value={`${data.touchupHours} hours`} />
        )}
      </div>

      {/* Trial & Travel */}
      <div className="grid grid-cols-2 gap-2">
        <FeaturePill 
          icon={CheckCircle2} 
          label="Trial Session" 
          value={data.trialIncluded}
          description={data.trialPrice ? `₹${data.trialPrice} extra` : 'Included'}
        />
        {data.travelIncludedKm && (
          <InfoBox icon={Car} label="Travel" value={`${data.travelIncludedKm}km free`} variant="info" />
        )}
      </div>
    </div>
  );

  const renderDJ = () => (
    <div className="space-y-4">
      {/* Hero Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HeroPricing
          icon={Music}
          label={data.serviceType || 'DJ Services'}
          value={data.price}
          sublabel={data.pricingType || 'Per Event'}
        />
        <div className="grid grid-cols-2 gap-2">
          {data.durationHours && (
            <StatCard icon={Clock} label="Duration" value={data.durationHours} suffix="hrs" highlight />
          )}
          {data.soundSystemWattage && (
            <StatCard icon={Volume2} label="Sound Power" value={data.soundSystemWattage} suffix="W" />
          )}
          {data.teamSize && (
            <StatCard icon={Users} label="Team Size" value={data.teamSize} />
          )}
          {data.extraHourPrice && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/50">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-[10px] text-amber-600">Extra Hour</p>
                  <p className="text-sm font-bold text-amber-700">₹{Number(data.extraHourPrice).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment */}
      {data.equipmentIncluded && (
        <TagCloud label="Equipment Included" icon={Lightbulb} values={data.equipmentIncluded} />
      )}

      {/* Music Genres */}
      {data.musicGenre && (
        <TagCloud label="Music Genres" icon={Music} values={data.musicGenre} />
      )}

      {/* Features */}
      {data.customPlaylist !== undefined && (
        <div className="grid grid-cols-2 gap-2">
          <FeaturePill icon={Music} label="Custom Playlist Accepted" value={data.customPlaylist} />
        </div>
      )}
    </div>
  );

  const renderSoundLights = () => (
    <div className="space-y-4">
      {/* Hero Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HeroPricing
          icon={Lightbulb}
          label="Sound & Lighting"
          value={data.price}
          sublabel="Per day"
        />
        <div className="grid grid-cols-2 gap-2">
          {data.durationDays && (
            <StatCard icon={Clock} label="Duration" value={data.durationDays} suffix="days" highlight />
          )}
          {data.coverageArea && (
            <StatCard icon={Layers} label="Coverage" value={data.coverageArea} suffix="sq ft" />
          )}
          {data.powerRequirement && (
            <StatCard icon={Zap} label="Power" value={data.powerRequirement} suffix="KW" />
          )}
          {data.teamSize && (
            <StatCard icon={Users} label="Technicians" value={data.teamSize} />
          )}
        </div>
      </div>

      {/* Equipment Types */}
      {data.equipmentType && (
        <TagCloud label="Equipment" icon={Cpu} values={data.equipmentType} />
      )}

      {/* Services */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        <FeaturePill icon={CheckCircle2} label="Setup Included" value={data.setupIncluded} />
        <FeaturePill icon={CheckCircle2} label="Dismantling Included" value={data.dismantlingIncluded} />
        {data.extraDayPrice && (
          <InfoBox icon={Timer} label="Extra Day" value={`₹${Number(data.extraDayPrice).toLocaleString('en-IN')}`} variant="warning" />
        )}
      </div>
    </div>
  );

  const renderGeneric = () => (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined || value === '') return null;
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        if (typeof value === 'boolean') {
          return <FeaturePill key={key} label={label} value={value} />;
        }
        if (Array.isArray(value)) {
          return <div key={key}><TagCloud label={label} values={value} /></div>;
        }
        if (typeof value === 'number' && (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost'))) {
          return <InfoRow key={key} label={label} value={`₹${value.toLocaleString('en-IN')}`} highlight />;
        }
        return <InfoRow key={key} label={label} value={String(value)} />;
      })}
    </div>
  );

  // ============ CATEGORY INFO & ROUTING ============

  const getCategoryInfo = () => {
    switch (categoryId) {
      case 'caterer':
        return { icon: Utensils, title: 'Catering Details' };
      case 'photographer':
      case 'photography-videography':
      case 'photo-video':
      case 'cinematographer':
      case 'videographer':
        return { icon: Camera, title: 'Photography & Videography' };
      case 'venue':
        return { icon: Building2, title: 'Venue Details' };
      case 'decorator':
        return { icon: Palette, title: 'Decoration Details' };
      case 'mua':
        return { icon: Sparkles, title: 'Makeup & Styling' };
      case 'dj':
      case 'dj-entertainment':
      case 'live-music':
        return { icon: Music, title: 'Entertainment Details' };
      case 'sound-lights':
        return { icon: Lightbulb, title: 'Sound & Lighting' };
      default:
        return { icon: Sparkles, title: 'Service Details' };
    }
  };

  const renderContent = () => {
    switch (categoryId) {
      case 'caterer': return renderCaterer();
      case 'photographer':
      case 'photography-videography':
      case 'photo-video':
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
    <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Header with brand primary gradient */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary to-primary/90">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-white">{categoryInfo.title}</h2>
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
