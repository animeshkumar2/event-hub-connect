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
    if (!businessName || !category || !city || !phone) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const onboardingData = {
        businessName,
        categoryId: category,
        cityName: city,
        phone,
        email: email || user?.email || '',
        instagram,
        bio: businessName, // Use business name as fallback
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
        
        toast.success('Welcome! Your vendor profile has been created.');
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

  // Removed listing-related state and helpers

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress */}
        {step !== 'success' && (
          <div className="flex items-center gap-2 mb-8">
            {['basic-info'].map((s, i) => {
              const stepIndex = ['basic-info'].indexOf(step);
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
                </div>
              );
            })}
          </div>
        )}

        {/* Basic Info */}
        {step === 'basic-info' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 mb-2">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                Tell us about your business
              </h2>
              <p className="text-muted-foreground text-base">
                This helps customers find you
              </p>
            </div>

            {/* Form Card */}
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                {/* Business Name */}
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold text-sm">
                    Business Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Royal Moments Photography"
                    className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                  />
                </div>

                {/* Contact Person */}
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold text-sm">
                    Contact Person <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Your name"
                    className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                  />
                </div>

                {/* Category & City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold text-sm">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20">
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
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold text-sm">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20">
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
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> 
                      Mobile (WhatsApp) <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> 
                      Email
                    </Label>
                    <Input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      type="email"
                      className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold text-sm flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-primary" /> 
                    Instagram Link
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      (Optional but strongly encouraged)
                    </span>
                  </Label>
                  <Input 
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    type="url"
                    className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="flex-1 h-12 border-2 hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={!businessName || !contactPerson || !phone || !category || !city || isSubmitting}
                size="lg"
                className="flex-1 h-12 bg-gradient-to-r from-primary via-primary-glow to-secondary text-white font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Complete Onboarding
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
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
