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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import CompleteProfilePrompt from '@/shared/components/CompleteProfilePrompt';
import { useVendorProfile } from '@/shared/hooks/useVendorProfile';
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
  Sparkles,
  Mail,
  Building2,
  Receipt,
  History,
  Circle,
  CircleCheck,
  CircleX
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorBookings, useVendorUpcomingBookings, useVendorPastBookings, useBookingTimeline } from '@/shared/hooks/useApi';
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
  const { isComplete: profileComplete, isLoading: profileLoading } = useVendorProfile();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
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
  
  // Fetch timeline for selected booking
  const { data: timelineData } = useBookingTimeline(selectedBooking?.id || null);

  // Auto-select first booking when data loads or tab changes
  useEffect(() => {
    if (filteredBookings.length > 0) {
      setSelectedBooking(filteredBookings[0]);
    } else {
      setSelectedBooking(null);
    }
  }, [activeTab, allBookingsData, upcomingBookingsData, pastBookingsData]);

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

  // Check if a booking is upcoming (event date >= today and status is CONFIRMED or IN_PROGRESS)
  const isUpcomingBooking = (booking: Booking): boolean => {
    if (!booking.eventDate) return false;
    const eventDate = new Date(booking.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const status = booking.status?.toUpperCase() || '';
    const isUpcomingDate = eventDate >= today;
    const isBookingStatus = status === 'CONFIRMED' || status === 'IN_PROGRESS';
    
    return isUpcomingDate && isBookingStatus;
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    } catch {
      return dateString;
    }
  };

  // Build comprehensive lifecycle timeline
  const buildLifecycleTimeline = (booking: Booking, timeline: any[] = []) => {
    const timelineItems: Array<{
      id: string;
      label: string;
      description?: string;
      date?: string;
      status: 'completed' | 'pending' | 'in_progress';
      icon: any;
      sortOrder: number; // For proper ordering
    }> = [];

    const tokenIsPaid = booking.tokenPaid && booking.tokenPaid > 0;
    const isConfirmed = booking.status?.toUpperCase() === 'CONFIRMED' || 
                       booking.status?.toUpperCase() === 'IN_PROGRESS' || 
                       booking.status?.toUpperCase() === 'COMPLETED';

    // 1. Order Created (first event)
    if (booking.createdAt) {
      timelineItems.push({
        id: 'order-created',
        label: 'Order Created',
        description: `Order #${booking.orderNumber} was created`,
        date: booking.createdAt,
        status: 'completed',
        icon: FileText,
        sortOrder: 1
      });
    }

    // 2. Token Payment Received (after order creation)
    if (tokenIsPaid) {
      timelineItems.push({
        id: 'token-paid',
        label: 'Token Payment Received',
        description: `₹${booking.tokenPaid?.toLocaleString('en-IN')} received (25% of total)`,
        date: booking.updatedAt || booking.createdAt,
        status: 'completed',
        icon: CreditCard,
        sortOrder: 2
      });
    }

    // 3. Booking Confirmed (after payment)
    if (isConfirmed) {
      timelineItems.push({
        id: 'booking-confirmed',
        label: 'Booking Confirmed',
        description: 'Booking is confirmed and scheduled',
        date: booking.updatedAt || booking.createdAt,
        status: 'completed',
        icon: CheckCircle2,
        sortOrder: 3
      });
    }

    // 4. Event Scheduled (future date)
    if (booking.eventDate) {
      const isEventPast = new Date(booking.eventDate) < new Date();
      timelineItems.push({
        id: 'event-date',
        label: isEventPast ? 'Event Completed' : 'Event Scheduled',
        description: `Event date: ${formatDate(booking.eventDate)}${booking.eventTime ? ` at ${booking.eventTime}` : ''}`,
        date: booking.eventDate,
        status: isEventPast ? 'completed' : 'pending',
        icon: Calendar,
        sortOrder: isEventPast ? 5 : 4
      });
    }

    // 5. Order Completed (final status)
    if (booking.status?.toUpperCase() === 'COMPLETED') {
      timelineItems.push({
        id: 'order-completed',
        label: 'Order Completed',
        description: 'Event completed successfully',
        date: booking.updatedAt,
        status: 'completed',
        icon: CheckCircle,
        sortOrder: 6
      });
    }

    // Sort by sortOrder first, then by date for same sortOrder
    return timelineItems.sort((a, b) => {
      // Primary sort by sortOrder
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      // Secondary sort by date
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  // Show profile completion prompt if profile is not complete
  if (!profileLoading && !profileComplete) {
    return (
      <VendorLayout>
        <CompleteProfilePrompt 
          title="Complete Your Profile to View Bookings"
          description="You need to set up your vendor profile before you can view and manage bookings."
          featureName="bookings"
        />
      </VendorLayout>
    );
  }

  if (loading || profileLoading) {
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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Bookings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your confirmed bookings
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              className="pl-10 bg-background border-border text-foreground w-full sm:w-56 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card 
            className={`border cursor-pointer transition-all ${activeTab === 'all' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/50'}`}
            onClick={() => setActiveTab('all')}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">All</p>
                  <div className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                    {(upcomingBookingsLoading || pastBookingsLoading) ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      (upcomingBookingsData?.length || 0) + (pastBookingsData?.length || 0)
                    )}
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-full hidden sm:flex ${activeTab === 'all' ? 'bg-primary/20' : 'bg-muted/50'}`}>
                  <FileText className={`h-4 w-4 sm:h-5 sm:w-5 ${activeTab === 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border cursor-pointer transition-all ${activeTab === 'upcoming' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/50'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Upcoming</p>
                  <div className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                    {upcomingBookingsLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      upcomingBookingsData?.length || 0
                    )}
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-full hidden sm:flex ${activeTab === 'upcoming' ? 'bg-primary/20' : 'bg-blue-500/10'}`}>
                  <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${activeTab === 'upcoming' ? 'text-primary' : 'text-blue-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border cursor-pointer transition-all ${activeTab === 'past' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/50'}`}
            onClick={() => setActiveTab('past')}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Past</p>
                  <div className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                    {pastBookingsLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      pastBookingsData?.length || 0
                    )}
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-full hidden sm:flex ${activeTab === 'past' ? 'bg-primary/20' : 'bg-green-500/10'}`}>
                  <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${activeTab === 'past' ? 'text-primary' : 'text-green-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {filteredBookings.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 sm:p-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No bookings found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming bookings. New confirmed bookings will appear here."
                  : activeTab === 'past'
                  ? "No past bookings yet. Completed bookings will appear here."
                  : "No bookings found. Bookings will appear here once customers confirm their orders."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Bookings List - Full width on mobile, left panel on desktop */}
            <div className="lg:col-span-4 xl:col-span-4">
              <Card className="border-border">
                <CardHeader className="p-3 sm:p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">
                      {activeTab === 'all' ? 'All Bookings' : activeTab === 'upcoming' ? 'Upcoming' : 'Past Bookings'}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {filteredBookings.length}
                    </Badge>
                  </div>
                </CardHeader>
                <div className="max-h-[60vh] lg:max-h-[calc(100vh-420px)] overflow-y-auto">
                  {filteredBookings.map((booking: Booking) => (
                    <div
                      key={booking.id}
                      onClick={() => {
                        setSelectedBooking(booking);
                        // Open mobile modal on small screens
                        if (window.innerWidth < 1024) {
                          setShowMobileModal(true);
                        }
                      }}
                      className={`p-3 sm:p-4 cursor-pointer transition-all border-b border-border/50 last:border-b-0 hover:bg-muted/50 ${
                        selectedBooking?.id === booking.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold text-sm">{(booking.customerName || 'C')[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground truncate">{booking.customerName || 'Customer'}</p>
                            <Badge className={`${getStatusColor(booking.status)} text-[10px] px-1.5 py-0.5 flex-shrink-0`}>
                              {getBookingStatusDisplay(booking.status).split(' ')[0]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-2">{booking.eventType || 'Event'}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {booking.eventDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(booking.eventDate)}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-foreground/70">
                              <IndianRupee className="h-3 w-3" />
                              {Number(booking.totalAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Booking Details - Right Panel (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-8 xl:col-span-8">
              {selectedBooking ? (
                <Card className="border-border">
                  {/* Detail Header */}
                  <CardHeader className="p-4 sm:p-5 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-lg">{(selectedBooking.customerName || 'C')[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-foreground">{selectedBooking.customerName || 'Customer'}</h2>
                          <p className="text-xs sm:text-sm text-muted-foreground">#{selectedBooking.orderNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(selectedBooking.status)} text-xs`}>
                          {getBookingStatusDisplay(selectedBooking.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 sm:p-5 space-y-4 sm:space-y-5 max-h-[calc(100vh-420px)] overflow-y-auto">
                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedBooking.eventDate && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Event Date</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{formatDate(selectedBooking.eventDate)}</p>
                        </div>
                      )}
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Total</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">₹{Number(selectedBooking.totalAmount || 0).toLocaleString('en-IN')}</p>
                      </div>
                      {selectedBooking.tokenPaid && (
                        <div className="bg-green-500/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-600 mb-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Token Paid</span>
                          </div>
                          <p className="text-sm font-semibold text-green-600">₹{Number(selectedBooking.tokenPaid).toLocaleString('en-IN')}</p>
                        </div>
                      )}
                      {selectedBooking.guestCount && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <User className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Guests</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{selectedBooking.guestCount}</p>
                        </div>
                      )}
                    </div>

                    {/* Collapsible Sections */}
                    <Accordion type="multiple" defaultValue={['event']} className="w-full space-y-2">
                      {/* Event Details Section */}
                      <AccordionItem value="event" className="border border-border/50 rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-blue-500/10">
                              <Calendar className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Event Details</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {selectedBooking.eventDate && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Event Date</p>
                                <p className="text-sm font-medium text-foreground">{formatDate(selectedBooking.eventDate)}</p>
                                {selectedBooking.eventTime && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{selectedBooking.eventTime}</p>
                                )}
                              </div>
                            )}
                            {selectedBooking.eventType && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Event Type</p>
                                <p className="text-sm font-medium text-foreground">{selectedBooking.eventType}</p>
                              </div>
                            )}
                            {selectedBooking.venueAddress && (
                              <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground mb-1">Venue Address</p>
                                <p className="text-sm font-medium text-foreground">{selectedBooking.venueAddress}</p>
                              </div>
                            )}
                            {selectedBooking.notes && (
                              <div className="sm:col-span-2 pt-2 border-t border-border/50">
                                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm text-foreground/80">{selectedBooking.notes}</p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Listing Details Section */}
                      {selectedBooking.listingName && (
                        <AccordionItem value="listing" className="border border-border/50 rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-md bg-purple-500/10">
                                <Package className="h-4 w-4 text-purple-500" />
                              </div>
                              <span className="text-sm font-medium text-foreground">Listing Details</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="flex items-start gap-3 pt-2">
                              {selectedBooking.listingImage && (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted/50 border border-border/50 overflow-hidden flex-shrink-0">
                                  <img 
                                    src={selectedBooking.listingImage} 
                                    alt={selectedBooking.listingName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-foreground mb-1 truncate">{selectedBooking.listingName}</h4>
                                {selectedBooking.listingId && (
                                  <p className="text-xs text-muted-foreground font-mono">ID: {selectedBooking.listingId}</p>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* Customer Details Section */}
                      <AccordionItem value="customer" className="border border-border/50 rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-green-500/10">
                              <User className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Customer Details</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {selectedBooking.customerName && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Name</p>
                                <p className="text-sm font-medium text-foreground">{selectedBooking.customerName}</p>
                              </div>
                            )}
                            {selectedBooking.customerEmail && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Email</p>
                                <p className="text-sm font-medium text-foreground break-all">{selectedBooking.customerEmail}</p>
                              </div>
                            )}
                            {selectedBooking.customerPhone && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                <p className="text-sm font-medium text-foreground">{selectedBooking.customerPhone}</p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Payment Details Section */}
                      <AccordionItem value="payment" className="border border-border/50 rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-orange-500/10">
                              <CreditCard className="h-4 w-4 text-orange-500" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Payment Details</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-4 pt-2">
                            {/* Order Value Breakdown */}
                            <div className="space-y-2 text-sm">
                              {selectedBooking.baseAmount !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Base Amount</span>
                                  <span className="text-foreground font-medium">₹{Number(selectedBooking.baseAmount).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {selectedBooking.addOnsAmount && selectedBooking.addOnsAmount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Add-ons</span>
                                  <span className="text-foreground font-medium">₹{Number(selectedBooking.addOnsAmount).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {selectedBooking.customizationsAmount && selectedBooking.customizationsAmount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Customizations</span>
                                  <span className="text-foreground font-medium">₹{Number(selectedBooking.customizationsAmount).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {selectedBooking.discountAmount && selectedBooking.discountAmount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Discount</span>
                                  <span className="text-green-500 font-medium">-₹{Number(selectedBooking.discountAmount).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {selectedBooking.taxAmount && selectedBooking.taxAmount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Tax (GST)</span>
                                  <span className="text-foreground font-medium">₹{Number(selectedBooking.taxAmount).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              <div className="flex justify-between border-t border-border pt-2 mt-2">
                                <span className="text-foreground font-semibold">Total</span>
                                <span className="text-foreground font-bold">₹{Number(selectedBooking.totalAmount || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Breakdown */}
                          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-3 sm:p-4 border border-green-500/20">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Payment Status</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="bg-green-500/20 rounded-lg p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <span className="text-xs font-medium text-green-400">Token Received</span>
                                </div>
                                <p className="text-lg font-bold text-green-400">
                                  ₹{Number(selectedBooking.tokenPaid || Math.round((selectedBooking.totalAmount || 0) * 0.25)).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-green-400/70">25% of total</p>
                              </div>
                              <div className="bg-orange-500/20 rounded-lg p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Clock className="h-4 w-4 text-orange-400" />
                                  <span className="text-xs font-medium text-orange-400">Balance Due</span>
                                </div>
                                <p className="text-lg font-bold text-orange-400">
                                  ₹{Number((selectedBooking.totalAmount || 0) - (selectedBooking.tokenPaid || Math.round((selectedBooking.totalAmount || 0) * 0.25))).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-orange-400/70">From customer</p>
                              </div>
                            </div>
                            {selectedBooking.paymentStatus && (
                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                                <span className="text-foreground/60 text-sm">Payment Status</span>
                                <Badge className={getPaymentStatusColor(selectedBooking.paymentStatus)}>
                                  {getPaymentStatusDisplay(selectedBooking.paymentStatus)}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Earnings */}
                          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 sm:p-4 border border-blue-500/20">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Your Earnings</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-foreground/60">Gross Amount</span>
                                <span className="text-foreground font-medium">₹{Number(selectedBooking.totalAmount || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground/60">Platform Fee (5%)</span>
                                <span className="text-red-400 font-medium">-₹{Math.round((selectedBooking.totalAmount || 0) * 0.05).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between border-t border-border pt-2 mt-2">
                                <span className="text-foreground font-semibold">Net Payout</span>
                                <span className="text-blue-400 font-bold text-lg">₹{Math.round((selectedBooking.totalAmount || 0) * 0.95).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Complete Lifecycle Timeline */}
                    <Card className="border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-700/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <History className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-foreground">Order Lifecycle</CardTitle>
                        </div>
                        <p className="text-xs text-foreground/60 mt-1">Complete timeline of order milestones</p>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {buildLifecycleTimeline(selectedBooking, timelineData || []).map((item, index) => {
                          const Icon = item.icon;
                          const isLast = index === buildLifecycleTimeline(selectedBooking, timelineData || []).length - 1;
                          const isCompleted = item.status === 'completed';
                          const isPending = item.status === 'pending';
                          
                          return (
                            <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                              {/* Timeline Line */}
                              {!isLast && (
                                <div className="absolute left-5 top-10 w-0.5 h-full bg-border" />
                              )}
                              
                              {/* Icon */}
                              <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-green-500/20 border-2 border-green-500' 
                                  : isPending
                                  ? 'bg-gray-500/20 border-2 border-gray-500'
                                  : 'bg-yellow-500/20 border-2 border-yellow-500'
                              }`}>
                                <Icon className={`h-5 w-5 ${
                                  isCompleted 
                                    ? 'text-green-400' 
                                    : isPending
                                    ? 'text-gray-400'
                                    : 'text-yellow-400'
                                }`} />
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 pt-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className={`text-sm font-semibold ${
                                      isCompleted ? 'text-foreground' : 'text-foreground/70'
                                    }`}>
                                      {item.label}
                                    </h4>
                                    {item.description && (
                                      <p className="text-xs text-foreground/60 mt-1">{item.description}</p>
                                    )}
                                  </div>
                                  {item.date && (
                                    <div className="text-right">
                                      <p className="text-xs text-foreground/50 font-mono">
                                        {formatDateTime(item.date)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {buildLifecycleTimeline(selectedBooking, timelineData || []).length === 0 && (
                          <div className="text-center py-8 text-foreground/40 text-sm">
                            No timeline events available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Complete Event Button for Upcoming Bookings */}
                  {isUpcomingBooking(selectedBooking) && 
                   selectedBooking.eventDate && 
                   new Date(selectedBooking.eventDate) <= new Date() && (
                    <Card className="border-green-500/30 bg-green-500/5">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                              <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                              Complete Event
                            </h3>
                            <p className="text-xs sm:text-sm text-foreground/70">
                              Share photos and details from this event. This will help you get more bookings!
                            </p>
                          </div>
                          <Button
                            onClick={() => openCompleteModal(selectedBooking.id)}
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Complete Event
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
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
                <Card className="border-border h-full flex items-center justify-center min-h-[400px]">
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-base font-medium text-foreground mb-1">No booking selected</h3>
                    <p className="text-sm text-muted-foreground">Select a booking from the list to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Mobile Booking Detail Modal */}
        <Dialog open={showMobileModal} onOpenChange={setShowMobileModal}>
          <DialogContent className="lg:hidden bg-card border-border max-w-[95vw] max-h-[90vh] overflow-hidden p-0 gap-0">
            {selectedBooking && (
              <>
                {/* Modal Header */}
                <DialogHeader className="p-4 border-b sticky top-0 bg-card z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">{(selectedBooking.customerName || 'C')[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <DialogTitle className="text-base font-semibold text-foreground">{selectedBooking.customerName || 'Customer'}</DialogTitle>
                        <p className="text-xs text-muted-foreground">#{selectedBooking.orderNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(selectedBooking.status)} text-xs`}>
                        {getBookingStatusDisplay(selectedBooking.status)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowMobileModal(false)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>

                {/* Modal Content */}
                <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBooking.eventDate && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Event Date</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{formatDate(selectedBooking.eventDate)}</p>
                      </div>
                    )}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Total</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">₹{Number(selectedBooking.totalAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                    {selectedBooking.tokenPaid && (
                      <div className="bg-green-500/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Token Paid</span>
                        </div>
                        <p className="text-sm font-semibold text-green-600">₹{Number(selectedBooking.tokenPaid).toLocaleString('en-IN')}</p>
                      </div>
                    )}
                    {selectedBooking.guestCount && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <User className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Guests</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{selectedBooking.guestCount}</p>
                      </div>
                    )}
                  </div>

                  {/* Accordion Sections */}
                  <Accordion type="multiple" defaultValue={['event']} className="w-full space-y-2">
                    {/* Event Details */}
                    <AccordionItem value="event" className="border border-border/50 rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-blue-500/10">
                            <Calendar className="h-4 w-4 text-blue-500" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Event Details</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          {selectedBooking.eventDate && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Event Date</p>
                              <p className="text-sm font-medium text-foreground">{formatDate(selectedBooking.eventDate)}</p>
                            </div>
                          )}
                          {selectedBooking.eventType && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Event Type</p>
                              <p className="text-sm font-medium text-foreground">{selectedBooking.eventType}</p>
                            </div>
                          )}
                          {selectedBooking.venueAddress && (
                            <div className="col-span-2">
                              <p className="text-xs text-muted-foreground mb-1">Venue</p>
                              <p className="text-sm font-medium text-foreground">{selectedBooking.venueAddress}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Customer Details */}
                    <AccordionItem value="customer" className="border border-border/50 rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-green-500/10">
                            <User className="h-4 w-4 text-green-500" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Customer Details</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="grid grid-cols-1 gap-3 pt-2">
                          {selectedBooking.customerName && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Name</p>
                              <p className="text-sm font-medium text-foreground">{selectedBooking.customerName}</p>
                            </div>
                          )}
                          {selectedBooking.customerEmail && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Email</p>
                              <p className="text-sm font-medium text-foreground break-all">{selectedBooking.customerEmail}</p>
                            </div>
                          )}
                          {selectedBooking.customerPhone && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Phone</p>
                              <p className="text-sm font-medium text-foreground">{selectedBooking.customerPhone}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Payment Details */}
                    <AccordionItem value="payment" className="border border-border/50 rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-orange-500/10">
                            <CreditCard className="h-4 w-4 text-orange-500" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Payment Details</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Amount</span>
                            <span className="font-medium">₹{Number(selectedBooking.totalAmount || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Token Paid</span>
                            <span className="font-medium text-green-500">₹{Number(selectedBooking.tokenPaid || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-sm border-t pt-2">
                            <span className="font-medium">Balance Due</span>
                            <span className="font-bold text-orange-500">₹{Number((selectedBooking.totalAmount || 0) - (selectedBooking.tokenPaid || 0)).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Order Lifecycle */}
                    <AccordionItem value="lifecycle" className="border border-border/50 rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10">
                            <History className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Order Lifecycle</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="relative pt-2">
                          {buildLifecycleTimeline(selectedBooking, timelineData || []).map((item, index) => {
                            const Icon = item.icon;
                            const isLast = index === buildLifecycleTimeline(selectedBooking, timelineData || []).length - 1;
                            const isCompleted = item.status === 'completed';
                            const isPending = item.status === 'pending';
                            
                            return (
                              <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                                {!isLast && (
                                  <div className="absolute left-4 top-8 w-0.5 h-full bg-border" />
                                )}
                                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted 
                                    ? 'bg-green-500/20 border-2 border-green-500' 
                                    : isPending
                                    ? 'bg-gray-500/20 border-2 border-gray-500'
                                    : 'bg-yellow-500/20 border-2 border-yellow-500'
                                }`}>
                                  <Icon className={`h-4 w-4 ${
                                    isCompleted ? 'text-green-400' : isPending ? 'text-gray-400' : 'text-yellow-400'
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <h4 className={`text-xs font-semibold ${isCompleted ? 'text-foreground' : 'text-foreground/70'}`}>
                                    {item.label}
                                  </h4>
                                  {item.description && (
                                    <p className="text-xs text-foreground/60 mt-0.5 line-clamp-2">{item.description}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t bg-card sticky bottom-0">
                  <Button 
                    onClick={() => navigate('/vendor/chat')}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Message Client
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Pagination for All Bookings */}
        {activeTab === 'all' && totalPages > 1 && (
          <div className="flex items-center justify-start gap-1 sm:gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180 mr-1" />
              Prev
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 p-0 text-xs sm:text-sm ${page === pageNum ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              Next
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            </Button>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
              of {totalPages} pages
            </span>
          </div>
        )}

        {/* Complete Event Modal */}
        <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
          <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground text-lg sm:text-xl flex items-center gap-2">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                Complete Event
              </DialogTitle>
              <p className="text-xs sm:text-sm text-foreground/60 mt-2">
                Add photos and details from this event. These will be shown in your portfolio to help you get more bookings!
              </p>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-foreground font-semibold text-sm sm:text-base">Event Photos *</Label>
                <p className="text-xs text-foreground/60 mb-2 sm:mb-3">
                  Upload photos from the event. These will be added to your portfolio.
                </p>
                <ImageUpload
                  images={eventImages}
                  onChange={setEventImages}
                  maxImages={20}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-semibold text-sm sm:text-base">Event Description (Optional)</Label>
                <p className="text-xs text-foreground/60 mb-2">
                  Share details about this event. This helps potential customers understand your work better.
                </p>
                <Textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Describe the event, highlights, special moments..."
                  className="bg-muted/50 border-border text-foreground min-h-[100px] sm:min-h-[120px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setEventImages([]);
                    setEventDescription('');
                    setCompletingBookingId(null);
                  }}
                  className="flex-1 border-border text-foreground hover:bg-muted order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteEvent}
                  disabled={eventImages.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 order-1 sm:order-2"
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
