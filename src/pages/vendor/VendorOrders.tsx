import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  bookingId: string;
  client: string;
  phone: string;
  event: string;
  date: string;
  venue: string;
  package: string;
  amount: number;
  tokenPaid: number;
  status: 'confirmed' | 'in-progress' | 'completed' | 'disputed';
  timeline: { stage: string; date: string; completed: boolean }[];
}

export default function VendorOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const orders: Order[] = [
    {
      id: '1',
      bookingId: 'EVT-2024-001',
      client: 'Sharma Family',
      phone: '+91 98765 43210',
      event: 'Wedding',
      date: 'Dec 15, 2024',
      venue: 'Taj Lands End, Mumbai',
      package: 'Wedding Photography - Full Day',
      amount: 75000,
      tokenPaid: 15000,
      status: 'confirmed',
      timeline: [
        { stage: 'Lead Received', date: 'Nov 20', completed: true },
        { stage: 'Token Paid', date: 'Nov 25', completed: true },
        { stage: 'Booking Confirmed', date: 'Nov 25', completed: true },
        { stage: 'Event Day', date: 'Dec 15', completed: false },
        { stage: 'Delivery Complete', date: '-', completed: false },
        { stage: 'Payment Released', date: '-', completed: false },
      ],
    },
    {
      id: '2',
      bookingId: 'EVT-2024-002',
      client: 'Mehta Corp',
      phone: '+91 87654 32109',
      event: 'Corporate Event',
      date: 'Dec 10, 2024',
      venue: 'The Leela, Mumbai',
      package: 'Corporate Event Photography',
      amount: 35000,
      tokenPaid: 7000,
      status: 'in-progress',
      timeline: [
        { stage: 'Lead Received', date: 'Nov 15', completed: true },
        { stage: 'Token Paid', date: 'Nov 18', completed: true },
        { stage: 'Booking Confirmed', date: 'Nov 18', completed: true },
        { stage: 'Event Day', date: 'Dec 10', completed: true },
        { stage: 'Delivery Complete', date: '-', completed: false },
        { stage: 'Payment Released', date: '-', completed: false },
      ],
    },
    {
      id: '3',
      bookingId: 'EVT-2024-003',
      client: 'Desai Family',
      phone: '+91 76543 21098',
      event: 'Birthday Party',
      date: 'Dec 1, 2024',
      venue: 'Private Residence',
      package: 'Birthday Party Coverage',
      amount: 12000,
      tokenPaid: 2400,
      status: 'completed',
      timeline: [
        { stage: 'Lead Received', date: 'Nov 10', completed: true },
        { stage: 'Token Paid', date: 'Nov 12', completed: true },
        { stage: 'Booking Confirmed', date: 'Nov 12', completed: true },
        { stage: 'Event Day', date: 'Dec 1', completed: true },
        { stage: 'Delivery Complete', date: 'Dec 5', completed: true },
        { stage: 'Payment Released', date: 'Dec 7', completed: true },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'disputed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleMarkComplete = () => {
    toast.success('Event marked as complete. Delivery pending.');
  };

  const handleRequestPayout = () => {
    toast.success('Payout request submitted!');
  };

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Orders & Bookings</h1>
            <p className="text-white/60">{orders.length} total orders</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input placeholder="Search orders..." className="pl-10 bg-white/5 border-white/10 text-white w-64" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="all" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
              All Orders
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1 space-y-4">
            {orders.map((order) => (
              <Card 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`glass-card border-white/10 cursor-pointer transition-all hover:border-white/20 ${
                  selectedOrder?.id === order.id ? 'border-vendor-gold' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{order.client}</p>
                      <p className="text-sm text-white/60">{order.event}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {order.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      ₹{order.amount.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mt-3">#{order.bookingId}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-xl">{selectedOrder.client}</CardTitle>
                      <p className="text-white/60">#{selectedOrder.bookingId}</p>
                    </div>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 text-white/60 mb-1">
                        <Calendar className="h-4 w-4" /> Event Date
                      </div>
                      <p className="text-white font-medium">{selectedOrder.date}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 text-white/60 mb-1">
                        <MapPin className="h-4 w-4" /> Venue
                      </div>
                      <p className="text-white font-medium">{selectedOrder.venue}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 text-white/60 mb-1">
                        <User className="h-4 w-4" /> Package
                      </div>
                      <p className="text-white font-medium">{selectedOrder.package}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 text-white/60 mb-1">
                        <Phone className="h-4 w-4" /> Contact
                      </div>
                      <p className="text-white font-medium">{selectedOrder.phone}</p>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 rounded-xl bg-vendor-gold/10 border border-vendor-gold/20">
                    <h3 className="text-white font-semibold mb-3">Payment Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Total Amount</span>
                        <span className="text-white">₹{selectedOrder.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Token Paid</span>
                        <span className="text-green-400">₹{selectedOrder.tokenPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2">
                        <span className="text-white font-medium">Balance Due</span>
                        <span className="text-vendor-gold font-bold">₹{(selectedOrder.amount - selectedOrder.tokenPaid).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Booking Timeline</h3>
                    <div className="space-y-4">
                      {selectedOrder.timeline.map((stage, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            stage.completed ? 'bg-green-500/20' : 'bg-white/10'
                          }`}>
                            {stage.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <Clock className="h-4 w-4 text-white/40" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={stage.completed ? 'text-white' : 'text-white/40'}>{stage.stage}</p>
                            <p className="text-xs text-white/40">{stage.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contract & Documents */}
                  <div className="p-4 rounded-xl bg-white/5">
                    <h3 className="text-white font-semibold mb-3">Documents</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <FileText className="mr-2 h-4 w-4" /> View Contract
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Upload className="mr-2 h-4 w-4" /> Upload Deliverables
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                    <Button className="bg-vendor-purple hover:bg-vendor-purple/80">
                      <MessageSquare className="mr-2 h-4 w-4" /> Message Client
                    </Button>
                    {selectedOrder.status === 'in-progress' && (
                      <Button onClick={handleMarkComplete} className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
                      </Button>
                    )}
                    {selectedOrder.status === 'completed' && (
                      <Button onClick={handleRequestPayout} className="bg-vendor-gold text-vendor-dark">
                        <IndianRupee className="mr-2 h-4 w-4" /> Request Payout
                      </Button>
                    )}
                    <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                          <AlertTriangle className="mr-2 h-4 w-4" /> Raise Dispute
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-vendor-dark border-white/10">
                        <DialogHeader>
                          <DialogTitle className="text-white">Raise a Dispute</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <p className="text-white/60">Please describe the issue you're facing with this booking.</p>
                          <Textarea 
                            placeholder="Describe the issue..."
                            className="bg-white/5 border-white/10 text-white min-h-[120px]"
                          />
                          <div className="space-y-2">
                            <p className="text-sm text-white/60">Attach evidence (optional)</p>
                            <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center">
                              <Upload className="h-6 w-6 text-white/40 mx-auto" />
                              <p className="text-sm text-white/40 mt-2">Upload files</p>
                            </div>
                          </div>
                          <Button className="w-full bg-red-500 hover:bg-red-600 text-white" onClick={() => {
                            toast.info('Dispute submitted. Our team will review it.');
                            setShowDisputeModal(false);
                          }}>
                            Submit Dispute
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card border-white/10 h-full flex items-center justify-center">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">Select an order to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
