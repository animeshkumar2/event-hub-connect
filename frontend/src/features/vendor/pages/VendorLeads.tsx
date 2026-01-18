import { useState, useEffect } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { InlineError } from '@/shared/components/InlineError';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  X, 
  CheckCircle2,
  HandCoins,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Loader2,
  XCircle,
  Package,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Image as ImageIcon,
  Building2,
  Receipt,
  History,
  FileText,
  Sparkles,
  User,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useVendorLeads } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  venueAddress?: string;
  guestCount?: number;
  budget?: string;
  message?: string;
  status: string;
  source?: string; // 'DIRECT_ORDER', 'CHAT', 'OFFER', 'INQUIRY'
  createdAt: string;
  updatedAt?: string;
  vendor?: any;
  order?: {
    id: string;
    orderNumber?: string;
    totalAmount: number;
    tokenAmount?: number;
    baseAmount: number;
    addOnsAmount: number;
    customizationsAmount: number;
    discountAmount: number;
    taxAmount: number;
    balanceAmount: number;
    paymentStatus: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
  listing?: {
    id: string;
    name: string;
    price: number;
    images?: string[];
  };
  tokenAmount?: number;
}

interface Offer {
  id: string;
  listingId: string;
  listingName: string;
  listingImage?: string;
  offeredPrice: number;
  originalPrice: number;
  counterPrice?: number;
  counterMessage?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  eventType?: string;
  eventDate?: string;
  guestCount?: number;
  message?: string;
}

