import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useStats } from '@/shared/hooks/useApi';
import { 
  Star, 
  Users, 
  BadgeCheck, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Calendar,
  Wallet,
  MessageSquare,
  Package,
  Rocket,
  Target,
  ChevronDown
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';



const FAQS = [
  {
    q: "What is CartEvent?",
    a: "CartEvent is a marketplace that helps customers discover and connect with independent event vendors. We do not provide services ourselves.",
  },
  {
    q: "Does CartEvent verify vendors?",
    a: "No. Vendors are responsible for their own credentials, licenses, and portfolio authenticity.",
  },
  {
    q: "Does CartEvent guarantee bookings or leads?",
    a: "No. Listing on CartEvent does not guarantee inquiries, bookings, or visibility.",
  },
  {
    q: "Who handles payments?",
    a: "Customers pay vendors directly. CartEvent does not manage payments or refunds.",
  },
  {
    q: "Who is responsible if something goes wrong at an event?",
    a: "The vendor and customer. CartEvent is not involved in service delivery or disputes.",
  },
  {
    q: "Can CartEvent remove my listing?",
    a: "Yes. Listings or vendor accounts may be modified, suspended, or removed at any time.",
  },
  {
    q: "Can my photos be used in marketing?",
    a: "Yes. Content you upload may be used for marketing. You can request removal anytime.",
  },
  {
    q: "Can I contact customers outside the platform?",
    a: "No. Poaching or misusing customer data can result in suspension or permanent ban.",
  },
];

const EARLY_BIRD_LIMIT = 100;
const FOMO_ALREADY_BOOKED = 49; // For FOMO: show 49 out of 100 already booked

export default function VendorLandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  
  // Fetch vendor count for dynamic spots remaining
  const { data: stats } = useStats();
  
  // Calculate remaining spots (starting from 51 to create FOMO - 49 already "booked")
  const spotsRemaining = useMemo(() => {
    const vendorCount = stats?.vendorCount || stats?.vendors || 0;
    // Start from 51 (100 - 49 fake booked), then subtract actual registrations
    const remaining = EARLY_BIRD_LIMIT - FOMO_ALREADY_BOOKED - vendorCount;
    return Math.max(0, remaining);
  }, [stats]);
  
  // Determine if early bird offer is still available
  const isEarlyBirdAvailable = spotsRemaining > 0;

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Check if already a vendor (check both cases for safety)
      if (user?.role === 'vendor' || user?.role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else {
        // Show upgrade modal for existing customers
        setShowUpgradeModal(true);
      }
    } else {
      // Not logged in, go to signup
      navigate('/auth?mode=signup&type=vendor');
    }
  };

  const handleConfirmUpgrade = () => {
    setShowUpgradeModal(false);
    navigate('/vendor/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-primary">
            cartevent.
          </a>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Browse as Customer
            </Button>
            {isAuthenticated ? (
              <Button onClick={handleGetStarted}>
                {(user?.role === 'vendor' || user?.role === 'VENDOR') ? 'Go to Dashboard' : 'Start Listing'}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/auth?mode=login&type=vendor')}>
                Vendor Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Early Access - Limited Spots Available
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Get More Customers for Your{' '}
              <span className="text-primary">Event Business</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              India's upcoming one-stop platform for booking event vendors. Join our early vendor network 
              and reach customers planning weddings, parties, cultural ceremonies, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 h-14 gap-2" onClick={handleGetStarted}>
                Get Listed Now - It's Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Dynamic Spots Remaining Badge */}
            {isEarlyBirdAvailable && (
              <div className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-6 py-3">
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  only {spotsRemaining} spots left
                </span>
                <span className="text-sm text-muted-foreground">
                  - First 100 vendors get FREE forever access
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              ✓ No credit card required &nbsp;•&nbsp; ✓ Setup in 5 minutes &nbsp;•&nbsp; ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Premium Design */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white/90 text-xs font-medium mb-4">
              SIMPLE 3-STEP PROCESS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <div className="hidden md:flex items-center flex-1">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-white/50 to-transparent" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Sign Up</h3>
                <p className="text-white/80 text-sm leading-relaxed">Fill a quick form with your business details. Takes less than 2 minutes.</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <div className="hidden md:flex items-center flex-1">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-white/50 to-transparent" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Post Your First Listing</h3>
                <p className="text-white/80 text-sm leading-relaxed">Showcase your services with photos, pricing & packages.</p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Start Getting Free Leads</h3>
                <p className="text-white/80 text-sm leading-relaxed">Get customer bookings & enquiries directly on the platform.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join CartEvent - Comprehensive Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Join CartEvent?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to grow your event business
            </p>
          </div>

          {/* Feature Cards with Screenshots */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Analytics Card */}
            <div className="group">
              <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="h-48 bg-gradient-to-br from-blue-500/10 via-primary/5 to-purple-500/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                  <div className="relative bg-white rounded-xl shadow-2xl p-4 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-end gap-1 h-16">
                        <div className="w-4 bg-primary/30 rounded-t h-6" />
                        <div className="w-4 bg-primary/50 rounded-t h-10" />
                        <div className="w-4 bg-primary/70 rounded-t h-8" />
                        <div className="w-4 bg-primary rounded-t h-14" />
                        <div className="w-4 bg-primary/80 rounded-t h-12" />
                      </div>
                      <div className="text-xs text-muted-foreground text-center">Revenue Trend</div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-xl">Analytics & Insights</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">Track revenue, see booking trends, and grow smarter with data-driven decisions.</p>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Card */}
            <div className="group">
              <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="h-48 bg-gradient-to-br from-green-500/10 via-primary/5 to-emerald-500/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                  <div className="relative bg-white rounded-xl shadow-2xl p-4 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-muted-foreground font-medium">{d}</div>
                      ))}
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map((n) => (
                        <div key={n} className={`w-5 h-5 rounded flex items-center justify-center ${n === 8 || n === 15 ? 'bg-primary text-white' : n === 12 ? 'bg-green-500 text-white' : 'hover:bg-muted'}`}>
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="font-bold text-xl">Smart Calendar</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">Manage your schedule effortlessly. Never double-book again.</p>
                </CardContent>
              </Card>
            </div>

            {/* Payments Card */}
            <div className="group">
              <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="h-48 bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                  <div className="relative bg-white rounded-xl shadow-2xl p-4 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">₹45,000</div>
                      <div className="text-xs text-muted-foreground mb-3">This Month</div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-xs text-green-600 font-medium">Paid Directly</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="font-bold text-xl">Direct Payments</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">Get paid directly by customers. No middleman, no delays.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Lalach Section + Early Vendor Benefits */}
          <div className="mb-16">
            <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-white relative">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left - Quote */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Rocket className="h-6 w-6" />
                      <span className="text-sm font-medium uppercase tracking-wider opacity-80">Growth Potential</span>
                    </div>
                    <blockquote className="text-2xl md:text-3xl font-bold leading-tight mb-6">
                      "Vendors on CartEvent may get <span className="text-yellow-300">3x more bookings</span> than traditional marketing methods"
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                        <Target className="h-4 w-4" />
                        <span className="text-sm font-medium">2026 Target: 1000+ Vendors</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right - Early Vendor Benefits */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-300" />
                      Early Vendor Benefits
                    </h3>
                    <ul className="space-y-3">
                      {[
                        `First 100 vendors - FREE forever (only ${spotsRemaining} spots left)`,
                        "Unlimited listings - no restrictions",
                        "0% commission - keep 100% of your earnings",
                        "Priority placement in search results",
                        "Featured in our launch marketing campaigns"
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-white/90">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    {isEarlyBirdAvailable ? (
                      <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                        <p className="text-yellow-200 text-sm font-medium text-center">
                          ⏰ Hurry! Only <span className="font-bold text-lg">{spotsRemaining}</span> early bird spots remaining!
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                        <p className="text-red-200 text-sm font-medium text-center">
                          ❌ Early bird offer has ended. Standard pricing applies.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: MessageSquare, title: "Real-time Chat", desc: "Instant customer messaging", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Star, title: "Reviews & Ratings", desc: "Build trust with feedback", color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { icon: Package, title: "Unlimited Listings", desc: "Create packages freely", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: BadgeCheck, title: "100% Free", desc: "No listing fees ever", color: "text-green-500", bg: "bg-green-500/10" },
            ].map((feature, i) => (
              <Card key={i} className="border hover:border-primary/30 transition-all hover:shadow-lg group">
                <CardContent className="p-5 text-center">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          </div>
      </section>

      {/* Who Can Join - Inclusive Section */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Zero Barriers
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              If You're in Events, <span className="text-primary">You're In.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From wedding photographers to corporate caterers, balloon artists to event planners - 
              if you provide any service for any event, CartEvent is for you.
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Any Service */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group overflow-hidden">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Any Service</h3>
                <p className="text-muted-foreground mb-6">Whatever you do for events, list it here.</p>
                <ul className="space-y-2 text-sm">
                  {["Photography & Video", "Catering & Food", "Decoration & Flowers", "DJ & Live Music", "Makeup & Styling", "Venues & Halls", "Anchoring & Entertainment", "...anything event-related"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Any Scale */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group overflow-hidden">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Any Scale</h3>
                <p className="text-muted-foreground mb-6">No minimum. No maximum. Everyone's welcome.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg">🪑</div>
                    <div>
                      <p className="font-medium text-sm">20 chairs?</p>
                      <p className="text-xs text-muted-foreground">List them.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">💄</div>
                    <div>
                      <p className="font-medium text-sm">Weekend makeup artist?</p>
                      <p className="text-xs text-muted-foreground">List your services.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg">🏨</div>
                    <div>
                      <p className="font-medium text-sm">500-person venue?</p>
                      <p className="text-xs text-muted-foreground">List it too.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Any Event */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group overflow-hidden">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Any Event</h3>
                <p className="text-muted-foreground mb-6">We cover every occasion, every gathering.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { emoji: "💒", label: "Weddings" },
                    { emoji: "💼", label: "Corporate" },
                    { emoji: "🎂", label: "Birthdays" },
                    { emoji: "🎓", label: "Graduations" },
                    { emoji: "💃", label: "Club Nights" },
                    { emoji: "🙏", label: "Religious" },
                    { emoji: "🏠", label: "Housewarmings" },
                    { emoji: "🎉", label: "Parties" },
                    { emoji: "🕯️", label: "Memorials" },
                    { emoji: "✨", label: "...any event" },
                  ].map((event, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm hover:bg-primary/10 transition-colors cursor-default">
                      <span>{event.emoji}</span>
                      <span>{event.label}</span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Hustle Message */}
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
              <CardContent className="p-8 text-center">
                <p className="text-xl md:text-2xl font-medium text-foreground/80 italic">
                  "Even if you're just starting out with a side hustle, CartEvent is the platform to grow."
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Part-time vendors, freelancers, students, homemakers - everyone's welcome.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Early Vendor CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Become an Early Vendor</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Be among the first 50 vendors in your city to get featured across our marketing campaigns. 
            Early vendors get priority placement and exclusive benefits.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 h-14 gap-2" onClick={handleGetStarted}>
            Get Listed Now - It's Free
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {(showAllFaqs ? FAQS : FAQS.slice(0, 3)).map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    {faq.q}
                  </h3>
                  <p className="text-muted-foreground pl-7">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
            
            {/* See More / See Less Button */}
            {FAQS.length > 3 && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllFaqs(!showAllFaqs)}
                  className="gap-2"
                >
                  {showAllFaqs ? 'Show Less' : `See More (${FAQS.length - 3} more)`}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAllFaqs ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-muted-foreground mb-8">
            Join CartEvent today and start receiving leads from customers in your city.
          </p>
          <Button size="lg" className="text-lg px-8 h-14 gap-2" onClick={handleGetStarted}>
            Get Listed Now - It's Free
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="text-lg font-semibold text-primary mb-2">Launching Soon</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/vendor-terms" className="hover:text-foreground">Vendor T&C</a>
            <a href="/vendor-privacy" className="hover:text-foreground">Privacy Policy</a>
            <a href="mailto:support@cartevent.com" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>

      {/* Upgrade Modal for Existing Customers */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-6 pb-4">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-2xl">
                  👋
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Hi {user?.name?.split(' ')[0] || 'there'}!
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Ready to become a vendor?
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">This will allow you to:</p>
              <div className="grid gap-2.5">
                {[
                  { text: "List your services on CartEvent", icon: "📦" },
                  { text: "Receive booking requests from customers", icon: "📥" },
                  { text: "Manage your vendor dashboard", icon: "📊" },
                  { text: "Get leads directly in your dashboard", icon: "🎯" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <span className="text-sm text-foreground leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">💡</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You'll still be able to browse and book other vendors as a customer.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-muted/30 p-4 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-white hover:shadow-lg transition-all"
              onClick={handleConfirmUpgrade}
            >
              Continue as Vendor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

