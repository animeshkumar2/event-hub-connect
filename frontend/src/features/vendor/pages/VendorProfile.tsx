import { useState, useEffect, useRef } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { InlineError } from '@/shared/components/InlineError';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { ProfileImageUpload } from '@/shared/components/ProfileImageUpload';
import { ImageViewer } from '@/shared/components/ImageViewer';
import { ImageCropModal } from '@/shared/components/ImageCropModal';
import { 
  Camera, CheckCircle, MapPin, Phone, Mail, Instagram, Save, Loader2, X, ImagePlus,
  Sparkles, Eye, Star, Edit3, ChevronRight, Globe, Building2, Navigation, Zap,
  MessageCircle, CalendarCheck, User, Plus, AlertCircle, TrendingUp, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorProfile, useVendorDashboardStats } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { LocationAutocomplete, LocationDTO } from '@/shared/components/LocationAutocomplete';
import { RadiusSlider, VENDOR_RADIUS_OPTIONS } from '@/shared/components/RadiusSlider';
import { categories, cities, vendorProfessions } from '@/shared/constants/mockData';
import { useAuth } from '@/shared/contexts/AuthContext';
import { uploadImage, validateImageFile, deleteImage, deleteImages } from '@/shared/utils/storage';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Profile completion calculator - uses real data with accurate checks
const calculateProfileCompletion = (profile: any, portfolioImages: string[], location: LocationDTO | null) => {
  const checks = [
    { 
      name: 'Business Name', 
      done: !!profile?.businessName && profile.businessName.length >= 3, 
      weight: 15,
      tip: 'Add your business name',
      icon: Building2
    },
    { 
      name: 'Profile Photo', 
      done: !!profile?.profileImage, 
      weight: 15,
      tip: 'Upload a profile photo',
      icon: User
    },
    { 
      name: 'Cover Image', 
      done: !!profile?.coverImage, 
      weight: 10,
      tip: 'Add a cover image',
      icon: Camera
    },
    { 
      name: 'Bio Description', 
      done: !!profile?.bio && profile.bio.length >= 50, 
      weight: 15,
      tip: 'Write at least 50 characters about your business',
      icon: Edit3
    },
    { 
      name: 'Portfolio Images', 
      done: portfolioImages.length >= 3, 
      weight: 20,
      tip: `Add ${Math.max(0, 3 - portfolioImages.length)} more image${3 - portfolioImages.length !== 1 ? 's' : ''} (${portfolioImages.length}/3)`,
      icon: ImagePlus
    },
    { 
      name: 'Service Location', 
      done: !!location || (!!profile?.locationName && !!profile?.locationLat), 
      weight: 15,
      tip: 'Set your service location',
      icon: MapPin
    },
    { 
      name: 'Contact Info', 
      done: !!profile?.phone || !!profile?.email, 
      weight: 10,
      tip: 'Add phone or email',
      icon: Phone
    },
  ];
  const completed = checks.filter(c => c.done).reduce((sum, c) => sum + c.weight, 0);
  const completedCount = checks.filter(c => c.done).length;
  const totalCount = checks.length;
  
  let level = 'Beginner';
  let levelColor = 'text-red-500';
  let levelBg = 'bg-red-500';
  if (completed >= 90) { level = 'Expert'; levelColor = 'text-emerald-500'; levelBg = 'bg-emerald-500'; }
  else if (completed >= 70) { level = 'Professional'; levelColor = 'text-blue-500'; levelBg = 'bg-blue-500'; }
  else if (completed >= 50) { level = 'Intermediate'; levelColor = 'text-amber-500'; levelBg = 'bg-amber-500'; }
  else if (completed >= 25) { level = 'Getting Started'; levelColor = 'text-orange-500'; levelBg = 'bg-orange-500'; }
  
  return { checks, completed, completedCount, totalCount, level, levelColor, levelBg };
};

