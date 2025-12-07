import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { CheckCircle, ArrowRight, Phone, Mail, Instagram, Loader2, Package } from 'lucide-react';
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
  const [step, setStep] = useState<OnboardingStep>('welcome');
  
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
        {step !== 'welcome' && step !== 'success' && (
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

        {/* Welcome */}
        {step === 'welcome' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Welcome to Event Hub Connect
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Get started in just 2 simple steps. Create your listings after onboarding.
              </p>
            </div>

            <Card className="border-border p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">Quick Setup</h3>
                    <p className="text-muted-foreground text-sm">Just provide your basic business information</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">Create Listings Later</h3>
                    <p className="text-muted-foreground text-sm">Add your services and packages from your dashboard</p>
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
                onClick={handleComplete}
                disabled={!businessName || !contactPerson || !phone || !category || !city || isSubmitting}
                className="flex-1 bg-gradient-to-r from-secondary to-primary text-foreground font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Complete Onboarding <CheckCircle className="ml-2 h-4 w-4" />
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
              <h2 className="font-display text-3xl font-bold text-foreground">Welcome Aboard! 🎉</h2>
              <p className="text-muted-foreground">Your vendor profile has been created successfully</p>
            </div>

            <Card className="border-border p-6">
              <p className="text-foreground mb-4">
                You're all set! Now create your first listing to start getting leads.
              </p>
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
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
