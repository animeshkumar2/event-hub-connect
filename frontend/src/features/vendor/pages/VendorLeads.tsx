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
  Image as ImageIcon
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
  createdAt: string;
  vendor?: any;
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
  eventType?: string;
  eventDate?: string;
  guestCount?: number;
  message?: string;
}

export default function VendorLeads() {
  const navigate = useNavigate();
  const { data: leadsData, loading, error, refetch } = useVendorLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [processingOffer, setProcessingOffer] = useState<string | null>(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const leads: Lead[] = leadsData || [];

  useEffect(() => {
    if (selectedLead) {
      loadOffers(selectedLead.id);
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

  const getFinalStatusDisplay = (lead: Lead): string => {
    const statusUpper = lead.status?.toUpperCase() || '';
    switch (statusUpper) {
      case 'NEW': return 'User made offer';
      case 'OPEN': return 'Counter offer by vendor';
      case 'DECLINED': return 'Booking rejected';
      case 'WITHDRAWN': return 'Offer withdrawn';
      case 'CONVERTED': return 'Booking confirmed';
      default: return lead.status || 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase() || '';
    switch (statusUpper) {
      case 'NEW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'OPEN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'WITHDRAWN': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'DECLINED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'CONVERTED': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  if (error) {
    return (
      <VendorLayout>
        <div className="p-6">
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
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
            <h1 className="text-2xl font-bold text-foreground">Leads & Offers</h1>
            <p className="text-muted-foreground">
              {leads.length} total leads
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search leads..." className="pl-10 bg-background border-border text-foreground w-64" />
            </div>
            <Button variant="outline" className="border-border hover:bg-muted">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Closed ({closedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredLeads.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/60">No {activeFilter} leads found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leads List */}
            <div className="lg:col-span-1 space-y-4">
              {filteredLeads.map((lead) => (
                <Card 
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`border-border shadow-card cursor-pointer transition-all hover:shadow-elegant ${
                    selectedLead?.id === lead.id ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold">{lead.name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{lead.name}</p>
                          <p className="text-sm text-foreground/60">{lead.eventType || 'Event Inquiry'}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>
                        {getFinalStatusDisplay(lead)}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-foreground/60">
                      {lead.eventDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(lead.eventDate)}
                        </div>
                      )}
                      {lead.budget && (
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          {lead.budget}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-foreground/40 mt-3">{formatDateTime(lead.createdAt)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Lead Details */}
            <div className="lg:col-span-2">
              {selectedLead ? (
                <Card className="border-border shadow-card">
                  <CardHeader className="flex flex-row items-start justify-between border-b pb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold text-lg">{selectedLead.name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <CardTitle className="text-foreground text-xl">{selectedLead.name}</CardTitle>
                          <p className="text-foreground/60 text-sm">{selectedLead.eventType || 'Event Inquiry'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(selectedLead.status)}>
                        {getFinalStatusDisplay(selectedLead)}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)} className="text-foreground/60">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 pt-6">
                    {/* Contact & Event Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contact Information */}
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                            <Mail className="h-4 w-4" /> Contact Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-foreground/80">
                              <Mail className="h-3.5 w-3.5 text-foreground/50" />
                              <span className="break-all">{selectedLead.email}</span>
                            </div>
                            {selectedLead.phone && (
                              <div className="flex items-center gap-2 text-foreground/80">
                                <Phone className="h-3.5 w-3.5 text-foreground/50" />
                                <span>{selectedLead.phone}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Event Details */}
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Event Details
                          </h3>
                          <div className="space-y-2 text-sm">
                            {selectedLead.eventDate && (
                              <div className="flex items-center gap-2 text-foreground/80">
                                <Calendar className="h-3.5 w-3.5 text-foreground/50" />
                                <span>{formatDate(selectedLead.eventDate)}</span>
                              </div>
                            )}
                            {selectedLead.guestCount && (
                              <div className="flex items-center gap-2 text-foreground/80">
                                <Users className="h-3.5 w-3.5 text-foreground/50" />
                                <span>{selectedLead.guestCount} guests</span>
                              </div>
                            )}
                            {selectedLead.venueAddress && (
                              <div className="flex items-start gap-2 text-foreground/80">
                                <MapPin className="h-3.5 w-3.5 text-foreground/50 mt-0.5" />
                                <span className="flex-1">{selectedLead.venueAddress}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Message */}
                    {selectedLead.message && (
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-semibold text-foreground/80 mb-2">Message from Customer</h3>
                          <p className="text-sm text-foreground/70 leading-relaxed">{selectedLead.message}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Offers with Horizontal Lifecycle */}
                    {loadingOffers ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : offers.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">Offers</h3>
                        </div>
                        {offers.map((offer) => {
                          const lifecycle = buildOfferLifecycle(offer);
                          const discount = ((offer.originalPrice - offer.offeredPrice) / offer.originalPrice * 100).toFixed(0);
                          
                          return (
                            <Card key={offer.id} className="border-border">
                              <CardContent className="p-5">
                                {/* Listing Info */}
                                <div className="flex items-start gap-4 mb-5">
                                  <div className="w-20 h-20 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {offer.listingImage ? (
                                      <img 
                                        src={offer.listingImage} 
                                        alt={offer.listingName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="h-8 w-8 text-foreground/40" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="flex-1">
                                        <h4 className="text-base font-semibold text-foreground mb-1">{offer.listingName}</h4>
                                        <div className="flex items-center gap-3 text-sm">
                                          <span className="text-foreground/60">Original Price:</span>
                                          <span className="font-semibold text-foreground">
                                            <IndianRupee className="inline h-3.5 w-3.5" />
                                            {offer.originalPrice.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                      <Badge className={getOfferStatusColor(offer.status)}>
                                        {offer.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Horizontal Lifecycle */}
                                <div className="mb-5">
                                  <h4 className="text-sm font-semibold text-foreground/80 mb-3">Offer Negotiation Timeline</h4>
                                  <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                                    {lifecycle.map((step, index) => {
                                      const Icon = step.icon;
                                      const isLast = index === lifecycle.length - 1;
                                      return (
                                        <div key={index} className="flex items-center flex-shrink-0">
                                          <div className="flex flex-col items-center min-w-[100px]">
                                            <div className={`p-2.5 rounded-full mb-2 ${
                                              step.type === 'original' ? 'bg-gray-500/20' :
                                              step.type === 'user-offer' ? 'bg-green-500/20' :
                                              step.type === 'vendor-counter' ? 'bg-blue-500/20' :
                                              step.type === 'accepted' ? 'bg-green-500/20' :
                                              step.type === 'rejected' || step.type === 'withdrawn' ? 'bg-red-500/20' :
                                              'bg-yellow-500/20'
                                            }`}>
                                              <Icon className={`h-4 w-4 ${
                                                step.type === 'original' ? 'text-gray-400' :
                                                step.type === 'user-offer' ? 'text-green-400' :
                                                step.type === 'vendor-counter' ? 'text-blue-400' :
                                                step.type === 'accepted' ? 'text-green-400' :
                                                step.type === 'rejected' || step.type === 'withdrawn' ? 'text-red-400' :
                                                'text-yellow-400'
                                              }`} />
                                            </div>
                                            <p className="text-xs font-medium text-foreground/70 text-center mb-1">{step.label}</p>
                                            {step.price !== null && (
                                              <p className="text-sm font-semibold text-foreground text-center">
                                                <IndianRupee className="inline h-3 w-3" />
                                                {step.price.toLocaleString()}
                                              </p>
                                            )}
                                          </div>
                                          {!isLast && (
                                            <ArrowRight className="h-4 w-4 text-foreground/30 mx-1 flex-shrink-0" />
                                          )}
                                        </div>
                                      );
                                    })}
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

                                {/* Action Buttons - Only show for PENDING offers */}
                                {offer.status === 'PENDING' && (
                                  <div className="flex gap-2 pt-4 border-t">
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
                                          Accept Offer
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
                                      Make Counter Offer
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
                      <Card className="border-border/50">
                        <CardContent className="p-8 text-center">
                          <AlertCircle className="h-10 w-10 text-foreground/40 mx-auto mb-3" />
                          <p className="text-foreground/60 font-medium">No offers found for this lead</p>
                          <p className="text-sm text-foreground/50 mt-1">This lead doesn't have any offers yet</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2 border-t">
                      <Button 
                        onClick={() => navigate('/vendor/chat')}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" /> Reply in Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border shadow-card h-full flex items-center justify-center min-h-[400px]">
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                    <p className="text-foreground/40">Select a lead to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Counter Offer Modal */}
        <Dialog open={showCounterModal} onOpenChange={setShowCounterModal}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Make Counter Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {selectedOfferId && (() => {
                const offer = offers.find(o => o.id === selectedOfferId);
                if (!offer) return null;
                return (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
                    <p className="text-foreground/60">Original Price: ₹{offer.originalPrice.toLocaleString()}</p>
                    <p className="text-foreground/60">Customer Offered: ₹{offer.offeredPrice.toLocaleString()}</p>
                  </div>
                );
              })()}
              
              <div className="space-y-2">
                <Label className="text-foreground">Counter Price (₹) *</Label>
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
                    return <p className="text-sm text-red-400">Must be greater than ₹{offer.offeredPrice.toLocaleString()}</p>;
                  }
                  if (price && price >= offer.originalPrice) {
                    return <p className="text-sm text-red-400">Must be less than ₹{offer.originalPrice.toLocaleString()}</p>;
                  }
                  return null;
                })()}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Message (Optional)</Label>
                <Textarea 
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="Add a message to your counter offer..."
                  className="bg-muted/50 border-border text-foreground min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCounterModal(false);
                    setCounterPrice('');
                    setCounterMessage('');
                    setSelectedOfferId(null);
                  }}
                  className="flex-1 border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCounterOffer} 
                  disabled={processingOffer !== null || !counterPrice}
                  className="flex-1"
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
