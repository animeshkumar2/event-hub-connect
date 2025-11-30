import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockVendors, eventTypes } from '@/data/mockData';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, CheckCircle2, ShoppingCart } from 'lucide-react';
import { EventRecommendation } from '@/data/mockData';

const EventPlanner = () => {
  const [budget, setBudget] = useState('');
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [recommendations, setRecommendations] = useState<EventRecommendation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateRecommendations = () => {
    if (!budget || !eventType || !guestCount) {
      toast({
        title: 'Please fill all fields',
        description: 'Budget, event type, and guest count are required',
        variant: 'destructive',
      });
      return;
    }

    const budgetNum = parseInt(budget);
    const guestNum = parseInt(guestCount);

    // Simple recommendation algorithm
    const recs: EventRecommendation[] = [];

    // Always recommend decorator (30% of budget)
    const decorBudget = budgetNum * 0.3;
    const decorVendor = mockVendors.find((v) => v.category === 'decorator');
    if (decorVendor && decorVendor.packages[0]) {
      recs.push({
        category: 'decorator',
        vendorId: decorVendor.id,
        vendorName: decorVendor.businessName,
        packageId: decorVendor.packages[0].id,
        packageName: decorVendor.packages[0].name,
        price: Math.min(decorBudget, decorVendor.packages[0].price),
        reason: 'Essential for creating the perfect ambiance',
      });
    }

    // Recommend photographer (25% of budget)
    const photoBudget = budgetNum * 0.25;
    const photoVendor = mockVendors.find((v) => v.category === 'photographer');
    if (photoVendor && photoVendor.packages[0]) {
      recs.push({
        category: 'photographer',
        vendorId: photoVendor.id,
        vendorName: photoVendor.businessName,
        packageId: photoVendor.packages[0].id,
        packageName: photoVendor.packages[0].name,
        price: Math.min(photoBudget, photoVendor.packages[0].price),
        reason: 'Capture your special moments forever',
      });
    }

    // Recommend DJ (20% of budget)
    const djBudget = budgetNum * 0.2;
    const djVendor = mockVendors.find((v) => v.category === 'dj');
    if (djVendor && djVendor.packages[0]) {
      recs.push({
        category: 'dj',
        vendorId: djVendor.id,
        vendorName: djVendor.businessName,
        packageId: djVendor.packages[0].id,
        packageName: djVendor.packages[0].name,
        price: Math.min(djBudget, djVendor.packages[0].price),
        reason: 'Keep the party going with great music',
      });
    }

    // Recommend caterer if budget allows (remaining budget)
    const remainingBudget = budgetNum - recs.reduce((sum, r) => sum + r.price, 0);
    if (remainingBudget > guestNum * 500) {
      const catererVendor = mockVendors.find((v) => v.category === 'caterer');
      if (catererVendor && catererVendor.packages[0]) {
        recs.push({
          category: 'caterer',
          vendorId: catererVendor.id,
          vendorName: catererVendor.businessName,
          packageId: catererVendor.packages[0].id,
          packageName: catererVendor.packages[0].name,
          price: Math.min(remainingBudget * 0.8, catererVendor.packages[0].price),
          reason: `Perfect for ${guestNum} guests`,
        });
      }
    }

    setRecommendations(recs);
    setShowResults(true);
  };

  const handleAddAllToCart = () => {
    recommendations.forEach((rec) => {
      const vendor = mockVendors.find((v) => v.id === rec.vendorId);
      const pkg = vendor?.packages.find((p) => p.id === rec.packageId);
      if (vendor && pkg) {
        addToCart({
          vendorId: vendor.id,
          vendorName: vendor.businessName,
          packageId: pkg.id,
          packageName: pkg.name,
          price: rec.price,
          basePrice: pkg.price,
          addOns: [],
          quantity: 1,
        });
      }
    });
    toast({
      title: 'Added to Cart!',
      description: `${recommendations.length} vendors added to your cart`,
    });
    navigate('/cart');
  };

  const totalCost = recommendations.reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Event Planner</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Tell us your budget and event details, and we'll recommend the perfect vendors
            </p>
          </div>

          {!showResults ? (
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="budget">Total Budget (₹)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 200000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your total budget for the event
                  </p>
                </div>

                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="guestCount">Number of Guests</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    placeholder="e.g., 100"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                  />
                </div>

                <Button onClick={generateRecommendations} className="w-full" size="lg">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Recommendations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recommended Vendors</CardTitle>
                    <Badge variant="secondary">
                      Budget: ₹{parseInt(budget).toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge>{rec.category}</Badge>
                                <h3 className="font-bold">{rec.vendorName}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {rec.packageName}
                              </p>
                              <p className="text-sm">{rec.reason}</p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-primary">
                                ₹{rec.price.toLocaleString()}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => navigate(`/vendor/${rec.vendorId}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Cost</div>
                      <div className="text-3xl font-bold text-primary">
                        ₹{totalCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Remaining: ₹{(parseInt(budget) - totalCost).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Within Budget</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleAddAllToCart} className="flex-1" size="lg">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add All to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowResults(false);
                        setRecommendations([]);
                      }}
                    >
                      Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventPlanner;

