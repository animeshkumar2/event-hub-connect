import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/features/home/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { customerApi } from '@/shared/services/api';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Package, 
  User, 
  Mail, 
  Phone, 
  CreditCard,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  FileText,
  Download,
  Printer
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
    'pending': { label: 'Pending', variant: 'outline', icon: Clock },
    'confirmed': { label: 'Confirmed', variant: 'default', icon: CheckCircle2 },
    'in-progress': { label: 'In Progress', variant: 'secondary', icon: Truck },
    'completed': { label: 'Completed', variant: 'default', icon: CheckCircle2 },
    'cancelled': { label: 'Cancelled', variant: 'destructive', icon: XCircle },
  };
  const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: 'outline', icon: Clock };
  const Icon = statusInfo.icon;
  return (
    <Badge variant={statusInfo.variant} className="gap-1.5">
      <Icon className="h-3 w-3" />
      {statusInfo.label}
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
  const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: 'outline' };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
};

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const response = await customerApi.getOrder(orderId);
      if (!response.success) throw new Error(response.message || 'Failed to fetch order');
      return response.data;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card className="shadow-md border">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">Loading order details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card className="shadow-md border">
            <CardContent className="p-12 text-center">
              <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-lg font-bold mb-2">Order Not Found</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'The order you are looking for does not exist.'}
              </p>
              <Button onClick={() => navigate('/profile')} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const order = orderData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="gap-1.5 mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Order Details</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Order #{order.orderNumber}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 h-8">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 h-8">
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Event Information - Prominent Display - Always Visible */}
            <Card className="shadow-md border border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Event Date & Time</p>
                      {order.eventDate ? (
                        <>
                          <p className="text-sm font-semibold">
                            {format(new Date(order.eventDate), 'EEEE, MMM dd, yyyy')}
                          </p>
                          {order.eventTime ? (
                            <p className="text-xs text-muted-foreground mt-0.5">{order.eventTime}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic mt-0.5">Time TBD</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-muted-foreground italic">Not provided</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <FileText className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Event Type</p>
                      {order.eventType ? (
                        <p className="text-sm font-semibold">{order.eventType}</p>
                      ) : (
                        <p className="text-sm font-semibold text-muted-foreground italic">Not provided</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 md:col-span-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Venue Address</p>
                      {order.venueAddress ? (
                        <p className="text-sm font-semibold">{order.venueAddress}</p>
                      ) : (
                        <p className="text-sm font-semibold text-muted-foreground italic">Not provided</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <User className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Guest Count</p>
                      {order.guestCount ? (
                        <p className="text-sm font-semibold">{order.guestCount} guests</p>
                      ) : (
                        <p className="text-sm font-semibold text-muted-foreground italic">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card className="shadow-md border">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
                <CardTitle className="text-lg">Order Status</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Order Status</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1.5">Payment Status</p>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Order Date</p>
                    <p className="font-medium">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Order Number</p>
                    <p className="font-medium">#{order.orderNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card className="shadow-md border">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
                <CardTitle className="text-lg">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">{order.listing?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.vendor?.businessName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Category: {order.listing?.categoryName || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{order.baseAmount?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Base Price</p>
                    </div>
                  </div>
                  {order.listing?.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{order.listing.description}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>


            {/* Customer Information */}
            <Card className="shadow-md border">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Name</p>
                      <p className="text-sm font-medium">{order.customerName}</p>
                    </div>
                  </div>
                  {order.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Email</p>
                        <p className="text-sm font-medium">{order.customerEmail}</p>
                      </div>
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Phone</p>
                        <p className="text-sm font-medium">{order.customerPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card className="shadow-md border">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
                  <CardTitle className="text-lg">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border sticky top-20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span className="font-medium">₹{order.baseAmount?.toLocaleString()}</span>
                  </div>
                  {order.addOnsAmount && order.addOnsAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Add-ons</span>
                      <span className="font-medium">₹{order.addOnsAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {order.customizationsAmount && order.customizationsAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Customizations</span>
                      <span className="font-medium">₹{order.customizationsAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {order.discountAmount && order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-₹{order.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {order.taxAmount && order.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (GST)</span>
                      <span className="font-medium">₹{order.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-lg font-bold text-primary">₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                  {order.tokenPaid && order.tokenPaid > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Token Paid</span>
                        <span className="font-medium">₹{order.tokenPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Balance Amount</span>
                        <span className="font-medium">₹{order.balanceAmount?.toLocaleString() || '0'}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

