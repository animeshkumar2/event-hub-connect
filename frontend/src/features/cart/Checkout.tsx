import { useState, useEffect } from 'react';
import { Navbar } from '@/features/home/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { useCart } from '@/shared/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/use-toast';
import { CheckCircle2, Shield, Lock, CreditCard, Info } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/shared/contexts/AuthContext';
import { customerApi } from '@/shared/services/api';
import { Loader2 } from 'lucide-react';
import { TokenPaymentModal } from '@/shared/components/TokenPaymentModal';

// Token payment percentage (25%)
const TOKEN_PERCENTAGE = 0.25;

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    venueAddress: '',
    guestCount: '',
    eventType: '',
    notes: '',
  });
  const [processing, setProcessing] = useState(false);
  
  // Token payment modal state
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [orderTotalAmount, setOrderTotalAmount] = useState(0);
  const [orderTokenAmount, setOrderTokenAmount] = useState(0);

  // Pre-fill customer details from auth if available
  useEffect(() => {
    if (user) {
      setCustomerDetails(prev => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handlePayment = async () => {
    // Validate required fields
    if (!customerDetails.name || !customerDetails.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name and email',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      // Cart items are already synced to backend by CartContext
      // No need to re-add them here - that causes duplicates!
      
      // Create order from cart items already in backend
      const orderData = {
          paymentMethod: paymentMethod === 'card' ? 'card' : 'upi',
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone || undefined,
          eventDate: customerDetails.eventDate || undefined,
          eventTime: customerDetails.eventTime || undefined,
          venueAddress: customerDetails.venueAddress || undefined,
          guestCount: customerDetails.guestCount ? parseInt(customerDetails.guestCount) : undefined,
          eventType: customerDetails.eventType || undefined,
          notes: customerDetails.notes || undefined,
        };
      
      const response = await customerApi.createOrder(orderData);
      
      if (response.success && response.data) {
        // Order created successfully - now show token payment modal
        const order = response.data;
        setCreatedOrderId(order.id);
        setOrderTotalAmount(order.totalAmount || total);
        setOrderTokenAmount(order.tokenAmount || Math.round(total * TOKEN_PERCENTAGE));
        setShowTokenModal(true);
        
        toast({
          title: 'Order Created!',
          description: 'Please complete the token payment to confirm your booking.',
        });
      } else {
        // If cart is empty, it means items weren't saved - show helpful message
        if (response.message?.includes('Cart is empty')) {
          toast({
            title: 'Cart Sync Issue',
            description: 'Please try adding items to cart again. If the problem persists, refresh the page.',
            variant: 'destructive',
          });
        } else {
          throw new Error(response.message || 'Failed to create order');
        }
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: 'Order Creation Failed',
        description: error.message || 'Failed to create order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle token payment success
  const handleTokenPaymentSuccess = () => {
    setShowTokenModal(false);
    clearCart();
    toast({
      title: 'Token Payment Successful!',
      description: 'Your booking is confirmed. The vendor will contact you shortly.',
    });
    navigate('/booking-success');
  };

  // Handle token payment modal close
  const handleTokenModalClose = () => {
    setShowTokenModal(false);
    // Order is created but token not paid - redirect to orders page
    toast({
      title: 'Payment Pending',
      description: 'Your order is created. Please complete the token payment from your orders page.',
    });
    clearCart();
    navigate('/customer/orders');
  };

  const total = getTotalPrice() * 1.23;
  const tokenAmount = Math.round(total * TOKEN_PERCENTAGE);
  const balanceAmount = total - tokenAmount;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Input
                      id="eventType"
                      value={customerDetails.eventType}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, eventType: e.target.value })}
                      placeholder="e.g., Wedding, Birthday"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={customerDetails.eventDate}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, eventDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Event Time</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={customerDetails.eventTime}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, eventTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestCount">Number of Guests</Label>
                    <Input
                      id="guestCount"
                      type="number"
                      value={customerDetails.guestCount}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, guestCount: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="venueAddress">Venue Address</Label>
                  <Textarea
                    id="venueAddress"
                    value={customerDetails.venueAddress}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, venueAddress: e.target.value })}
                    placeholder="Enter the event venue address"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={customerDetails.notes}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                    placeholder="Any special requirements or instructions"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Protection Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-bold mb-2">Payment Protection</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✓ Payment held securely until service completion</li>
                      <li>✓ Full refund if vendor cancels</li>
                      <li>✓ Dispute resolution support</li>
                      <li>✓ 100% money-back guarantee for service issues</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg mb-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Credit/Debit Card</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        <span>UPI</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, number: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, expiry: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cvv: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="mt-6">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium">{item.packageName}</div>
                        <div className="text-muted-foreground">{item.vendorName}</div>
                      </div>
                      <div className="text-right">
                        <div>
                          ₹
                          {(
                            (item.price +
                              item.addOns.reduce((sum, a) => sum + a.price, 0) +
                              (item.customizations?.reduce((sum, c) => sum + c.price, 0) || 0)) *
                            item.quantity
                          ).toLocaleString()}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-muted-foreground">×{item.quantity}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span>₹{(getTotalPrice() * 0.05).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>₹{(getTotalPrice() * 0.18).toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Token Payment Info */}
                <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Info className="h-4 w-4" />
                    <span>Pay only 25% token now!</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Token Amount (25%)</span>
                    <span className="text-lg font-bold text-primary">₹{tokenAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Balance (pay later)</span>
                    <span>₹{balanceAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handlePayment}
                  className="w-full"
                  size="lg"
                  disabled={processing || items.length === 0}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pay Token ₹{tokenAmount.toLocaleString()}
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Balance ₹{balanceAmount.toLocaleString()} to be paid after vendor confirmation
                </p>
                <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Refund Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Instant Confirmation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Token Payment Modal */}
      {createdOrderId && (
        <TokenPaymentModal
          isOpen={showTokenModal}
          onClose={handleTokenModalClose}
          orderId={createdOrderId}
          totalAmount={orderTotalAmount}
          tokenAmount={orderTokenAmount}
          onPaymentSuccess={handleTokenPaymentSuccess}
        />
      )}
    </div>
  );
};

export default Checkout;


