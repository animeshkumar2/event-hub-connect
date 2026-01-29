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

  // ============ COMPACT HELPER COMPONENTS ============
  
  // Hero pricing card with gradient - compact
  const HeroPricing = ({ icon: Icon, label, value, sublabel, gradient }: {
    icon: any; label: string; value: any; sublabel?: string; gradient: string;
  }) => {
    if (!value) return null;
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl p-3 text-white",
        gradient
      )}>
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="p-1 rounded-lg bg-white/20">
              <Icon className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-medium opacity-90">{label}</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <IndianRupee className="h-4 w-4 opacity-80" />
            <span className="text-xl font-bold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
            </span>
          </div>
          {sublabel && (
            <p className="text-[10px] opacity-75 mt-1">{sublabel}</p>
          )}
        </div>
      </div>
    );
  };

  // Compact stat card
  const StatCard = ({ icon: Icon, label, value, suffix, highlight = false, gradient }: {
    icon: any; label: string; value: any; suffix?: string; highlight?: boolean; gradient?: string;
  }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className={cn(
        "rounded-lg p-2.5 border",
        highlight 
          ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20" 
          : "bg-slate-50/80 border-slate-100",
        gradient
      )}>
        <div className={cn(
          "inline-flex p-1 rounded mb-1.5",
          highlight ? "bg-primary/15" : "bg-slate-100"
        )}>
          <Icon className={cn("h-3 w-3", highlight ? "text-primary" : "text-slate-500")} />
        </div>
        <div className="space-y-0">
          <div className="flex items-baseline gap-0.5">
            <span className={cn(
              "text-base font-bold",
              highlight ? "text-primary" : "text-slate-900"
            )}>
              {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
            </span>
            {suffix && (
              <span className="text-[10px] text-slate-500">{suffix}</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">{label}</p>
        </div>
      </div>
    );
  };

  // Compact feature toggle pill
  const FeaturePill = ({ icon: Icon, label, value, description }: {
    icon?: any; label: string; value: any; description?: string;
  }) => {
    if (value === null || value === undefined) return null;
    const isIncluded = value === true || value === 'yes' || value === 'Yes';
    
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg",
        isIncluded 
          ? "bg-emerald-50/80 border border-emerald-200/60" 
          : "bg-slate-50/60 border border-slate-100"
      )}>
        <div className={cn(
          "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center",
          isIncluded ? "bg-emerald-100" : "bg-slate-100"
        )}>
          {isIncluded ? (
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          ) : (
            <XCircle className="h-3 w-3 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-[10px] font-medium truncate",
            isIncluded ? "text-emerald-800" : "text-slate-500"
          )}>
            {label}
          </p>
          {description && isIncluded && (
            <p className="text-[9px] text-emerald-600/70 truncate">{description}</p>
          )}
        </div>
      </div>
    );
  };

  // Compact Tags/badges display
  const TagCloud = ({ label, icon: Icon, values, color = 'primary' }: {
    label: string; icon?: any; values: any; color?: 'primary' | 'amber' | 'emerald' | 'violet' | 'rose';
  }) => {
    const items = Array.isArray(values) ? values : (typeof values === 'string' ? values.split(',').map(s => s.trim()) : []);
    if (items.length === 0) return null;
    
    const colorMap = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      violet: 'bg-violet-50 text-violet-700 border-violet-200',
      rose: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          {Icon && (
            <div className="p-1 rounded bg-slate-100">
              <Icon className="h-3 w-3 text-slate-600" />
            </div>
          )}
          <h4 className="text-[10px] font-medium text-slate-700">{label}</h4>
          <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-slate-100">
            {items.length}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {items.map((item: string, index: number) => (
            <span
              key={index}
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
                colorMap[color]
              )}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Compact section divider
  const SectionDivider = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
    <div className="flex items-center gap-2 py-2">
      <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60">
        <Icon className="h-3 w-3 text-slate-600" />
      </div>
      <div>
        <h3 className="text-xs font-bold text-slate-800">{title}</h3>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent ml-2" />
    </div>
  );

  // Compact info row
  const InfoRow = ({ icon: Icon, label, value, highlight = false }: {
    icon?: any; label: string; value: any; highlight?: boolean;
  }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className={cn(
        "flex items-center justify-between py-1.5 px-2 rounded-lg",
        highlight ? "bg-primary/5" : ""
      )}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3 w-3 text-slate-400" />}
          <span className="text-[10px] text-slate-600">{label}</span>
        </div>
        <span className={cn(
          "text-[10px] font-semibold",
          highlight ? "text-primary" : "text-slate-800"
        )}>
          {value}
        </span>
      </div>
    );
  };

  // ============ CATEGORY-SPECIFIC RENDERS ============

  const renderPhotographer = () => {
    return (
      <div className="space-y-3">
        {/* Hero Pricing Section */}
        <div className="grid grid-cols-2 gap-2">
          <HeroPricing
            icon={data.serviceType?.includes('Video') ? Film : Camera}
            label={data.serviceType || 'Photography'}
            value={data.price}
            sublabel={data.pricingType || 'Per Event'}
            gradient="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
          />
          <div className="space-y-2">
            <StatCard icon={ImageIcon} label="Edited Photos" value={data.editedPhotos} highlight />
            {data.teamSize && (
              <StatCard icon={Users} label="Team Size" value={data.teamSize} />
            )}
          </div>
        </div>

        {/* Duration (for hourly pricing) */}
        {data.durationHours && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/60">
            <Clock className="h-3 w-3 text-amber-600" />
            <span className="text-[10px] font-medium text-amber-800">
              Duration: {data.durationHours} hrs
            </span>
          </div>
        )}

        {/* Deliverables Grid */}
        <SectionDivider icon={Package} title="Included" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
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
    <div className="space-y-3">
      {/* Pricing Cards */}
      <div className="grid grid-cols-2 gap-2">
        <HeroPricing
          icon={Utensils}
          label="Veg"
          value={data.pricePerPlateVeg}
          sublabel="/plate"
          gradient="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500"
        />
        {data.pricePerPlateNonVeg && (
          <HeroPricing
            icon={Utensils}
            label="Non-Veg"
            value={data.pricePerPlateNonVeg}
            sublabel="/plate"
            gradient="bg-gradient-to-br from-orange-500 via-red-500 to-rose-500"
          />
        )}
      </div>

      {/* Guest Capacity & Style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <StatCard icon={Users} label="Min Guests" value={data.minGuests} highlight />
        {data.maxGuests && <StatCard icon={Users} label="Max" value={data.maxGuests} />}
        {data.serviceStyle && (
          <div className="col-span-2 flex items-center gap-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200/60">
            <PartyPopper className="h-3 w-3 text-amber-600" />
            <div>
              <p className="text-[9px] text-amber-600/80">Style</p>
              <p className="text-[10px] font-semibold text-amber-800">{data.serviceStyle}</p>
            </div>
          </div>
        )}
      </div>

      {/* Cuisines */}
      <TagCloud label="Cuisines" icon={Utensils} values={data.cuisineType} color="amber" />

      {/* What's Included */}
      {data.includes && (
        <TagCloud label="Included" icon={Gift} values={data.includes} color="emerald" />
      )}

      {/* Live Counters */}
      {data.liveCounters && (
        <div className="p-2 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/60">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded bg-violet-100">
              <Zap className="h-3 w-3 text-violet-600" />
            </div>
            <p className="text-[10px] font-semibold text-violet-800">Live Counters</p>
          </div>
          {data.liveCounterTypes && (
            <div className="flex flex-wrap gap-1 mt-1">
              {(Array.isArray(data.liveCounterTypes) ? data.liveCounterTypes : [data.liveCounterTypes]).map((counter: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-violet-100 text-violet-700">
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
          <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60">
            <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap">{data.menuItems}</p>
          </div>
        </>
      )}
    </div>
  );

  const renderVenue = () => (
    <div className="space-y-6">
      {/* Hero with Venue Type and Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeroPricing
          icon={Building2}
          label={data.venueType || 'Venue'}
          value={data.price}
          sublabel={data.pricingType || 'Per Day'}
          gradient="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500"
        />
        <div className="space-y-4">
          <StatCard icon={Users} label="Seating Capacity" value={data.capacitySeating} highlight />
          {data.capacityStanding && (
            <StatCard icon={Users} label="Standing Capacity" value={data.capacityStanding} />
          )}
        </div>
      </div>

      {/* Venue Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.areaSquareFeet && (
          <StatCard icon={Layers} label="Area" value={data.areaSquareFeet} suffix="sq ft" />
        )}
        {data.parkingCapacity && (
          <StatCard icon={Car} label="Parking" value={data.parkingCapacity} suffix="vehicles" />
        )}
        {data.timingStart && data.timingEnd && (
          <div className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-blue-50/80 border border-blue-200/60">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600/80">Available Timing</p>
              <p className="text-sm font-semibold text-blue-800">{data.timingStart} - {data.timingEnd}</p>
            </div>
          </div>
        )}
      </div>

      {/* Amenities */}
      {data.amenities && (
        <TagCloud label="Amenities" icon={Star} values={data.amenities} color="violet" />
      )}

      {/* Policies */}
      <SectionDivider icon={BookOpen} title="Venue Policies" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.cateringPolicy && (
          <InfoRow icon={Utensils} label="Catering" value={data.cateringPolicy} />
        )}
        {data.alcoholPolicy && (
          <InfoRow icon={PartyPopper} label="Alcohol" value={data.alcoholPolicy} />
        )}
        <FeaturePill icon={Clock} label="Overnight Events" value={data.overnightAllowed} />
        {data.peakSeasonSurcharge > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60">
            <ArrowUpRight className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              Peak season: +{data.peakSeasonSurcharge}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderDecorator = () => (
    <div className="space-y-6">
      {/* Hero Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HeroPricing
          icon={Palette}
          label={data.theme || 'Custom Décor'}
          value={data.price}
          sublabel="Starting price"
          gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500"
        />
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {data.coverageArea && (
            <StatCard icon={Layers} label="Coverage Area" value={data.coverageArea} suffix="sq ft" highlight />
          )}
          {data.tableCenterpieces && (
            <StatCard icon={Flower2} label="Centerpieces" value={data.tableCenterpieces} />
          )}
        </div>
      </div>

      {/* Décor Types */}
      <TagCloud label="Décor Services" icon={Palette} values={data.decorType} color="rose" />

      {/* What's Included */}
      {data.includes && (
        <TagCloud label="Materials Included" icon={Gift} values={data.includes} color="emerald" />
      )}

      {/* Features Grid */}
      <SectionDivider icon={Sparkles} title="Package Features" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
    <div className="space-y-6">
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.bridalPrice && (
          <HeroPricing
            icon={Crown}
            label="Bridal"
            value={data.bridalPrice}
            sublabel="Premium bridal package"
            gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500"
          />
        )}
        {data.familyPrice && (
          <div className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/60">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-violet-600" />
              <span className="text-xs font-medium text-violet-600">Family</span>
            </div>
            <div className="flex items-baseline gap-1">
              <IndianRupee className="h-4 w-4 text-violet-700" />
              <span className="text-2xl font-bold text-violet-800">{Number(data.familyPrice).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-violet-600 mt-1">per person</p>
          </div>
        )}
        {data.guestPrice && (
          <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/60">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-600">Guest</span>
            </div>
            <div className="flex items-baseline gap-1">
              <IndianRupee className="h-4 w-4 text-slate-700" />
              <span className="text-2xl font-bold text-slate-800">{Number(data.guestPrice).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">per person</p>
          </div>
        )}
      </div>

      {/* Service For */}
      <TagCloud label="Service For" icon={Users} values={data.serviceFor} color="rose" />

      {/* Services Included */}
      <TagCloud label="Services Included" icon={Brush} values={data.servicesIncluded} color="violet" />

      {/* Details Grid */}
      <SectionDivider icon={Sparkles} title="Service Details" />
      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 gap-3">
        <FeaturePill 
          icon={CheckCircle2} 
          label="Trial Session" 
          value={data.trialIncluded}
          description={data.trialPrice ? `₹${data.trialPrice} extra` : 'Included'}
        />
        {data.travelIncludedKm && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/80 border border-blue-200/60">
            <Car className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Travel: {data.travelIncludedKm}km free</p>
              {data.travelChargePerKm && (
                <p className="text-xs text-blue-600">₹{data.travelChargePerKm}/km after</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDJ = () => (
    <div className="space-y-6">
      {/* Hero Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeroPricing
          icon={Music}
          label={data.serviceType || 'DJ Services'}
          value={data.price}
          sublabel={data.pricingType || 'Per Event'}
          gradient="bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600"
        />
        <div className="grid grid-cols-2 gap-3">
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
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60">
              <Timer className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-xs text-amber-600">Extra Hour</p>
                <p className="text-sm font-bold text-amber-800">₹{Number(data.extraHourPrice).toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment */}
      {data.equipmentIncluded && (
        <TagCloud label="Equipment Included" icon={Lightbulb} values={data.equipmentIncluded} color="violet" />
      )}

      {/* Music Genres */}
      {data.musicGenre && (
        <TagCloud label="Music Genres" icon={Music} values={data.musicGenre} color="primary" />
      )}

      {/* Features */}
      {data.customPlaylist !== undefined && (
        <div className="grid grid-cols-2 gap-3">
          <FeaturePill icon={Music} label="Custom Playlist Accepted" value={data.customPlaylist} />
        </div>
      )}
    </div>
  );

  const renderSoundLights = () => (
    <div className="space-y-6">
      {/* Hero Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeroPricing
          icon={Lightbulb}
          label="Sound & Lighting"
          value={data.price}
          sublabel="Per day"
          gradient="bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500"
        />
        <div className="grid grid-cols-2 gap-3">
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
        <TagCloud label="Equipment" icon={Cpu} values={data.equipmentType} color="amber" />
      )}

      {/* Services */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <FeaturePill icon={CheckCircle2} label="Setup Included" value={data.setupIncluded} />
        <FeaturePill icon={CheckCircle2} label="Dismantling Included" value={data.dismantlingIncluded} />
        {data.extraDayPrice && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60">
            <Timer className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs text-amber-600">Extra Day</p>
              <p className="text-sm font-bold text-amber-800">₹{Number(data.extraDayPrice).toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderGeneric = () => (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined || value === '') return null;
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        if (typeof value === 'boolean') {
          return <FeaturePill key={key} label={label} value={value} />;
        }
        if (Array.isArray(value)) {
          return <div key={key}><TagCloud label={label} values={value} color="primary" /></div>;
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
        return { 
          icon: Utensils, 
          title: 'Catering Details', 
          subtitle: 'Complete menu and service information',
          gradient: 'from-emerald-500 to-teal-500' 
        };
      case 'photographer':
      case 'photography-videography':
      case 'photo-video':
      case 'cinematographer':
      case 'videographer':
        return { 
          icon: Camera, 
          title: 'Photography & Videography', 
          subtitle: 'Coverage and deliverables',
          gradient: 'from-indigo-500 to-purple-500' 
        };
      case 'venue':
        return { 
          icon: Building2, 
          title: 'Venue Details', 
          subtitle: 'Capacity, amenities and policies',
          gradient: 'from-amber-500 to-orange-500' 
        };
      case 'decorator':
        return { 
          icon: Palette, 
          title: 'Decoration Details', 
          subtitle: 'Décor themes and inclusions',
          gradient: 'from-pink-500 to-rose-500' 
        };
      case 'mua':
        return { 
          icon: Sparkles, 
          title: 'Makeup & Styling', 
          subtitle: 'Services and packages',
          gradient: 'from-rose-500 to-pink-500' 
        };
      case 'dj':
      case 'dj-entertainment':
      case 'live-music':
        return { 
          icon: Music, 
          title: 'Entertainment Details', 
          subtitle: 'Equipment and performance',
          gradient: 'from-purple-500 to-violet-500' 
        };
      case 'sound-lights':
        return { 
          icon: Lightbulb, 
          title: 'Sound & Lighting', 
          subtitle: 'Equipment and technical specs',
          gradient: 'from-amber-500 to-yellow-500' 
        };
      default:
        return { 
          icon: Sparkles, 
          title: 'Service Details', 
          subtitle: 'Complete package information',
          gradient: 'from-primary to-violet-500' 
        };
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
    <Card className="overflow-hidden border-0 shadow-md bg-white/80 backdrop-blur-sm">
      {/* Compact Header */}
      <div className={cn(
        "relative overflow-hidden px-4 py-3 bg-gradient-to-r",
        categoryInfo.gradient
      )}>
        <div className="relative flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white">{categoryInfo.title}</h2>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-3">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