export default function VendorLeads() {
  const navigate = useNavigate();
  const { data: leadsData, loading, error, refetch } = useVendorLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [processingOffer, setProcessingOffer] = useState<string | null>(null);
  const [processingLead, setProcessingLead] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const leads: Lead[] = leadsData || [];

  // Auto-select first lead when data loads or filter changes
  useEffect(() => {
    if (filteredLeads.length > 0 && !selectedLead) {
      setSelectedLead(filteredLeads[0]);
    }
  }, [leadsData]);

  // Auto-select first lead when filter changes
  useEffect(() => {
    if (filteredLeads.length > 0) {
      setSelectedLead(filteredLeads[0]);
    } else {
      setSelectedLead(null);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (selectedLead) {
      // Only load offers for non-DIRECT_ORDER leads
      if (selectedLead.source !== 'DIRECT_ORDER') {
        loadOffers(selectedLead.id);
      } else {
        setOffers([]); // Clear offers for DIRECT_ORDER leads
      }
    }
  }, [selectedLead]);

  const loadOffers = async (leadId: string) => {
    setLoadingOffers(true);
    try {
      const response = await vendorApi.getLeadOffers(leadId);
      if (response.success) {
        setOffers(response.data || []);
      }
    } catch (err: any) {
      console.error('Error loading offers:', err);
      toast.error('Failed to load offers');
    } finally {
      setLoadingOffers(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const status = lead.status?.toUpperCase() || '';
    if (activeFilter === 'pending') {
      return status === 'NEW' || status === 'OPEN';
    } else if (activeFilter === 'closed') {
      return status === 'WITHDRAWN' || status === 'DECLINED' || status === 'CONVERTED';
    }
    return true;
  });

  const pendingCount = leads.filter(l => {
    const status = l.status?.toUpperCase() || '';
    return status === 'NEW' || status === 'OPEN';
  }).length;

  const closedCount = leads.filter(l => {
    const status = l.status?.toUpperCase() || '';
    return status === 'WITHDRAWN' || status === 'DECLINED' || status === 'CONVERTED';
  }).length;

  // Get the current lifecycle status considering lead data and offers
  const getCurrentLifecycleStatus = (lead: Lead, offers: Offer[]): { label: string; color: string } => {
    const statusUpper = lead.status?.toUpperCase() || '';
    
    // Priority 1: Check if token payment received (booking confirmed)
    if (lead.tokenAmount && lead.tokenAmount > 0) {
      return { label: 'Booking confirmed', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
    
    // Priority 2: Check if lead is converted
    if (statusUpper === 'CONVERTED') {
      return { label: 'Booking confirmed', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
    
    // Priority 3: Check offer statuses
    if (offers.length > 0) {
      // Get the latest offer by date
      const sortedOffers = [...offers].sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      const latestOffer = sortedOffers[0];
      
      if (latestOffer) {
        const offerStatus = latestOffer.status?.toUpperCase();
        
        // If offer is accepted, check if waiting for payment
        if (offerStatus === 'ACCEPTED') {
          if (!lead.tokenAmount || lead.tokenAmount === 0) {
            return { label: 'Waiting for payment', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
          }
        }
        
        // If offer is countered by vendor
        if (offerStatus === 'COUNTERED') {
          return { label: 'Waiting for customer response', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
        }
        
        // If offer is pending (new offer from customer)
        if (offerStatus === 'PENDING') {
          return { label: 'New offer received', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
        }
        
        // If offer is rejected
        if (offerStatus === 'REJECTED') {
          return { label: 'Offer rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
        }
        
        // If offer is withdrawn
        if (offerStatus === 'WITHDRAWN') {
          return { label: 'Offer withdrawn', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
        }
      }
    }
    
    // Priority 4: Check if order exists (direct order) but awaiting payment
    if (lead.order && (!lead.tokenAmount || lead.tokenAmount === 0)) {
      return { label: 'Waiting for payment', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    
    // Priority 5: Fall back to lead status
    switch (statusUpper) {
      case 'NEW': return { label: 'New offer received', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'OPEN': return { label: 'Counter offer sent', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'DECLINED': return { label: 'Booking rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'WITHDRAWN': return { label: 'Offer withdrawn', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      default: return { label: lead.status || 'Unknown', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  const getOfferStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase() || '';
    switch (statusUpper) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'COUNTERED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ACCEPTED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'WITHDRAWN': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    setProcessingOffer(offerId);
    try {
      const response = await vendorApi.acceptOffer(offerId);
      if (response.success) {
        toast.success('Offer accepted! Order created successfully.');
        await loadOffers(selectedLead!.id);
        refetch();
      } else {
        toast.error(response.message || 'Failed to accept offer');
      }
    } catch (err: any) {
      console.error('Error accepting offer:', err);
      toast.error(err.message || 'Failed to accept offer');
    } finally {
      setProcessingOffer(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    setProcessingOffer(offerId);
    try {
      const response = await vendorApi.rejectOffer(offerId);
      if (response.success) {
        toast.success('Offer rejected');
        await loadOffers(selectedLead!.id);
        refetch();
      } else {
        toast.error(response.message || 'Failed to reject offer');
      }
    } catch (err: any) {
      console.error('Error rejecting offer:', err);
      toast.error(err.message || 'Failed to reject offer');
    } finally {
      setProcessingOffer(null);
    }
  };

  const handleCounterOffer = async () => {
    if (!selectedOfferId || !counterPrice) {
      toast.error('Please enter a counter price');
      return;
    }

    const offer = offers.find(o => o.id === selectedOfferId);
    if (!offer) return;

    const counterPriceNum = parseFloat(counterPrice);
    if (counterPriceNum <= offer.offeredPrice) {
      toast.error('Counter price must be greater than the offered price');
      return;
    }
    if (counterPriceNum >= offer.originalPrice) {
      toast.error('Counter price must be less than the original price');
      return;
    }

    setProcessingOffer(selectedOfferId);
    try {
      const response = await vendorApi.counterOffer(selectedOfferId, {
        counterPrice: counterPriceNum,
        counterMessage: counterMessage || undefined
      });
      if (response.success) {
        toast.success('Counter offer sent successfully');
        setShowCounterModal(false);
        setCounterPrice('');
        setCounterMessage('');
        setSelectedOfferId(null);
        await loadOffers(selectedLead!.id);
        refetch();
      } else {
        toast.error(response.message || 'Failed to send counter offer');
      }
    } catch (err: any) {
      console.error('Error sending counter offer:', err);
      toast.error(err.message || 'Failed to send counter offer');
    } finally {
      setProcessingOffer(null);
    }
  };

  const handleAcceptLead = async () => {
    if (!selectedLead) return;
    setProcessingLead(true);
    try {
      const response = await vendorApi.acceptLead(selectedLead.id);
      if (response.success) {
        toast.success('Lead accepted! Order confirmed successfully.');
        refetch();
      } else {
        toast.error(response.message || 'Failed to accept lead');
      }
    } catch (err: any) {
      console.error('Error accepting lead:', err);
      toast.error(err.message || 'Failed to accept lead');
    } finally {
      setProcessingLead(false);
    }
  };

  const handleRejectLead = async () => {
    if (!selectedLead) return;
    setProcessingLead(true);
    try {
      const response = await vendorApi.rejectLead(selectedLead.id, 'Vendor declined the order');
      if (response.success) {
        toast.success('Lead rejected');
        refetch();
      } else {
        toast.error(response.message || 'Failed to reject lead');
      }
    } catch (err: any) {
      console.error('Error rejecting lead:', err);
      toast.error(err.message || 'Failed to reject lead');
    } finally {
      setProcessingLead(false);
    }
  };

  const openCounterModal = (offerId: string, offer: Offer) => {
    setSelectedOfferId(offerId);
    setCounterPrice('');
    setCounterMessage('');
    setShowCounterModal(true);
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
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return format(date, 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTimeFull = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    } catch {
      return dateString;
    }
  };

  // Build comprehensive lead lifecycle timeline
  const buildLeadLifecycle = (lead: Lead, offers: Offer[] = []) => {
    const timelineItems: Array<{
      id: string;
      label: string;
      description?: string;
      date?: string;
      status: 'completed' | 'pending' | 'in_progress';
      icon: any;
    }> = [];

    // 1. Lead Created
    if (lead.createdAt) {
      const sourceText = lead.source === 'DIRECT_ORDER' 
        ? 'direct order' 
        : lead.source === 'OFFER' 
        ? 'offer' 
        : lead.source === 'CHAT'
        ? 'chat'
        : 'inquiry';
      timelineItems.push({
        id: 'lead-created',
        label: 'Lead Created',
        description: `Lead received from ${sourceText}`,
        date: lead.createdAt,
        status: 'completed',
        icon: FileText
      });
    }

    // 2. Direct Order Created (if applicable)
    if (lead.source === 'DIRECT_ORDER' && lead.order) {
      timelineItems.push({
        id: 'order-created',
        label: 'Order Created',
        description: `Order #${lead.order.orderNumber || 'N/A'} created`,
        date: lead.order.createdAt || lead.createdAt,
        status: 'completed',
        icon: Receipt
      });
    }

    // 3. Token Payment Received (if applicable)
    if (lead.tokenAmount && lead.tokenAmount > 0) {
      timelineItems.push({
        id: 'token-paid',
        label: 'Token Payment Received',
        description: `₹${lead.tokenAmount.toLocaleString('en-IN')} received (25% of total)`,
        date: lead.updatedAt || lead.createdAt,
        status: 'completed',
        icon: HandCoins
      });
    }

    // 4. Offer milestones (for non-DIRECT_ORDER leads) - Process in chronological order
    if (lead.source !== 'DIRECT_ORDER' && offers.length > 0) {
      // Sort offers by creation date
      const sortedOffers = [...offers].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });

      sortedOffers.forEach((offer, index) => {
        const discountFromCustomer = ((offer.originalPrice - offer.offeredPrice) / offer.originalPrice * 100).toFixed(0);
        
        // 1. Customer Made Offer (always first for this offer)
        if (offer.createdAt) {
          timelineItems.push({
            id: `offer-${offer.id}-1-created`,
            label: `Customer Made Offer`,
            description: `Offered ₹${offer.offeredPrice.toLocaleString('en-IN')} (${discountFromCustomer}% off original ₹${offer.originalPrice.toLocaleString('en-IN')})`,
            date: offer.createdAt,
            status: 'completed',
            icon: HandCoins
          });
        }

        // 2. Vendor Counter Offer - ONLY if vendor countered with a DIFFERENT price
        const hasRealCounter = offer.counterPrice && offer.counterPrice !== offer.offeredPrice;
        if (hasRealCounter) {
          const discountFromVendor = ((offer.originalPrice - offer.counterPrice!) / offer.originalPrice * 100).toFixed(0);
          timelineItems.push({
            id: `offer-${offer.id}-2-countered`,
            label: 'Vendor Counter Offer',
            description: `Countered with ₹${offer.counterPrice!.toLocaleString('en-IN')} (${discountFromVendor}% off original price)`,
            date: offer.updatedAt || offer.createdAt,
            status: offer.status === 'COUNTERED' ? 'in_progress' : 'completed',
            icon: ArrowRight
          });
        }

        // 3. Offer Accepted by Vendor
        if (offer.status === 'ACCEPTED') {
          const finalPrice = hasRealCounter ? offer.counterPrice! : offer.offeredPrice;
          const savings = offer.originalPrice - finalPrice;
          const acceptedWhat = hasRealCounter ? 'Customer accepted counter offer' : 'Vendor accepted customer\'s offer';
          timelineItems.push({
            id: `offer-${offer.id}-3-accepted`,
            label: 'Offer Accepted',
            description: `${acceptedWhat}. Final: ₹${finalPrice.toLocaleString('en-IN')} (Save ₹${savings.toLocaleString('en-IN')})`,
            date: offer.acceptedAt || offer.updatedAt || offer.createdAt,
            status: 'completed',
            icon: CheckCircle
          });
          
          // 4. Waiting for Token Payment (if applicable)
          const tokenPaid = lead.tokenAmount && lead.tokenAmount > 0;
          if (!tokenPaid && lead.status !== 'CONVERTED') {
            const tokenAmount = Math.round(finalPrice * 0.25);
            timelineItems.push({
              id: `offer-${offer.id}-4-awaiting`,
              label: 'Awaiting Token Payment',
              description: `Pay ₹${tokenAmount.toLocaleString('en-IN')} (25% token) to confirm booking`,
              date: offer.acceptedAt || offer.updatedAt,
              status: 'in_progress',
              icon: Clock
            });
          }
        }

        // Offer Rejected
        if (offer.status === 'REJECTED') {
          timelineItems.push({
            id: `offer-${offer.id}-3-rejected`,
            label: 'Offer Rejected',
            description: `Customer's offer of ₹${offer.offeredPrice.toLocaleString('en-IN')} was rejected`,
            date: offer.rejectedAt || offer.updatedAt || offer.createdAt,
            status: 'completed',
            icon: XCircle
          });
        }

        // Offer Withdrawn
        if (offer.status === 'WITHDRAWN') {
          timelineItems.push({
            id: `offer-${offer.id}-3-withdrawn`,
            label: 'Offer Withdrawn',
            description: `Customer withdrew offer of ₹${offer.offeredPrice.toLocaleString('en-IN')}`,
            date: offer.updatedAt || offer.createdAt,
            status: 'completed',
            icon: XCircle
          });
        }
      });
    }

    // 5. Lead Status Changes (check after processing offers to get correct order)
    const status = lead.status?.toUpperCase() || '';
    
    // Lead Opened - only if there's a counter offer but not yet accepted
    if (status === 'OPEN' && lead.source !== 'DIRECT_ORDER') {
      const hasCounterOffer = offers.some(o => o.status === 'COUNTERED' && o.counterPrice);
      if (hasCounterOffer) {
        // Find the latest counter offer date
        const counterOffers = offers.filter(o => o.status === 'COUNTERED' && o.counterPrice);
        const latestCounter = counterOffers.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        })[0];
        
        timelineItems.push({
          id: 'lead-opened',
          label: 'Lead Opened',
          description: 'Vendor responded with counter offer',
          date: latestCounter?.updatedAt || lead.updatedAt || lead.createdAt,
          status: 'completed',
          icon: CheckCircle2
        });
      }
    }

    // Lead Converted
    if (status === 'CONVERTED') {
      timelineItems.push({
        id: 'lead-converted',
        label: 'Lead Converted',
        description: 'Lead converted to booking',
        date: lead.updatedAt || lead.createdAt,
        status: 'completed',
        icon: CheckCircle
      });
    }

    // Lead Declined
    if (status === 'DECLINED') {
      timelineItems.push({
        id: 'lead-declined',
        label: 'Lead Declined',
        description: 'Vendor declined the lead',
        date: lead.updatedAt || lead.createdAt,
        status: 'completed',
        icon: XCircle
      });
    }

    // Lead Withdrawn
    if (status === 'WITHDRAWN') {
      timelineItems.push({
        id: 'lead-withdrawn',
        label: 'Lead Withdrawn',
        description: 'Customer withdrew the lead',
        date: lead.updatedAt || lead.createdAt,
        status: 'completed',
        icon: XCircle
      });
    }

    // 6. Order Accepted (if vendor accepted direct order)
    if (lead.source === 'DIRECT_ORDER' && lead.order) {
      if (lead.order.status === 'CONFIRMED' || lead.order.status === 'IN_PROGRESS') {
        timelineItems.push({
          id: 'order-accepted',
          label: 'Order Accepted',
          description: 'Vendor accepted the order',
          date: lead.order.updatedAt || lead.updatedAt || lead.createdAt,
          status: 'completed',
          icon: CheckCircle2
        });
      }
    }

    // Sort by date (chronological order) with proper ordering for same timestamps
    return timelineItems.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      // If dates are the same (or very close - within 1 second), use predefined order
      if (Math.abs(dateA - dateB) < 1000) {
        // Extract order number from ID (e.g., offer-xxx-1-created -> 1, offer-xxx-2-countered -> 2)
        const getItemOrder = (id: string): number => {
          // Check for numbered offer items first (offer-xxx-N-type)
          const offerMatch = id.match(/offer-[^-]+-(\d+)-/);
          if (offerMatch) {
            return 100 + parseInt(offerMatch[1]); // 101, 102, 103, 104 for offer items
          }
          
          // Predefined order for non-offer items
          const orderMap: Record<string, number> = {
            'lead-created': 1,
            'order-created': 2,
            'token-paid': 200,
            'lead-opened': 150,
            'lead-converted': 300,
            'lead-declined': 300,
            'lead-withdrawn': 300,
            'order-accepted': 250
          };
          
          for (const [key, order] of Object.entries(orderMap)) {
            if (id.includes(key)) return order;
          }
          return 999;
        };
        
        return getItemOrder(a.id) - getItemOrder(b.id);
      }
      return dateA - dateB;
    });
  };

  const buildOfferLifecycle = (offer: Offer) => {
    const lifecycle = [];
    
    lifecycle.push({
      label: 'Original Price',
      price: offer.originalPrice,
      type: 'original',
      icon: Package
    });
    
    lifecycle.push({
      label: 'User Offered',
      price: offer.offeredPrice,
      type: 'user-offer',
      icon: HandCoins
    });
    
    if (offer.counterPrice) {
      lifecycle.push({
        label: 'Vendor Countered',
        price: offer.counterPrice,
        type: 'vendor-counter',
        icon: ArrowRight
      });
    }
    
    if (offer.status === 'ACCEPTED') {
      lifecycle.push({
        label: 'Vendor Accepted',
        price: offer.counterPrice || offer.offeredPrice,
        type: 'accepted',
        icon: CheckCircle
      });
    } else if (offer.status === 'REJECTED') {
      lifecycle.push({
        label: 'Vendor Rejected',
        price: null,
        type: 'rejected',
        icon: XCircle
      });
    } else if (offer.status === 'WITHDRAWN') {
      lifecycle.push({
        label: 'User Withdrew',
        price: null,
        type: 'withdrawn',
        icon: XCircle
      });
    } else if (offer.status === 'COUNTERED') {
      lifecycle.push({
        label: 'Waiting for User',
        price: offer.counterPrice,
        type: 'waiting',
        icon: Clock
      });
    } else {
      lifecycle.push({
        label: 'Pending Response',
        price: offer.offeredPrice,
        type: 'pending',
        icon: Clock
      });
    }
    
    return lifecycle;
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <BrandedLoader fullScreen={false} message="Loading leads" />
        </div>
      </VendorLayout>
    );
  }

  if (error) {
    return (
      <VendorLayout>
        <InlineError
          title="Failed to load leads"
          message="We couldn't load your leads data. Please try again."
          error={error}
          onRetry={() => refetch()}
          showHomeButton={false}
        />
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Leads & Offers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your incoming leads and offers
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search leads..." 
                className="pl-10 bg-background border-border text-foreground w-full sm:w-56 h-9" 
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card 
            className={`border cursor-pointer transition-all ${activeFilter === 'pending' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/50'}`}
            onClick={() => setActiveFilter('pending')}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{pendingCount}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${activeFilter === 'pending' ? 'bg-primary/20' : 'bg-yellow-500/10'}`}>
                  <Clock className={`h-4 w-4 sm:h-5 sm:w-5 ${activeFilter === 'pending' ? 'text-primary' : 'text-yellow-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border cursor-pointer transition-all ${activeFilter === 'closed' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/50'}`}
            onClick={() => setActiveFilter('closed')}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Closed</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{closedCount}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${activeFilter === 'closed' ? 'bg-primary/20' : 'bg-green-500/10'}`}>
                  <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${activeFilter === 'closed' ? 'text-primary' : 'text-green-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {filteredLeads.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 sm:p-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No {activeFilter} leads</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {activeFilter === 'pending' 
                  ? "You don't have any pending leads at the moment. New leads will appear here."
                  : "No closed leads yet. Leads that are converted, declined, or withdrawn will appear here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Leads List - Left Panel */}
            <div className="lg:col-span-4 xl:col-span-4">
              <Card className="border-border">
                <CardHeader className="p-3 sm:p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">
                      {activeFilter === 'pending' ? 'Pending Leads' : 'Closed Leads'}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {filteredLeads.length}
                    </Badge>
                  </div>
                </CardHeader>
                <div className="max-h-[60vh] lg:max-h-[calc(100vh-380px)] overflow-y-auto">
                  {filteredLeads.map((lead, index) => (
                    <div
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead);
                        // Open mobile modal on small screens
                        if (window.innerWidth < 1024) {
                          setShowMobileModal(true);
                        }
                      }}
                      className={`p-3 sm:p-4 cursor-pointer transition-all border-b border-border/50 last:border-b-0 hover:bg-muted/50 ${
                        selectedLead?.id === lead.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold text-sm">{lead.name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                            <Badge className={`${getCurrentLifecycleStatus(lead, []).color} text-[10px] px-1.5 py-0.5 flex-shrink-0`}>
                              {getCurrentLifecycleStatus(lead, []).label.split(' ')[0]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-2">{lead.eventType || 'Event Inquiry'}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {lead.eventDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(lead.eventDate)}
                              </span>
                            )}
                            {lead.listing?.price && (
                              <span className="flex items-center gap-1 text-foreground/70">
                                <IndianRupee className="h-3 w-3" />
                                {lead.listing.price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Lead Details - Right Panel (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-8 xl:col-span-8">
              {selectedLead ? (
                <Card className="border-border">
                  {/* Detail Header */}
                  <CardHeader className="p-4 sm:p-5 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-lg">{selectedLead.name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-foreground">{selectedLead.name}</h2>
                          <p className="text-xs sm:text-sm text-muted-foreground">{selectedLead.eventType || 'Event Inquiry'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getCurrentLifecycleStatus(selectedLead, offers).color} text-xs`}>
                          {getCurrentLifecycleStatus(selectedLead, offers).label}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedLead(null)} 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 sm:p-5 space-y-4 sm:space-y-5 max-h-[50vh] lg:max-h-[calc(100vh-380px)] overflow-y-auto">
                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedLead.eventDate && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Event Date</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{formatDate(selectedLead.eventDate)}</p>
                        </div>
                      )}
                      {selectedLead.guestCount && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Guests</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{selectedLead.guestCount}</p>
                        </div>
                      )}
                      {selectedLead.budget && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <IndianRupee className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Budget</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{selectedLead.budget}</p>
                        </div>
                      )}
                      {selectedLead.listing?.price && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Package className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Listing Price</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">₹{selectedLead.listing.price.toLocaleString('en-IN')}</p>
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
                            {selectedLead.eventDate && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Event Date</p>
                                <p className="text-sm font-medium text-foreground">{formatDate(selectedLead.eventDate)}</p>
                              </div>
                            )}
                            {selectedLead.eventType && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Event Type</p>
                                <p className="text-sm font-medium text-foreground">{selectedLead.eventType}</p>
                              </div>
                            )}
                            {selectedLead.venueAddress && (
                              <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground mb-1">Venue Address</p>
                                <p className="text-sm font-medium text-foreground">{selectedLead.venueAddress}</p>
                              </div>
                            )}
                            {selectedLead.guestCount && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Guest Count</p>
                                <p className="text-sm font-medium text-foreground">{selectedLead.guestCount} people</p>
                              </div>
                            )}
                            {selectedLead.message && (
                              <div className="sm:col-span-2 pt-2 border-t border-border/50">
                                <p className="text-xs text-muted-foreground mb-1">Customer Message</p>
                                <p className="text-sm text-foreground/80">{selectedLead.message}</p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

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
                            {selectedLead.name && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Name</p>
                                <p className="text-sm font-medium text-foreground">{selectedLead.name}</p>
                              </div>
                            )}
                            {selectedLead.email && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Email</p>
                                <p className="text-sm font-medium text-foreground break-all">{selectedLead.email}</p>
                              </div>
                            )}
                            {selectedLead.phone && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                <p className="text-sm font-medium text-foreground">{selectedLead.phone}</p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Listing Details Section (for DIRECT_ORDER) */}
                      {selectedLead.source === 'DIRECT_ORDER' && selectedLead.listing && (
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
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted/50 border border-border/50 overflow-hidden flex-shrink-0">
                                {selectedLead.listing.images && selectedLead.listing.images.length > 0 ? (
                                  <img 
                                    src={selectedLead.listing.images[0]} 
                                    alt={selectedLead.listing.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-foreground mb-1 truncate">{selectedLead.listing.name}</h4>
                                <p className="text-lg font-bold text-foreground">
                                  ₹{(selectedLead.listing.price || selectedLead.order?.totalAmount || 0).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* Payment Details Section (for DIRECT_ORDER) */}
                      {selectedLead.source === 'DIRECT_ORDER' && selectedLead.order && (
                        <AccordionItem value="payment" className="border-border/50">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-orange-500/10">
                                <CreditCard className="h-5 w-5 text-orange-400" />
                              </div>
                              <div className="text-left">
                                <h3 className="text-base font-semibold text-foreground">Payment Details</h3>
                                <p className="text-xs text-foreground/60">Payment breakdown and earnings</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <div className="space-y-6">
                              {/* Order Value Breakdown */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground">Order Breakdown</h4>
                                <div className="space-y-2 text-sm">
                                  {selectedLead.order.baseAmount !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-foreground/60">Base Amount</span>
                                      <span className="text-foreground font-medium">
                                        <IndianRupee className="inline h-3.5 w-3.5" />
                                        {selectedLead.order.baseAmount?.toLocaleString() || '0'}
                                      </span>
                                    </div>
                                  )}
                                  {selectedLead.order.addOnsAmount > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-foreground/60">Add-ons</span>
                                      <span className="text-foreground font-medium">
                                        <IndianRupee className="inline h-3.5 w-3.5" />
                                        {selectedLead.order.addOnsAmount.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  {selectedLead.order.customizationsAmount > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-foreground/60">Customizations</span>
                                      <span className="text-foreground font-medium">
                                        <IndianRupee className="inline h-3.5 w-3.5" />
                                        {selectedLead.order.customizationsAmount.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  {selectedLead.order.discountAmount > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-foreground/60">Discount</span>
                                      <span className="text-green-400 font-medium">
                                        -<IndianRupee className="inline h-3.5 w-3.5" />
                                        {selectedLead.order.discountAmount.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  {selectedLead.order.taxAmount > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-foreground/60">Tax (GST)</span>
                                      <span className="text-foreground font-medium">
                                        <IndianRupee className="inline h-3.5 w-3.5" />
                                        {selectedLead.order.taxAmount.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                                    <span className="text-foreground font-semibold">Total Order Value</span>
                                    <span className="text-foreground font-bold text-lg">
                                      <IndianRupee className="inline h-4 w-4" />
                                      {selectedLead.order.totalAmount?.toLocaleString() || '0'}
                                    </span>
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
                                      <IndianRupee className="inline h-4 w-4" />
                                      {(selectedLead.tokenAmount || Math.round((selectedLead.order.totalAmount || 0) * 0.25)).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-green-400/70">25% of total</p>
                                  </div>
                                  <div className="bg-orange-500/20 rounded-lg p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <Clock className="h-4 w-4 text-orange-400" />
                                      <span className="text-xs font-medium text-orange-400">Balance Due</span>
                                    </div>
                                    <p className="text-lg font-bold text-orange-400">
                                      <IndianRupee className="inline h-4 w-4" />
                                      {((selectedLead.order.totalAmount || 0) - (selectedLead.tokenAmount || Math.round((selectedLead.order.totalAmount || 0) * 0.25))).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-orange-400/70">From customer</p>
                                  </div>
                                </div>
                                {selectedLead.order.paymentStatus && (
                                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                                    <span className="text-foreground/60 text-sm">Payment Status</span>
                                    <Badge className={selectedLead.order.paymentStatus === 'PARTIAL' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}>
                                      {selectedLead.order.paymentStatus}
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
                                    <span className="text-foreground font-medium">
                                      <IndianRupee className="inline h-3.5 w-3.5" />
                                      {selectedLead.order.totalAmount?.toLocaleString() || '0'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-foreground/60">Platform Fee (5%)</span>
                                    <span className="text-red-400 font-medium">
                                      -<IndianRupee className="inline h-3.5 w-3.5" />
                                      {Math.round((selectedLead.order.totalAmount || 0) * 0.05).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                                    <span className="text-foreground font-semibold">Net Payout</span>
                                    <span className="text-blue-400 font-bold text-lg">
                                      <IndianRupee className="inline h-4 w-4" />
                                      {Math.round((selectedLead.order.totalAmount || 0) * 0.95).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* Offers Section (for non-DIRECT_ORDER leads) */}
                      {selectedLead.source !== 'DIRECT_ORDER' && (
                        <AccordionItem value="offers" className="border-border/50">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-yellow-500/10">
                                <HandCoins className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div className="text-left">
                                <h3 className="text-base font-semibold text-foreground">Offers</h3>
                                <p className="text-xs text-foreground/60">
                                  {loadingOffers ? 'Loading...' : offers.length > 0 ? `${offers.length} offer${offers.length > 1 ? 's' : ''}` : 'No offers yet'}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                            {loadingOffers ? (
                              <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : offers.length > 0 ? (
                              <div className="space-y-4">
                                {offers.map((offer) => {
                                  // Determine final price based on status
                                  const finalPrice = offer.status === 'ACCEPTED' 
                                    ? (offer.counterPrice || offer.offeredPrice)
                                    : offer.status === 'COUNTERED' 
                                    ? offer.counterPrice 
                                    : offer.offeredPrice;
                                  const discount = offer.originalPrice - (finalPrice || offer.offeredPrice);
                                  const discountPercent = ((discount / offer.originalPrice) * 100).toFixed(1);
                                  
                                  return (
                                    <Card key={offer.id} className="border-border/50">
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-4 mb-4">
                                          <div className="w-16 h-16 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {offer.listingImage ? (
                                              <img 
                                                src={offer.listingImage} 
                                                alt={offer.listingName}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <Package className="h-6 w-6 text-foreground/40" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                              <h4 className="text-base font-semibold text-foreground">{offer.listingName}</h4>
                                              <Badge className={getOfferStatusColor(offer.status)}>
                                                {offer.status}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Price Negotiation Breakdown */}
                                        <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border/50">
                                          <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <IndianRupee className="h-4 w-4" />
                                            Price Negotiation
                                          </h5>
                                          <div className="space-y-3">
                                            {/* Original Price */}
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                <span className="text-sm text-foreground/60">Original Listing Price</span>
                                              </div>
                                              <span className="font-semibold text-foreground">
                                                ₹{offer.originalPrice.toLocaleString('en-IN')}
                                              </span>
                                            </div>
                                            
                                            {/* Customer's Offer */}
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                <span className="text-sm text-yellow-400">Customer's Offer</span>
                                              </div>
                                              <span className="font-semibold text-yellow-400">
                                                ₹{offer.offeredPrice.toLocaleString('en-IN')}
                                                <span className="text-xs text-foreground/40 ml-1">
                                                  (-{((offer.originalPrice - offer.offeredPrice) / offer.originalPrice * 100).toFixed(0)}%)
                                                </span>
                                              </span>
                                            </div>
                                            
                                            {/* Vendor's Counter (only if different from customer's offer) */}
                                            {offer.counterPrice && offer.counterPrice !== offer.offeredPrice && (
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                                  <span className="text-sm text-blue-400">Vendor's Counter Offer</span>
                                                </div>
                                                <span className="font-semibold text-blue-400">
                                                  ₹{offer.counterPrice.toLocaleString('en-IN')}
                                                  <span className="text-xs text-foreground/40 ml-1">
                                                    (-{((offer.originalPrice - offer.counterPrice) / offer.originalPrice * 100).toFixed(0)}%)
                                                  </span>
                                                </span>
                                              </div>
                                            )}
                                            
                                            {/* Final Accepted Price (if accepted) */}
                                            {offer.status === 'ACCEPTED' && (
                                              <>
                                                <Separator className="my-2" />
                                                <div className="flex items-center justify-between bg-green-500/10 rounded-lg p-2 -mx-2">
                                                  <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                                    <span className="text-sm font-semibold text-green-400">Final Accepted Price</span>
                                                  </div>
                                                  <span className="font-bold text-green-400">
                                                    ₹{((offer.counterPrice && offer.counterPrice !== offer.offeredPrice) ? offer.counterPrice : offer.offeredPrice).toLocaleString('en-IN')}
                                                    <span className="text-xs text-green-300/70 ml-1">
                                                      (Save ₹{(offer.originalPrice - ((offer.counterPrice && offer.counterPrice !== offer.offeredPrice) ? offer.counterPrice : offer.offeredPrice)).toLocaleString('en-IN')})
                                                    </span>
                                                  </span>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        {/* Messages */}
                                        {(offer.counterMessage || offer.message) && (
                                          <div className="space-y-2 mb-4">
                                            {offer.message && (
                                              <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                                <p className="text-xs font-medium text-foreground/60 mb-1">Customer Message:</p>
                                                <p className="text-sm text-foreground/80">{offer.message}</p>
                                              </div>
                                            )}
                                            {offer.counterMessage && (
                                              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                <p className="text-xs font-medium text-blue-400 mb-1">Your Counter Message:</p>
                                                <p className="text-sm text-foreground/80">{offer.counterMessage}</p>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Action Buttons */}
                                        {offer.status === 'PENDING' && (
                                          <div className="flex gap-2 pt-3 border-t">
                                            <Button
                                              size="sm"
                                              onClick={() => handleAcceptOffer(offer.id)}
                                              disabled={processingOffer === offer.id}
                                              className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                              {processingOffer === offer.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <>
                                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                                  Accept
                                                </>
                                              )}
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => openCounterModal(offer.id, offer)}
                                              disabled={processingOffer === offer.id}
                                              className="flex-1"
                                            >
                                              <HandCoins className="h-4 w-4 mr-2" />
                                              Counter
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleRejectOffer(offer.id)}
                                              disabled={processingOffer === offer.id}
                                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                            >
                                              {processingOffer === offer.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <XCircle className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-foreground/40 text-sm">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-foreground/20" />
                                <p>No offers found for this lead</p>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>

                    {/* Complete Lifecycle Timeline */}
                    <Card className="border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-700/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <History className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-foreground">Lead Lifecycle</CardTitle>
                        </div>
                        <p className="text-xs text-foreground/60 mt-1">Complete timeline of lead milestones</p>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          {selectedLead && buildLeadLifecycle(selectedLead, offers).map((item, index) => {
                            const timeline = buildLeadLifecycle(selectedLead, offers);
                            const Icon = item.icon;
                            const isLast = index === timeline.length - 1;
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
                                          {formatDateTimeFull(item.date)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {selectedLead && buildLeadLifecycle(selectedLead, offers).length === 0 && (
                            <div className="text-center py-8 text-foreground/40 text-sm">
                              No timeline events available
                            </div>
                          )}
                          
                          {!selectedLead && (
                            <div className="text-center py-8 text-foreground/40 text-sm">
                              Select a lead to view timeline
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons for DIRECT_ORDER */}
                    {selectedLead.source === 'DIRECT_ORDER' && selectedLead.status === 'NEW' && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                        <Button
                          onClick={handleAcceptLead}
                          disabled={processingLead}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {processingLead ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Accept Order
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleRejectLead}
                          disabled={processingLead}
                          className="flex-1 sm:flex-none border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          {processingLead ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Reject Order
                        </Button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                      <Button 
                        onClick={() => navigate('/vendor/chat')}
                        className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" /> Reply in Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border shadow-card h-full flex items-center justify-center min-h-[200px] lg:min-h-[400px]">
                  <div className="text-center py-8 sm:py-12 px-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-foreground mb-1">No lead selected</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Select a lead from the list to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Mobile Lead Detail Modal */}
        <Dialog open={showMobileModal} onOpenChange={setShowMobileModal}>
          <DialogContent className="lg:hidden bg-card border-border max-w-[95vw] max-h-[90vh] overflow-hidden p-0 gap-0">
            {selectedLead && (
              <>
                {/* Modal Header */}
                <DialogHeader className="p-4 border-b sticky top-0 bg-card z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">{selectedLead.name?.[0]?.toUpperCase() || '?'}</span>
                      </div>
                      <div>
                        <DialogTitle className="text-base font-semibold text-foreground">{selectedLead.name}</DialogTitle>
                        <p className="text-xs text-muted-foreground">{selectedLead.eventType || 'Event Inquiry'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getCurrentLifecycleStatus(selectedLead, offers).color} text-xs`}>
                        {getCurrentLifecycleStatus(selectedLead, offers).label.split(' ')[0]}
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
                    {selectedLead.eventDate && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Event Date</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{formatDate(selectedLead.eventDate)}</p>
                      </div>
                    )}
                    {selectedLead.guestCount && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Users className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Guests</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{selectedLead.guestCount}</p>
                      </div>
                    )}
                    {selectedLead.budget && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Budget</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{selectedLead.budget}</p>
                      </div>
                    )}
                    {selectedLead.listing?.price && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Package className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Listing Price</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">₹{selectedLead.listing.price.toLocaleString('en-IN')}</p>
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
                          {selectedLead.eventDate && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Event Date</p>
                              <p className="text-sm font-medium text-foreground">{formatDate(selectedLead.eventDate)}</p>
                            </div>
                          )}
                          {selectedLead.eventType && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Event Type</p>
                              <p className="text-sm font-medium text-foreground">{selectedLead.eventType}</p>
                            </div>
                          )}
                          {selectedLead.venueAddress && (
                            <div className="col-span-2">
                              <p className="text-xs text-muted-foreground mb-1">Venue</p>
                              <p className="text-sm font-medium text-foreground">{selectedLead.venueAddress}</p>
                            </div>
                          )}
                          {selectedLead.message && (
                            <div className="col-span-2 pt-2 border-t border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">Message</p>
                              <p className="text-sm text-foreground/80">{selectedLead.message}</p>
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
                          {selectedLead.name && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Name</p>
                              <p className="text-sm font-medium text-foreground">{selectedLead.name}</p>
                            </div>
                          )}
                          {selectedLead.email && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Email</p>
                              <p className="text-sm font-medium text-foreground break-all">{selectedLead.email}</p>
                            </div>
                          )}
                          {selectedLead.phone && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Phone</p>
                              <p className="text-sm font-medium text-foreground">{selectedLead.phone}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Offers Section (for non-DIRECT_ORDER leads) */}
                    {selectedLead.source !== 'DIRECT_ORDER' && offers.length > 0 && (
                      <AccordionItem value="offers" className="border border-border/50 rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-yellow-500/10">
                              <HandCoins className="h-4 w-4 text-yellow-500" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Offers ({offers.length})</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-3 pt-2">
                            {offers.map((offer) => (
                              <div key={offer.id} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-foreground truncate">{offer.listingName}</span>
                                  <Badge className={getOfferStatusColor(offer.status)} variant="outline">
                                    {offer.status}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Original</span>
                                    <span>₹{offer.originalPrice.toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-yellow-500">Offered</span>
                                    <span className="text-yellow-500">₹{offer.offeredPrice.toLocaleString('en-IN')}</span>
                                  </div>
                                  {offer.counterPrice && offer.counterPrice !== offer.offeredPrice && (
                                    <div className="flex justify-between">
                                      <span className="text-blue-500">Counter</span>
                                      <span className="text-blue-500">₹{offer.counterPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                  )}
                                </div>
                                {offer.status === 'PENDING' && (
                                  <div className="flex gap-2 mt-3 pt-2 border-t border-border/50">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAcceptOffer(offer.id)}
                                      disabled={processingOffer === offer.id}
                                      className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openCounterModal(offer.id, offer)}
                                      disabled={processingOffer === offer.id}
                                      className="flex-1 h-8 text-xs"
                                    >
                                      Counter
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectOffer(offer.id)}
                                      disabled={processingOffer === offer.id}
                                      className="h-8 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Lead Lifecycle */}
                    <AccordionItem value="lifecycle" className="border border-border/50 rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10">
                            <History className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Lead Lifecycle</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="relative pt-2">
                          {buildLeadLifecycle(selectedLead, offers).map((item, index) => {
                            const timeline = buildLeadLifecycle(selectedLead, offers);
                            const Icon = item.icon;
                            const isLast = index === timeline.length - 1;
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
                <div className="p-4 border-t bg-card sticky bottom-0 space-y-2">
                  {/* Action Buttons for DIRECT_ORDER */}
                  {selectedLead.source === 'DIRECT_ORDER' && selectedLead.status === 'NEW' && (
                    <div className="flex gap-2 mb-2">
                      <Button
                        onClick={handleAcceptLead}
                        disabled={processingLead}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processingLead ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRejectLead}
                        disabled={processingLead}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Button 
                    onClick={() => navigate('/vendor/chat')}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Reply in Chat
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Counter Offer Modal */}
        <Dialog open={showCounterModal} onOpenChange={setShowCounterModal}>
          <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground text-base sm:text-lg">Make Counter Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {selectedOfferId && (() => {
                const offer = offers.find(o => o.id === selectedOfferId);
                if (!offer) return null;
                return (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-xs sm:text-sm">
                    <p className="text-foreground/60">Original Price: ₹{offer.originalPrice.toLocaleString()}</p>
                    <p className="text-foreground/60">Customer Offered: ₹{offer.offeredPrice.toLocaleString()}</p>
                  </div>
                );
              })()}
              
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Counter Price (₹) *</Label>
                <Input 
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  placeholder="Enter counter price"
                  className="bg-muted/50 border-border text-foreground"
                />
                {selectedOfferId && (() => {
                  const offer = offers.find(o => o.id === selectedOfferId);
                  if (!offer) return null;
                  const price = parseFloat(counterPrice);
                  if (price && price <= offer.offeredPrice) {
                    return <p className="text-xs sm:text-sm text-red-400">Must be greater than ₹{offer.offeredPrice.toLocaleString()}</p>;
                  }
                  if (price && price >= offer.originalPrice) {
                    return <p className="text-xs sm:text-sm text-red-400">Must be less than ₹{offer.originalPrice.toLocaleString()}</p>;
                  }
                  return null;
                })()}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground text-sm">Message (Optional)</Label>
                <Textarea 
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="Add a message to your counter offer..."
                  className="bg-muted/50 border-border text-foreground min-h-[80px] sm:min-h-[100px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCounterModal(false);
                    setCounterPrice('');
                    setCounterMessage('');
                    setSelectedOfferId(null);
                  }}
                  className="flex-1 border-border text-foreground hover:bg-muted order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCounterOffer} 
                  disabled={processingOffer !== null || !counterPrice}
                  className="flex-1 order-1 sm:order-2"
                >
                  {processingOffer ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <HandCoins className="mr-2 h-4 w-4" /> Send Counter Offer
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
