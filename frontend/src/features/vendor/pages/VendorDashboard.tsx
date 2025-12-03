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
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VendorDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Upcoming Bookings', value: '8', icon: Calendar, color: 'text-secondary', bg: 'bg-secondary/10', trend: '+2 this week' },
    { label: 'Pending Leads', value: '12', icon: Users, color: 'text-primary', bg: 'bg-primary/10', trend: '3 new today' },
    { label: 'Wallet Balance', value: '₹45,000', icon: Wallet, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10', trend: 'Ready to withdraw' },
    { label: 'This Month Revenue', value: '₹1,25,000', icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', trend: '+18% vs last month' },
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
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-8 border border-border shadow-elegant">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, Royal Moments!
                </h1>
                <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                  Profile Live
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-secondary fill-secondary" /> 4.9 rating
                </span>
                <span>•</span>
                <span>142 bookings completed</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate('/vendor/listings')} 
                className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Listing
              </Button>
              <Button 
                onClick={() => navigate('/vendor/calendar')} 
                variant="outline" 
                className="border-border hover:bg-muted transition-all"
              >
                <Calendar className="mr-2 h-4 w-4" /> Set Availability
              </Button>
              <Button 
                onClick={() => navigate('/vendor/leads')} 
                variant="outline" 
                className="border-border hover:bg-muted transition-all"
              >
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
              className="border-border hover:shadow-elegant transition-all cursor-pointer group hover-lift"
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
                className="text-primary hover:text-primary/80"
                onClick={() => navigate('/vendor/calendar')}
              >
                View Calendar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaySchedule.map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover-lift cursor-pointer"
                >
                  <div className="text-center">
                    <p className="text-secondary font-semibold">{item.time.split(' ')[0]}</p>
                    <p className="text-xs text-muted-foreground">{item.time.split(' ')[1]}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{item.event}</p>
                    <p className="text-sm text-muted-foreground">{item.client}</p>
                  </div>
                </div>
              ))}
              {todaySchedule.length === 0 && (
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
                className="text-primary hover:text-primary/80" 
                onClick={() => navigate('/vendor/leads')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLeads.map((lead, i) => (
                <div 
                  key={lead.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover-lift cursor-pointer"
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
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border shadow-card hover:shadow-elegant transition-all">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Package, label: 'Create Package', path: '/vendor/listings', color: 'text-secondary' },
                { icon: Calendar, label: 'Block Dates', path: '/vendor/calendar', color: 'text-blue-600 dark:text-blue-400' },
                { icon: Wallet, label: 'Request Payout', path: '/vendor/wallet', color: 'text-green-600 dark:text-green-400' },
                { icon: Bell, label: 'Notifications', path: '/vendor/settings', color: 'text-primary' },
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
