import { Navbar } from '@/features/home/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useCart } from '@/shared/contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

const Cart = () => {
  const { items, removeFromCart, updateCartItem, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checkout',
        variant: 'destructive',
      });
      return;
    }
    navigate('/checkout');
  };

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + change);
    updateCartItem(id, { quantity: newQuantity });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center p-12">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding vendors to build your perfect event!
            </p>
            <Button asChild>
              <Link to="/search">Browse Vendors</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{item.packageName}</h3>
                          <p className="text-sm text-muted-foreground">{item.vendorName}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {item.eventDate && (
                        <div className="text-sm text-muted-foreground mb-2">
                          Event Date: {new Date(item.eventDate).toLocaleDateString()}
                          {item.eventTime && ` at ${item.eventTime}`}
                        </div>
                      )}

                      {item.addOns.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Add-ons:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.addOns.map((addon) => (
                              <Badge key={addon.id} variant="outline" className="text-xs">
                                {addon.title} (+₹{addon.price.toLocaleString()})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.customizations && item.customizations.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Customizations:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.customizations.map((custom) => (
                              <Badge key={custom.id} variant="outline" className="text-xs">
                                {custom.name}: {custom.value} (+₹{custom.price.toLocaleString()})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Price</div>
                          <div className="font-bold text-lg">
                            ₹
                            {(
                              (item.price +
                                item.addOns.reduce((sum, a) => sum + a.price, 0) +
                                (item.customizations?.reduce((sum, c) => sum + c.price, 0) || 0)) *
                              item.quantity
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
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
                    <span className="text-primary">
                      ₹{(getTotalPrice() * 1.23).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full"
                >
                  Clear Cart
                </Button>
                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  <p>✓ Secure payment processing</p>
                  <p>✓ Refund protection included</p>
                  <p>✓ Instant booking confirmation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;


