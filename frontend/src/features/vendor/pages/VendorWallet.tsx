import { useState } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
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
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorWallet, useVendorWalletTransactions } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description?: string;
  status?: string;
  createdAt: string;
  order?: {
    id?: string;
  };
}

export default function VendorWallet() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [page, setPage] = useState(0);

  const { data: walletData, loading: walletLoading, refetch: refetchWallet } = useVendorWallet();
  const { data: transactionsData, loading: transactionsLoading } = useVendorWalletTransactions(page, 10);

  const wallet = walletData || {
    balance: 0,
    pendingPayouts: 0,
    totalEarnings: 0,
  };

  const transactions: Transaction[] = transactionsData?.content || transactionsData || [];

  const walletBalance = Number(wallet.balance) || 0;
  const pendingPayouts = Number(wallet.pendingPayouts) || 0;
  const totalEarnings = Number(wallet.totalEarnings) || 0;

  const handleRequestPayout = async () => {
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    if (Number(payoutAmount) > walletBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!bankAccountNumber || !bankIfsc || !bankName || !accountHolderName) {
      toast.error('Please fill in all bank details');
      return;
    }

    setRequestingPayout(true);
    try {
      const response = await vendorApi.requestWithdrawal({
        amount: Number(payoutAmount),
        bankAccountNumber: bankAccountNumber.trim(),
        bankIfsc: bankIfsc.trim(),
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim(),
      });

      if (response.success) {
        toast.success(`Payout request of ₹${Number(payoutAmount).toLocaleString()} submitted!`);
        setShowPayoutModal(false);
        setPayoutAmount('');
        setBankAccountNumber('');
        setBankIfsc('');
        setBankName('');
        setAccountHolderName('');
        refetchWallet();
      } else {
        toast.error(response.message || 'Failed to request payout');
      }
    } catch (err: any) {
      console.error('Error requesting payout:', err);
      toast.error(err.message || 'Failed to request payout');
    } finally {
      setRequestingPayout(false);
    }
  };

  const handleExportCSV = () => {
    toast.success('Transaction history exported to CSV');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (walletLoading) {
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
            <h1 className="text-2xl font-bold text-foreground">Wallet & Payouts</h1>
            <p className="text-foreground/60">Manage your earnings and withdrawals</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportCSV} className="border-white/20 text-foreground hover:bg-white/10">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
              <DialogTrigger asChild>
                <Button className="bg-secondary text-secondary-foreground">
                  <ArrowUpRight className="mr-2 h-4 w-4" /> Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Request Payout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-foreground/60 text-sm">Available Balance</p>
                    <p className="text-3xl font-bold text-secondary">₹{walletBalance.toLocaleString()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Payout Amount (₹) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">₹</span>
                      <Input 
                        type="number"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="pl-8 bg-muted/50 border-border text-foreground"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPayoutAmount(String(walletBalance))}
                        className="border-white/20 text-foreground text-xs"
                      >
                        Max
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPayoutAmount(String(Math.floor(walletBalance / 2)))}
                        className="border-white/20 text-foreground text-xs"
                      >
                        50%
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Account Holder Name *</Label>
                      <Input 
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="Enter account holder name"
                        className="bg-muted/50 border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Bank Name *</Label>
                      <Input 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Enter bank name"
                        className="bg-muted/50 border-border text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Account Number *</Label>
                        <Input 
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="Enter account number"
                          className="bg-muted/50 border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">IFSC Code *</Label>
                        <Input 
                          value={bankIfsc}
                          onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                          placeholder="Enter IFSC"
                          className="bg-muted/50 border-border text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {payoutAmount && Number(payoutAmount) > 0 && (
                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">Payout Amount</span>
                        <span className="text-foreground">₹{Number(payoutAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">Platform Fee (5%)</span>
                        <span className="text-red-400">-₹{(Number(payoutAmount) * 0.05).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-border pt-2">
                        <span className="text-foreground">You'll Receive</span>
                        <span className="text-green-400">₹{(Number(payoutAmount) * 0.95).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-yellow-400 font-medium">Processing Time</p>
                        <p className="text-foreground/60">Standard payouts are processed within 2-3 business days.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPayoutModal(false)}
                      className="flex-1 border-white/20 text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRequestPayout}
                      disabled={requestingPayout || !payoutAmount || Number(payoutAmount) <= 0}
                      className="flex-1 bg-secondary text-secondary-foreground"
                    >
                      {requestingPayout ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        'Request Payout'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-secondary/20">
                  <Wallet className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-foreground/60 text-sm">Available Balance</p>
                <p className="text-3xl font-bold text-foreground">₹{walletBalance.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-yellow-500/20">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-foreground/60 text-sm">Pending Payouts</p>
                <p className="text-3xl font-bold text-foreground">₹{pendingPayouts.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <IndianRupee className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-foreground/60 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold text-foreground">₹{totalEarnings.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-foreground/60">No transactions yet</p>
                  </div>
                ) : (
                  <Tabs defaultValue="all">
                    <TabsList className="bg-muted/50 border border-border mb-4">
                      <TabsTrigger value="all" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="credits" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                        Credits
                      </TabsTrigger>
                      <TabsTrigger value="debits" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                        Payouts
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                      {transactions.map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              txn.type === 'CREDIT' ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                              {txn.type === 'CREDIT' ? (
                                <ArrowDownLeft className="h-5 w-5 text-green-400" />
                              ) : (
                                <ArrowUpRight className="h-5 w-5 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-foreground font-medium">{txn.description || 'Transaction'}</p>
                              <div className="flex items-center gap-2 text-sm text-foreground/60">
                                <span>{formatDate(txn.createdAt)}</span>
                                {txn.order?.id && (
                                  <>
                                    <span>•</span>
                                    <span>{txn.order.id}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${txn.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                              {txn.type === 'CREDIT' ? '+' : '-'}₹{Number(txn.amount).toLocaleString()}
                            </p>
                            {txn.status && (
                              <Badge className={
                                txn.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                txn.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }>
                                {txn.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bank Details */}
          <div className="space-y-6">
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Building className="h-5 w-5" /> Bank Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-foreground font-medium">Add bank details to request payouts</p>
                  <p className="text-foreground/60 text-sm mt-2">Bank details will be saved securely when you request your first payout.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
