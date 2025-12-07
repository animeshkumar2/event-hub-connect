import { useState, useEffect } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  FileText, 
  X, 
  Check,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Download,
  Send,
  Plus,
  Loader2,
  Trash2,
  Edit
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

interface Quote {
  id: string;
  amount: number;
  description?: string;
  isAccepted: boolean;
  createdAt: string;
}

interface QuoteItem {
  description: string;
  amount: string;
}

export default function VendorLeads() {
  const navigate = useNavigate();
  const { data: leadsData, loading, error, refetch } = useVendorLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([{ description: '', amount: '' }]);
  const [quoteDescription, setQuoteDescription] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [existingQuotes, setExistingQuotes] = useState<Quote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);

  const leads: Lead[] = leadsData || [];

  useEffect(() => {
    if (selectedLead) {
      loadQuotes(selectedLead.id);
    }
  }, [selectedLead]);

  const loadQuotes = async (leadId: string) => {
    setLoadingQuotes(true);
    try {
      const response = await vendorApi.getLeadQuotes(leadId);
      if (response.success) {
        setExistingQuotes(response.data || []);
      }
    } catch (err: any) {
      console.error('Error loading quotes:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (activeFilter === 'all') return true;
    return lead.status?.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'new': return 'bg-green-500/20 text-green-400';
      case 'open': return 'bg-blue-500/20 text-blue-400';
      case 'quoted': return 'bg-yellow-500/20 text-yellow-400';
      case 'accepted': return 'bg-purple-500/20 text-purple-400';
      case 'declined': return 'bg-red-500/20 text-red-400';
      case 'converted': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleCreateQuote = async () => {
    if (!selectedLead) return;

    if (!quoteAmount || Number(quoteAmount) <= 0) {
      toast.error('Please enter a valid quote amount');
      return;
    }

    setCreatingQuote(true);
    try {
      const quoteData = {
        amount: Number(quoteAmount),
        description: quoteDescription || `Quote for ${selectedLead.eventType || 'event'}`,
        itemType: 'PACKAGE', // Default to package
      };

      const response = await vendorApi.createQuote(selectedLead.id, quoteData);
      
      if (response.success) {
        toast.success('Quote created and sent to customer!');
        setShowQuoteModal(false);
        setQuoteAmount('');
        setQuoteDescription('');
        await loadQuotes(selectedLead.id);
        // Update lead status to QUOTED
        await handleUpdateStatus('QUOTED');
      } else {
        toast.error(response.message || 'Failed to create quote');
      }
    } catch (err: any) {
      console.error('Error creating quote:', err);
      toast.error(err.message || 'Failed to create quote');
    } finally {
      setCreatingQuote(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedLead) return;

    try {
      const response = await vendorApi.updateLeadStatus(selectedLead.id, status);
      if (response.success) {
        toast.success('Lead status updated');
        refetch();
        if (selectedLead) {
          setSelectedLead({ ...selectedLead, status });
        }
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDecline = async (lead: Lead) => {
    await handleUpdateStatus('DECLINED');
    setSelectedLead(null);
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
            <h1 className="text-2xl font-bold text-foreground">Leads & Quote Requests</h1>
            <p className="text-muted-foreground">
              {leads.length} total leads • {leads.filter(l => l.status?.toLowerCase() === 'new').length} new
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
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All ({leads.length})
            </TabsTrigger>
            <TabsTrigger value="new" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              New ({leads.filter(l => l.status?.toLowerCase() === 'new').length})
            </TabsTrigger>
            <TabsTrigger value="open" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Open ({leads.filter(l => l.status?.toLowerCase() === 'open').length})
            </TabsTrigger>
            <TabsTrigger value="quoted" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Quoted ({leads.filter(l => l.status?.toLowerCase() === 'quoted').length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Accepted ({leads.filter(l => l.status?.toLowerCase() === 'accepted').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredLeads.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/60">No leads found</p>
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
                    selectedLead?.id === lead.id ? 'border-primary' : ''
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
                        {lead.status || 'NEW'}
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
                <Card className="border-border shadow-card border-border">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground text-xl">{selectedLead.name}</CardTitle>
                      <p className="text-foreground/60">{selectedLead.eventType || 'Event Inquiry'}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)} className="text-foreground/60">
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLead.eventDate && (
                        <div className="p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-2 text-foreground/60 mb-1">
                            <Calendar className="h-4 w-4" /> Event Date
                          </div>
                          <p className="text-foreground font-medium">{formatDate(selectedLead.eventDate)}</p>
                        </div>
                      )}
                      {selectedLead.venueAddress && (
                        <div className="p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-2 text-foreground/60 mb-1">
                            <MapPin className="h-4 w-4" /> Venue
                          </div>
                          <p className="text-foreground font-medium">{selectedLead.venueAddress}</p>
                        </div>
                      )}
                      {selectedLead.guestCount && (
                        <div className="p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-2 text-foreground/60 mb-1">
                            <Users className="h-4 w-4" /> Guests
                          </div>
                          <p className="text-foreground font-medium">{selectedLead.guestCount} people</p>
                        </div>
                      )}
                      {selectedLead.budget && (
                        <div className="p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-2 text-foreground/60 mb-1">
                            <IndianRupee className="h-4 w-4" /> Budget
                          </div>
                          <p className="text-foreground font-medium">{selectedLead.budget}</p>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    {selectedLead.message && (
                      <div className="p-4 rounded-xl bg-muted/50">
                        <p className="text-foreground/60 text-sm mb-2">Message:</p>
                        <p className="text-foreground">{selectedLead.message}</p>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-foreground/60 text-sm mb-2">Contact:</p>
                      <p className="text-foreground">{selectedLead.email}</p>
                      {selectedLead.phone && <p className="text-foreground">{selectedLead.phone}</p>}
                    </div>

                    {/* Existing Quotes */}
                    {loadingQuotes ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : existingQuotes.length > 0 && (
                      <div className="p-4 rounded-xl bg-muted/50">
                        <p className="text-foreground/60 text-sm mb-3 font-medium">Existing Quotes:</p>
                        <div className="space-y-2">
                          {existingQuotes.map((quote) => (
                            <div key={quote.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                              <div>
                                <p className="text-foreground font-medium">₹{quote.amount?.toLocaleString()}</p>
                                {quote.description && (
                                  <p className="text-sm text-foreground/60">{quote.description}</p>
                                )}
                              </div>
                              <Badge className={quote.isAccepted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                                {quote.isAccepted ? 'Accepted' : 'Pending'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={() => navigate('/vendor/chat')}
                        className="bg-primary hover:bg-primary/80"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" /> Reply in Chat
                      </Button>
                      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
                        <DialogTrigger asChild>
                          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                            <FileText className="mr-2 h-4 w-4" /> Create Quote
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">Create Quote for {selectedLead.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label className="text-foreground">Quote Amount (₹) *</Label>
                              <Input 
                                type="number"
                                value={quoteAmount}
                                onChange={(e) => setQuoteAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="bg-muted/50 border-border text-foreground"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-foreground">Description</Label>
                              <Textarea 
                                value={quoteDescription}
                                onChange={(e) => setQuoteDescription(e.target.value)}
                                placeholder="Add quote description, terms, and conditions..."
                                className="bg-muted/50 border-border text-foreground min-h-[100px]"
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button 
                                variant="outline" 
                                onClick={() => setShowQuoteModal(false)}
                                className="flex-1 border-border text-foreground hover:bg-muted"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleCreateQuote} 
                                disabled={creatingQuote || !quoteAmount}
                                className="flex-1 bg-secondary text-secondary-foreground"
                              >
                                {creatingQuote ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                                  </>
                                ) : (
                                  <>
                                    <Send className="mr-2 h-4 w-4" /> Send Quote
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        onClick={() => handleDecline(selectedLead)}
                        variant="outline" 
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="mr-2 h-4 w-4" /> Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border shadow-card border-border h-full flex items-center justify-center">
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                    <p className="text-foreground/40">Select a lead to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
