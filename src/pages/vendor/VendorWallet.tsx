import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle,
  Download,
  Building,
  IndianRupee,
  AlertCircle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  date: string;
  bookingId?: string;
}

export default function VendorWallet() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  const walletBalance = 45000;
  const pendingPayouts = 28000;
  const totalEarnings = 325000;

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'credit',
      description: 'Token received - Sharma Wedding',
      amount: 15000,
      status: 'completed',
      date: 'Dec 1, 2024',
      bookingId: 'EVT-2024-001',
    },
    {
      id: '2',
      type: 'credit',
      description: 'Final payment - Mehta Corp Event',
      amount: 28000,
      status: 'pending',
      date: 'Dec 2, 2024',
      bookingId: 'EVT-2024-002',
    },
    {
      id: '3',
      type: 'debit',
      description: 'Payout to Bank - HDFC xxxx2345',
      amount: 35000,
      status: 'completed',
      date: 'Nov 28, 2024',
    },
    {
      id: '4',
      type: 'credit',
      description: 'Token received - Desai Birthday',
      amount: 2400,
      status: 'completed',
      date: 'Nov 25, 2024',
      bookingId: 'EVT-2024-003',
    },
    {
      id: '5',
      type: 'debit',
      description: 'Payout to Bank - HDFC xxxx2345',
      amount: 50000,
      status: 'completed',
      date: 'Nov 20, 2024',
    },
  ];

  const handleRequestPayout = () => {
    if (!payoutAmount || Number(payoutAmount) > walletBalance) {
      toast.error('Invalid payout amount');
      return;
    }
    toast.success(`Payout of ₹${Number(payoutAmount).toLocaleString()} initiated!`);
    setShowPayoutModal(false);
    setPayoutAmount('');
  };

  const handleExportCSV = () => {
    toast.success('Transaction history exported to CSV');
  };

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Wallet & Payouts</h1>
            <p className="text-white/60">Manage your earnings and withdrawals</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportCSV} className="border-white/20 text-white hover:bg-white/10">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
              <DialogTrigger asChild>
                <Button className="bg-vendor-gold text-vendor-dark">
                  <ArrowUpRight className="mr-2 h-4 w-4" /> Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-vendor-dark border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Request Payout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-white/60 text-sm">Available Balance</p>
                    <p className="text-3xl font-bold text-vendor-gold">₹{walletBalance.toLocaleString()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Payout Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">₹</span>
                      <Input 
                        type="number"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="pl-8 bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPayoutAmount(String(walletBalance))}
                        className="border-white/20 text-white text-xs"
                      >
                        Max
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPayoutAmount(String(Math.floor(walletBalance / 2)))}
                        className="border-white/20 text-white text-xs"
                      >
                        50%
                      </Button>
                    </div>
                  </div>

                  {payoutAmount && (
                    <div className="p-4 rounded-xl bg-white/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Payout Amount</span>
                        <span className="text-white">₹{Number(payoutAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Platform Fee (5%)</span>
                        <span className="text-red-400">-₹{(Number(payoutAmount) * 0.05).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">GST (18%)</span>
                        <span className="text-red-400">-₹{(Number(payoutAmount) * 0.05 * 0.18).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                        <span className="text-white">You'll Receive</span>
                        <span className="text-green-400">₹{(Number(payoutAmount) * 0.941).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-yellow-400 font-medium">Processing Time</p>
                        <p className="text-white/60">Standard payouts are processed within 2-3 business days. Instant payouts (T+0) incur an additional 1% fee.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPayoutModal(false)}
                      className="flex-1 border-white/20 text-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRequestPayout}
                      className="flex-1 bg-vendor-gold text-vendor-dark"
                    >
                      Request Payout
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-vendor-gold/20">
                  <Wallet className="h-6 w-6 text-vendor-gold" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-white/60 text-sm">Available Balance</p>
                <p className="text-3xl font-bold text-white">₹{walletBalance.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-yellow-500/20">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-white/60 text-sm">Pending Payouts</p>
                <p className="text-3xl font-bold text-white">₹{pendingPayouts.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <IndianRupee className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-white/60 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold text-white">₹{totalEarnings.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="bg-white/5 border border-white/10 mb-4">
                    <TabsTrigger value="all" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="credits" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
                      Credits
                    </TabsTrigger>
                    <TabsTrigger value="debits" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
                      Payouts
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            txn.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {txn.type === 'credit' ? (
                              <ArrowDownLeft className="h-5 w-5 text-green-400" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{txn.description}</p>
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <span>{txn.date}</span>
                              {txn.bookingId && (
                                <>
                                  <span>•</span>
                                  <span>{txn.bookingId}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${txn.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                            {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                          </p>
                          <Badge className={
                            txn.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }>
                            {txn.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Bank Details */}
          <div className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="h-5 w-5" /> Bank Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-white font-medium">HDFC Bank</p>
                  <p className="text-white/60">Account: xxxx xxxx 2345</p>
                  <p className="text-white/60">IFSC: HDFC0001234</p>
                </div>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Update Bank Details
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Tax Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-white">PAN Card</span>
                  <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-white">GST Certificate</span>
                  <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                </div>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Manage Documents
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
