import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ArrowRight, Loader2, Sparkles, CheckCircle, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { vendorProfessions, cities } from '@/shared/constants/mockData';
import { vendorApi } from '@/shared/services/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { getVendorPermissionInfo, getAllowedCategoryNames, LISTING_CATEGORY_NAMES } from '@/shared/constants/vendorCategoryPermissions';

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const { user, refreshVendorInfo, updateUser } = useAuth();
  
  // Essential fields only
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/vendor/onboarding');
      return;
    }
  }, [user, navigate]);

  // Load data from signup if available
  useEffect(() => {
    const signupData = sessionStorage.getItem('vendorSignupData');
    if (signupData) {
      try {
        const data = JSON.parse(signupData);
        if (data.email) setEmail(data.email);
        // Don't pre-fill business name - let vendor enter their actual business name
        if (data.phone) setPhone(data.phone);
      } catch (e) {
        // Ignore parse errors
      } finally {
        sessionStorage.removeItem('vendorSignupData');
      }
    } else if (user?.email) {
      setEmail(user.email);
    }
    // Pre-fill phone from user profile if available
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  // Check if form is valid - only essential fields
  const isFormValid = 
    businessName.trim() !== '' &&
    category !== '' &&
    city !== '';

  const handleComplete = async () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const vendorData = {
        businessName: businessName.trim(),
        categoryId: category,
        customCategoryName: undefined,
        cityName: city,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      };

      const response = await vendorApi.onboard(vendorData);

      if (response.success && response.data) {
        localStorage.setItem('vendor_id', response.data.id);
        localStorage.setItem('vendor_category_id', category);
        localStorage.removeItem('onboarding_skipped');
        // Trigger the vendor tour on first dashboard visit
        localStorage.setItem('vendor_tour_trigger', 'true');
        // Trigger the profile guide when they land on the profile page
        localStorage.setItem('vendor_profile_guide_trigger', 'true');
        
        await refreshVendorInfo();

        if (user?.role !== 'VENDOR') {
          updateUser({ role: 'VENDOR' });
        }

        toast.success('Profile created! Now let\'s complete your profile to start receiving leads.');
        
        // Navigate to profile page to complete the rest
        navigate('/vendor/profile');
        // Dispatch event so ProfileGuide picks up the trigger after navigation
        setTimeout(() => window.dispatchEvent(new CustomEvent('profile-guide-trigger')), 2000);
      } else {
        throw new Error(response.message || 'Failed to create vendor profile');
      }
    } catch (error: any) {
      console.error('Error creating vendor profile:', error);
      toast.error(error.message || 'Failed to create vendor profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome to CartEvent!
          </h1>
          <p className="text-muted-foreground">
            Let's get your business set up in just a few steps
          </p>
        </div>

        {/* Form Card */}
        <Card className="border border-border/50 shadow-xl">
          <CardContent className="p-6 space-y-5">
            {/* Business Name */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                Business Name <span className="text-destructive">*</span>
              </Label>
              <Input 
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Royal Decorators, Shutter Stories Photography"
                className="h-11 bg-background"
              />
              <p className="text-xs text-muted-foreground">
                This is how customers will see your business. Choose a memorable name!
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                What are you? <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="Select your profession" />
                </SelectTrigger>
                <SelectContent>
                  {vendorProfessions.map((cat) => {
                    const isEventPlanner = cat.id === 'event-planner';
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                          {isEventPlanner && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium">
                              ALL ACCESS
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {/* Dynamic info box showing what services they can offer */}
              {category && (
                <div className={`mt-3 p-3 rounded-xl border transition-all ${
                  category === 'event-planner' 
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
                    : 'bg-primary/5 border-primary/20'
                }`}>
                  {category === 'event-planner' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">Event Planner - All Access</span>
                      </div>
                      <p className="text-xs text-amber-700">
                        As an Event Planner, you can offer <span className="font-semibold">all types of services</span> - 
                        Photography, Décor, Catering, Venue, Makeup, DJ, Sound & Lights, and Artists.
                      </p>
                      <p className="text-[10px] text-amber-600 italic">
                        Perfect for full-service event management businesses
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Services you can offer:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {getAllowedCategoryNames(category).map((catName, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
                          >
                            {catName}
                          </span>
                        ))}
                      </div>
                      {getAllowedCategoryNames(category).length > 1 && (
                        <p className="text-[10px] text-muted-foreground">
                          Related services you can offer alongside your main profession
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                Where is your business based? <span className="text-destructive">*</span>
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {city && city !== 'bangalore' && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200/50">
                  <span className="text-sm flex-shrink-0">🌟</span>
                  <p className="text-[11px] text-blue-700">
                    Launching in Bangalore first, expanding soon to your city. List your services now to be ready when we go live in your area.
                  </p>
                </div>
              )}
            </div>

            {/* What's Next Info */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">What's next?</p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Complete your profile (photos, bio, contact)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Create your first listing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Start receiving leads!</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleComplete}
              disabled={!isFormValid || isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow text-white font-semibold text-base hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  Continue to Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Takes less than 2 minutes to complete your profile
        </p>
      </div>
    </div>
  );
}