// Stat Card Component - Compact and creative
const StatCard = ({ icon: Icon, label, value, color }: { 
  icon: any; label: string; value: string | number; color: string 
}) => (
  <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 ${color} group hover:scale-[1.02] transition-all duration-300`}>
    {/* Decorative elements */}
    <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-white/10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8" />
    <div className="absolute bottom-0 left-0 w-8 sm:w-12 h-8 sm:h-12 bg-white/5 rounded-full -ml-4 sm:-ml-6 -mb-4 sm:-mb-6" />
    
    <div className="relative">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white/90 mb-1.5 sm:mb-2" />
      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/80 font-medium">{label}</div>
    </div>
  </div>
);

// Quick Action Button - Compact on mobile
const QuickAction = ({ icon: Icon, label, onClick, badge }: { 
  icon: any; label: string; onClick: () => void; badge?: string 
}) => (
  <button onClick={onClick} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all group w-full text-left">
    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
      <Icon className="h-4 w-4" />
    </div>
    <span className="flex-1 text-sm font-medium text-foreground truncate">{label}</span>
    {badge && <Badge variant="secondary" className="text-xs h-5 px-1.5">{badge}</Badge>}
    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
  </button>
);

// Mandatory Setup Section - shown inline when vendor has no profile yet
function MandatorySetupSection({ onComplete }: { onComplete: () => void }) {
  const { user, refreshVendorInfo, updateUser } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Location fields - mandatory
  const [serviceLocation, setServiceLocation] = useState<LocationDTO | null>(null);
  const [coverageRadius, setCoverageRadius] = useState(25); // Default 25km

  // Get phone and email from user context or sessionStorage (for fresh signups)
  // These are read-only login credentials
  const [signupPhone, setSignupPhone] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  
  // Load signup data once on mount
  useEffect(() => {
    const signupData = sessionStorage.getItem('vendorSignupData');
    if (signupData) {
      try {
        const data = JSON.parse(signupData);
        if (data.phone) setSignupPhone(data.phone);
        if (data.email) setSignupEmail(data.email);
      } catch (e) {}
      // Clear after reading
      sessionStorage.removeItem('vendorSignupData');
    }
  }, []);
  
  // Derive phone and email - prefer user context, fallback to signup data
  const phone = user?.phone || signupPhone || '';
  const email = user?.email || signupEmail || '';

  const isFormValid = businessName.trim() !== '' && category !== '' && city !== '' &&
    serviceLocation !== null; // Location is now mandatory
  
  // Calculate progress - now 4 steps
  const filledFields = [
    businessName.trim(), 
    category, 
    city,
    serviceLocation
  ].filter(Boolean).length;

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        businessName: businessName.trim(),
        categoryId: category,
        customCategoryName: null,
        cityName: city,
        phone: phone.trim() || null,
        email: email.trim() || null,
        bio: bio.trim() || null,
        serviceRadiusKm: coverageRadius,
        // Location data
        locationName: serviceLocation?.name || null,
        locationLat: serviceLocation?.latitude || null,
        locationLng: serviceLocation?.longitude || null,
      };
      console.log('Onboarding payload:', payload); // Debug log
      const response = await vendorApi.onboard(payload);
      if (response.success && response.data) {
        localStorage.setItem('vendor_id', response.data.id);
        await refreshVendorInfo();
        if (user?.role !== 'VENDOR') updateUser({ role: 'VENDOR' });
        toast.success('Profile created! Now add photos and complete your profile.');
        onComplete();
      } else {
        throw new Error(response.message || 'Failed to create profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative -mt-12 sm:-mt-16">
      {/* Main Card */}
      <div className="bg-card rounded-2xl shadow-elegant border border-border/50 overflow-hidden">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-[#5950b3] to-[#7867dc] px-6 sm:px-8 py-6">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }} />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Complete Your Profile
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Just 4 quick steps to start receiving leads
              </p>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step <= filledFields 
                      ? 'bg-white text-[#5950b3]' 
                      : 'bg-white/20 text-white/70'
                  }`}>
                    {step <= filledFields ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 4 && (
                    <div className={`w-6 h-0.5 ${step < filledFields ? 'bg-white' : 'bg-white/20'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Step 1: Business Name */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                businessName.trim() 
                  ? 'bg-primary text-white' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {businessName.trim() ? <CheckCircle className="h-3.5 w-3.5" /> : '1'}
              </div>
              <Label className="text-sm font-semibold text-foreground">What's your business name?</Label>
            </div>
            <Input 
              value={businessName} 
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Royal Decorators, Shutter Stories Photography"
              className="h-12 text-base border-2 border-border/50 focus:border-primary bg-background transition-colors"
            />
            <p className="text-xs text-muted-foreground ml-8">
              This is how customers will see your business. Choose a memorable name!
            </p>
          </div>

          {/* Step 2 & 3: City & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  city 
                    ? 'bg-primary text-white' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {city ? <CheckCircle className="h-3.5 w-3.5" /> : '2'}
                </div>
                <Label className="text-sm font-semibold text-foreground">Where are you based?</Label>
              </div>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-12 text-base border-2 border-border/50 focus:border-primary bg-background">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  category 
                    ? 'bg-primary text-white' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {category ? <CheckCircle className="h-3.5 w-3.5" /> : '3'}
                </div>
                <Label className="text-sm font-semibold text-foreground">What are you?</Label>
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 text-base border-2 border-border/50 focus:border-primary bg-background">
                  <SelectValue placeholder="Select your profession" />
                </SelectTrigger>
                <SelectContent>
                  {vendorProfessions.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2"><span>{cat.icon}</span><span>{cat.name}</span></span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Step 4: Service Location - Mandatory */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                serviceLocation 
                  ? 'bg-primary text-white' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {serviceLocation ? <CheckCircle className="h-3.5 w-3.5" /> : '4'}
              </div>
              <Label className="text-sm font-semibold text-foreground">Where do you provide services?</Label>
            </div>
            
            <div className="space-y-4 ml-8">
              {/* Location Autocomplete */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Primary Service Location
                </Label>
                <LocationAutocomplete
                  value={serviceLocation}
                  onChange={setServiceLocation}
                  placeholder="Search for your area (e.g., Koramangala, Bangalore)"
                  className="h-12"
                  bangaloreOnly={true}
                />
                {serviceLocation && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    {serviceLocation.name}
                  </p>
                )}
              </div>
              
              {/* Coverage Radius - Only show after location is set */}
              {serviceLocation && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5" /> How far will you travel at no extra cost?
                  </Label>
                  <RadiusSlider
                    value={coverageRadius}
                    onChange={setCoverageRadius}
                    options={VENDOR_RADIUS_OPTIONS}
                    label=""
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Customers within {coverageRadius}km won't be charged travel fees
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Optional Section */}
          <details className="group pt-2">
            <summary className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors list-none select-none">
              <div className="w-5 h-5 rounded border border-border flex items-center justify-center group-open:bg-primary/10 transition-colors">
                <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
              </div>
              <span>Add contact details now</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Optional</span>
            </summary>
            <div className="mt-4 ml-7 pt-4 border-t border-border/50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone
                    {phone && <span className="text-xs text-primary">(Login credential)</span>}
                  </Label>
                  <div className="h-11 px-3 flex items-center bg-muted/50 rounded-lg border border-border/50 text-sm text-foreground">
                    {phone || 'Not provided'}
                  </div>
                  {phone && (
                    <p className="text-xs text-muted-foreground">
                      This is your login phone number and cannot be changed here
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                    {email && <span className="text-xs text-primary">(Login credential)</span>}
                  </Label>
                  <div className="h-11 px-3 flex items-center bg-muted/50 rounded-lg border border-border/50 text-sm text-foreground truncate">
                    {email || 'Not provided'}
                  </div>
                  {email && (
                    <p className="text-xs text-muted-foreground">
                      This is your login email and cannot be changed here
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Edit3 className="h-3.5 w-3.5" /> About Your Business
                </Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} 
                  placeholder="Tell customers what makes you unique..."
                  className="min-h-[80px] resize-none border border-border/50" />
              </div>
            </div>
          </details>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={!isFormValid || isSubmitting}
              className={`w-full h-14 text-base font-semibold transition-all duration-300 rounded-xl ${
                isFormValid 
                  ? 'bg-gradient-to-r from-[#5950b3] to-[#7867dc] hover:from-[#4a42a0] hover:to-[#6858c8] text-white shadow-lg shadow-primary/25' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating your profile...</>
              ) : isFormValid ? (
                <>
                  Continue to Your Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>Complete all 4 steps above</>
              )}
            </Button>
            
            {isFormValid && (
              <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Ready! You can add photos & portfolio next
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorProfile() {
  const { data: profileData, loading, error, refetch } = useVendorProfile();
  const { data: dashboardStats } = useVendorDashboardStats();
  const { user } = useAuth();
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  
  const [activeSection, setActiveSection] = useState<'overview' | 'edit' | 'gallery' | 'location' | 'contact'>('overview');
  const [formData, setFormData] = useState({ 
    businessName: '', bio: '', coverImage: '', profileImage: '', portfolioImages: [] as string[],
    phone: '', alternatePhone: '', email: '', instagram: '', website: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [pendingPortfolioFiles, setPendingPortfolioFiles] = useState<File[]>([]); // Files waiting to be uploaded on save
  const [removedPortfolioUrls, setRemovedPortfolioUrls] = useState<string[]>([]); // URLs to delete on save
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [showCoverCropModal, setShowCoverCropModal] = useState(false);
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
  const [showCoverViewer, setShowCoverViewer] = useState(false);
  const [location, setLocation] = useState<LocationDTO | null>(null);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(25);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  
  // Track original values to detect changes (dirty state)
  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);
  const [originalPortfolioImages, setOriginalPortfolioImages] = useState<string[]>([]);
  const [originalLocation, setOriginalLocation] = useState<LocationDTO | null>(null);
  const [originalRadius, setOriginalRadius] = useState(25);

  useEffect(() => {
    if (profileData) {
      setFormData({
        businessName: profileData.businessName || '',
        bio: profileData.bio || '',
        coverImage: profileData.coverImage || '',
        profileImage: profileData.profileImage || '',
        portfolioImages: profileData.portfolioImages || [],
        phone: profileData.phone || '',
        alternatePhone: profileData.alternatePhone || '',
        email: profileData.email || '',
        instagram: profileData.instagram || '',
        website: profileData.website || '',
      });
      setPortfolioImages(profileData.portfolioImages || []);
      if (profileData.locationName && profileData.locationLat && profileData.locationLng) {
        const loc = { name: profileData.locationName, latitude: profileData.locationLat, longitude: profileData.locationLng };
        setLocation(loc);
        setOriginalLocation(loc);
      }
      if (profileData.serviceRadiusKm) {
        setServiceRadiusKm(profileData.serviceRadiusKm);
        setOriginalRadius(profileData.serviceRadiusKm);
      }
      
      // Store original values for dirty checking
      setOriginalFormData({
        businessName: profileData.businessName || '',
        bio: profileData.bio || '',
        coverImage: profileData.coverImage || '',
        profileImage: profileData.profileImage || '',
        portfolioImages: profileData.portfolioImages || [],
        phone: profileData.phone || '',
        alternatePhone: profileData.alternatePhone || '',
        email: profileData.email || '',
        instagram: profileData.instagram || '',
        website: profileData.website || '',
      });
      setOriginalPortfolioImages(profileData.portfolioImages || []);
    }
  }, [profileData]);
  
  // Dirty state checks - only enable save when something changed
  const isProfileDirty = originalFormData && (
    formData.businessName !== originalFormData.businessName ||
    formData.bio !== originalFormData.bio
  );
  
  const isGalleryDirty = (
    pendingPortfolioFiles.length > 0 ||
    removedPortfolioUrls.length > 0 ||
    JSON.stringify(portfolioImages) !== JSON.stringify(originalPortfolioImages)
  );
  
  const isLocationDirty = (
    (location?.name !== originalLocation?.name) ||
    (location?.latitude !== originalLocation?.latitude) ||
    (location?.longitude !== originalLocation?.longitude) ||
    serviceRadiusKm !== originalRadius
  );
  
  const isContactDirty = originalFormData && (
    formData.alternatePhone !== originalFormData.alternatePhone ||
    formData.instagram !== originalFormData.instagram ||
    formData.website !== originalFormData.website
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const vendorId = localStorage.getItem('vendor_id') || 'new';
      const folder = `vendors/${vendorId}/portfolio`;
      
      // Upload pending portfolio files
      let finalPortfolioImages = [...portfolioImages];
      
      if (pendingPortfolioFiles.length > 0) {
        setIsUploadingPortfolio(true);
        for (const file of pendingPortfolioFiles) {
          try {
            const imageUrl = await uploadImage(file, folder);
            finalPortfolioImages.push(imageUrl);
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
        setIsUploadingPortfolio(false);
      }
      
      // Delete removed images from CDN (don't fail if delete fails)
      if (removedPortfolioUrls.length > 0) {
        deleteImages(removedPortfolioUrls).catch(err => {
          console.warn('Failed to delete some images:', err);
        });
      }
      
      const response = await vendorApi.updateProfile({
        businessName: formData.businessName, bio: formData.bio,
        coverImage: formData.coverImage, profileImage: formData.profileImage,
        portfolioImages: finalPortfolioImages,
      });
      
      if (response.success) { 
        // Clear pending states
        setPendingPortfolioFiles([]);
        setRemovedPortfolioUrls([]);
        setPortfolioImages(finalPortfolioImages);
        // Update original values to reflect saved state
        setOriginalFormData({ ...formData });
        setOriginalPortfolioImages(finalPortfolioImages);
        toast.success('Profile updated!'); 
        refetch(); 
        setActiveSection('overview'); 
      }
      else throw new Error(response.message || 'Failed to update profile');
    } catch (error: any) { toast.error(error.message || 'Failed to update profile'); }
    finally { setIsSaving(false); setIsUploadingPortfolio(false); }
  };

  const handleSaveContact = async () => {
    setIsSavingContact(true);
    try {
      const response = await vendorApi.updateProfile({
        phone: formData.phone, email: formData.email,
        alternatePhone: formData.alternatePhone,
        instagram: formData.instagram, website: formData.website,
      });
      if (response.success) { 
        // Update original values to reflect saved state
        if (originalFormData) {
          setOriginalFormData({ ...originalFormData, alternatePhone: formData.alternatePhone, instagram: formData.instagram, website: formData.website });
        }
        toast.success('Contact info updated!'); 
        refetch(); 
        setActiveSection('overview'); 
      }
      else throw new Error(response.message || 'Failed to update contact info');
    } catch (error: any) { toast.error(error.message || 'Failed to update contact info'); }
    finally { setIsSavingContact(false); }
  };

  const handleSaveLocation = async () => {
    if (!location) { toast.error('Please select a location first'); return; }
    setIsSavingLocation(true);
    try {
      const response = await vendorApi.updateLocation({
        locationName: location.name, latitude: location.latitude,
        longitude: location.longitude, serviceRadiusKm: serviceRadiusKm,
      });
      if (response.success) { 
        // Update original values to reflect saved state
        setOriginalLocation(location);
        setOriginalRadius(serviceRadiusKm);
        toast.success('Location updated!'); 
        refetch(); 
        setActiveSection('overview'); 
      }
      else throw new Error(response.message || 'Failed to update location');
    } catch (error: any) { toast.error(error.message || 'Failed to update location'); }
    finally { setIsSavingLocation(false); }
  };

  // Auto-save function for cover and profile images (now uses R2 URL)
  const autoSaveImage = async (imageType: 'cover' | 'profile', imageUrl: string) => {
    try {
      const updateData = imageType === 'cover' 
        ? { coverImage: imageUrl }
        : { profileImage: imageUrl };
      const response = await vendorApi.updateProfile(updateData);
      if (response.success) {
        // Don't show toast here - caller handles it
        refetch();
      } else {
        throw new Error(response.message || 'Failed to save image');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save image');
    }
  };

  // Remove profile picture
  const handleRemoveProfileImage = async () => {
    setIsUploadingProfile(true);
    const oldImageUrl = formData.profileImage;
    
    try {
      const response = await vendorApi.updateProfile({ profileImage: '' });
      if (response.success) {
        setFormData({ ...formData, profileImage: '' });
        toast.success('Profile photo removed!');
        refetch();
        
        // Delete from R2 after successful DB update
        if (oldImageUrl && oldImageUrl.includes('images.cartevent.com')) {
          try {
            await deleteImage(oldImageUrl);
            console.log('Profile image deleted from R2:', oldImageUrl);
          } catch (deleteError) {
            console.warn('Failed to delete image from R2:', deleteError);
          }
        }
      } else {
        throw new Error(response.message || 'Failed to remove image');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image');
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'profile' | 'portfolio') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { toast.error('Only images allowed (JPG, PNG, WebP, GIF)'); return; }
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }
    
    // For cover images, open crop modal first
    if (type === 'cover') {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverCropSrc(reader.result as string);
        setShowCoverCropModal(true);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }
    
    if (type === 'profile') setIsUploadingProfile(true);
    else setIsUploadingPortfolio(true);
    
    try {
      const vendorId = localStorage.getItem('vendor_id') || 'new';
      const folder = type === 'portfolio' 
        ? `vendors/${vendorId}/portfolio`
        : `vendors/${vendorId}/${type}`;
      
      // Get the old image URL to delete after successful upload
      const oldImageUrl = type === 'profile' 
          ? formData.profileImage 
          : null;
      
      // Upload to R2 via backend (compression happens on backend)
      const imageUrl = await uploadImage(file, folder);
      
      if (type === 'profile') { 
        setFormData(prev => ({ ...prev, profileImage: imageUrl })); 
        // Auto-save profile image immediately
        await autoSaveImage('profile', imageUrl);
      } else { 
        setPortfolioImages([...portfolioImages, imageUrl]); 
        toast.success('Image added! Click Save to apply.'); 
      }
      
      // Delete old image from R2 after successful upload (for profile only)
      if (oldImageUrl && oldImageUrl.includes('images.cartevent.com')) {
        try {
          await deleteImage(oldImageUrl);
          console.log('Old image deleted:', oldImageUrl);
        } catch (deleteError) {
          // Don't fail the upload if delete fails - just log it
          console.warn('Failed to delete old image:', deleteError);
        }
      }
    } catch (error: any) { 
      console.error('Image upload failed:', error);
      toast.error(error.message || 'Failed to upload image'); 
    }
    finally { 
      if (type === 'profile') setIsUploadingProfile(false);
      else setIsUploadingPortfolio(false);
      e.target.value = ''; 
    }
  };

  // Handle cover image crop completion
  const handleCoverCropComplete = async (blob: Blob) => {
    setIsUploadingCover(true);
    try {
      const file = new File([blob], 'cover-image.jpg', { type: 'image/jpeg' });
      const vendorId = localStorage.getItem('vendor_id') || 'new';
      const folder = `vendors/${vendorId}/cover`;
      const oldImageUrl = formData.coverImage;
      
      const imageUrl = await uploadImage(file, folder);
      setFormData(prev => ({ ...prev, coverImage: imageUrl }));
      await autoSaveImage('cover', imageUrl);
      
      // Delete old image
      if (oldImageUrl && oldImageUrl.includes('images.cartevent.com')) {
        deleteImage(oldImageUrl).catch(console.warn);
      }
      
      toast.success('Cover image updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
      setCoverCropSrc(null);
    }
  };

  const handleMultipleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        continue;
      }
      
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setPendingPortfolioFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} image(s) added. Click Save to upload.`);
    }
    e.target.value = '';
  };

  const vendorId = localStorage.getItem('vendor_id');
  const isNewVendor = !vendorId;

  if (loading && !isNewVendor) return <VendorLayout><div className="flex items-center justify-center min-h-[calc(100vh-12rem)]"><BrandedLoader fullScreen={false} message="Setting up your profile..." /></div></VendorLayout>;
  
  if (error && !isNewVendor) return <VendorLayout><InlineError title="Failed to load profile" message="We couldn't load your profile data." error={error} onRetry={() => refetch()} showHomeButton={false} /></VendorLayout>;
  
  // For new vendors, we show the profile UI with mandatory setup section
  // For existing vendors, we need profileData loaded
  if (!profileData && !isNewVendor) return <VendorLayout><div className="flex items-center justify-center min-h-[calc(100vh-12rem)]"><BrandedLoader fullScreen={false} message="Setting up your profile..." /></div></VendorLayout>;

  const isVerified = profileData?.isVerified || false;
  const categoryName = profileData?.customCategoryName || profileData?.vendorCategory?.name || profileData?.categoryName || 'Vendor';
  const cityName = profileData?.cityName || '';
  
  // Use formData for real-time profile completion (reflects unsaved changes)
  const profileForCompletion = profileData ? {
    ...profileData,
    profileImage: formData.profileImage,
    coverImage: formData.coverImage,
    bio: formData.bio,
    businessName: formData.businessName,
    phone: formData.phone,
    email: formData.email,
  } : null;
  const { checks, completed, completedCount, totalCount, level, levelColor, levelBg } = profileForCompletion 
    ? calculateProfileCompletion(profileForCompletion, portfolioImages, location)
    : { checks: [], completed: 0, completedCount: 0, totalCount: 7, level: 'Not Started', levelColor: 'text-gray-400', levelBg: 'bg-gray-400' };
  
  // Real stats from dashboard API
  const stats = {
    pendingLeads: dashboardStats?.pendingLeads || 0,
    upcomingBookings: dashboardStats?.upcomingBookings || 0,
    rating: profileData?.rating || 0,
    reviewCount: profileData?.reviewCount || 0,
  };

  return (
    <VendorLayout>
      <input type="file" ref={coverInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleFileSelect(e, 'cover')} />
      <input type="file" ref={profileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleFileSelect(e, 'profile')} />
      <input type="file" ref={portfolioInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleMultipleFileSelect} />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Hero Section - Simplified for new vendors */}
        {isNewVendor ? (
          <div className="relative">
            {/* Brand-aligned Hero for New Vendors - Lighter background */}
            <div className="h-28 sm:h-36 relative overflow-hidden bg-gradient-to-br from-[#7a72c4]/70 via-[#8b7fd4]/60 to-[#9d93e0]/50">
              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
              <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="h-64 sm:h-72 md:h-96 lg:h-[28rem] relative overflow-hidden">
              {formData.coverImage ? (
                <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover object-center" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground/70">Add a cover image</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Cover Image Button - Always Visible */}
              <div className="absolute top-4 right-4 flex gap-2">
                {formData.coverImage && (
                  <Button size="sm" className="bg-black/70 hover:bg-black/90 text-white shadow-lg backdrop-blur-sm border-0" onClick={() => setShowCoverViewer(true)}>
                    <Eye className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">View</span>
                  </Button>
                )}
                <Button size="sm" className="bg-black/70 hover:bg-black/90 text-white shadow-lg backdrop-blur-sm border-0" onClick={() => coverInputRef.current?.click()} disabled={isUploadingCover}>
                  {isUploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  <span className="ml-2">{formData.coverImage ? 'Change Cover' : 'Add Cover'}</span>
                </Button>
              </div>
            </div>

            {/* Profile Card Overlay */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 -mt-16 sm:-mt-20 relative z-10">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-primary/20 bg-gradient-to-br from-white via-primary/[0.03] to-violet-500/[0.08] dark:from-card dark:via-primary/[0.05] dark:to-violet-500/[0.1]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-full blur-3xl -mr-36 -mt-36" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-violet-500/10 to-primary/5 rounded-full blur-3xl -ml-28 -mb-28" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/[0.02] rounded-full blur-3xl" />
                
                <div className="relative p-4 sm:p-5 lg:p-6 xl:p-8">
                  {/* Mobile/Tablet: Stacked layout, Large Desktop: Side by side */}
                  <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
                    
                    {/* Left Section: Profile Info */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5 xl:flex-1">
                      {/* Profile Picture with Upload - Using ProfileImageUpload component */}
                      <div className="flex-shrink-0">
                        <ProfileImageUpload
                          type="profile"
                          size="2xl"
                          imageUrl={formData.profileImage || null}
                          onImageChange={async (file) => {
                            if (file) {
                              setIsUploadingProfile(true);
                              try {
                                const vendorId = localStorage.getItem('vendor_id') || 'new';
                                const folder = `vendors/${vendorId}/profile`;
                                const oldImageUrl = formData.profileImage;
                                const imageUrl = await uploadImage(file, folder);
                                setFormData(prev => ({ ...prev, profileImage: imageUrl }));
                                await autoSaveImage('profile', imageUrl);
                                // Delete old image
                                if (oldImageUrl && oldImageUrl.includes('images.cartevent.com')) {
                                  deleteImage(oldImageUrl).catch(console.warn);
                                }
                                toast.success('Profile image updated!');
                              } catch (error: any) {
                                toast.error(error.message || 'Failed to upload image');
                              } finally {
                                setIsUploadingProfile(false);
                              }
                            }
                          }}
                          onImageDelete={handleRemoveProfileImage}
                          uploading={isUploadingProfile}
                        />
                      </div>
                      
                      {/* Business Info */}
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2 sm:mb-3">
                          <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-foreground">{formData.businessName || 'Your Business'}</h1>
                          {isVerified && (
                            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 flex items-center gap-1 text-xs px-2 py-0.5">
                              <CheckCircle className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-muted-foreground text-sm sm:text-base">
                          <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 sm:h-5 sm:w-5" /> {categoryName}</span>
                          {(location?.name || cityName) && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 sm:h-5 sm:w-5" /> {location?.name || cityName}</span>}
                          {location && <span className="flex items-center gap-1.5"><Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> {serviceRadiusKm}km</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Profile Strength - Full width until xl, then side panel */}
                    <div className="xl:w-80 2xl:w-96">
                      <div className="relative overflow-hidden rounded-xl p-4 bg-white/80 dark:bg-card/90 backdrop-blur-sm border border-border/50 shadow-sm">
                        {/* Header */}
                        <div className="relative flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                              <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">Profile Strength</span>
                          </div>
                          <Badge variant="outline" className={`text-xs ${levelColor} border-current`}>{level}</Badge>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-2.5 bg-muted/60 rounded-full overflow-hidden mb-2">
                          <div className={`absolute inset-y-0 left-0 ${levelBg} transition-all duration-500 rounded-full`} style={{ width: `${completed}%` }} />
                        </div>
                        
                        {/* Completion Status */}
                        <div className="relative flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>{completedCount}/{totalCount} completed</span>
                          <span className={`font-semibold ${levelColor}`}>{completed}%</span>
                        </div>
                        
                        {completed < 100 ? (
                          <div className="relative space-y-2">
                            <p className="text-xs text-muted-foreground">
                              {completed < 50 ? '🚀 Complete your profile to attract more customers!' : 
                               completed < 70 ? '💪 Great progress! A few more steps to go.' :
                               completed < 90 ? '🎯 Almost there! Finish up for maximum visibility.' :
                               '✨ Just one more step to a perfect profile!'}
                            </p>
                            <div className="space-y-1.5">
                              {checks.filter(c => !c.done).slice(0, 3).map((check, i) => (
                                <button 
                                  key={i} 
                                  onClick={() => {
                                    if (check.name.includes('Photo') || check.name.includes('Cover')) setActiveSection('edit');
                                    else if (check.name.includes('Portfolio')) setActiveSection('gallery');
                                    else if (check.name.includes('Location')) setActiveSection('location');
                                    else if (check.name.includes('Contact')) setActiveSection('contact');
                                    else if (check.name.includes('Bio')) setActiveSection('edit');
                                    else setActiveSection('edit');
                                  }}
                                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/50 hover:border-primary hover:bg-primary/5 transition-all text-xs group"
                                >
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                  <span className="text-muted-foreground group-hover:text-foreground text-left flex-1">{check.tip}</span>
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-3">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="text-xs font-medium">Profile complete & optimized!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 ${isNewVendor ? 'pb-16' : 'py-6 sm:py-8'}`}>
          {/* Mandatory Setup Section for New Vendors */}
          {isNewVendor && (
            <div className="max-w-2xl mx-auto">
              <MandatorySetupSection onComplete={() => window.location.reload()} />
            </div>
          )}

          {/* Stats Grid - Only show for existing vendors */}
          {!isNewVendor && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-5 sm:mb-6 lg:mb-8">
              <StatCard icon={MessageCircle} label="Pending Leads" value={stats.pendingLeads} color="bg-gradient-to-br from-blue-500 to-blue-600" />
              <StatCard icon={CalendarCheck} label="Upcoming" value={stats.upcomingBookings} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
              <StatCard icon={Star} label="Rating" value={stats.rating > 0 ? `${Number(stats.rating).toFixed(1)}` : '—'} color="bg-gradient-to-br from-amber-500 to-orange-500" />
            </div>
          )}

          {/* Section Navigation - Only show for existing vendors */}
          {!isNewVendor && (
            <div className="mb-4 sm:mb-6">
              {/* Mobile: Icon-only tabs in a centered row */}
              <div className="flex sm:hidden justify-center gap-1 bg-muted/30 p-1 rounded-full mx-auto w-fit">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'edit', label: 'Edit', icon: Edit3 },
                  { id: 'gallery', label: 'Gallery', icon: ImagePlus },
                  { id: 'location', label: 'Location', icon: MapPin },
                  { id: 'contact', label: 'Contact', icon: Phone },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id as any)}
                    className={`relative p-2.5 rounded-full transition-all ${
                      activeSection === tab.id 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    title={tab.label}
                  >
                    <tab.icon className="h-4 w-4" />
                    {activeSection === tab.id && (
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary whitespace-nowrap">
                        {tab.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Desktop: Full tabs with labels */}
              <div className="hidden sm:flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'edit', label: 'Edit', icon: Edit3 },
                  { id: 'gallery', label: 'Gallery', icon: ImagePlus },
                  { id: 'location', label: 'Location', icon: MapPin },
                  { id: 'contact', label: 'Contact', icon: Phone },
                ].map((tab) => (
                  <Button key={tab.id} variant={activeSection === tab.id ? 'default' : 'ghost'} 
                    size="sm"
                    className={`flex-shrink-0 h-9 px-4 text-sm rounded-full ${activeSection === tab.id ? 'bg-primary text-white shadow-md' : 'bg-muted/50'}`}
                    onClick={() => setActiveSection(tab.id as any)}>
                    <tab.icon className="h-4 w-4 mr-2" /> 
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* All Profile Sections - Only show for existing vendors */}
          {!isNewVendor && activeSection === 'overview' && (
            <div className="grid xl:grid-cols-3 gap-4 sm:gap-6">
              <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                {/* About */}
                <Card className="overflow-hidden border-0 shadow-md sm:shadow-lg">
                  <CardContent className="p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> About
                    </h3>
                    {formData.bio ? (
                      <p className="text-sm text-muted-foreground leading-relaxed">{formData.bio}</p>
                    ) : (
                      <div className="text-center py-6 sm:py-8 bg-muted/30 rounded-xl">
                        <Edit3 className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">Add a bio to tell customers about your business</p>
                        <Button variant="outline" size="sm" onClick={() => setActiveSection('edit')}>Add Bio</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Portfolio Preview */}
                <Card className="overflow-hidden border-0 shadow-md sm:shadow-lg">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <ImagePlus className="h-4 w-4 text-primary" /> Portfolio ({portfolioImages.length})
                      </h3>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs sm:text-sm" onClick={() => setActiveSection('gallery')}>
                        View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                    {portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {portfolioImages.slice(0, 6).map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg sm:rounded-xl overflow-hidden group cursor-pointer" onClick={() => setActiveSection('gallery')}>
                            <img src={img} alt={`Work ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 bg-muted/30 rounded-xl">
                        <ImagePlus className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">Showcase your work with portfolio images</p>
                        <Button variant="outline" size="sm" onClick={() => setActiveSection('gallery')}>Add Images</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Quick Actions */}
              <div className="space-y-4 sm:space-y-6">
                <Card className="overflow-hidden border-0 shadow-md sm:shadow-lg">
                  <CardContent className="p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Quick Actions</h3>
                    
                    {/* Mobile: 2x2 grid for better touch targets */}
                    <div className="grid grid-cols-2 gap-2 sm:hidden">
                      {[
                        { icon: Edit3, label: 'Edit Profile', action: () => setActiveSection('edit') },
                        { icon: ImagePlus, label: 'Gallery', action: () => setActiveSection('gallery'), badge: portfolioImages.length },
                        { icon: MapPin, label: 'Location', action: () => setActiveSection('location') },
                        { icon: Phone, label: 'Contact', action: () => setActiveSection('contact') },
                      ].map((item, i) => (
                        <button 
                          key={i}
                          onClick={item.action}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all text-left"
                        >
                          <div className="relative flex-shrink-0">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <item.icon className="h-4 w-4" />
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white rounded-full px-1">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Desktop: Vertical list */}
                    <div className="hidden sm:grid gap-2">
                      <QuickAction icon={Edit3} label="Edit Profile" onClick={() => setActiveSection('edit')} />
                      <QuickAction icon={ImagePlus} label="Add Portfolio" onClick={() => setActiveSection('gallery')} badge={`${portfolioImages.length}`} />
                      <QuickAction icon={MapPin} label="Update Location" onClick={() => setActiveSection('location')} />
                      <QuickAction icon={Phone} label="Contact Info" onClick={() => setActiveSection('contact')} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Edit Profile Section */}
          {!isNewVendor && activeSection === 'edit' && (
            <Card className="overflow-hidden border-0 shadow-md sm:shadow-lg">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-xl font-semibold">Edit Profile</h3>
                  <Button size="sm" onClick={handleSave} disabled={isSaving || !isProfileDirty} className={`text-xs sm:text-sm ${isProfileDirty ? 'bg-gradient-to-r from-primary to-primary-glow' : 'bg-muted text-muted-foreground'}`}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {isProfileDirty ? 'Save Changes' : 'No Changes'}
                  </Button>
                </div>
                
                {/* Profile & Cover Image Section */}
                <div className="mb-8 p-6 bg-muted/30 rounded-2xl">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2"><Camera className="h-4 w-4" /> Profile Images</h4>
                  <div className="flex flex-wrap gap-6">
                    {/* Profile Picture */}
                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground mb-2 block">Profile Photo</Label>
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-border group-hover:border-primary transition-colors">
                          {formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <User className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => profileInputRef.current?.click()}
                          disabled={isUploadingProfile}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"
                        >
                          {isUploadingProfile ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Cover Image */}
                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-xs text-muted-foreground mb-2 block">Cover Image</Label>
                      <div className="relative group">
                        <div className="h-24 rounded-xl overflow-hidden border-2 border-dashed border-border group-hover:border-primary transition-colors">
                          {formData.coverImage ? (
                            <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <ImagePlus className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => coverInputRef.current?.click()}
                          disabled={isUploadingCover}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"
                        >
                          {isUploadingCover ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Business Name</Label>
                      <Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} 
                        placeholder="Enter your business name" className="h-12" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Category</Label>
                      <Input value={categoryName} disabled className="h-12 bg-muted/50" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Bio</Label>
                    <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell customers about your business, experience, and what makes you special..."
                      className="min-h-[140px] resize-none" maxLength={500} />
                    <p className="text-xs text-muted-foreground mt-2">{formData.bio.length}/500 characters {formData.bio.length < 50 && <span className="text-amber-500">(min 50 for profile completion)</span>}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gallery Section */}
          {!isNewVendor && activeSection === 'gallery' && (
            <Card className="overflow-hidden border-0 shadow-md sm:shadow-lg">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Header - Stack on mobile */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold">Portfolio Gallery</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Showcase your best work 
                        <span className={(portfolioImages.length + pendingPortfolioFiles.length) >= 3 ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'}> ({portfolioImages.length + pendingPortfolioFiles.length}/3 min)</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9" onClick={() => portfolioInputRef.current?.click()} disabled={isUploadingPortfolio}>
                        {isUploadingPortfolio ? <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" /> : <ImagePlus className="h-4 w-4 sm:mr-2" />}
                        <span className="hidden sm:inline">Add Images</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                      <Button size="sm" className={`flex-1 sm:flex-none h-9 ${isGalleryDirty ? 'bg-gradient-to-r from-primary to-primary-glow' : 'bg-muted text-muted-foreground'}`} onClick={handleSave} disabled={isSaving || !isGalleryDirty}>
                        {isSaving ? <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" /> : <Save className="h-4 w-4 sm:mr-2" />}
                        <span className="hidden sm:inline">{isGalleryDirty ? 'Save Changes' : 'Saved'}</span>
                        <span className="sm:hidden">{isGalleryDirty ? 'Save' : '✓'}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Pending uploads notice */}
                {pendingPortfolioFiles.length > 0 && (
                  <div className="mb-4 p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                      {pendingPortfolioFiles.length} image(s) pending. Tap <strong>Save</strong> to upload.
                    </p>
                  </div>
                )}

                {(portfolioImages.length > 0 || pendingPortfolioFiles.length > 0) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                    {/* Existing uploaded images */}
                    {portfolioImages.map((img, i) => (
                      <div key={`uploaded-${i}`} className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden group relative bg-muted">
                        <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => { 
                            setPortfolioImages(portfolioImages.filter((_, idx) => idx !== i)); 
                            setRemovedPortfolioUrls(prev => [...prev, img]);
                            toast.success('Image marked for removal. Click Save to confirm.'); 
                          }}>
                            <X className="h-3.5 w-3.5 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pending images (not yet uploaded) */}
                    {pendingPortfolioFiles.map((file, i) => (
                      <div key={`pending-${i}`} className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden group relative bg-muted border-2 border-dashed border-amber-400">
                        <img src={URL.createObjectURL(file)} alt={`Pending ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                          <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-amber-500 text-white font-medium">Pending</span>
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => { 
                            setPendingPortfolioFiles(pendingPortfolioFiles.filter((_, idx) => idx !== i)); 
                            toast.success('Image removed'); 
                          }}>
                            <X className="h-3.5 w-3.5 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add More Card */}
                    <div className="aspect-square rounded-xl sm:rounded-2xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all active:scale-95"
                      onClick={() => portfolioInputRef.current?.click()}>
                      <div className="text-center p-2 sm:p-4">
                        <ImagePlus className="h-6 w-6 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-1 sm:mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">Add More</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 sm:py-16 bg-muted/30 rounded-xl sm:rounded-2xl">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <ImagePlus className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold mb-2">No portfolio images yet</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">Upload at least 3 images of your best work to complete your profile</p>
                    <Button size="sm" onClick={() => portfolioInputRef.current?.click()} className="bg-gradient-to-r from-primary to-primary-glow">
                      <ImagePlus className="h-4 w-4 mr-2" /> Upload Images
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Info Section */}
          {!isNewVendor && activeSection === 'contact' && (
            <Card className="overflow-hidden border-0 shadow-md sm:shadow-lg">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Header - Stack on mobile */}
                <div className="mb-5 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-xl font-semibold">Contact Information</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Help customers reach you</p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={handleSaveContact} 
                      disabled={isSavingContact || !isContactDirty} 
                      className={`w-full sm:w-auto h-9 ${isContactDirty ? 'bg-gradient-to-r from-primary to-primary-glow' : 'bg-muted text-muted-foreground'}`}
                    >
                      {isSavingContact ? <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" /> : <Save className="h-4 w-4 sm:mr-2" />}
                      <span className="sm:inline">{isContactDirty ? 'Save' : 'No Changes'}</span>
                    </Button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-5 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-6 lg:gap-8">
                  {/* Left: Form Fields */}
                  <div className="space-y-4 sm:space-y-5">
                    {/* Phone - Read only */}
                    <div>
                      <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Phone
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Login</span>
                      </Label>
                      <div className="h-10 sm:h-11 px-3 flex items-center bg-muted/50 rounded-lg border border-border/50 text-sm text-foreground">
                        {user?.phone || formData.phone || 'Not set'}
                      </div>
                    </div>
                    
                    {/* Email - Read only */}
                    <div>
                      <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Email
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Login</span>
                      </Label>
                      <div className="h-10 sm:h-11 px-3 flex items-center bg-muted/50 rounded-lg border border-border/50 text-sm text-foreground truncate">
                        {user?.email || formData.email || 'Not set'}
                      </div>
                    </div>
                    
                    {/* Alternate Phone - Editable */}
                    <div>
                      <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" /> Alternate Phone
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Optional</span>
                      </Label>
                      <Input 
                        value={formData.alternatePhone} 
                        onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })} 
                        placeholder="9876543210" 
                        className="h-10 sm:h-11"
                        maxLength={10}
                      />
                    </div>
                    
                    {/* Instagram - Editable */}
                    <div>
                      <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block flex items-center gap-2">
                        <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" /> Instagram
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Optional</span>
                      </Label>
                      <Input 
                        value={formData.instagram} 
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} 
                        placeholder="@yourbusiness" 
                        className="h-10 sm:h-11" 
                      />
                    </div>
                    
                    {/* Website - Editable */}
                    <div>
                      <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" /> Website
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Optional</span>
                      </Label>
                      <Input 
                        value={formData.website} 
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })} 
                        placeholder="https://yourbusiness.com" 
                        className="h-10 sm:h-11" 
                      />
                    </div>
                  </div>

                  {/* Right: Info Card */}
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                    <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" /> Why add contact info?
                    </h4>
                    <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                      {[
                        'Customers can reach you directly',
                        'Builds trust with potential clients',
                        'Improves profile completion score',
                        'Social links boost credibility'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 sm:gap-3">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Contact Summary */}
                    {(formData.instagram || formData.website) && (
                      <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-background rounded-lg sm:rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground mb-2">
                          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" /> Your Social Links
                        </div>
                        {formData.instagram && (
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                            <Instagram className="h-3 w-3" /> {formData.instagram}
                          </p>
                        )}
                        {formData.website && (
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                            <Globe className="h-3 w-3" /> {formData.website}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Section */}
          {!isNewVendor && activeSection === 'location' && (
            <Card className="overflow-hidden border-0 shadow-md sm:shadow-lg">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Header - Stack on mobile */}
                <div className="mb-5 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                        <Navigation className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-xl font-semibold">Service Location</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Help customers find you</p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={handleSaveLocation} 
                      disabled={isSavingLocation || !location || !isLocationDirty} 
                      className={`w-full sm:w-auto h-9 ${isLocationDirty && location ? 'bg-gradient-to-r from-primary to-primary-glow' : 'bg-muted text-muted-foreground'}`}
                    >
                      {isSavingLocation ? <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" /> : <Save className="h-4 w-4 sm:mr-2" />}
                      <span className="sm:inline">{isLocationDirty ? 'Save' : 'No Changes'}</span>
                    </Button>
                  </div>
                </div>

                {/* Main Content - Single column on mobile */}
                <div className="space-y-5 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-6 lg:gap-8">
                  {/* Left: Form Fields */}
                  <div className="space-y-4 sm:space-y-5">
                    {/* City - Read only */}
                    <div>
                      <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block text-muted-foreground">City</Label>
                      <div className="h-10 sm:h-11 px-3 flex items-center bg-muted/50 rounded-lg border border-border/50 text-sm text-foreground">
                        {cityName || 'Not set'}
                      </div>
                    </div>
                    
                    {/* Location Search */}
                    <div>
                      <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Primary Service Location</Label>
                      <LocationAutocomplete 
                        value={location} 
                        onChange={setLocation} 
                        placeholder="Search your area..." 
                        bangaloreOnly={true}
                      />
                    </div>
                    
                    {/* Radius Slider - Only show after location is set */}
                    {location && (
                      <div className="pt-4 border-t border-border/50">
                        <RadiusSlider 
                          value={serviceRadiusKm} 
                          onChange={setServiceRadiusKm} 
                          options={VENDOR_RADIUS_OPTIONS} 
                          label="Travel distance (no extra cost)" 
                        />
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                          <span>💡</span>
                          <span>Customers within {serviceRadiusKm}km won't be charged travel fees</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Info Card */}
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                    <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" /> Why set your location?
                    </h4>
                    <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                      {[
                        'Appear in location-based searches',
                        'Customers see how far you can travel',
                        'Get matched with nearby customers',
                        'Build trust with local presence'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 sm:gap-3">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Current Location Summary */}
                    {location && (
                      <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-background rounded-lg sm:rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground mb-1">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" /> Current Location
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{location.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Service radius: {serviceRadiusKm} km</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cover Image Crop Modal */}
      <ImageCropModal
        open={showCoverCropModal}
        onClose={() => {
          setShowCoverCropModal(false);
          setCoverCropSrc(null);
        }}
        imageSrc={coverCropSrc || ''}
        onCropComplete={handleCoverCropComplete}
        aspectRatio={16 / 9}
        cropShape="rect"
        title="Crop Cover Image"
      />

      {/* Cover Image Viewer */}
      {formData.coverImage && (
        <ImageViewer
          open={showCoverViewer}
          onClose={() => setShowCoverViewer(false)}
          images={[formData.coverImage]}
          title="Cover Image"
          onEdit={() => {
            setShowCoverViewer(false);
            coverInputRef.current?.click();
          }}
        />
      )}
    </VendorLayout>
  );
}
