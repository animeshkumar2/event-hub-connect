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
import { CheckCircle2, Shield, Lock, CreditCard } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/shared/contexts/AuthContext';
import { customerApi } from '@/shared/services/api';
import { Loader2 } from 'lucide-react';

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

    // Payment details are optional for testing
    // if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv)) {
    //   toast({
    //     title: 'Invalid Card Details',
    //     description: 'Please fill in all card details',
    //     variant: 'destructive',
    //   });
    //   return;
    // }

    // if (paymentMethod === 'upi' && !upiId) {
    //   toast({
    //     title: 'Invalid UPI ID',
    //     description: 'Please enter your UPI ID',
    //     variant: 'destructive',
    //   });
    //   return;
    // }

    setProcessing(true);

    try {
      // First, ensure all cart items are saved to backend
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('auth_token');
      
      if (userId && token) {
        // Save any unsaved cart items to backend
        for (const item of items) {
          if (item.id && item.id.startsWith('cart-') && item.packageId) {
            // This is a local-only cart item, save it to backend
            try {
              const addOnIds = item.addOns?.filter(a => a.id && a.id.length > 0)
                .map(a => a.id)
                .filter(id => {
                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                  return uuidRegex.test(id);
                }) || [];
              
              let customizations = undefined;
              if (item.customizations && item.customizations.length > 0) {
                const customizationsPrice = item.customizations.reduce((sum, c) => sum + (c.price || 0), 0);
                customizations = {
                  price: customizationsPrice,
                  items: item.customizations,
                };
              }

              await customerApi.addToCart({
                listingId: item.packageId,
                quantity: item.quantity || 1,
                addOnIds: addOnIds.length > 0 ? addOnIds : undefined,
                customizations: customizations,
              });
            } catch (error) {
              console.error('Failed to save cart item to backend before checkout:', error);
              // Continue with other items
            }
          }
        }
      }
      
      // Then create order
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
          // Payment details are optional for testing
          ...(paymentMethod === 'card' && cardDetails.number ? {
            cardDetails: {
              cardNumber: cardDetails.number,
              cardholderName: cardDetails.name,
              expiryDate: cardDetails.expiry,
              cvv: cardDetails.cvv,
            }
          } : paymentMethod === 'upi' && upiId ? {
            upiId: upiId,
          } : {}),
        };

      // Wait a bit for cart items to be saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await customerApi.createOrder(orderData);
      
      if (response.success) {
        toast({
          title: 'Payment Successful!',
          description: 'Your booking has been confirmed. You will receive a confirmation email shortly.',
        });
        clearCart();
        navigate('/booking-success');
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
        title: 'Payment Failed',
        description: error.message || 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const total = getTotalPrice() * 1.23;

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
                    <span className="text-primary">₹{total.toLocaleString()}</span>
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pay Securely ₹{total.toLocaleString()}
                    </>
                  )}
                </Button>
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
    </div>
  );
};

export default Checkout;


