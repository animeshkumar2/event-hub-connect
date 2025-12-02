import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle, Sparkles, ArrowRight, Phone, Mail, MapPin, Camera } from 'lucide-react';
import { toast } from 'sonner';

type OnboardingStep = 'welcome' | 'basic-info' | 'listing' | 'preview' | 'success';

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  // Basic info
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Listing data
  const [listingTitle, setListingTitle] = useState('');
  const [price, setPrice] = useState('');
  const [billingType, setBillingType] = useState('');
  const [inclusions, setInclusions] = useState('');
  const [instantBook, setInstantBook] = useState(false);
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPrimaryImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    toast.success('Your listing is now live!');
    setStep('success');
  };

  const aiPackageSuggestions = [
    { name: 'Basic Package', price: Math.round(Number(price) * 0.8), features: ['2 hours coverage', 'Digital delivery', '50 edited photos'] },
    { name: 'Standard Package', price: Number(price), features: ['4 hours coverage', 'Digital + prints', '100 edited photos', 'Album'] },
    { name: 'Premium Package', price: Math.round(Number(price) * 1.5), features: ['Full day coverage', 'Premium prints', '200+ photos', 'Video highlights'] },
  ];

  return (
    <div className="min-h-screen bg-vendor-dark relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-vendor-purple/10 via-transparent to-vendor-gold/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-vendor-purple/20 blur-[120px] rounded-full" />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress */}
        {step !== 'welcome' && step !== 'success' && (
          <div className="flex items-center gap-2 mb-8">
            {['basic-info', 'listing', 'preview'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s ? 'bg-vendor-gold text-vendor-dark' : 
                  ['basic-info', 'listing', 'preview'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  {['basic-info', 'listing', 'preview'].indexOf(step) > i ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`w-16 h-0.5 mx-2 ${['basic-info', 'listing', 'preview'].indexOf(step) > i ? 'bg-green-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Welcome */}
        {step === 'welcome' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white">
                Become a <span className="text-vendor-gold">Vendor</span>
              </h1>
              <p className="text-white/70 text-lg max-w-md mx-auto">
                Get live in 2 minutes — Add one listing. We'll help build the rest.
              </p>
            </div>

            <Card className="glass-card border-white/10 p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-vendor-gold/20 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-vendor-gold" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">One Listing to Start</h3>
                    <p className="text-white/60 text-sm">Create your first listing in minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-vendor-purple/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-vendor-purple" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">AI-Powered Suggestions</h3>
                    <p className="text-white/60 text-sm">Get package recommendations based on your listing</p>
                  </div>
                </div>
              </div>
            </Card>

            <Button 
              onClick={() => setStep('basic-info')}
              className="bg-gradient-to-r from-vendor-gold to-amber-500 text-vendor-dark font-semibold px-8 py-6 text-lg rounded-xl hover:shadow-glow-gold transition-all"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Basic Info */}
        {step === 'basic-info' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="font-display text-3xl font-bold text-white">Tell us about your business</h2>
              <p className="text-white/60">This helps customers find you</p>
            </div>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Business Name</Label>
                  <Input 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Royal Moments Photography"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photographer">Photographer</SelectItem>
                        <SelectItem value="decorator">Decorator</SelectItem>
                        <SelectItem value="caterer">Caterer</SelectItem>
                        <SelectItem value="dj">DJ / Music</SelectItem>
                        <SelectItem value="makeup">Makeup Artist</SelectItem>
                        <SelectItem value="venue">Venue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">City</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone
                    </Label>
                    <Input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1 border-white/20 text-white hover:bg-white/10">
                Back
              </Button>
              <Button 
                onClick={() => setStep('listing')}
                disabled={!businessName || !category || !city}
                className="flex-1 bg-gradient-to-r from-vendor-gold to-amber-500 text-vendor-dark font-semibold"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mandatory Listing */}
        {step === 'listing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="font-display text-3xl font-bold text-white">Create Your First Listing</h2>
              <p className="text-white/60">Just 6 fields to go live</p>
            </div>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Listing Title</Label>
                  <Input 
                    value={listingTitle}
                    onChange={(e) => setListingTitle(e.target.value)}
                    placeholder="e.g., Wedding Photography Package"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <p className="text-xs text-white/40">Keep it short and descriptive</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Price (₹)</Label>
                    <Input 
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="25000"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                    <p className="text-xs text-vendor-gold">Avg. in {city || 'your city'}: ₹20,000 - ₹40,000</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Billing Type</Label>
                    <Select value={billingType} onValueChange={setBillingType}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="per-hour">Per Hour</SelectItem>
                        <SelectItem value="per-day">Per Day</SelectItem>
                        <SelectItem value="per-plate">Per Plate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">What's Included (3 key points)</Label>
                  <Textarea 
                    value={inclusions}
                    onChange={(e) => setInclusions(e.target.value)}
                    placeholder="• 4 hours coverage&#10;• 100 edited photos&#10;• Digital delivery"
                    rows={3}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Primary Image</Label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-vendor-gold/50 transition-colors cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {primaryImage ? (
                        <img src={primaryImage} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 text-white/40 mx-auto" />
                          <p className="text-white/60">Click to upload or drag & drop</p>
                          <p className="text-xs text-white/40">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white font-medium">Enable Instant Book</p>
                    <p className="text-sm text-white/60">Let customers book directly</p>
                  </div>
                  <Switch checked={instantBook} onCheckedChange={setInstantBook} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('basic-info')} className="flex-1 border-white/20 text-white hover:bg-white/10">
                Back
              </Button>
              <Button 
                onClick={() => setStep('preview')}
                disabled={!listingTitle || !price || !billingType}
                className="flex-1 bg-gradient-to-r from-vendor-gold to-amber-500 text-vendor-dark font-semibold"
              >
                Preview <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Preview */}
        {step === 'preview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="font-display text-3xl font-bold text-white">Preview Your Listing</h2>
              <p className="text-white/60">This is how customers will see your listing</p>
            </div>

            <Card className="glass-card border-white/10 overflow-hidden">
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
                    <h3 className="text-xl font-bold text-white">{listingTitle}</h3>
                    <p className="text-white/60">{businessName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-vendor-gold">₹{Number(price).toLocaleString()}</p>
                    <p className="text-sm text-white/60">{billingType}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-white/80 font-medium">What's Included:</p>
                  <div className="text-white/60 text-sm whitespace-pre-line">{inclusions}</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <MapPin className="h-4 w-4" />
                  {city}
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-white/50">
              📱 Phone number will be visible to customers only after token payment
            </p>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('listing')} className="flex-1 border-white/20 text-white hover:bg-white/10">
                Edit
              </Button>
              <Button 
                onClick={handlePublish}
                className="flex-1 bg-gradient-to-r from-vendor-gold to-amber-500 text-vendor-dark font-semibold hover:shadow-glow-gold"
              >
                Publish & Go Live <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold text-white">You're Live! 🎉</h2>
              <p className="text-white/60">Your profile is now visible to customers</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={() => navigate('/vendor/listings')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Add Another Listing
              </Button>
              <Button 
                onClick={() => setShowAISuggestions(true)}
                className="bg-vendor-purple hover:bg-vendor-purple/80 text-white"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Package Suggestions
              </Button>
              <Button 
                onClick={() => navigate('/vendor/dashboard')}
                className="bg-gradient-to-r from-vendor-gold to-amber-500 text-vendor-dark font-semibold"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* AI Suggestions Modal */}
            {showAISuggestions && (
              <Card className="glass-card border-white/10 text-left">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-vendor-purple" />
                    <h3 className="text-lg font-semibold text-white">AI-Generated Package Drafts</h3>
                  </div>
                  <p className="text-sm text-white/60">Based on your listing, here are some package suggestions:</p>
                  
                  <div className="space-y-3">
                    {aiPackageSuggestions.map((pkg, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium">{pkg.name}</h4>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              defaultValue={pkg.price}
                              className="w-24 h-8 text-sm bg-white/10 border-white/20 text-white"
                            />
                            <span className="text-white/60">₹</span>
                          </div>
                        </div>
                        <ul className="text-sm text-white/60 space-y-1">
                          {pkg.features.map((f, j) => (
                            <li key={j}>• {f}</li>
                          ))}
                        </ul>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                            Accept
                          </Button>
                          <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
