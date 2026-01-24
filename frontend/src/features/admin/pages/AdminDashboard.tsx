import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Star, 
  TrendingUp,
  UserPlus,
  LogOut,
  RefreshCw,
  BarChart3,
  MapPin,
  Eye,
  Globe,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/shared/contexts/AuthContext';
import { format } from 'date-fns';

interface AdminDashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalVendors: number;
  newUsersLast30Days: number;
  newVendorsLast30Days: number;
  totalListings: number;
  activeListings: number;
  newListingsLast30Days: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalReviews: number;
  averageRating: number;
  totalLeads: number;
  newLeadsLast30Days: number;
  listingsByCategory: Record<string, number>;
  vendorsByCity: Record<string, number>;
  totalPageViews?: number;
  totalSignups?: number;
  uniqueVisitors30Days?: number;
  signups30Days?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Unauthorized. Please login again.');
          logout();
          navigate('/admin/login');
          return;
        }
        const errorText = await response.text();
        console.error('Error response:', errorText);
        toast.error('Failed to fetch stats');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Enhanced spinner with gradient */}
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-secondary animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
          </div>
          {/* Enhanced text */}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent">
              Crunching the numbers...
            </p>
            {/* Progress bar */}
            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer" 
                   style={{
                     backgroundSize: '200% 100%'
                   }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load dashboard</p>
          <Button onClick={fetchStats}>Retry</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend,
    trendLabel 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    trend?: number;
    trendLabel?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && trendLabel && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-3 w-3 mr-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '+' : ''}{trend} {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                size="sm"
                title="Go to Home"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" onClick={fetchStats} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle={`${stats.totalCustomers} customers, ${stats.totalVendors} vendors`}
            icon={Users}
            trend={stats.newUsersLast30Days}
            trendLabel="new (30d)"
          />
          <StatCard
            title="Total Listings"
            value={stats.totalListings}
            subtitle={`${stats.activeListings} active`}
            icon={Package}
            trend={stats.newListingsLast30Days}
            trendLabel="new (30d)"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            subtitle={`${stats.completedOrders} completed, ${stats.pendingOrders} pending`}
            icon={ShoppingCart}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle={`${formatCurrency(stats.monthlyRevenue)} this month`}
            icon={DollarSign}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="New Vendors"
            value={stats.newVendorsLast30Days}
            subtitle="Last 30 days"
            icon={UserPlus}
          />
          <StatCard
            title="Total Reviews"
            value={stats.totalReviews}
            subtitle={`Avg rating: ${stats.averageRating.toFixed(1)} ⭐`}
            icon={Star}
          />
          <StatCard
            title="Total Leads"
            value={stats.totalLeads}
            subtitle={`${stats.newLeadsLast30Days} new (30d)`}
            icon={TrendingUp}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            subtitle="Last 30 days"
            icon={BarChart3}
          />
        </div>

        {/* Distribution Charts */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* Listings by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Listings by Category
              </CardTitle>
              <CardDescription>Distribution of listings across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.listingsByCategory || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Vendors by City */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Vendors by City
              </CardTitle>
              <CardDescription>Geographic distribution of vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.vendorsByCity || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([city, count]) => (
                    <div key={city} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{city}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Stats */}
        {(stats.totalPageViews !== undefined || stats.uniqueVisitors30Days !== undefined) && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Total Page Views"
              value={stats.totalPageViews?.toLocaleString() || '0'}
              subtitle="All time"
              icon={Globe}
            />
            <StatCard
              title="Unique Visitors (30d)"
              value={stats.uniqueVisitors30Days?.toLocaleString() || '0'}
              subtitle="Last 30 days"
              icon={Eye}
            />
            <StatCard
              title="Total Signups"
              value={stats.totalSignups?.toLocaleString() || '0'}
              subtitle="All time"
              icon={UserPlus}
            />
            <StatCard
              title="Signups (30d)"
              value={stats.signups30Days?.toLocaleString() || '0'}
              subtitle="Last 30 days"
              icon={TrendingUp}
            />
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Admin Functions</h3>
                <div className="grid gap-2 md:grid-cols-4">
                  <Button variant="outline" className="justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate('/admin/vendors')}
                  >
                    <Store className="mr-2 h-4 w-4" />
                    Manage Vendors
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate('/admin/listings')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Manage Listings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate('/admin/api-performance')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    API Performance
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">User Journey Access</h3>
                <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate('/')}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate('/search')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Browse Listings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate('/event-planner')}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Event Planner
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate('/vendor/dashboard')}
                  >
                    <Store className="mr-2 h-4 w-4" />
                    Vendor Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



