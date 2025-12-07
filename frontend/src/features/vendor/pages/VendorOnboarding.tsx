import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Upload, CheckCircle, Sparkles, ArrowRight, Phone, Mail, MapPin, Camera, Instagram, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { categories, cities } from '@/shared/constants/mockData';
import { vendorApi } from '@/shared/services/api';
import { useAuth } from '@/shared/contexts/AuthContext';

type OnboardingStep = 'welcome' | 'basic-info' | 'listing' | 'preview' | 'success';

// Category-specific examples
const categoryExamples: Record<string, string[]> = {
  photographer: ['2-Hour Candid Photoshoot', 'Pre-Wedding Shoot', 'Engagement Photography', 'Candid Wedding Coverage'],
  cinematographer: ['Wedding Cinematography Package', 'Highlight Reel', 'Full Wedding Film', 'Pre-Wedding Video'],
  decorator: ['Haldi Setup — Basic', 'Wedding Stage Decoration', 'Reception Decor', 'Mandap Decoration'],
  dj: ['DJ Setup — 3 Hours', 'Wedding DJ Package', 'Reception Music', 'Birthday Party DJ'],
  'sound-lights': ['Sound & Lighting Setup', 'Stage Lighting', 'LED Display', 'Professional Audio'],
  mua: ['Bridal Makeup Package', 'Engagement Makeup', 'Party Makeup', 'Hair & Makeup Combo'],
  caterer: ['Veg Per Plate — Silver Menu', 'Wedding Feast Package', 'Per Plate Catering', 'Buffet Service'],
  'return-gifts': ['Return Gift Sets', 'Customized Gifts', 'Premium Gift Boxes', 'Themed Gifts'],
  invitations: ['Wedding Invitations', 'Digital Invites', 'Printed Cards', 'Custom Design'],
  'live-music': ['Live Band Performance', 'Singer Performance', 'Instrumental Music', 'Fusion Band'],
  anchors: ['Wedding Anchor', 'Event MC', 'Bilingual Anchor', 'Celebrity Anchor'],
  'event-coordinator': ['Full Event Planning', 'Day Coordination', 'Vendor Management', 'Event Execution'],
};

