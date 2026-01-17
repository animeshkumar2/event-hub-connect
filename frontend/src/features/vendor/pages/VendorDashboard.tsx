import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Calendar, 
  MessageSquare, 
  Package, 
  Wallet, 
  Plus, 
  ArrowUpRight,
  Clock,
  IndianRupee,
  Users,
  TrendingUp,
  Star,
  Bell,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVendorDashboardData } from '@/shared/hooks/useApi';
import { format } from 'date-fns';
import { useMemo, useEffect, useRef } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useVendorProfile } from '@/shared/hooks/useVendorProfile';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { isComplete: profileComplete, vendorId, isLoading: vendorLoading } = useVendorProfile();
  const hasCheckedRef = useRef(false);

  // Redirect to login if not authenticated or not a vendor
  useEffect(() => {
    // Only run once when auth is ready
    if (!authLoading && !vendorLoading && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      
      if (!isAuthenticated) {
        navigate('/login?redirect=/vendor/dashboard');
        return;
      }
      if (user?.role !== 'VENDOR') {
        navigate('/');
        return;
      }
      
      // Check if vendor_id is set - if not and onboarding wasn't skipped, redirect to onboarding
      const onboardingSkipped = localStorage.getItem('onboarding_skipped');
      
      if (!vendorId && !onboardingSkipped) {
        // Vendor hasn't completed onboarding and hasn't skipped - redirect to onboarding
        console.log('Vendor ID not found - redirecting to onboarding');
        navigate('/vendor/onboarding');
        return;
      }
    }
  }, [isAuthenticated, user, authLoading, vendorLoading, navigate, vendorId]);
  
  // Fetch real data in parallel using optimized hook (only if profile is complete)
  const { stats, profile, upcomingOrders, leads, listings, loading: dataLoading } = useVendorDashboardData();
  const statsData = stats.data;
  const statsLoading = stats.loading || dataLoading;
  const statsError = stats.error;
  const profileData = profile.data;
  const profileLoading = profile.loading || dataLoading;
  const upcomingOrdersData = upcomingOrders.data;
  const ordersLoading = upcomingOrders.loading || dataLoading;
  const leadsData = leads.data;
  const leadsLoading = leads.loading || dataLoading;
  const listingsData = listings.data;
  const listingsLoading = listings.loading || dataLoading;

  // Transform stats data into card format
  const statsCards = useMemo(() => {
    // If profile is incomplete, show zeros
    if (!profileComplete) {
      return [
        { 
          label: 'Upcoming Bookings', 
          value: '0', 
          icon: Calendar, 
          color: 'text-secondary', 
          bg: 'bg-secondary/10', 
          trend: 'Complete profile to get bookings' 
        },
        { 
          label: 'Pending Leads', 
          value: '0', 
          icon: Users, 
          color: 'text-primary', 
          bg: 'bg-primary/10', 
          trend: 'Complete profile to receive leads' 
        },
      ];
    }
    
    if (!statsData) return null;
    return [
      { 
        label: 'Upcoming Bookings', 
        value: statsData.upcomingBookings?.toString() || '0', 
        icon: Calendar, 
        color: 'text-secondary', 
        bg: 'bg-secondary/10', 
        trend: 'View calendar' 
      },
      { 
        label: 'Pending Leads', 
        value: statsData.pendingLeads?.toString() || '0', 
        icon: Users, 
        color: 'text-primary', 
        bg: 'bg-primary/10', 
        trend: 'Respond to leads' 
      },
      // PHASE 1: Wallet Balance - Commented out for initial release
      // { 
      //   label: 'Wallet Balance', 
      //   value: `₹${statsData.walletBalance ? Number(statsData.walletBalance).toLocaleString('en-IN') : '0'}`, 
      //   icon: Wallet, 
      //   color: 'text-green-600 dark:text-green-400', 
      //   bg: 'bg-green-500/10', 
      //   trend: statsData.walletBalance && Number(statsData.walletBalance) > 0 ? 'Ready to withdraw' : 'No balance' 
      // },
      // PHASE 1: This Month Revenue - Commented out for initial release
      // { 
      //   label: 'This Month Revenue', 
      //   value: `₹${statsData.monthlyRevenue ? Number(statsData.monthlyRevenue).toLocaleString('en-IN') : '0'}`, 
      //   icon: TrendingUp, 
      //   color: 'text-blue-600 dark:text-blue-400', 
      //   bg: 'bg-blue-500/10', 
      //   trend: 'View analytics' 
      // },
    ];
  }, [statsData, profileComplete]);

  // Get today's schedule from upcoming orders
  const todaySchedule = useMemo(() => {
    if (!upcomingOrdersData || !Array.isArray(upcomingOrdersData)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return upcomingOrdersData
      .filter((order: any) => {
        if (!order.eventDate) return false;
        const orderDate = new Date(order.eventDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      })
      .slice(0, 3)
      .map((order: any) => ({
        time: order.eventTime || 'TBD',
        event: order.listingName || 'Event',
        client: order.customerName || 'Customer',
        orderId: order.id,
      }));
  }, [upcomingOrdersData]);

  // Get recent leads
  const recentLeads = useMemo(() => {
    if (!leadsData || !Array.isArray(leadsData)) return [];
    return leadsData
      .slice(0, 3)
      .map((lead: any) => ({
        id: lead.id,
        name: lead.customerName || 'Customer',
        event: lead.eventType || 'Event',
        date: lead.eventDate ? format(new Date(lead.eventDate), 'MMM d') : 'TBD',
        budget: lead.budget ? `₹${Number(lead.budget).toLocaleString('en-IN')}` : 'TBD',
        status: lead.status?.toLowerCase() || 'new',
      }));
  }, [leadsData]);

  const vendorName = profileComplete ? (profileData?.businessName || user?.fullName || 'Vendor') : (user?.fullName || 'Vendor');
  const vendorRating = profileComplete ? (profileData?.rating || 0) : 0;
  const reviewCount = profileComplete ? (profileData?.reviewCount || 0) : 0;
  const isActive = profileComplete ? (profileData?.isActive !== false) : false;
  const hasListings = profileComplete && listingsData && Array.isArray(listingsData) && listingsData.length > 0;

  // Show loading while checking auth
  if (authLoading) {
    return (
      <VendorLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || user?.role !== 'VENDOR') {
    return null;
  }

  if (statsLoading || profileLoading) {
    return (
      <VendorLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  if (statsError && profileComplete) {
    // Only show error if profile is complete (otherwise it's expected to fail)
    return (
      <VendorLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Failed to load dashboard</p>
                  <p className="text-sm text-muted-foreground">{statsError}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Profile Completion Banner - Show if vendor hasn't completed onboarding */}
        {!profileComplete && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Complete Your Profile to Start Receiving Leads
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Add your business details, services, and contact information to make your profile visible to customers and start receiving bookings.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/vendor/onboarding')}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Complete Profile Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Banner */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-4 sm:p-6 lg:p-8 border border-border shadow-elegant">
          <div className="relative z-10 space-y-4">
            {/* Header Section */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground break-words flex-1 min-w-0">
                    Welcome back, {vendorName}!
                  </h1>
                  {isActive && (
                    <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 flex-shrink-0 text-xs">
                      Profile Live
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  {vendorRating > 0 && (
                    <>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary fill-secondary" /> 
                        {vendorRating.toFixed(1)} rating
                      </span>
                      <span className="hidden sm:inline">•</span>
                    </>
                  )}
                  <span className="whitespace-nowrap">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <Button 
                onClick={() => navigate('/vendor/listings')} 
                className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all w-full justify-center"
                size="sm"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
                <span className="text-xs sm:text-sm">Add Listing</span>
              </Button>
              <Button 
                onClick={() => navigate('/vendor/calendar')} 
                variant="outline" 
                className="border border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/30 hover:text-foreground hover:shadow-md transition-all w-full justify-center shadow-sm"
                size="sm"
              >
                <Calendar className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
                <span className="text-xs sm:text-sm">Set Availability</span>
              </Button>
              <Button 
                onClick={() => navigate('/vendor/leads')} 
                variant="outline" 
                className="border border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/30 hover:text-foreground hover:shadow-md transition-all w-full justify-center sm:col-span-2 lg:col-span-1 shadow-sm"
                size="sm"
              >
                <MessageSquare className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
                <span className="text-xs sm:text-sm">View Leads</span>
              </Button>
            </div>
          </div>
        </div>

        {/* No Listings Message */}
        {!listingsLoading && !hasListings && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Create your first listing to start getting leads
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your services and packages to make your profile visible to customers and start receiving booking requests.
                  </p>
                  <Button 
                    onClick={() => navigate('/vendor/listings')} 
                    className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Listing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        {statsCards && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statsCards.map((stat, i) => (
              <Card 
                key={i} 
                className="border-border hover:shadow-elegant transition-all cursor-pointer group hover-lift"
                onClick={() => {
                  if (i === 0) navigate('/vendor/calendar');
                  if (i === 1) navigate('/vendor/leads');
                  if (i === 2) navigate('/vendor/wallet');
                  if (i === 3) navigate('/vendor/analytics');
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${stat.bg} transition-transform group-hover:scale-110`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <p className="text-xs text-secondary mt-1 font-medium">{stat.trend}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card className="border-border shadow-card hover:shadow-elegant transition-all">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-secondary" />
                Today's Schedule
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5 font-medium"
                onClick={() => navigate('/vendor/calendar')}
              >
                <Calendar className="h-3.5 w-3.5" />
                View Calendar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {ordersLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : todaySchedule.length > 0 ? (
                todaySchedule.map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover-lift cursor-pointer"
                    onClick={() => navigate(`/vendor/orders?orderId=${item.orderId}`)}
                  >
                    <div className="text-center">
                      <p className="text-secondary font-semibold">{item.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{item.event}</p>
                      <p className="text-sm text-muted-foreground">{item.client}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No events scheduled for today
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card className="border-border shadow-card hover:shadow-elegant transition-all">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Recent Leads
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5 font-medium" 
                onClick={() => navigate('/vendor/leads')}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {leadsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover-lift cursor-pointer"
                    onClick={() => navigate(`/vendor/leads?leadId=${lead.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">{lead.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.event} • {lead.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-secondary font-semibold">{lead.budget}</p>
                      <Badge className={lead.status === 'new' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'}>
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No leads yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border shadow-card hover:shadow-elegant transition-all">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {[
                { icon: Package, label: 'Create Package', path: '/vendor/listings', color: 'text-secondary' },
                { icon: Calendar, label: 'Block Dates', path: '/vendor/calendar', color: 'text-blue-600 dark:text-blue-400' },
                // PHASE 1: Request Payout - Commented out for initial release
                // { icon: Wallet, label: 'Request Payout', path: '/vendor/wallet', color: 'text-green-600 dark:text-green-400' },
                // PHASE 1: Notifications - Commented out for initial release
                // { icon: Bell, label: 'Notifications', path: '/vendor/settings', color: 'text-primary' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => navigate(action.path)}
                  className="h-auto py-6 flex-col gap-2 border-border hover:bg-muted hover:shadow-sm transition-all hover-lift"
                >
                  <action.icon className={`h-6 w-6 ${action.color} transition-transform group-hover:scale-110`} />
                  <span className="text-foreground font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
