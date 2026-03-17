import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../components/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  ShoppingBag,
  Calendar,
  MapPin,
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
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
    <Badge variant={info.variant} className="gap-1.5">
      <Icon className="h-3 w-3" />
      {info.label}
    </Badge>
  );
};

const getPaymentStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'pending': { label: 'Pending', variant: 'outline' },
    'partial': { label: 'Partial', variant: 'secondary' },
    'paid': { label: 'Paid', variant: 'default' },
    'refunded': { label: 'Refunded', variant: 'destructive' },
  };
  const info = statusMap[status?.toLowerCase()] || { label: status, variant: 'outline' as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
};

export default function CustomerOrders() {
  const navigate = useNavigate();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['customerOrders'],
    queryFn: async () => {
      const response = await customerApi.getOrders();
      return response.success ? response.data : [];
    },
  });

  const orders = ordersData || [];

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">View and track all your orders</p>
        </div>

        {isLoading ? (
          <Card className="shadow-sm border">
            <CardContent className="p-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading your orders...</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="shadow-sm border">
            <CardContent className="p-10 text-center">
              <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start exploring vendors and book your first event!</p>
              <Button onClick={() => navigate('/search')} size="sm" className="gap-1.5">
                <Search className="h-4 w-4" />
                Browse Vendors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <Card key={order.id} className="border hover:shadow-md transition-all duration-200 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base font-bold">Order #{order.orderNumber}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Status:</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Payment:</span>
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                        {order.eventDate && (
                          <>
                            <span>•</span>
                            <span>Event: {format(new Date(order.eventDate), 'MMM dd, yyyy')}</span>
                            {order.eventTime && <span>at {order.eventTime}</span>}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary mb-1.5">₹{order.totalAmount?.toLocaleString()}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="gap-1.5 h-8"
                      >
                        View Details
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                      <div className="bg-primary/10 p-1.5 rounded-lg">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Service</p>
                        <p className="text-sm font-semibold">{order.listing?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.vendor?.businessName}</p>
                      </div>
                    </div>
                    {order.eventDate && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                        <div className="bg-primary/10 p-1.5 rounded-lg">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">Event Date</p>
                          <p className="text-sm font-semibold">{format(new Date(order.eventDate), 'MMM dd, yyyy')}</p>
                          {order.eventTime ? (
                            <p className="text-xs text-muted-foreground">{order.eventTime}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">Time TBD</p>
                          )}
                        </div>
                      </div>
                    )}
                    {order.venueAddress && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                        <div className="bg-primary/10 p-1.5 rounded-lg">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">Venue</p>
                          <p className="text-sm font-semibold line-clamp-2">{order.venueAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