// Price range suggestions based on city and category
const getPriceRange = (city: string, category: string): { min: number; max: number } => {
  const baseRanges: Record<string, { min: number; max: number }> = {
    photographer: { min: 5000, max: 30000 },
    cinematographer: { min: 20000, max: 80000 },
    decorator: { min: 10000, max: 100000 },
    dj: { min: 5000, max: 30000 },
    'sound-lights': { min: 8000, max: 40000 },
    mua: { min: 3000, max: 25000 },
    caterer: { min: 200, max: 800 },
    'return-gifts': { min: 100, max: 500 },
    invitations: { min: 30, max: 300 },
    'live-music': { min: 15000, max: 80000 },
    anchors: { min: 5000, max: 30000 },
    'event-coordinator': { min: 20000, max: 150000 },
  };

  const range = baseRanges[category] || { min: 1000, max: 50000 };
  const cityMultiplier: Record<string, number> = {
    mumbai: 1.2,
    delhi: 1.1,
    bangalore: 1.0,
    hyderabad: 0.9,
    chennai: 0.9,
    kolkata: 0.85,
    pune: 0.95,
    ahmedabad: 0.85,
  };

  const multiplier = cityMultiplier[city.toLowerCase()] || 1.0;
  return {
    min: Math.round(range.min * multiplier),
    max: Math.round(range.max * multiplier),
  };
};

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const { user, refreshVendorInfo, updateUser } = useAuth();
  
  // Basic info
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');

  // Listing data
  const [listingTitle, setListingTitle] = useState('');
  const [price, setPrice] = useState('');
  const [billingType, setBillingType] = useState('');
  const [inclusions, setInclusions] = useState('');
  const [description, setDescription] = useState('');
  const [instantBook, setInstantBook] = useState(false);
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);

  // UI state
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showOpsHelp, setShowOpsHelp] = useState(false);
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (!user) {
      // Not authenticated - redirect to login with return path
      navigate('/login?redirect=/vendor/onboarding');
      return;
    }
    
    // If user is already a vendor with a completed profile, redirect to dashboard
    const vendorId = localStorage.getItem('vendor_id');
    if (user.role === 'VENDOR' && vendorId) {
      // Vendor has completed onboarding - redirect to dashboard
      navigate('/vendor/dashboard');
      return;
    }
    // If user is a customer or vendor without profile, allow them to proceed with onboarding
  }, [user, navigate]);

  // Load email from signup if available
  useEffect(() => {
    const signupData = sessionStorage.getItem('vendorSignupData');
    if (signupData) {
      try {
        const data = JSON.parse(signupData);
        setEmail(data.email || '');
        // Skip welcome step if coming from signup
        setStep('basic-info');
      } catch (e) {
        // Ignore parse errors
      } finally {
        sessionStorage.removeItem('vendorSignupData'); // Clear after use
      }
    } else if (user?.email) {
      // Use email from authenticated user if available
      setEmail(user.email);
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPrimaryImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLoadExample = () => {
    if (category && categoryExamples[category]) {
      const examples = categoryExamples[category];
      const randomExample = examples[Math.floor(Math.random() * examples.length)];
      setListingTitle(randomExample);
      toast.success('Example loaded!');
    } else {
      toast.error('Please select a category first');
    }
  };

  const handleInstagramImport = () => {
    if (instagram) {
      toast.info('Instagram import feature coming soon! You can upload an image manually.');
      // In future: Fetch images from Instagram API
    } else {
      toast.error('Please add Instagram link in basic info');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    // Validation
    if (!listingTitle.trim()) {
      toast.error('Listing title is required');
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (!primaryImage) {
      toast.error('Primary image is required');
      return;
    }
    if (!billingType) {
      toast.error('Billing type is required');
      return;
    }
    if (!inclusions.trim()) {
      toast.error('Inclusions are required (3 bullets max)');
      return;
    }
    if (!businessName || !category || !city || !phone) {
      toast.error('Please complete all required fields in Basic Info');
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse inclusions into array
      const includedItems = inclusions.split('\n')
        .filter(line => line.trim())
        .map(line => line.trim())
        .slice(0, 3); // Max 3 items

      const onboardingData = {
        businessName,
        categoryId: category,
        cityName: city,
        phone,
        email,
        instagram,
        bio: description || businessName, // Use business name as fallback
        listingName: listingTitle,
        price: Number(price),
        description: description || `${includedItems.join('. ')}`,
        includedItemsText: includedItems,
        images: primaryImage ? [primaryImage] : [],
        isActive: instantBook,
      };

      const response = await vendorApi.onboard(onboardingData);
      
      if (response.success && response.data) {
        // Store vendor ID in localStorage
        const vendorId = response.data.id;
        localStorage.setItem('vendor_id', vendorId);
        
        // Update user role to VENDOR if not already set
        if (user && user.role !== 'VENDOR') {
          updateUser({ role: 'VENDOR' });
        }
        
        // Refresh vendor info to ensure everything is synced
        await refreshVendorInfo();
        
        toast.success('Your listing is now live! You\'ll receive a preview link via WhatsApp.');
        setStep('success');
      } else {
        toast.error(response.message || 'Failed to create vendor profile');
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'An error occurred during onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceRange = category && city ? getPriceRange(city, category) : null;
  const inclusionCount = inclusions.split('\n').filter(l => l.trim()).length;

  const aiPackageSuggestions = [
    { 
      name: 'Basic Package', 
      price: Math.round(Number(price) * 0.8) || 0, 
      features: ['2 hours coverage', 'Digital delivery', '50 edited photos'] 
    },
    { 
      name: 'Standard Package', 
      price: Number(price) || 0, 
      features: ['4 hours coverage', 'Digital + prints', '100 edited photos', 'Album'] 
    },
    { 
      name: 'Premium Package', 
      price: Math.round(Number(price) * 1.5) || 0, 
      features: ['Full day coverage', 'Premium prints', '200+ photos', 'Video highlights'] 
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress */}
        {step !== 'welcome' && step !== 'success' && (
          <div className="flex items-center gap-2 mb-8">
            {['basic-info', 'listing', 'preview'].map((s, i) => {
              const stepIndex = ['basic-info', 'listing', 'preview'].indexOf(step);
              const isCompleted = stepIndex > i;
              const isCurrent = step === s;
              return (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    isCurrent ? 'bg-secondary text-foreground' : 
                    isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`w-16 h-0.5 mx-2 transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Welcome */}
        {step === 'welcome' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Get live in 2 minutes
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Add one listing. You can add more services later — we'll help.
              </p>
            </div>

            <Card className="border-border p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">One Listing to Start</h3>
                    <p className="text-muted-foreground text-sm">Add one simple service or price to start</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">AI-Powered Suggestions</h3>
                    <p className="text-muted-foreground text-sm">Get package recommendations after you go live</p>
                  </div>
                </div>
              </div>
            </Card>

            <Button 
              onClick={() => setStep('basic-info')}
              className="bg-gradient-to-r from-secondary to-primary text-foreground font-semibold px-8 py-6 text-lg rounded-xl hover:shadow-lg transition-all"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Basic Info */}
        {step === 'basic-info' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Tell us about your business</h2>
              <p className="text-muted-foreground">This helps customers find you</p>
            </div>

            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Business Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Royal Moments Photography"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    Contact Person <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Your name"
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c.toLowerCase()}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Mobile (WhatsApp) <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      type="email"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Instagram className="h-4 w-4" /> Instagram Link <span className="text-muted-foreground text-xs">(Optional but strongly encouraged)</span>
                  </Label>
                  <Input 
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    type="url"
                    className="bg-background"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep('listing')}
                disabled={!businessName || !contactPerson || !phone || !category || !city}
                className="flex-1 bg-gradient-to-r from-secondary to-primary text-foreground font-semibold"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mandatory Listing */}
        {step === 'listing' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Create Your First Listing</h2>
              <p className="text-muted-foreground">Just 6 fields to go live</p>
            </div>

            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">
                      1. Listing Title <span className="text-destructive">*</span>
                    </Label>
                    {category && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadExample}
                        className="text-xs h-7"
                      >
                        Load Example
                      </Button>
                    )}
                  </div>
                  <Input 
                    value={listingTitle}
                    onChange={(e) => setListingTitle(e.target.value)}
                    placeholder="e.g. 2-Hour Candid Photoshoot"
                    className="bg-background"
                  />
                  {category && categoryExamples[category] && (
                    <p className="text-xs text-muted-foreground">
                      Examples: {categoryExamples[category].slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      2. Price (₹) <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter number only (₹)"
                      min="1"
                      className="bg-background"
                    />
                    {priceRange && (
                      <p className="text-xs text-secondary">
                        Suggested range: ₹{priceRange.min.toLocaleString()} - ₹{priceRange.max.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      3. Unit / Billing Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={billingType} onValueChange={setBillingType}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Per hour / Per plate / Fixed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per-hour">Per Hour</SelectItem>
                        <SelectItem value="per-day">Per Day</SelectItem>
                        <SelectItem value="per-plate">Per Plate</SelectItem>
                        <SelectItem value="per-session">Per Session</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    4. Short Inclusions (3 bullets max) <span className="text-destructive">*</span>
                  </Label>
                  <Textarea 
                    value={inclusions}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').filter(l => l.trim());
                      if (lines.length <= 3 || e.target.value.length < inclusions.length) {
                        setInclusions(e.target.value);
                      }
                    }}
                    placeholder="1 photographer · 100 edited pics · Online gallery"
                    rows={3}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    {inclusionCount} / 3 bullets {inclusionCount > 3 && <span className="text-destructive">(Max 3)</span>}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    Add 1-line description <span className="text-muted-foreground text-xs">(Optional, max 80 characters)</span>
                  </Label>
                  <Textarea 
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= 80) {
                        setDescription(e.target.value);
                      }
                    }}
                    placeholder="Brief description of your service..."
                    rows={2}
                    className="bg-background"
                    maxLength={80}
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length} / 80 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">
                      5. Primary Image <span className="text-destructive">*</span>
                    </Label>
                    {instagram && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleInstagramImport}
                        className="text-xs h-7"
                      >
                        <Instagram className="h-3 w-3 mr-1" />
                        Use Instagram post
                      </Button>
                    )}
                  </div>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-secondary/50 transition-colors cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {primaryImage ? (
                        <img src={primaryImage} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground">Upload 1 image (portfolio photo or Instagram post)</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <p className="text-foreground font-medium">6. Availability toggle</p>
                    <p className="text-sm text-muted-foreground">Instant book? Yes/No (default: No)</p>
                  </div>
                  <Switch checked={instantBook} onCheckedChange={setInstantBook} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('basic-info')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep('preview')}
                disabled={!listingTitle || !price || Number(price) <= 0 || !billingType || !inclusions.trim() || !primaryImage || inclusionCount > 3}
                className="flex-1 bg-gradient-to-r from-secondary to-primary text-foreground font-semibold"
              >
                Preview <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Preview */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Preview Your Listing</h2>
              <p className="text-muted-foreground">This is how customers will see your listing</p>
            </div>

            <Card className="border-border overflow-hidden">
              {primaryImage && (
                <div className="aspect-video relative">
                  <img src={primaryImage} alt="Listing" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {instantBook && (
                    <Badge className="absolute top-4 right-4 bg-green-500 text-white">Instant Book</Badge>
                  )}
                </div>
              )}
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{listingTitle}</h3>
                    <p className="text-muted-foreground">{businessName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-secondary">₹{Number(price).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{billingType}</p>
                  </div>
                </div>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">What's Included:</p>
                  <div className="text-muted-foreground text-sm whitespace-pre-line">{inclusions}</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {cities.find(c => c.toLowerCase() === city) || city}
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                📱 Phone number will be visible to customers only after token payment
              </p>
              <p className="text-xs text-muted-foreground">
                You'll receive a WhatsApp preview link after admin review
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('listing')} className="flex-1">
                Edit
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-secondary to-primary text-foreground font-semibold hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish listing & Go Live <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center space-y-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold text-foreground">You're Live! 🎉</h2>
              <p className="text-muted-foreground">Your profile is now visible to customers</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={() => navigate('/vendor/listings')}
                variant="outline"
              >
                Add more listings
              </Button>
              <Button 
                onClick={() => setShowAISuggestions(true)}
                className="bg-primary hover:bg-primary/80 text-foreground"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get suggestions (AI)
              </Button>
              <Button 
                onClick={() => setShowOpsHelp(true)}
                variant="outline"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Request ops help
              </Button>
              <Button 
                onClick={async () => {
                  // Ensure vendor info is refreshed before navigating
                  await refreshVendorInfo();
                  navigate('/vendor/dashboard');
                }}
                className="bg-gradient-to-r from-secondary to-primary text-foreground font-semibold"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* AI Suggestions Modal */}
            <Dialog open={showAISuggestions} onOpenChange={setShowAISuggestions}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Generated Package Drafts
                  </DialogTitle>
                  <DialogDescription>
                    Based on your listing, here are some package suggestions (optional). You can Accept, Edit, or Decline each draft.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {aiPackageSuggestions.map((pkg, i) => (
                    <Card key={i} className="border-border">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-foreground font-medium">{pkg.name}</h4>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              defaultValue={pkg.price}
                              className="w-24 h-8 text-sm"
                            />
                            <span className="text-muted-foreground">₹</span>
                          </div>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {pkg.features.map((f, j) => (
                            <li key={j}>• {f}</li>
                          ))}
                        </ul>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-500/20 text-green-600 hover:bg-green-500/30">
                            Accept
                          </Button>
                          <Button size="sm" variant="ghost">
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    These are optional. You remain live with your single listing. You can add these packages later from your dashboard.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Ops Help Modal */}
            <Dialog open={showOpsHelp} onOpenChange={setShowOpsHelp}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ops-Assisted Listing Help</DialogTitle>
                  <DialogDescription>
                    Get professional help creating your listings. We'll build listings for you — you only approve the price.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Card className="border-border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">Free Plan</h4>
                          <p className="text-sm text-muted-foreground">2 listings in 5-7 days</p>
                        </div>
                        <Badge variant="outline">Free</Badge>
                      </div>
                      <Button className="w-full" variant="outline">
                        Choose Free Plan
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-secondary border-2">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">Premium Plan</h4>
                          <p className="text-sm text-muted-foreground">5 listings in 2-3 days</p>
                        </div>
                        <Badge className="bg-secondary text-foreground">₹2,000</Badge>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-secondary to-primary text-foreground">
                        Choose Premium Plan
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
