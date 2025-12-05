import { useState } from 'react';
import { Navbar } from '@/features/home/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { useCart } from '@/shared/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/use-toast';
import { Sparkles, CheckCircle2, ShoppingCart, Loader2, AlertCircle, ExternalLink, Star, TrendingUp, Award, Check } from 'lucide-react';
import { publicApi } from '@/shared/services/api';
import { useEventTypes } from '@/shared/hooks/useApi';
import { cn } from '@/shared/lib/utils';

interface ListingOption {
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  vendorReviewCount: number;
  packageId: string;
  packageName: string;
  packageDescription?: string;
  price: number;
  reason: string;
  images?: string[];
  isPopular?: boolean;
  isTrending?: boolean;
  valueScore?: number;
}

interface CategoryRecommendation {
  category: string;
  categoryName: string;
  allocatedBudget: number;
  options: ListingOption[];
}

interface SelectedOption {
  category: string;
  option: ListingOption;
}

const EventPlanner = () => {
  const [budget, setBudget] = useState('');
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [recommendations, setRecommendations] = useState<CategoryRecommendation[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, SelectedOption>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: eventTypesData, loading: eventTypesLoading } = useEventTypes();
  const eventTypes = eventTypesData || [];

  const generateRecommendations = async () => {
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

    if (budgetNum <= 0 || guestNum <= 0) {
      toast({
        title: 'Invalid input',
        description: 'Budget and guest count must be positive numbers',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedOptions(new Map());

    try {
      const response = await publicApi.getRecommendations({
        budget: budgetNum,
        eventType: eventType,
        guestCount: guestNum,
      });

      if (response.success && response.data) {
        // Convert price from BigDecimal to number and set default selections (first option)
        const formattedRecs: CategoryRecommendation[] = response.data.map((rec: any) => {
          const options = (rec.options || []).map((opt: any) => ({
            ...opt,
            price: typeof opt.price === 'number' ? opt.price : parseFloat(opt.price),
            vendorRating: typeof opt.vendorRating === 'number' ? opt.vendorRating : parseFloat(opt.vendorRating || 0),
            allocatedBudget: typeof rec.allocatedBudget === 'number' ? rec.allocatedBudget : parseFloat(rec.allocatedBudget || 0),
          }));
          
          return {
            ...rec,
            allocatedBudget: typeof rec.allocatedBudget === 'number' ? rec.allocatedBudget : parseFloat(rec.allocatedBudget || 0),
            options,
          };
        });
        
        setRecommendations(formattedRecs);
        
        // Auto-select first option for each category
        const autoSelected = new Map<string, SelectedOption>();
        formattedRecs.forEach((rec) => {
          if (rec.options && rec.options.length > 0) {
            autoSelected.set(rec.category, {
              category: rec.category,
              option: rec.options[0],
            });
          }
        });
        setSelectedOptions(autoSelected);
        setShowResults(true);
        
        if (formattedRecs.length === 0 || formattedRecs.every(r => !r.options || r.options.length === 0)) {
          toast({
            title: 'No recommendations found',
            description: 'Try adjusting your budget or event type',
            variant: 'default',
          });
        }
      } else {
        throw new Error(response.message || 'Failed to get recommendations');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (category: string, option: ListingOption) => {
    setSelectedOptions(prev => {
      const newMap = new Map(prev);
      newMap.set(category, { category, option });
      return newMap;
    });
  };

  const handleAddSelectedToCart = async () => {
    if (selectedOptions.size === 0) {
      toast({
        title: 'No selections',
        description: 'Please select at least one option',
        variant: 'destructive',
      });
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const [category, selected] of selectedOptions.entries()) {
      try {
        // Fetch package details to get addOns and basePrice
        try {
          const packageResponse = await publicApi.getPackage(selected.option.packageId);
          
          if (packageResponse?.success && packageResponse?.data) {
            const pkg = packageResponse.data;
            addToCart({
              vendorId: selected.option.vendorId,
              vendorName: selected.option.vendorName,
              packageId: selected.option.packageId,
              packageName: selected.option.packageName,
              price: selected.option.price,
              basePrice: typeof pkg.price === 'number' ? pkg.price : parseFloat(pkg.price),
              addOns: [],
              quantity: 1,
            });
            successCount++;
          } else {
            // Fallback: use recommendation data directly
            addToCart({
              vendorId: selected.option.vendorId,
              vendorName: selected.option.vendorName,
              packageId: selected.option.packageId,
              packageName: selected.option.packageName,
              price: selected.option.price,
              basePrice: selected.option.price,
              addOns: [],
              quantity: 1,
            });
            successCount++;
          }
        } catch (err) {
          // Fallback: use recommendation data directly
          addToCart({
            vendorId: selected.option.vendorId,
            vendorName: selected.option.vendorName,
            packageId: selected.option.packageId,
            packageName: selected.option.packageName,
            price: selected.option.price,
            basePrice: selected.option.price,
            addOns: [],
            quantity: 1,
          });
          successCount++;
        }
      } catch (err) {
        console.error(`Failed to add ${selected.option.packageName} to cart:`, err);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: 'Added to Cart!',
        description: `${successCount} package${successCount > 1 ? 's' : ''} added to your cart${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
      });
      navigate('/cart');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add items to cart',
        variant: 'destructive',
      });
    }
  };

  const totalCost = Array.from(selectedOptions.values()).reduce(
    (sum, selected) => sum + selected.option.price,
    0
  );
  const remainingBudget = parseInt(budget) - totalCost;
  const isWithinBudget = remainingBudget >= 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Event Planner</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Tell us your budget and event details, and we'll recommend the perfect packages
            </p>
          </div>

          {!showResults ? (
            <Card className="max-w-2xl mx-auto">
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
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your total budget for the event
                  </p>
                </div>

                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={eventType} onValueChange={setEventType} disabled={eventTypesLoading}>
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder={eventTypesLoading ? "Loading..." : "Select event type"} />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type: any) => (
                        <SelectItem key={type.id || type} value={String(type.id || type)}>
                          {type.name || type}
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
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Approximate number of guests attending
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button 
                  onClick={generateRecommendations} 
                  className="w-full" 
                  size="lg"
                  disabled={loading || eventTypesLoading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Recommendations...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Budget Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
                      <div className="text-3xl font-bold">₹{parseInt(budget).toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Selected Total</div>
                      <div className="text-3xl font-bold text-primary">
                        ₹{totalCost.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Remaining</div>
                        <div className={`text-2xl font-bold ${isWithinBudget ? 'text-green-600' : 'text-destructive'}`}>
                          ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
                        </div>
                      </div>
                      {isWithinBudget ? (
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-destructive" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Recommendations */}
              {recommendations.map((rec) => {
                const selected = selectedOptions.get(rec.category);
                return (
                  <Card key={rec.category} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl capitalize">{rec.categoryName || rec.category}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Allocated Budget: ₹{rec.allocatedBudget.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {rec.options?.length || 0} Options
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {!rec.options || rec.options.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No packages found for this category</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {rec.options.map((option, index) => {
                            const isSelected = selected?.option.packageId === option.packageId;
                            const budgetUsage = (option.price / rec.allocatedBudget) * 100;
                            
                            return (
                              <Card
                                key={option.packageId}
                                className={cn(
                                  "relative cursor-pointer transition-all hover:shadow-lg",
                                  isSelected && "ring-2 ring-primary shadow-lg"
                                )}
                                onClick={() => handleSelectOption(rec.category, option)}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 z-10">
                                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                                      <Check className="h-4 w-4" />
                                    </div>
                                  </div>
                                )}
                                
                                {index === 0 && option.isTrending && (
                                  <div className="absolute top-2 left-2 z-10">
                                    <Badge className="bg-orange-500">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Best Value
                                    </Badge>
                                  </div>
                                )}
                                
                                {option.isPopular && !option.isTrending && (
                                  <div className="absolute top-2 left-2 z-10">
                                    <Badge variant="secondary">
                                      <Award className="h-3 w-3 mr-1" />
                                      Popular
                                    </Badge>
                                  </div>
                                )}

                                {option.images && option.images.length > 0 && (
                                  <div className="h-40 w-full overflow-hidden rounded-t-lg">
                                    <img
                                      src={option.images[0]}
                                      alt={option.packageName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                                      }}
                                    />
                                  </div>
                                )}

                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div>
                                      <h3 className="font-bold text-lg mb-1">{option.packageName}</h3>
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {option.packageDescription || option.reason}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">
                                          {option.vendorRating.toFixed(1)}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        ({option.vendorReviewCount} reviews)
                                      </span>
                                    </div>

                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Vendor</p>
                                      <p className="text-sm font-medium">{option.vendorName}</p>
                                    </div>

                                    <div className="pt-2 border-t">
                                      <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-2xl font-bold text-primary">
                                          ₹{option.price.toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {budgetUsage.toFixed(0)}% of budget
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {option.reason}
                                      </p>
                                    </div>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/vendor/${option.vendorId}?packageId=${option.packageId}`);
                                      }}
                                    >
                                      <ExternalLink className="mr-2 h-3 w-3" />
                                      View Details
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Action Buttons */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAddSelectedToCart}
                      className="flex-1"
                      size="lg"
                      disabled={selectedOptions.size === 0 || !isWithinBudget}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add Selected to Cart ({selectedOptions.size})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowResults(false);
                        setRecommendations([]);
                        setSelectedOptions(new Map());
                        setError(null);
                      }}
                      size="lg"
                    >
                      Start Over
                    </Button>
                  </div>
                  {!isWithinBudget && (
                    <p className="text-sm text-destructive mt-3 text-center">
                      Selected packages exceed budget. Please adjust your selections.
                    </p>
                  )}
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
