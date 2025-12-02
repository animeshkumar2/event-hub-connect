import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VendorDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Upcoming Bookings', value: '8', icon: Calendar, color: 'text-vendor-gold', bg: 'bg-vendor-gold/10', trend: '+2 this week' },
    { label: 'Pending Leads', value: '12', icon: Users, color: 'text-vendor-purple', bg: 'bg-vendor-purple/10', trend: '3 new today' },
    { label: 'Wallet Balance', value: '₹45,000', icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/10', trend: 'Ready to withdraw' },
    { label: 'This Month Revenue', value: '₹1,25,000', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+18% vs last month' },
  ];

  const todaySchedule = [
    { time: '10:00 AM', event: 'Pre-wedding shoot consultation', client: 'Priya & Rahul' },
    { time: '2:00 PM', event: 'Wedding ceremony coverage', client: 'Sharma Family' },
    { time: '6:00 PM', event: 'Reception shoot', client: 'Sharma Family' },
  ];

  const recentLeads = [
    { id: 1, name: 'Anita Desai', event: 'Birthday Party', date: 'Dec 15', budget: '₹15,000', status: 'new' },
    { id: 2, name: 'Vikram Singh', event: 'Corporate Event', date: 'Dec 20', budget: '₹50,000', status: 'quoted' },
    { id: 3, name: 'Meera Patel', event: 'Engagement', date: 'Jan 5', budget: '₹25,000', status: 'new' },
  ];

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-vendor-purple/30 via-vendor-dark to-vendor-gold/20 p-8">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200')] opacity-10 bg-cover bg-center" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-bold text-white">Welcome back, Royal Moments!</h1>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Profile Live</Badge>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-vendor-gold fill-vendor-gold" /> 4.9 rating
                </span>
                <span>•</span>
                <span>142 bookings completed</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/vendor/listings')} className="bg-vendor-gold text-vendor-dark hover:bg-vendor-gold/90">
                <Plus className="mr-2 h-4 w-4" /> Add Listing
              </Button>
              <Button onClick={() => navigate('/vendor/calendar')} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Calendar className="mr-2 h-4 w-4" /> Set Availability
              </Button>
              <Button onClick={() => navigate('/vendor/leads')} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <MessageSquare className="mr-2 h-4 w-4" /> View Leads
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card 
              key={i} 
              className="glass-card border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <p className="text-xs text-vendor-gold mt-1">{stat.trend}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-vendor-gold" />
                Today's Schedule
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-vendor-gold hover:text-vendor-gold/80">
                View Calendar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaySchedule.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="text-center">
                    <p className="text-vendor-gold font-semibold">{item.time.split(' ')[0]}</p>
                    <p className="text-xs text-white/40">{item.time.split(' ')[1]}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.event}</p>
                    <p className="text-sm text-white/60">{item.client}</p>
                  </div>
                </div>
              ))}
              {todaySchedule.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  No events scheduled for today
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-vendor-purple" />
                Recent Leads
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-vendor-purple hover:text-vendor-purple/80" onClick={() => navigate('/vendor/leads')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-vendor-purple/20 flex items-center justify-center">
                      <span className="text-vendor-purple font-semibold">{lead.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{lead.name}</p>
                      <p className="text-sm text-white/60">{lead.event} • {lead.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-vendor-gold font-semibold">{lead.budget}</p>
                    <Badge className={lead.status === 'new' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Package, label: 'Create Package', path: '/vendor/listings', color: 'text-vendor-gold' },
                { icon: Calendar, label: 'Block Dates', path: '/vendor/calendar', color: 'text-blue-400' },
                { icon: Wallet, label: 'Request Payout', path: '/vendor/wallet', color: 'text-green-400' },
                { icon: Bell, label: 'Notifications', path: '/vendor/settings', color: 'text-vendor-purple' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => navigate(action.path)}
                  className="h-auto py-6 flex-col gap-2 border-white/10 hover:bg-white/5 hover:border-white/20"
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-white/80">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
