import { Users, Utensils, Camera, Palette, Music, Lightbulb, Sparkles, Clock, CheckCircle2, XCircle, Car, Volume2, Heart, Star, Zap, Gift, Flower2, Building2, PartyPopper, BookOpen, Brush, Crown, Gem, ImageIcon, Film, Package, Eye, Timer, Cpu, Layers, Aperture, ArrowUpRight, Tv, Wand2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CategorySpecificDisplayProps { categoryId: string; categorySpecificData: string | null; hidePricing?: boolean; }

export const CategorySpecificDisplay = ({ categoryId, categorySpecificData, hidePricing = false }: CategorySpecificDisplayProps) => {
  if (!categorySpecificData) return null;
  let data: Record<string, any> = {};
  try { data = JSON.parse(categorySpecificData); } catch { return null; }
  if (Object.keys(data).length === 0) return null;

  const HeroPricing = ({ icon: Icon, label, value, sublabel }: { icon: any; label: string; value: any; sublabel?: string }) => {
    if (!value) return null;
    return (
      <div className="p-5 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-slate-400">₹</span>
          <span className="text-3xl font-bold text-slate-900 tracking-tight">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</span>
        </div>
        {sublabel && <p className="text-sm text-slate-400 mt-1.5">{sublabel}</p>}
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, suffix }: { icon: any; label: string; value: any; suffix?: string; highlight?: boolean }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="rounded-2xl p-4 border border-slate-200 bg-white">
        <Icon className="h-4 w-4 text-slate-400 mb-2" />
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</span>
          {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    );
  };

  const FeaturePill = ({ label, value, description }: { icon?: any; label: string; value: any; description?: string }) => {
    if (value === null || value === undefined) return null;
    const ok = value === true || value === 'yes' || value === 'Yes';
    return (
      <div className={cn("flex items-center gap-3 py-3 px-4 rounded-xl border", ok ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/60")}>
        <div className={cn("flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center", ok ? "bg-brand" : "bg-slate-200")}>
          {ok ? <CheckCircle2 className="h-3 w-3 text-white" /> : <XCircle className="h-3 w-3 text-slate-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm truncate", ok ? "text-slate-700" : "text-slate-400")}>{label}</p>
          {description && ok && <p className="text-xs text-slate-400 truncate">{description}</p>}
        </div>
      </div>
    );
  };

  const TagPills = ({ items }: { items: string[] }) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700">{item}</span>
      ))}
    </div>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">{children}</p>
  );

  const TagCloud = ({ label, values }: { label: string; icon?: any; values: any }) => {
    const items = Array.isArray(values) ? values : (typeof values === 'string' ? values.split(',').map(s => s.trim()) : []);
    if (items.length === 0) return null;
    return (
      <div>
        <SectionLabel>{label}</SectionLabel>
        <TagPills items={items} />
      </div>
    );
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon?: any; label: string; value: any; highlight?: boolean }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
          <span className="text-sm text-slate-500">{label}</span>
        </div>
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      </div>
    );
  };

  const InfoBox = ({ icon: Icon, label, value }: { icon: any; label: string; value: string; variant?: string }) => (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white">
      <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
      <span className="text-sm text-slate-600">{label}: <span className="font-medium text-slate-900">{value}</span></span>
    </div>
  );

  // ── Category renderers ──

  const renderPhotographer = () => (
    <div className="space-y-6">
      {!hidePricing && (
        <div className="grid grid-cols-2 gap-4">
          <HeroPricing icon={data.serviceType?.includes('Video') ? Film : Camera} label={data.serviceType || 'Photography'} value={data.price} sublabel={data.pricingType || 'Per Event'} />
          <div className="space-y-3">
            <StatCard icon={ImageIcon} label="Edited Photos" value={data.editedPhotos} />
            {data.teamSize > 0 && <StatCard icon={Users} label="Team Size" value={data.teamSize} />}
          </div>
        </div>
      )}
      {hidePricing && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={ImageIcon} label="Edited Photos" value={data.editedPhotos} />
          {data.teamSize > 0 && <StatCard icon={Users} label="Team Size" value={data.teamSize} />}
        </div>
      )}
      {data.durationHours > 0 && <InfoBox icon={Clock} label="Duration" value={`${data.durationHours} hours`} />}
      <div>
        <SectionLabel>What's Included</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          <FeaturePill icon={ImageIcon} label="Raw Photos" value={data.rawPhotos} />
          <FeaturePill icon={Film} label="Highlight Video" value={data.highlightVideo} description={data.highlightVideoMinutes ? `${data.highlightVideoMinutes} min` : undefined} />
          <FeaturePill icon={Tv} label="Full Video" value={data.fullVideo} description={data.fullVideoMinutes ? `${data.fullVideoMinutes} min` : undefined} />
          <FeaturePill icon={Aperture} label="Drone" value={data.droneIncluded} />
          <FeaturePill icon={BookOpen} label="Album" value={data.albumIncluded} description={data.albumPages ? `${data.albumPages} pages` : undefined} />
          <FeaturePill icon={Heart} label="Pre-Wedding" value={data.preWeddingIncluded} />
        </div>
      </div>
    </div>
  );

  const renderCaterer = () => {
    const serviceStyles = data.serviceStyle ? (Array.isArray(data.serviceStyle) ? data.serviceStyle : [data.serviceStyle]) : [];
    const cuisines = data.cuisineType ? (Array.isArray(data.cuisineType) ? data.cuisineType : (typeof data.cuisineType === 'string' ? data.cuisineType.split(',').map((s: string) => s.trim()) : [])) : [];
    const includes = data.includes ? (Array.isArray(data.includes) ? data.includes : (typeof data.includes === 'string' ? data.includes.split(',').map((s: string) => s.trim()) : [])) : [];
    const liveCounterTypes = data.liveCounters && data.liveCounterTypes ? (Array.isArray(data.liveCounterTypes) ? data.liveCounterTypes : [data.liveCounterTypes]) : [];

    let menuObj: Record<string, any> | null = null;
    if (data.menuItems) {
      if (typeof data.menuItems === 'string') { try { const p = JSON.parse(data.menuItems); if (typeof p === 'object' && !Array.isArray(p)) menuObj = p; } catch {} }
      else if (typeof data.menuItems === 'object' && !Array.isArray(data.menuItems)) menuObj = data.menuItems;
    }
    const menuCourses = menuObj ? Object.entries(menuObj).filter(([, v]) => {
      if (v && typeof v === 'object' && Array.isArray(v.items)) return v.items.length > 0;
      if (Array.isArray(v)) return v.length > 0;
      return false;
    }) : [];

    return (
      <div className="space-y-6">
        {/* Pricing */}
        {!hidePricing && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <HeroPricing icon={Utensils} label={data.foodType || 'Veg'} value={data.pricePerPlate || data.pricePerPlateVeg} sublabel="per plate" />
              {!data.pricePerPlate && data.pricePerPlateNonVeg > 0 && <HeroPricing icon={Utensils} label="Non-Veg" value={data.pricePerPlateNonVeg} sublabel="per plate" />}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Min Guests" value={data.minGuests} />
              {data.maxGuests > 0 && <StatCard icon={Users} label="Max Guests" value={data.maxGuests} />}
            </div>
          </>
        )}

        {/* At-a-glance: service style + cuisines side by side */}
        {(serviceStyles.length > 0 || cuisines.length > 0) && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={cn("grid gap-6", serviceStyles.length > 0 && cuisines.length > 0 ? "sm:grid-cols-2" : "grid-cols-1")}>
              {serviceStyles.length > 0 && (
                <div>
                  <SectionLabel>Service Style</SectionLabel>
                  <TagPills items={serviceStyles} />
                </div>
              )}
              {cuisines.length > 0 && (
                <div>
                  <SectionLabel>Cuisines</SectionLabel>
                  <TagPills items={cuisines} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Counters */}
        {liveCounterTypes.length > 0 && (
          <div>
            <SectionLabel>Live Counters</SectionLabel>
            <TagPills items={liveCounterTypes} />
          </div>
        )}

        {/* Menu */}
        {menuCourses.length > 0 && (
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-brand/[0.04] to-brand/[0.08] border border-brand/10">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Utensils className="h-3.5 w-3.5 text-brand" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Menu</h4>
              </div>
              <span className="text-xs text-brand/60 font-medium">{menuCourses.length} {menuCourses.length === 1 ? 'course' : 'courses'}</span>
            </div>
            <div className="mx-5 mb-5 rounded-xl bg-white border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {menuCourses.map(([course, val]) => {
                const items: string[] = Array.isArray(val) ? val : (val?.items || []);
                const count: number = Array.isArray(val) ? val.length : (val?.count ?? items.length);
                const isChoice = count < items.length;
                return (
                  <div key={course} className="px-4 py-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900">{course}</span>
                      {isChoice ? (
                        <span className="text-[11px] font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">Choose {count} from {items.length}</span>
                      ) : (
                        <span className="text-[11px] text-slate-400">{items.length} items</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 rounded-md text-[13px] text-slate-600">{item}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback text menu */}
        {data.menuItems && menuCourses.length === 0 && typeof data.menuItems === 'string' && (() => { try { JSON.parse(data.menuItems); return false; } catch { return true; } })() && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <SectionLabel>Menu</SectionLabel>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{data.menuItems}</p>
          </div>
        )}
      </div>
    );
  };

  const renderVenue = () => (
    <div className="space-y-6">
      {!hidePricing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HeroPricing icon={Building2} label={data.venueType || 'Venue'} value={data.price} sublabel="Starting price" />
          <div className="space-y-3">
            <StatCard icon={Users} label="Seating Capacity" value={data.capacitySeating} />
            {data.capacityStanding > 0 && <StatCard icon={Users} label="Standing Capacity" value={data.capacityStanding} />}
          </div>
        </div>
      )}
      {hidePricing && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={Users} label="Seating Capacity" value={data.capacitySeating} />
          {data.capacityStanding > 0 && <StatCard icon={Users} label="Standing Capacity" value={data.capacityStanding} />}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.numberOfHalls > 0 && <StatCard icon={Building2} label="Halls / Spaces" value={data.numberOfHalls} />}
        {data.areaSquareFeet > 0 && <StatCard icon={Layers} label="Area" value={data.areaSquareFeet} suffix="sq ft" />}
        {data.parkingCapacity > 0 && <StatCard icon={Car} label="Parking" value={data.parkingCapacity} suffix="vehicles" />}
      </div>
      {data.venueSession && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <SectionLabel>Session Type</SectionLabel>
          <span className="px-3 py-1.5 rounded-full text-sm bg-slate-50 text-slate-700 border border-slate-100">{data.venueSession}</span>
        </div>
      )}
      {data.roomsAvailable > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <SectionLabel>Accommodation · {data.roomsAvailable} rooms</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {data.acRooms > 0 && <span className="px-3 py-1.5 rounded-full text-sm bg-slate-50 text-slate-700 border border-slate-100">{data.acRooms} AC Rooms</span>}
            {data.nonAcRooms > 0 && <span className="px-3 py-1.5 rounded-full text-sm bg-slate-50 text-slate-700 border border-slate-100">{data.nonAcRooms} Non-AC Rooms</span>}
          </div>
        </div>
      )}
      {data.amenities && <TagCloud label="Amenities" values={data.amenities} />}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <SectionLabel>Venue Policies</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {data.cateringPolicy && <InfoRow icon={Utensils} label="Catering" value={data.cateringPolicy} />}
          {data.decorationPolicy && <InfoRow icon={Palette} label="Decoration" value={data.decorationPolicy} />}
          {data.alcoholPolicy && <InfoRow icon={PartyPopper} label="Alcohol" value={data.alcoholPolicy} />}
          <FeaturePill icon={Car} label="Valet Parking" value={data.valetParking} />
          {data.peakSeasonSurcharge > 0 && <InfoBox icon={ArrowUpRight} label="Peak season" value={`+${data.peakSeasonSurcharge}%`} />}
        </div>
      </div>
    </div>
  );

  const renderDecorator = () => (
    <div className="space-y-6">
      {!hidePricing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HeroPricing icon={Palette} label={data.theme || 'Custom Décor'} value={data.price} sublabel="Starting price" />
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            {data.coverageArea > 0 && <StatCard icon={Layers} label="Coverage Area" value={data.coverageArea} suffix="sq ft" />}
            {data.tableCenterpieces > 0 && <StatCard icon={Flower2} label="Centerpieces" value={data.tableCenterpieces} />}
          </div>
        </div>
      )}
      {hidePricing && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {data.coverageArea > 0 && <StatCard icon={Layers} label="Coverage Area" value={data.coverageArea} suffix="sq ft" />}
          {data.tableCenterpieces > 0 && <StatCard icon={Flower2} label="Centerpieces" value={data.tableCenterpieces} />}
        </div>
      )}
      <TagCloud label="Décor Services" values={data.decorType} />
      {data.includes && <TagCloud label="Materials Included" values={data.includes} />}
      <div>
        <SectionLabel>Package Features</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          <FeaturePill icon={Wand2} label="Stage Backdrop" value={data.stageBackdrop} />
          <FeaturePill icon={Flower2} label="Entrance Arch" value={data.entranceArch} />
          <FeaturePill icon={Layers} label="Ceiling Draping" value={data.ceilingDraping} />
          <FeaturePill icon={Flower2} label="Aisle Decoration" value={data.aisleDecoration} />
          <FeaturePill icon={CheckCircle2} label="Dismantling Included" value={data.dismantlingIncluded} />
          <FeaturePill icon={Sparkles} label="Customization Available" value={data.customizationAvailable} />
        </div>
      </div>
    </div>
  );

  const renderMUA = () => (
    <div className="space-y-6">
      {!hidePricing && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.bridalPrice > 0 && <HeroPricing icon={Crown} label="Bridal" value={data.bridalPrice} sublabel="Premium bridal package" />}
          {data.familyPrice > 0 && <HeroPricing icon={Heart} label="Family" value={data.familyPrice} sublabel="per person" />}
          {data.guestPrice > 0 && <HeroPricing icon={Users} label="Guest" value={data.guestPrice} sublabel="per person" />}
        </div>
      )}
      <TagCloud label="Service For" values={data.serviceFor} />
      <TagCloud label="Services Included" values={data.servicesIncluded} />
      <div>
        <SectionLabel>Service Details</SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {data.makeupType && <InfoRow icon={Gem} label="Makeup Type" value={data.makeupType} />}
          {data.productsUsed && <InfoRow icon={Star} label="Products / Brands" value={data.productsUsed} />}
          {data.numberOfLooks > 0 && <InfoRow icon={Eye} label="Looks Included" value={`${data.numberOfLooks} looks`} />}
          {data.touchupHours > 0 && <InfoRow icon={Clock} label="Touch-up Service" value={`${data.touchupHours} hours`} />}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <FeaturePill icon={CheckCircle2} label="Trial Session" value={data.trialIncluded} description={data.trialPrice ? `₹${data.trialPrice} extra` : 'Included'} />
        {data.travelIncludedKm > 0 && <InfoBox icon={Car} label="Travel" value={`${data.travelIncludedKm} km free`} />}
      </div>
    </div>
  );

  const renderDJ = () => (
    <div className="space-y-6">
      {!hidePricing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HeroPricing icon={Music} label={data.serviceType || 'DJ Services'} value={data.price} sublabel={data.pricingType || 'Per Event'} />
          <div className="grid grid-cols-2 gap-3">
            {data.durationHours > 0 && <StatCard icon={Clock} label="Duration" value={data.durationHours} suffix="hrs" />}
            {data.soundSystemWattage > 0 && <StatCard icon={Volume2} label="Sound Power" value={data.soundSystemWattage} suffix="W" />}
            {data.teamSize > 0 && <StatCard icon={Users} label="Team Size" value={data.teamSize} />}
            {data.extraHourPrice > 0 && <StatCard icon={Timer} label="Extra Hour" value={`₹${Number(data.extraHourPrice).toLocaleString('en-IN')}`} />}
          </div>
        </div>
      )}
      {hidePricing && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.durationHours > 0 && <StatCard icon={Clock} label="Duration" value={data.durationHours} suffix="hrs" />}
          {data.soundSystemWattage > 0 && <StatCard icon={Volume2} label="Sound Power" value={data.soundSystemWattage} suffix="W" />}
          {data.teamSize > 0 && <StatCard icon={Users} label="Team Size" value={data.teamSize} />}
        </div>
      )}
      {data.equipmentIncluded && <TagCloud label="Equipment Included" values={data.equipmentIncluded} />}
      {data.musicGenre && <TagCloud label="Music Genres" values={data.musicGenre} />}
      {data.customPlaylist !== undefined && (
        <div className="grid grid-cols-2 gap-2.5">
          <FeaturePill icon={Music} label="Custom Playlist Accepted" value={data.customPlaylist} />
        </div>
      )}
    </div>
  );

  const renderSoundLights = () => (
    <div className="space-y-6">
      {!hidePricing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HeroPricing icon={Lightbulb} label="Sound & Lighting" value={data.price} sublabel="Per day" />
          <div className="grid grid-cols-2 gap-3">
            {data.durationDays > 0 && <StatCard icon={Clock} label="Duration" value={data.durationDays} suffix="days" />}
            {data.coverageArea > 0 && <StatCard icon={Layers} label="Coverage" value={data.coverageArea} suffix="sq ft" />}
            {data.powerRequirement > 0 && <StatCard icon={Zap} label="Power" value={data.powerRequirement} suffix="KW" />}
            {data.teamSize > 0 && <StatCard icon={Users} label="Technicians" value={data.teamSize} />}
          </div>
        </div>
      )}
      {hidePricing && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.durationDays > 0 && <StatCard icon={Clock} label="Duration" value={data.durationDays} suffix="days" />}
          {data.coverageArea > 0 && <StatCard icon={Layers} label="Coverage" value={data.coverageArea} suffix="sq ft" />}
          {data.powerRequirement > 0 && <StatCard icon={Zap} label="Power" value={data.powerRequirement} suffix="KW" />}
          {data.teamSize > 0 && <StatCard icon={Users} label="Technicians" value={data.teamSize} />}
        </div>
      )}
      {data.equipmentType && <TagCloud label="Equipment" values={data.equipmentType} />}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        <FeaturePill icon={CheckCircle2} label="Setup Included" value={data.setupIncluded} />
        <FeaturePill icon={CheckCircle2} label="Dismantling Included" value={data.dismantlingIncluded} />
        {data.extraDayPrice > 0 && <InfoBox icon={Timer} label="Extra Day" value={`₹${Number(data.extraDayPrice).toLocaleString('en-IN')}`} />}
      </div>
    </div>
  );

  const renderGeneric = () => (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined || value === '') return null;
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        if (typeof value === 'boolean') return <FeaturePill key={key} label={label} value={value} />;
        if (Array.isArray(value)) return <div key={key}><TagCloud label={label} values={value} /></div>;
        if (typeof value === 'number' && (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost'))) return <InfoRow key={key} label={label} value={`₹${value.toLocaleString('en-IN')}`} />;
        return <InfoRow key={key} label={label} value={String(value)} />;
      })}
    </div>
  );

  const getCategoryInfo = () => {
    switch (categoryId) {
      case 'caterer': return { title: 'Catering Details' };
      case 'photographer': case 'photography-videography': case 'photo-video': case 'cinematographer': case 'videographer': return { title: 'Photography & Videography' };
      case 'venue': return { title: 'Venue Details' };
      case 'decorator': return { title: 'Decoration Details' };
      case 'mua': return { title: 'Makeup & Styling' };
      case 'dj': case 'dj-entertainment': case 'live-music': return { title: 'Entertainment Details' };
      case 'sound-lights': return { title: 'Sound & Lighting' };
      default: return { title: 'Service Details' };
    }
  };

  const renderContent = () => {
    switch (categoryId) {
      case 'caterer': return renderCaterer();
      case 'photographer': case 'photography-videography': case 'photo-video': case 'cinematographer': case 'videographer': return renderPhotographer();
      case 'venue': return renderVenue();
      case 'decorator': return renderDecorator();
      case 'mua': return renderMUA();
      case 'dj': case 'dj-entertainment': case 'live-music': return renderDJ();
      case 'sound-lights': return renderSoundLights();
      default: return renderGeneric();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-5">{getCategoryInfo().title}</h2>
      {renderContent()}
    </div>
  );
};
