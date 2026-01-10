import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { CheckCircle, ArrowRight, Phone, Mail, Instagram, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { categories, cities } from '@/shared/constants/mockData';
import { vendorApi } from '@/shared/services/api';
import { useAuth } from '@/shared/contexts/AuthContext';

type OnboardingStep = 'welcome' | 'basic-info' | 'success';

// Removed category examples and price range helpers - no longer needed

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const { user, refreshVendorInfo, updateUser } = useAuth();
  
  // Basic info
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [category, setCategory] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');

  // Listing data removed - no longer required

  // UI state
  const [step, setStep] = useState<OnboardingStep>('basic-info');
  
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
        // Start directly with form
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

  // Removed listing-related handlers

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    // Validation
    if (!businessName.trim()) {
      toast.error('Please enter your business name');
      return;
    }
    if (!contactPerson.trim()) {
      toast.error('Please enter contact person name');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    if (category === 'other' && !customCategoryName.trim()) {
      toast.error('Please enter your custom category name');
      return;
    }
    if (!city) {
      toast.error('Please select a city');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your WhatsApp number');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create vendor profile
      const vendorData = {
        businessName: businessName.trim(),
        contactPerson: contactPerson.trim(),
        category: category === 'other' ? customCategoryName.trim() : category,
        city,
        phone: phone.trim(),
        email: email.trim(),
        instagram: instagram.trim() || undefined,
        userId: user?.id,
      };

      const response = await vendorApi.createVendor(vendorData);

      if (response.success && response.data) {
        // Store vendor ID
        localStorage.setItem('vendor_id', response.data.id);
        
        // Clear onboarding skipped flag since they completed it
        localStorage.removeItem('onboarding_skipped');
        
        // Refresh vendor info in auth context
        await refreshVendorInfo();

        // Update user role to VENDOR if not already
        if (user?.role !== 'VENDOR') {
          updateUser({ role: 'VENDOR' });
        }

        toast.success('Profile created successfully!');
        
        // Navigate to dashboard
        navigate('/vendor/dashboard');
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

  const handleSkipForNow = () => {
    // Mark onboarding as skipped (can be completed later)
    localStorage.setItem('onboarding_skipped', 'true');
    toast.info('You can complete your profile anytime from the Profile page');
    navigate('/vendor/dashboard');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-2xl">
        {/* Basic Info */}
        {step === 'basic-info' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Tell us about your business
              </h2>
              <p className="text-muted-foreground text-sm">
                This helps customers find you
              </p>
            </div>

            {/* Form Card */}
            <Card className="border border-border/50 shadow-lg">
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Business Name & Contact Person */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-foreground font-medium text-sm">
                      Business Name <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Royal Moments Photography"
                      className="h-10 bg-background border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-foreground font-medium text-sm">
                      Contact Person <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Your name"
                      className="h-10 bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>

                {/* Category & City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-foreground font-medium text-sm">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={category} onValueChange={(value) => {
                      setCategory(value);
                      if (value !== 'other') {
                        setCustomCategoryName('');
                      }
                    }}>
                      <SelectTrigger className="h-10 bg-background border-border focus:border-primary">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {category === 'other' && (
                      <Input
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        placeholder="Specify your category..."
                        className="h-10 mt-2 bg-background border-border focus:border-primary"
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground font-medium text-sm">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-10 bg-background border-border focus:border-primary">
                        <SelectValue placeholder="Select city" />
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

                {/* Phone & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" /> 
                      WhatsApp Number <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-10 bg-background border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" /> 
                      Email
                    </Label>
                    <Input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      type="email"
                      className="h-10 bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="space-y-1.5">
                  <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 text-primary" /> 
                    Instagram
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </Label>
                  <Input 
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    type="url"
                    className="h-10 bg-background border-border focus:border-primary"
                  />
                </div>

                {/* Action Buttons - Inside Card */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleSkipForNow} 
                      className="flex-1 h-10 border-border hover:bg-muted"
                      disabled={isSubmitting}
                    >
                      Skip for now
                    </Button>
                    <Button 
                      onClick={handleComplete}
                      disabled={!businessName || !contactPerson || !phone || !category || !city || isSubmitting}
                      className="flex-[2] h-10 bg-primary hover:bg-primary/90 text-white font-medium transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Complete Onboarding
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    You can complete your profile anytime from the Profile page
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center space-y-10 animate-fade-in">
            {/* Success Icon */}
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-bounce-in">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            
            {/* Success Message */}
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-black text-foreground">
                Welcome Aboard! 🎉
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Your vendor profile has been created successfully
              </p>
            </div>

            {/* Info Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 max-w-md mx-auto shadow-xl">
              <div className="space-y-4">
                <p className="text-foreground text-base leading-relaxed">
                  You're all set! Now create your first listing to start getting leads.
                </p>
                <Button 
                  onClick={async () => {
                    // Ensure vendor info is refreshed before navigating
                    await refreshVendorInfo();
                    navigate('/vendor/dashboard');
                  }}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary via-primary-glow to-secondary text-white font-bold hover:shadow-xl hover:scale-105 transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
