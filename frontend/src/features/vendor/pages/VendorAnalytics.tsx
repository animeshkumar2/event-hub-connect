import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  IndianRupee, 
  Calendar,
  Clock,
  Download,
  BarChart3,
  PieChart,
  Loader2,
  Lock,
  Sparkles,
  Zap
} from 'lucide-react';
import { useVendorDashboardStats, useVendorOrders } from '@/shared/hooks/useApi';
import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { FEATURE_FLAGS } from '@/shared/config/featureFlags';

export default function VendorAnalytics() {
  const { data: statsData, loading, error } = useVendorDashboardStats();
  const { data: ordersData } = useVendorOrders();

  const stats = statsData || {
    upcomingBookings: 0,
    pendingLeads: 0,
    walletBalance: 0,
    monthlyRevenue: 0,
  };

  // Calculate monthly data from real orders
  const monthlyData = useMemo(() => {
    if (!ordersData?.content || !Array.isArray(ordersData.content)) {
      return [];
    }

    const orders = ordersData.content;
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return last6Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthOrders = orders.filter((order: any) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const bookings = monthOrders.length;
      const revenue = monthOrders.reduce((sum: number, order: any) => {
        return sum + (parseFloat(order.totalAmount) || 0);
      }, 0);

      return {
        month: format(month, 'MMM'),
        bookings,
        revenue: Math.round(revenue)
      };
    });
  }, [ordersData]);

  // Calculate top services from orders
  const topServices = useMemo(() => {
    if (!ordersData?.content || !Array.isArray(ordersData.content)) {
      return [];
    }

    const serviceMap = new Map<string, { bookings: number; revenue: number }>();
    
    ordersData.content.forEach((order: any) => {
      const listingName = order.listingName || 'Unknown Service';
      const amount = parseFloat(order.totalAmount) || 0;
      
      if (!serviceMap.has(listingName)) {
        serviceMap.set(listingName, { bookings: 0, revenue: 0 });
      }
      
      const service = serviceMap.get(listingName)!;
      service.bookings += 1;
      service.revenue += amount;
    });

    const services = Array.from(serviceMap.entries())
      .map(([name, data]) => ({
        name,
        bookings: data.bookings,
        revenue: data.revenue,
        revenueFormatted: data.revenue >= 100000 
          ? `₹${(data.revenue / 100000).toFixed(1)}L` 
          : `₹${(data.revenue / 1000).toFixed(0)}K`
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    const totalRevenue = services.reduce((sum, s) => sum + s.revenue, 0);
    
    return services.map(service => ({
      ...service,
      percentage: totalRevenue > 0 ? Math.round((service.revenue / totalRevenue) * 100) : 0
    }));
  }, [ordersData]);

  const displayStats = [
    { 
      label: 'Upcoming Bookings', 
      value: String(stats.upcomingBookings || 0), 
      change: '', 
      trend: 'up' as const,
      icon: Calendar,
      color: 'text-secondary',
      bg: 'bg-secondary/10'
    },
    { 
      label: 'Monthly Revenue', 
      value: (() => {
        const revenue = Number(stats.monthlyRevenue) || 0;
        if (revenue >= 100000) return `₹${(revenue / 100000).toFixed(1)}L`;
        return `₹${(revenue / 1000).toFixed(0)}K`;
      })(), 
      change: '', 
      trend: 'up' as const,
      icon: IndianRupee,
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    { 
      label: 'Pending Leads', 
      value: String(stats.pendingLeads || 0), 
      change: '', 
      trend: 'up' as const,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      label: 'Wallet Balance', 
      value: (() => {
        const balance = Number(stats.walletBalance) || 0;
        if (balance >= 100000) return `₹${(balance / 100000).toFixed(1)}L`;
        return `₹${(balance / 1000).toFixed(0)}K`;
      })(), 
      change: '', 
      trend: 'up' as const,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
  ];

  if (loading) {
    return (
      <VendorLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  if (error) {
    return (
      <VendorLayout>
        <div className="p-6">
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
            </CardContent>
          </Card>
        </div>
      </VendorLayout>
    );
  }

  const maxRevenue = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.revenue)) : 1;
  const maxBookings = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.bookings)) : 1;

  // PHASE 1: Show locked state if analytics is disabled
  if (!FEATURE_FLAGS.ANALYTICS_ENABLED) {
    return (
      <VendorLayout>
        <div className="relative min-h-screen overflow-hidden">
          {/* Blurred Background Content */}
          <div className="absolute inset-0 pointer-events-none select-none p-4 space-y-4" style={{ filter: 'blur(10px)' }}>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Analytics & Insights</h1>
                  <p className="text-foreground/60 text-xs">Track your business performance</p>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="last30">
                    <SelectTrigger className="w-32 h-8 text-xs bg-muted/50 border-0 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7">Last 7 days</SelectItem>
                      <SelectItem value="last30">Last 30 days</SelectItem>
                      <SelectItem value="last90">Last 90 days</SelectItem>
                      <SelectItem value="thisyear">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="border-0 text-foreground hover:bg-muted h-8">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Export
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {displayStats.map((stat, i) => (
                  <Card key={i} className="border-0 shadow-none bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-foreground/60 text-xs mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Revenue Chart */}
                <Card className="border-0 shadow-none bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-secondary" />
                      Revenue Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-foreground/60 w-10 text-xs">Jan</span>
                          <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-secondary to-amber-500 rounded-full w-3/4" />
                          </div>
                          <span className="text-foreground font-medium w-16 text-right text-xs">₹50K</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bookings Chart */}
                <Card className="border-0 shadow-none bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Bookings Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between h-32 gap-2">
                      {[60, 80, 70, 90, 85, 95].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex flex-col items-center">
                            <span className="text-foreground text-xs mb-1">12</span>
                            <div 
                              className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t"
                              style={{ height: `${height}px` }}
                            />
                          </div>
                          <span className="text-foreground/60 text-xs">Jan</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Overlay with Lock Message */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/85 p-6">
              <Card className="max-w-md w-full border-0 shadow-2xl bg-card">
                <CardContent className="p-8 text-center">
                  {/* Animated Lock Icon */}
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                      <Lock className="h-12 w-12 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
                    <Zap className="h-6 w-6 text-secondary" />
                    Analytics Coming Soon
                  </h2>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                    Powerful analytics to track revenue trends, booking patterns, and customer insights.
                  </p>

                  {/* Features Preview */}
                  <div className="space-y-3 mb-6 text-left">
                    {[
                      { icon: BarChart3, text: 'Revenue & earnings breakdown' },
                      { icon: Calendar, text: 'Booking trends & forecasts' },
                      { icon: Users, text: 'Customer behavior insights' },
                      { icon: TrendingUp, text: 'Performance comparisons' }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <feature.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-foreground/80">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Badge */}
                  <Badge className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-0 px-4 py-2 font-semibold">
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            </div>
        </div>
      </VendorLayout>
    );
  }

  // Original analytics content (when ANALYTICS_ENABLED = true)
  return (
    <VendorLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Analytics & Insights</h1>
            <p className="text-foreground/60 text-xs">Track your business performance</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="last30">
              <SelectTrigger className="w-32 h-8 text-xs bg-muted/50 border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="last90">Last 90 days</SelectItem>
                <SelectItem value="thisyear">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted h-8">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayStats.map((stat, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  {stat.change && (
                    <Badge className={`text-xs h-5 ${stat.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {stat.trend === 'up' ? <TrendingUp className="h-2.5 w-2.5 mr-1" /> : <TrendingDown className="h-2.5 w-2.5 mr-1" />}
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-foreground/60 text-xs mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue Chart */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-secondary" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <div className="space-y-2">
                  {monthlyData.map((data, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-foreground/60 w-10 text-xs">{data.month}</span>
                      <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-secondary to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-foreground font-medium w-16 text-right text-xs">
                        {data.revenue >= 100000 
                          ? `₹${(data.revenue / 100000).toFixed(1)}L` 
                          : `₹${(data.revenue / 1000).toFixed(0)}K`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/60 text-center py-4">No revenue data available</p>
              )}
            </CardContent>
          </Card>

          {/* Bookings Chart */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Bookings Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <div className="flex items-end justify-between h-32 gap-2">
                  {monthlyData.map((data, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-foreground text-xs mb-1">{data.bookings}</span>
                        <div 
                          className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t transition-all duration-500"
                          style={{ height: `${(data.bookings / maxBookings) * 100}px` }}
                        />
                      </div>
                      <span className="text-foreground/60 text-xs">{data.month}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/60 text-center py-4">No bookings data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Services */}
        {topServices.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <PieChart className="h-4 w-4 text-green-400" />
                Top Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topServices.map((service, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      i === 0 ? 'bg-secondary' : 
                      i === 1 ? 'bg-primary' : 
                      i === 2 ? 'bg-blue-400' : 'bg-green-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-foreground font-medium text-sm truncate">{service.name}</p>
                        <p className="text-secondary font-bold text-sm ml-2">{service.revenueFormatted}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-foreground/60 mt-0.5">
                        <span>{service.bookings} bookings</span>
                        <span>{service.percentage}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            i === 0 ? 'bg-secondary' : 
                            i === 1 ? 'bg-primary' : 
                            i === 2 ? 'bg-blue-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${service.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </VendorLayout>
  );
}
