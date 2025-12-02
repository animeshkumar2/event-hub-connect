import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  event: string;
  date: string;
  venue: string;
  guests: number;
  budget: string;
  message: string;
  status: 'new' | 'open' | 'quoted' | 'accepted' | 'declined';
  createdAt: string;
}

export default function VendorLeads() {
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const leads: Lead[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      email: 'priya@email.com',
      phone: '+91 98765 43210',
      event: 'Wedding Photography',
      date: 'Dec 15, 2024',
      venue: 'Taj Lands End, Mumbai',
      guests: 500,
      budget: '₹50,000 - ₹75,000',
      message: 'Looking for a photographer for my wedding. We need coverage for both day and night events.',
      status: 'new',
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      name: 'Rahul Mehta',
      email: 'rahul@company.com',
      phone: '+91 87654 32109',
      event: 'Corporate Event',
      date: 'Dec 20, 2024',
      venue: 'The Leela, Mumbai',
      guests: 200,
      budget: '₹30,000 - ₹50,000',
      message: 'Annual corporate event photography needed. Will include keynote sessions and networking dinner.',
      status: 'quoted',
      createdAt: '1 day ago',
    },
    {
      id: '3',
      name: 'Anita Desai',
      email: 'anita@email.com',
      phone: '+91 76543 21098',
      event: 'Birthday Party',
      date: 'Jan 5, 2025',
      venue: 'Private Residence, Juhu',
      guests: 50,
      budget: '₹15,000 - ₹25,000',
      message: 'Kids birthday party. Need candid shots and some family portraits.',
      status: 'open',
      createdAt: '3 days ago',
    },
  ];

  const filteredLeads = leads.filter(lead => 
    activeFilter === 'all' || lead.status === activeFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-500/20 text-green-400';
      case 'open': return 'bg-blue-500/20 text-blue-400';
      case 'quoted': return 'bg-yellow-500/20 text-yellow-400';
      case 'accepted': return 'bg-purple-500/20 text-purple-400';
      case 'declined': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleCreateQuote = () => {
    toast.success('Quote created and sent to customer!');
    setShowQuoteModal(false);
  };

  const handleDecline = (lead: Lead) => {
    toast.info('Lead declined');
    setSelectedLead(null);
  };

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leads & Quote Requests</h1>
            <p className="text-muted-foreground">{leads.length} total leads • {leads.filter(l => l.status === 'new').length} new</p>
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
              New ({leads.filter(l => l.status === 'new').length})
            </TabsTrigger>
            <TabsTrigger value="open" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Open
            </TabsTrigger>
            <TabsTrigger value="quoted" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Quoted
            </TabsTrigger>
            <TabsTrigger value="accepted" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Accepted
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
                        <span className="text-primary font-semibold">{lead.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{lead.name}</p>
                        <p className="text-sm text-foreground/60">{lead.event}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-foreground/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {lead.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      {lead.budget}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/40 mt-3">{lead.createdAt}</p>
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
                    <p className="text-foreground/60">{selectedLead.event}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)} className="text-foreground/60">
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2 text-foreground/60 mb-1">
                        <Calendar className="h-4 w-4" /> Event Date
                      </div>
                      <p className="text-foreground font-medium">{selectedLead.date}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2 text-foreground/60 mb-1">
                        <MapPin className="h-4 w-4" /> Venue
                      </div>
                      <p className="text-foreground font-medium">{selectedLead.venue}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2 text-foreground/60 mb-1">
                        <Users className="h-4 w-4" /> Guests
                      </div>
                      <p className="text-foreground font-medium">{selectedLead.guests} people</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2 text-foreground/60 mb-1">
                        <IndianRupee className="h-4 w-4" /> Budget
                      </div>
                      <p className="text-foreground font-medium">{selectedLead.budget}</p>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-foreground/60 text-sm mb-2">Message:</p>
                    <p className="text-foreground">{selectedLead.message}</p>
                  </div>

                  {/* Contact */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-foreground/60 text-sm mb-2">Contact:</p>
                    <p className="text-foreground">{selectedLead.email}</p>
                    <p className="text-foreground">{selectedLead.phone}</p>
                  </div>

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
                          {/* Quote Items */}
                          <div className="space-y-3">
                            <Label className="text-foreground">Line Items</Label>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input placeholder="Item description" className="flex-1 bg-muted/50 border-border text-foreground" defaultValue="Wedding Photography - Full Day" />
                                <Input placeholder="Price" className="w-32 bg-muted/50 border-border text-foreground" defaultValue="₹45,000" />
                              </div>
                              <div className="flex gap-2">
                                <Input placeholder="Item description" className="flex-1 bg-muted/50 border-border text-foreground" defaultValue="Pre-wedding Shoot" />
                                <Input placeholder="Price" className="w-32 bg-muted/50 border-border text-foreground" defaultValue="₹15,000" />
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-border text-foreground">
                              <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                          </div>

                          {/* Summary */}
                          <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                            <div className="flex justify-between text-foreground/60">
                              <span>Subtotal</span>
                              <span>₹60,000</span>
                            </div>
                            <div className="flex justify-between text-foreground/60">
                              <span>GST (18%)</span>
                              <span>₹10,800</span>
                            </div>
                            <div className="flex justify-between text-foreground font-bold text-lg border-t border-border pt-2">
                              <span>Total</span>
                              <span>₹70,800</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-foreground">Validity</Label>
                            <Input type="date" className="bg-muted/50 border-border text-foreground" />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-foreground">Notes</Label>
                            <Textarea 
                              placeholder="Add any additional terms or notes..."
                              className="bg-muted/50 border-border text-foreground"
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 border-border text-foreground hover:bg-muted">
                              <Download className="mr-2 h-4 w-4" /> Download PDF
                            </Button>
                            <Button onClick={handleCreateQuote} className="flex-1 bg-secondary text-secondary-foreground">
                              <Send className="mr-2 h-4 w-4" /> Send Quote
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
      </div>
    </VendorLayout>
  );
}
