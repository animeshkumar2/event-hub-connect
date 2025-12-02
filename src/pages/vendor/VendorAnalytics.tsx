import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  IndianRupee, 
  Calendar,
  Clock,
  Download,
  BarChart3,
  PieChart
} from 'lucide-react';

export default function VendorAnalytics() {
  const stats = [
    { 
      label: 'Total Bookings', 
      value: '142', 
      change: '+12%', 
      trend: 'up',
      icon: Calendar,
      color: 'text-vendor-gold',
      bg: 'bg-vendor-gold/10'
    },
    { 
      label: 'Revenue', 
      value: '₹12.5L', 
      change: '+18%', 
      trend: 'up',
      icon: IndianRupee,
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    { 
      label: 'Conversion Rate', 
      value: '34%', 
      change: '+5%', 
      trend: 'up',
      icon: Users,
      color: 'text-vendor-purple',
      bg: 'bg-vendor-purple/10'
    },
    { 
      label: 'Avg Response Time', 
      value: '2.4h', 
      change: '-15%', 
      trend: 'down',
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
  ];

  const monthlyData = [
    { month: 'Jul', bookings: 8, revenue: 85000 },
    { month: 'Aug', bookings: 12, revenue: 125000 },
    { month: 'Sep', bookings: 15, revenue: 180000 },
    { month: 'Oct', bookings: 18, revenue: 210000 },
    { month: 'Nov', bookings: 22, revenue: 280000 },
    { month: 'Dec', bookings: 28, revenue: 350000 },
  ];

  const topServices = [
    { name: 'Wedding Photography', bookings: 45, revenue: '₹5.4L', percentage: 45 },
    { name: 'Pre-Wedding Shoot', bookings: 32, revenue: '₹3.2L', percentage: 27 },
    { name: 'Corporate Events', bookings: 28, revenue: '₹2.8L', percentage: 18 },
    { name: 'Birthday Party', bookings: 12, revenue: '₹96K', percentage: 10 },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Analytics & Insights</h1>
            <p className="text-white/60">Track your business performance</p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue="last30">
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="last90">Last 90 days</SelectItem>
                <SelectItem value="thisyear">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <Badge className={stat.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {stat.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-vendor-gold" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-white/60 w-12 text-sm">{data.month}</span>
                    <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-vendor-gold to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-medium w-20 text-right">₹{(data.revenue / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bookings Chart */}
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-vendor-purple" />
                Bookings Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-4">
                {monthlyData.map((data, i) => {
                  const maxBookings = Math.max(...monthlyData.map(d => d.bookings));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-white text-sm mb-2">{data.bookings}</span>
                        <div 
                          className="w-full bg-gradient-to-t from-vendor-purple to-vendor-purple/50 rounded-t-lg transition-all duration-500"
                          style={{ height: `${(data.bookings / maxBookings) * 140}px` }}
                        />
                      </div>
                      <span className="text-white/60 text-xs">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Services */}
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-400" />
              Top Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service List */}
              <div className="space-y-4">
                {topServices.map((service, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      i === 0 ? 'bg-vendor-gold' : 
                      i === 1 ? 'bg-vendor-purple' : 
                      i === 2 ? 'bg-blue-400' : 'bg-green-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">{service.name}</p>
                        <p className="text-vendor-gold font-bold">{service.revenue}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <span>{service.bookings} bookings</span>
                        <span>{service.percentage}%</span>
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            i === 0 ? 'bg-vendor-gold' : 
                            i === 1 ? 'bg-vendor-purple' : 
                            i === 2 ? 'bg-blue-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${service.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie Chart Visual */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
                    <circle 
                      cx="50" cy="50" r="40" fill="none" 
                      stroke="#FFD166" strokeWidth="20"
                      strokeDasharray={`${45 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset="0"
                    />
                    <circle 
                      cx="50" cy="50" r="40" fill="none" 
                      stroke="#7C5CFF" strokeWidth="20"
                      strokeDasharray={`${27 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`${-45 * 2.51}`}
                    />
                    <circle 
                      cx="50" cy="50" r="40" fill="none" 
                      stroke="#60A5FA" strokeWidth="20"
                      strokeDasharray={`${18 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`${-(45 + 27) * 2.51}`}
                    />
                    <circle 
                      cx="50" cy="50" r="40" fill="none" 
                      stroke="#4ADE80" strokeWidth="20"
                      strokeDasharray={`${10 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`${-(45 + 27 + 18) * 2.51}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">142</p>
                      <p className="text-sm text-white/60">Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Heatmap */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Response Time by Day & Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-1 min-w-[600px]">
                <div className="text-white/40 text-xs"></div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-white/40 text-xs py-2">{day}</div>
                ))}
                {['9AM', '12PM', '3PM', '6PM', '9PM'].map((time) => (
                  <>
                    <div className="text-white/40 text-xs py-2">{time}</div>
                    {[1,2,3,4,5,6,7].map((_, i) => {
                      const intensity = Math.random();
                      return (
                        <div 
                          key={i}
                          className="aspect-square rounded"
                          style={{
                            backgroundColor: `rgba(124, 92, 255, ${0.2 + intensity * 0.6})`
                          }}
                        />
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-xs text-white/40">Faster</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8].map((opacity, i) => (
                  <div 
                    key={i}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: `rgba(124, 92, 255, ${opacity})` }}
                  />
                ))}
              </div>
              <span className="text-xs text-white/40">Slower</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
