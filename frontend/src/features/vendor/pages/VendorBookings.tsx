import { useState, useMemo, useEffect } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { ImageUpload } from '@/shared/components/ImageUpload';
import { 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  Phone,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  IndianRupee,
  Loader2,
  Package,
  X,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Camera,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorBookings, useVendorUpcomingBookings, useVendorPastBookings } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  listingId?: string;
  listingName?: string;
  listingImage?: string;
  eventType?: string;
  eventDate?: string;
  eventTime?: string;
  venueAddress?: string;
  guestCount?: number;
  baseAmount?: number;
  addOnsAmount?: number;
  customizationsAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  tokenPaid?: number;
  balanceAmount?: number;
  paymentStatus?: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to map Order entity to Booking interface
const mapOrderToBooking = (order: any): Booking => {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    listingId: order.listing?.id || order.listingId,
    listingName: order.listing?.name || order.listingName,
    listingImage: order.listing?.images?.[0] || order.listingImage,
    eventType: order.eventType,
    eventDate: order.eventDate,
    eventTime: order.eventTime,
    venueAddress: order.venueAddress,
    guestCount: order.guestCount,
    baseAmount: order.baseAmount ? Number(order.baseAmount) : undefined,
    addOnsAmount: order.addOnsAmount ? Number(order.addOnsAmount) : undefined,
    customizationsAmount: order.customizationsAmount ? Number(order.customizationsAmount) : undefined,
    discountAmount: order.discountAmount ? Number(order.discountAmount) : undefined,
    taxAmount: order.taxAmount ? Number(order.taxAmount) : undefined,
    totalAmount: Number(order.totalAmount || 0),
    tokenPaid: order.tokenPaid ? Number(order.tokenPaid) : undefined,
    balanceAmount: order.balanceAmount ? Number(order.balanceAmount) : undefined,
    paymentStatus: order.paymentStatus?.toString() || order.paymentStatus,
    status: order.status?.toString() || order.status || 'PENDING',
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export default function VendorBookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingBookingId, setCompletingBookingId] = useState<string | null>(null);
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [eventDescription, setEventDescription] = useState('');

  // Fetch bookings based on active tab
  const { data: allBookingsData, loading: allBookingsLoading, refetch: refetchAll } = useVendorBookings(page, 10);
  const { data: upcomingBookingsData, loading: upcomingBookingsLoading, refetch: refetchUpcoming } = useVendorUpcomingBookings();
  const { data: pastBookingsData, loading: pastBookingsLoading, refetch: refetchPast } = useVendorPastBookings();

  // Get bookings based on active tab and map them
  const bookings = useMemo(() => {
    let rawBookings: any[] = [];
    if (activeTab === 'all') {
      rawBookings = allBookingsData?.content || allBookingsData || [];
    } else if (activeTab === 'upcoming') {
      rawBookings = upcomingBookingsData || [];
    } else {
      rawBookings = pastBookingsData || [];
    }
    return rawBookings.map(mapOrderToBooking);
  }, [activeTab, allBookingsData, upcomingBookingsData, pastBookingsData]);

  const loading = activeTab === 'all' ? allBookingsLoading : (activeTab === 'upcoming' ? upcomingBookingsLoading : pastBookingsLoading);
  const totalPages = activeTab === 'all' ? (allBookingsData?.totalPages || 0) : 0;

  // Filter bookings by search query
  const filteredBookings = useMemo(() => {
    if (!searchQuery) return bookings;
    const query = searchQuery.toLowerCase();
    return bookings.filter((booking: Booking) =>
      booking.orderNumber?.toLowerCase().includes(query) ||
      booking.customerName?.toLowerCase().includes(query) ||
      booking.listingName?.toLowerCase().includes(query) ||
      booking.eventType?.toLowerCase().includes(query)
    );
  }, [bookings, searchQuery]);

  const refetch = () => {
    if (activeTab === 'all') refetchAll();
    else if (activeTab === 'upcoming') refetchUpcoming();
    else refetchPast();
  };

  // Get booking status display (normalize status for display)
  const getBookingStatusDisplay = (status: string): string => {
    const statusUpper = status?.toUpperCase() || '';
    // Handle both enum name and string formats
    const normalized = statusUpper.replace(/-/g, '_');
    switch (normalized) {
      case 'CONFIRMED':
        return 'Confirmed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'DISPUTED':
        return 'Disputed';
      case 'PENDING':
        return 'Pending';
      default:
        return status || 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase() || '';
    const normalized = statusUpper.replace(/-/g, '_');
    switch (normalized) {
      case 'CONFIRMED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'IN_PROGRESS':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CANCELLED':
      case 'DISPUTED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PENDING':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase() || '';
    switch (statusUpper) {
      case 'PAID':
        return 'bg-green-500/20 text-green-400';
      case 'PARTIAL':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'PENDING':
        return 'bg-gray-500/20 text-gray-400';
      case 'REFUNDED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPaymentStatusDisplay = (status: string): string => {
    const statusUpper = status?.toUpperCase() || '';
    switch (statusUpper) {
      case 'PAID':
        return 'Paid';
      case 'PARTIAL':
        return 'Partial';
      case 'PENDING':
        return 'Pending';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return status || 'Pending';
    }
  };

  const buildUpcomingLifecycle = (booking: Booking) => {
    const lifecycle = [];
    
    // Step 1: Booking Confirmed
    lifecycle.push({
      label: 'Booking Confirmed',
      icon: CheckCircle2,
      completed: true,
      color: 'text-green-400'
    });
    
    // Step 2: Token Amount Received
    const hasTokenPaid = booking.tokenPaid && booking.tokenPaid > 0;
    lifecycle.push({
      label: 'Token Amount Received',
      icon: CreditCard,
      completed: hasTokenPaid,
      color: hasTokenPaid ? 'text-green-400' : 'text-gray-400',
      value: booking.tokenPaid ? `₹${booking.tokenPaid.toLocaleString('en-IN')}` : 'Pending'
    });
    
    // Step 3: Event Pending
    const isEventDatePast = booking.eventDate ? new Date(booking.eventDate) <= new Date() : false;
    lifecycle.push({
      label: isEventDatePast ? 'Event Day' : 'Event Pending',
      icon: Calendar,
      completed: false,
      color: isEventDatePast ? 'text-yellow-400' : 'text-gray-400',
      value: booking.eventDate ? format(new Date(booking.eventDate), 'MMM dd, yyyy') : 'Not set'
    });
    
    return lifecycle;
  };

  const handleCompleteEvent = async () => {
    if (!completingBookingId) return;
    
    if (eventImages.length === 0) {
      toast.error('Please add at least one event photo');
      return;
    }

    try {
      const response = await vendorApi.completeEvent(completingBookingId, {
        images: eventImages,
        description: eventDescription || undefined
      });
      
      if (response.success) {
        toast.success('Event completed successfully! Photos will be added to your portfolio.');
        setShowCompleteModal(false);
        setEventImages([]);
        setEventDescription('');
        setCompletingBookingId(null);
        refetch();
        if (selectedBooking?.id === completingBookingId) {
          setSelectedBooking({ ...selectedBooking, status: 'COMPLETED' });
        }
      } else {
        throw new Error(response.message || 'Failed to complete event');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete event');
    }
  };

  const openCompleteModal = (bookingId: string) => {
    setCompletingBookingId(bookingId);
    setEventImages([]);
    setEventDescription('');
    setShowCompleteModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
            <p className="text-foreground/60">
              {activeTab === 'all' && `${filteredBookings.length} total bookings`}
              {activeTab === 'upcoming' && `${filteredBookings.length} upcoming bookings`}
              {activeTab === 'past' && `${filteredBookings.length} past bookings`}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input
              placeholder="Search bookings..."
              className="pl-10 bg-background border-border text-foreground w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Bookings ({allBookingsData?.content?.length || allBookingsData?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Upcoming ({upcomingBookingsData?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Past ({pastBookingsData?.length || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings List */}
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredBookings.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                  <p className="text-foreground/60">No bookings found</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking: Booking) => (
                <Card
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`border-border shadow-card cursor-pointer transition-all hover:shadow-elegant ${
                    selectedBooking?.id === booking.id ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-foreground font-medium">{booking.customerName || 'Customer'}</p>
                        <p className="text-sm text-foreground/60">{booking.eventType || 'Event'}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {getBookingStatusDisplay(booking.status)}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-foreground/60">
                      {booking.eventDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(booking.eventDate)}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        ₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <p className="text-xs text-foreground/40 mt-3">#{booking.orderNumber}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Booking Details */}
          <div className="lg:col-span-2">
            {selectedBooking ? (
              <Card className="border-border shadow-card">
                <CardHeader className="flex flex-row items-start justify-between border-b pb-4">
                  <div>
                    <CardTitle className="text-foreground text-xl">
                      {selectedBooking.customerName || 'Customer'}
                    </CardTitle>
                    <p className="text-foreground/60 mt-1">#{selectedBooking.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {getBookingStatusDisplay(selectedBooking.status)}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(null)} className="text-foreground/60">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 pt-6">
                  {/* Listing Info */}
                  {selectedBooking.listingName && (
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {selectedBooking.listingImage && (
                            <div className="w-20 h-20 rounded-lg bg-muted/50 border border-border/50 overflow-hidden flex-shrink-0">
                              <img 
                                src={selectedBooking.listingImage} 
                                alt={selectedBooking.listingName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="h-4 w-4 text-foreground/60" />
                              <h3 className="text-base font-semibold text-foreground">{selectedBooking.listingName}</h3>
                            </div>
                            {selectedBooking.listingId && (
                              <p className="text-xs text-foreground/50">Listing ID: {selectedBooking.listingId}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Upcoming Bookings Lifecycle */}
                  {activeTab === 'upcoming' && (
                    <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                      <CardContent className="p-5">
                        <h3 className="text-sm font-semibold text-foreground/80 mb-4 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Booking Progress
                        </h3>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                          {buildUpcomingLifecycle(selectedBooking).map((step, index) => {
                            const Icon = step.icon;
                            const isLast = index === buildUpcomingLifecycle(selectedBooking).length - 1;
                            return (
                              <div key={index} className="flex items-center flex-shrink-0">
                                <div className="flex flex-col items-center min-w-[120px]">
                                  <div className={`p-3 rounded-full mb-2 ${
                                    step.completed ? 'bg-green-500/20' : 'bg-gray-500/20'
                                  }`}>
                                    <Icon className={`h-5 w-5 ${step.color}`} />
                                  </div>
                                  <p className="text-xs font-medium text-foreground/70 text-center mb-1">{step.label}</p>
                                  {step.value && (
                                    <p className="text-xs text-foreground/60 text-center">{step.value}</p>
                                  )}
                                </div>
                                {!isLast && (
                                  <ArrowRight className="h-4 w-4 text-foreground/30 mx-2 flex-shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBooking.eventDate && (
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-foreground/60 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">Event Date</span>
                          </div>
                          <p className="text-foreground font-medium">{formatDate(selectedBooking.eventDate)}</p>
                          {selectedBooking.eventTime && (
                            <p className="text-sm text-foreground/60 mt-1">{selectedBooking.eventTime}</p>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {selectedBooking.venueAddress && (
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-foreground/60 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-medium">Venue</span>
                          </div>
                          <p className="text-foreground font-medium">{selectedBooking.venueAddress}</p>
                        </CardContent>
                      </Card>
                    )}
                    {selectedBooking.guestCount && (
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-foreground/60 mb-2">
                            <User className="h-4 w-4" />
                            <span className="text-sm font-medium">Guests</span>
                          </div>
                          <p className="text-foreground font-medium">{selectedBooking.guestCount} people</p>
                        </CardContent>
                      </Card>
                    )}
                    {selectedBooking.customerEmail && (
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-foreground/60 mb-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm font-medium">Contact</span>
                          </div>
                          <p className="text-foreground font-medium text-sm break-all">{selectedBooking.customerEmail}</p>
                          {selectedBooking.customerPhone && (
                            <p className="text-foreground font-medium text-sm mt-1">{selectedBooking.customerPhone}</p>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <Card className="border-border/50 bg-secondary/5">
                    <CardContent className="p-5">
                      <h3 className="text-base font-semibold text-foreground mb-4">Payment Details</h3>
                      <div className="space-y-2 text-sm">
                        {selectedBooking.baseAmount !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Base Amount</span>
                            <span className="text-foreground font-medium">₹{Number(selectedBooking.baseAmount).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedBooking.addOnsAmount && selectedBooking.addOnsAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Add-ons</span>
                            <span className="text-foreground font-medium">₹{Number(selectedBooking.addOnsAmount).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedBooking.discountAmount && selectedBooking.discountAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Discount</span>
                            <span className="text-green-400 font-medium">-₹{Number(selectedBooking.discountAmount).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-border pt-2 mt-2">
                          <span className="text-foreground font-semibold">Total Amount</span>
                          <span className="text-foreground font-bold text-lg">₹{Number(selectedBooking.totalAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        {selectedBooking.tokenPaid && selectedBooking.tokenPaid > 0 && (
                          <>
                            <div className="flex justify-between pt-2">
                              <span className="text-foreground/60">Token Paid</span>
                              <span className="text-green-400 font-medium">₹{Number(selectedBooking.tokenPaid).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                              <span className="text-foreground font-semibold">Balance Due</span>
                              <span className="text-foreground font-bold">
                                ₹{(Number(selectedBooking.totalAmount || 0) - Number(selectedBooking.tokenPaid || 0)).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </>
                        )}
                        {selectedBooking.paymentStatus && (
                          <div className="flex justify-between pt-2">
                            <span className="text-foreground/60">Payment Status</span>
                            <Badge className={getPaymentStatusColor(selectedBooking.paymentStatus)}>
                              {getPaymentStatusDisplay(selectedBooking.paymentStatus)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Complete Event Button for Upcoming Bookings */}
                  {activeTab === 'upcoming' && 
                   (selectedBooking.status?.toUpperCase() === 'CONFIRMED' || selectedBooking.status?.toUpperCase() === 'IN_PROGRESS') && 
                   selectedBooking.eventDate && 
                   new Date(selectedBooking.eventDate) <= new Date() && (
                    <Card className="border-green-500/30 bg-green-500/5">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                              <Camera className="h-5 w-5 text-green-400" />
                              Complete Event
                            </h3>
                            <p className="text-sm text-foreground/70 mb-4">
                              Share photos and details from this event. This will help you get more bookings!
                            </p>
                          </div>
                          <Button
                            onClick={() => openCompleteModal(selectedBooking.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Complete Event
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button 
                      onClick={() => navigate('/vendor/chat')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" /> Message Client
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border shadow-card h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                  <p className="text-foreground/40">Select a booking to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Pagination for All Bookings */}
        {activeTab === 'all' && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-foreground/60">
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

        {/* Complete Event Modal */}
        <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground text-xl flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Complete Event
              </DialogTitle>
              <p className="text-sm text-foreground/60 mt-2">
                Add photos and details from this event. These will be shown in your portfolio to help you get more bookings!
              </p>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Event Photos *</Label>
                <p className="text-xs text-foreground/60 mb-3">
                  Upload photos from the event. These will be added to your portfolio.
                </p>
                <ImageUpload
                  images={eventImages}
                  onChange={setEventImages}
                  maxImages={20}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Event Description (Optional)</Label>
                <p className="text-xs text-foreground/60 mb-2">
                  Share details about this event. This helps potential customers understand your work better.
                </p>
                <Textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Describe the event, highlights, special moments..."
                  className="bg-muted/50 border-border text-foreground min-h-[120px]"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setEventImages([]);
                    setEventDescription('');
                    setCompletingBookingId(null);
                  }}
                  className="flex-1 border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteEvent}
                  disabled={eventImages.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {eventImages.length === 0 ? (
                    'Add Photos to Continue'
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete Event
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </VendorLayout>
  );
}
