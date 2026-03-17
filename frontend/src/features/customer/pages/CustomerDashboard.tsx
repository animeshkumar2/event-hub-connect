import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { CustomerLayout } from '../components/CustomerLayout';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  ShoppingBag,
  Heart,
  MapPin,
  Search,
  Calendar,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from 'lucide-react';
import { customerApi } from '@/shared/services/api';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
    'pending': { label: 'Pending', variant: 'outline', icon: Clock },
    'confirmed': { label: 'Confirmed', variant: 'default', icon: CheckCircle2 },
    'in-progress': { label: 'In Progress', variant: 'secondary', icon: Truck },
    'completed': { label: 'Completed', variant: 'default', icon: CheckCircle2 },
    'cancelled': { label: 'Cancelled', variant: 'destructive', icon: XCircle },
  };
  const info = statusMap[status?.toLowerCase()] || { label: status, variant: 'outline' as const, icon: Clock };
  const Icon = info.icon;
  return (
    <Badge variant={info.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {info.label}
    </Badge>
  );
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: ordersData } = useQuery({
    queryKey: ['customerOrders'],
    queryFn: async () => {
      const response = await customerApi.getOrders();
      return response.success ? response.data : [];
    },
  });

  const { data: wishlistCount } = useQuery({
    queryKey: ['wishlistCount'],
    queryFn: async () => {
      const response = await customerApi.getWishlistCount();
      return response.success ? response.data : 0;
    },
  });

  const { data: addressesData } = useQuery({
    queryKey: ['customerAddresses'],
    queryFn: async () => {
      const response = await customerApi.getAddresses();
      return response.success ? response.data : [];
    },
  });

  const orders = ordersData || [];
  const recentOrders = orders.slice(0, 3);
  const addressCount = addressesData?.length || 0;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Avatar className="h-12 w-12 border-2 border-background shadow-md">
              <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Welcome, {user?.fullName?.split(' ')[0] || 'there'}!</h1>
              <p className="text-sm text-muted-foreground">Here's what's happening with your account</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/customer/orders')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-xs text-muted-foreground truncate">Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/customer/wishlist')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold">{wishlistCount || 0}</p>
                  <p className="text-xs text-muted-foreground truncate">Wishlist</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/customer/addresses')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold">{addressCount}</p>
                  <p className="text-xs text-muted-foreground truncate">Addresses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/search')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Search className="h-5 w-5 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Browse</p>
                  <p className="text-xs text-muted-foreground truncate">Find vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="shadow-sm border">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-muted/30">
            <h2 className="text-base sm:text-lg font-semibold">Recent Orders</h2>
            {orders.length > 3 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/customer/orders')} className="gap-1 text-xs">
                View All
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
          <CardContent className="p-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-muted/50 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-1">No orders yet</h3>
                <p className="text-xs text-muted-foreground mb-3">Start exploring vendors and book your first event!</p>
                <Button onClick={() => navigate('/search')} size="sm" className="gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  Browse Vendors
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">Order #{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.listing?.name || order.vendor?.businessName}</p>
                        {order.eventDate && (
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(order.eventDate), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                      {getStatusBadge(order.status)}
                      <p className="text-sm font-semibold text-primary">₹{order.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
