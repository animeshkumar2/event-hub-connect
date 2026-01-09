import { useState, useMemo } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  Phone,
  FileText,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  IndianRupee,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorOrders } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format } from 'date-fns';

export default function VendorOrders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Fetch orders
  const { data: ordersData, loading: ordersLoading, error: ordersError, refetch } = useVendorOrders(
    selectedStatus === 'all' ? undefined : selectedStatus.toUpperCase(),
    page,
    10
  );

  const orders = ordersData?.content || ordersData || [];
  const totalPages = ordersData?.totalPages || 0;

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter((order: any) =>
      order.orderNumber?.toLowerCase().includes(query) ||
      order.customerName?.toLowerCase().includes(query) ||
      order.listingName?.toLowerCase().includes(query) ||
      order.eventType?.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'confirmed':
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400';
      case 'in_progress':
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
      case 'disputed':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const response = await vendorApi.updateOrderStatus(orderId, status);
      if (response.success) {
        toast.success('Order status updated successfully!');
        refetch();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const response = await vendorApi.confirmOrder(orderId);
      if (response.success) {
        toast.success('Order confirmed successfully!');
        refetch();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: 'CONFIRMED' });
        }
      } else {
        throw new Error(response.message || 'Failed to confirm order');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm order');
    }
  };

  if (ordersLoading) {
    return (
      <VendorLayout>
        <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders & Bookings</h1>
            <p className="text-foreground/60">{filteredOrders.length} total orders</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input
              placeholder="Search orders..."
              className="pl-10 bg-muted/50 border-border text-foreground w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              All Orders
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              Pending
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              Confirmed
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order: any) => (
                <Card
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`border-border shadow-card cursor-pointer transition-all hover:border-secondary ${
                    selectedOrder?.id === order.id ? 'border-secondary' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-foreground font-medium">{order.customerName || 'Customer'}</p>
                        <p className="text-sm text-foreground/60">{order.eventType || 'Event'}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-foreground/60">
                      {order.eventDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(order.eventDate), 'MMM d, yyyy')}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <p className="text-xs text-foreground/40 mt-3">#{order.orderNumber}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <Card className="border-border shadow-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground text-xl">
                        {selectedOrder.customerName || 'Customer'}
                      </CardTitle>
                      <p className="text-foreground/60">#{selectedOrder.orderNumber}</p>
                    </div>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Event Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedOrder.eventDate && (
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2 text-foreground/60 mb-1">
                          <Calendar className="h-4 w-4" /> Event Date
                        </div>
                        <p className="text-foreground font-medium">
                          {format(new Date(selectedOrder.eventDate), 'MMM d, yyyy')}
                        </p>
                        {selectedOrder.eventTime && (
                          <p className="text-sm text-foreground/60">{selectedOrder.eventTime}</p>
                        )}
                      </div>
                    )}
                    {selectedOrder.venueAddress && (
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2 text-foreground/60 mb-1">
                          <MapPin className="h-4 w-4" /> Venue
                        </div>
                        <p className="text-foreground font-medium">{selectedOrder.venueAddress}</p>
                      </div>
                    )}
                    {selectedOrder.listingName && (
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2 text-foreground/60 mb-1">
                          <User className="h-4 w-4" /> Package/Item
                        </div>
                        <p className="text-foreground font-medium">{selectedOrder.listingName}</p>
                      </div>
                    )}
                    {selectedOrder.guestCount && (
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2 text-foreground/60 mb-1">
                          <User className="h-4 w-4" /> Guests
                        </div>
                        <p className="text-foreground font-medium">{selectedOrder.guestCount}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                    <h3 className="text-foreground font-semibold mb-3">Payment Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-foreground/60">Base Amount</span>
                        <span className="text-foreground">₹{Number(selectedOrder.baseAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      {selectedOrder.addOnsAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Add-ons</span>
                          <span className="text-foreground">₹{Number(selectedOrder.addOnsAmount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Discount</span>
                          <span className="text-green-400">-₹{Number(selectedOrder.discountAmount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="text-foreground font-medium">Total Amount</span>
                        <span className="text-foreground font-bold">₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      {selectedOrder.tokenPaid > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Token Paid</span>
                            <span className="text-green-400">₹{Number(selectedOrder.tokenPaid).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between border-t border-border pt-2">
                            <span className="text-foreground font-medium">Balance Due</span>
                            <span className="text-secondary font-bold">
                              ₹{(Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.tokenPaid || 0)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  {selectedOrder.status === 'PENDING' && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <h3 className="text-foreground font-semibold mb-3">Order Actions</h3>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleConfirmOrder(selectedOrder.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Confirm Order
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'CANCELLED')}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          Cancel Order
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status Update for other statuses */}
                  {selectedOrder.status !== 'PENDING' && selectedOrder.status !== 'COMPLETED' && (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="text-foreground font-semibold mb-3">Update Status</h3>
                      <div className="flex gap-3">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => {
                            if (newStatus) {
                              handleStatusUpdate(selectedOrder.id, newStatus);
                              setNewStatus('');
                            }
                          }}
                          disabled={!newStatus}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    <Button className="bg-primary hover:bg-primary/80">
                      <MessageSquare className="mr-2 h-4 w-4" /> Message Client
                    </Button>
                    {selectedOrder.status === 'IN_PROGRESS' && (
                      <Button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'COMPLETED')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
                      </Button>
                    )}
                    {selectedOrder.status === 'COMPLETED' && (
                      <Button className="bg-secondary text-secondary-foreground">
                        <IndianRupee className="mr-2 h-4 w-4" /> Request Payout
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border shadow-card h-full flex items-center justify-center">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                  <p className="text-foreground/40">Select an order to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
