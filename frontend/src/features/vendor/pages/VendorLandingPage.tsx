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
  ChevronDown,
  Heart,
  Briefcase,
  Cake,
  GraduationCap,
  Music2,
  Church,
  Home,
  PartyPopper,
  Flame,
  Sparkle,
  Camera,
  ChefHat,
  Palette,
  Building2,
  Mic,
  Brush
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
    q: "Who is responsible if something goes wrong at an event?",
    a: "The vendor and customer. CartEvent is not involved in service delivery or disputes.",
  },
  {
    q: "Can CartEvent remove my listing?",
    a: "Yes. Listings or vendor accounts may be modified, suspended, or removed at any time.",
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
  const { isAuthenticated, user, logout } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  
  // Fetch vendor count for dynamic spots remaining
  const { data: stats, loading: statsLoading } = useStats();
  
  // Calculate remaining spots (starting from 51 to create FOMO - 49 already "booked")
  const spotsRemaining = useMemo(() => {
    // Use cached data if available, even if still loading fresh data
    if (!stats) {
      return null; // Return null only if no data at all (not even cached)
    }
    const vendorCount = stats?.vendorCount || stats?.vendors || 0;
    // Start from 51 (100 - 49 fake booked), then subtract actual registrations
    const remaining = EARLY_BIRD_LIMIT - FOMO_ALREADY_BOOKED - vendorCount;
    return Math.max(0, remaining);
  }, [stats]);
  
  // Determine if early bird offer is still available (only when data is loaded)
  const isEarlyBirdAvailable = spotsRemaining !== null && spotsRemaining > 0;

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
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <a href="/" className="text-lg sm:text-xl font-bold text-primary">
            cartevent.
          </a>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10">
              <span className="hidden sm:inline">Browse as Customer</span>
              <span className="sm:hidden">Browse</span>
            </Button>
            {isAuthenticated ? (
              <>
                <Button onClick={handleGetStarted} className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10">
                  <span className="hidden sm:inline">{(user?.role === 'vendor' || user?.role === 'VENDOR') ? 'Go to Dashboard' : 'Start Listing'}</span>
                  <span className="sm:hidden">{(user?.role === 'vendor' || user?.role === 'VENDOR') ? 'Dashboard' : 'Start'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    logout();
                    navigate('/for-vendors');
                  }}
                  className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/auth?mode=login&type=vendor')} className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10">
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Sign In</span>
                </Button>
                <Button onClick={() => navigate('/auth?mode=signup&type=vendor')} className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10">
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Sign Up</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              Early Access - Limited Spots Available
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 px-2">
              Get More Customers for Your{' '}
              <span className="text-primary">Event Business</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Secure your spot in India's only event marketplace. Join our early vendor network 
              and reach customers planning weddings, parties, cultural ceremonies, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 gap-2 w-full sm:w-auto" onClick={handleGetStarted}>
                Get Listed Now - It's Free
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            
            {/* Dynamic Spots Remaining Badge */}
            {spotsRemaining !== null && isEarlyBirdAvailable ? (
              <div className="mt-4 sm:mt-6 inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mx-2">
                <span className="text-base sm:text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  only {spotsRemaining} spots left
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  - First 100 vendors get FREE forever access
                </span>
              </div>
            ) : null}
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 px-4">
              ✓ 100% Free to join &nbsp;•&nbsp; ✓ Setup in 5 minutes &nbsp;•&nbsp; ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Premium Design */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/20 text-white/90 text-xs font-medium mb-3 sm:mb-4">
              SIMPLE 3-STEP PROCESS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-2">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-primary">1</span>
                  </div>
                  <div className="hidden md:flex items-center flex-1">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-white/50 to-transparent" />
                  </div>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-white mb-2">Sign Up</h3>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">Fill a quick form with your business details. Takes less than 2 minutes.</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-primary">2</span>
                  </div>
                  <div className="hidden md:flex items-center flex-1">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-white/50 to-transparent" />
                  </div>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-white mb-2">Post Your First Listing</h3>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">Showcase your services with photos, pricing & packages.</p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-primary">3</span>
                  </div>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-white mb-2">Start Getting Free Leads</h3>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">Get customer bookings & enquiries directly on the platform.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join CartEvent - Comprehensive Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-4">Why Join CartEvent?</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Connect with high-value customers and grow your business. We handle customer acquisition so you can focus on delivering exceptional service.
            </p>
          </div>

          {/* Feature Cards with Screenshots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
            {/* Analytics Card */}
            <div className="group">
              <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
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
                <CardContent className="p-4 sm:p-6 min-h-[140px] flex flex-col">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl">Analytics & Insights</h3>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm">Track revenue, see booking trends, and grow smarter with data-driven decisions.</p>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Card */}
            <div className="group">
              <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
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
                <CardContent className="p-4 sm:p-6 min-h-[140px] flex flex-col">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl">Smart Calendar</h3>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm">Manage your schedule effortlessly. Never double-book again.</p>
                </CardContent>
              </Card>
            </div>

            {/* Payments Card */}
            <div className="group">
              <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
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
                <CardContent className="p-4 sm:p-6 min-h-[140px] flex flex-col">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl">Direct Payments</h3>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm">Get paid directly by customers. No middleman, no delays.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Lalach Section + Early Vendor Benefits */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-white relative">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12 relative z-10">
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                  {/* Left - Quote */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Rocket className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-sm font-medium uppercase tracking-wider opacity-80">Growth Potential</span>
                    </div>
                    <blockquote className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-4 sm:mb-6">
                      "Vendors on CartEvent may get <span className="text-yellow-300">3x more bookings</span> than traditional marketing methods"
                    </blockquote>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                        <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm font-medium">2026 Target: 1000+ Vendors</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right - Early Vendor Benefits */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                    <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
                      Early Vendor Benefits
                    </h3>
                    <ul className="space-y-2 sm:space-y-3">
                      {[
                        spotsRemaining !== null ? `First 100 vendors - FREE forever (only ${spotsRemaining} spots left)` : "First 100 vendors - FREE forever",
                        "Unlimited listings - no restrictions",
                        "0% commission - keep 100% of your earnings",
                        "Priority placement in search results",
                        "Featured in our launch marketing campaigns"
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 sm:gap-3">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-white/90 text-sm sm:text-base">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    {spotsRemaining !== null && isEarlyBirdAvailable ? (
                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                        <p className="text-yellow-200 text-xs sm:text-sm font-medium text-center">
                          ⏰ Hurry! Only <span className="font-bold text-base sm:text-lg">{spotsRemaining}</span> early bird spots remaining!
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: MessageSquare, title: "Real-time Chat", desc: "Instant customer messaging", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Star, title: "Reviews & Ratings", desc: "Build trust with feedback", color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { icon: Package, title: "Unlimited Listings", desc: "Create packages freely", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: BadgeCheck, title: "100% Free", desc: "No listing fees ever", color: "text-green-500", bg: "bg-green-500/10" },
            ].map((feature, i) => (
              <Card key={i} className="border hover:border-primary/30 transition-all hover:shadow-lg group">
                <CardContent className="p-3 sm:p-4 md:p-5 text-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.bg} flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground leading-tight">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          </div>
      </section>

      {/* Who Can Join - Inclusive Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              Zero Barriers
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
              If You're in Events, <span className="text-primary">You're In.</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Join India's growing event services marketplace. List your services, reach more customers, and grow your business.
            </p>
          </div>

          {/* Services & Events - Visual Showcase */}
          <div className="max-w-6xl mx-auto mb-8 sm:mb-12 md:mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Services Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-6">
                    <Sparkles className="h-4 w-4" />
                    Services
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: Camera, label: "Photography & Videography" },
                      { icon: Palette, label: "Décor" },
                      { icon: ChefHat, label: "Catering" },
                      { icon: Building2, label: "Venue" },
                      { icon: Sparkles, label: "Makeup & Styling" },
                      { icon: Music2, label: "DJ & Entertainment" },
                      { icon: Mic, label: "Sound & Lights" },
                      { icon: Brush, label: "Artists & Performers" },
                    ].map((service, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50 hover:border-blue-300 hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-default"
                      >
                        <service.icon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-foreground/80">{service.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Events Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-6">
                    <Calendar className="h-4 w-4" />
                    Events
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: Heart, label: "Wedding", color: "hover:border-rose-300 hover:from-rose-50 hover:to-pink-50" },
                      { icon: Cake, label: "Birthday", color: "hover:border-pink-300 hover:from-pink-50 hover:to-fuchsia-50" },
                      { icon: Heart, label: "Anniversary", color: "hover:border-red-300 hover:from-red-50 hover:to-rose-50" },
                      { icon: Briefcase, label: "Corporate", color: "hover:border-slate-400 hover:from-slate-100 hover:to-gray-100" },
                      { icon: Heart, label: "Engagement", color: "hover:border-purple-300 hover:from-purple-50 hover:to-violet-50" },
                      { icon: PartyPopper, label: "Baby Shower", color: "hover:border-blue-300 hover:from-blue-50 hover:to-sky-50" },
                      { icon: Music2, label: "Nightlife", color: "hover:border-indigo-300 hover:from-indigo-50 hover:to-purple-50" },
                      { icon: Sparkle, label: "Other", color: "hover:border-amber-300 hover:from-amber-50 hover:to-yellow-50" },
                    ].map((event, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50 ${event.color} transition-all duration-200 cursor-default`}
                      >
                        <event.icon className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-foreground/80">{event.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {(showAllFaqs ? FAQS : FAQS.slice(0, 3)).map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-2 flex items-start gap-2 text-sm sm:text-base">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                    {faq.q}
                  </h3>
                  <p className="text-muted-foreground pl-6 sm:pl-7 text-xs sm:text-sm">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
            
            {/* See More / See Less Button */}
            {FAQS.length > 3 && (
              <div className="text-center pt-3 sm:pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllFaqs(!showAllFaqs)}
                  className="gap-2 text-sm sm:text-base"
                >
                  {showAllFaqs ? 'Show Less' : `See More (${FAQS.length - 3} more)`}
                  <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${showAllFaqs ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            )}

            {/* Request Ops Assistance Note - Commented out for now
            <Card className="border-primary/20 bg-primary/5 mt-4 sm:mt-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Request Ops Assistance</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">Post Launch</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t">
        <div className="container mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
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

