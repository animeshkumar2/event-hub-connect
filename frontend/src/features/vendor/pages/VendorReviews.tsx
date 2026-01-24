import { useState } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { InlineError } from '@/shared/components/InlineError';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Lock,
  Sparkles,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useMyVendorReviews, useVendorReviewStatistics } from '@/shared/hooks/useApi';
import { format } from 'date-fns';
import { vendorApi } from '@/shared/services/api';
import { FEATURE_FLAGS } from '@/shared/config/featureFlags';
import { BrandedLoader } from '@/shared/components/BrandedLoader';

interface Review {
  id: string;
  customer?: {
    name?: string;
    email?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  vendorResponse?: string;
  order?: {
    eventType?: string;
  };
}

interface EligibleOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  eventType: string;
  eventDate: string;
  orderDate: string;
  eligible: boolean;
  reason: string;
  recommendation: string | null;
}

export default function VendorReviews() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [page, setPage] = useState(0);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  
  // Review request states
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  
  // PHASE 1: Skip API calls if review requests is disabled
  const shouldFetchData = FEATURE_FLAGS.REVIEW_REQUESTS_ENABLED;
  
  const { data: reviewsData, loading: reviewsLoading, error: reviewsError } = useMyVendorReviews(page, 10, { enabled: shouldFetchData });
  const { data: statsData, loading: statsLoading } = useVendorReviewStatistics({ enabled: shouldFetchData });

  const reviews: Review[] = reviewsData?.content || reviewsData || [];
  const stats = statsData || {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  };

  const overallRating = stats.averageRating || 0;
  const totalReviews = stats.totalReviews || 0;
  const ratingDistribution = [
    { stars: 5, count: stats.ratingDistribution?.[5] || 0 },
    { stars: 4, count: stats.ratingDistribution?.[4] || 0 },
    { stars: 3, count: stats.ratingDistribution?.[3] || 0 },
    { stars: 2, count: stats.ratingDistribution?.[2] || 0 },
    { stars: 1, count: stats.ratingDistribution?.[1] || 0 },
  ].map(item => ({
    ...item,
    percentage: totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0
  }));

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !selectedReview) return;
    
    setSubmittingResponse(true);
    try {
      // TODO: Implement vendor response API endpoint
      toast.success('Response posted successfully!');
      setResponseText('');
      setSelectedReview(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to post response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleOpenRequestDialog = async () => {
    setShowRequestDialog(true);
    setLoadingOrders(true);
    
    try {
      const response = await vendorApi.getEligibleOrdersForReview();
      
      if (response.success) {
        setEligibleOrders(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load eligible orders');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load eligible orders');
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSendReviewRequest = async () => {
    if (!selectedOrderId) {
      toast.error('Please select an order');
      return;
    }
    
    setSendingRequest(true);
    try {
      const response = await vendorApi.sendReviewRequest(selectedOrderId);
      
      if (response.success) {
        const result = response.data;
        toast.success(`Review request sent to ${result.customerName}!`);
        setShowRequestDialog(false);
        setSelectedOrderId(null);
        
        // Refresh eligible orders
        handleOpenRequestDialog();
      } else {
        toast.error(response.message || 'Failed to send review request');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send review request');
    } finally {
      setSendingRequest(false);
    }
  };

  const getEligibilityIcon = (order: EligibleOrder) => {
    if (order.eligible && order.recommendation === 'Best time to ask') {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (order.eligible) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    } else if (order.reason.includes('wait')) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getEligibilityColor = (order: EligibleOrder) => {
    if (order.eligible && order.recommendation === 'Best time to ask') {
      return 'text-green-600 dark:text-green-400';
    } else if (order.eligible) {
      return 'text-blue-600 dark:text-blue-400';
    } else if (order.reason.includes('wait')) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (reviewsLoading || statsLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <BrandedLoader fullScreen={false} message="Collecting your reviews..." />
        </div>
      </VendorLayout>
    );
  }

  if (reviewsError) {
    return (
      <VendorLayout>
        <InlineError
          title="Failed to load reviews"
          message="We couldn't load your reviews data. Please try again."
          error={reviewsError}
          onRetry={() => window.location.reload()}
          showHomeButton={false}
        />
      </VendorLayout>
    );
  }

  // PHASE 1: Show locked state if review requests is disabled
  if (!FEATURE_FLAGS.REVIEW_REQUESTS_ENABLED) {
    return (
      <VendorLayout>
        <div className="relative min-h-screen overflow-hidden">
          {/* Blurred Background Content */}
          <div className="absolute inset-0 pointer-events-none select-none p-4 space-y-4" style={{ filter: 'blur(10px)' }}>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Reviews & Reputation</h1>
                  <p className="text-foreground/60 text-xs">Manage your customer reviews</p>
                </div>
                <Button className="bg-secondary text-secondary-foreground h-8">
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> Request Review
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Rating Overview */}
                <Card className="border-0 shadow-none bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-base">Rating Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold text-foreground">4.8</span>
                        <Star className="h-8 w-8 text-secondary fill-vendor-gold" />
                      </div>
                      <p className="text-foreground/60 text-sm">24 reviews</p>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-10">
                            <span className="text-foreground text-xs">{stars}</span>
                            <Star className="h-2.5 w-2.5 text-secondary fill-vendor-gold" />
                          </div>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-secondary rounded-full w-3/4" />
                          </div>
                          <span className="text-foreground/60 text-xs w-8 text-right">18</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-3">
                  {[1, 2].map((i) => (
                    <Card key={i} className="border-0 shadow-none bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">J</span>
                            </div>
                            <div>
                              <p className="text-foreground font-medium text-sm">John Doe</p>
                              <p className="text-xs text-foreground/60">Wedding • Dec 20, 2024</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-secondary fill-vendor-gold" />
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground/80 text-sm mb-3">
                          Amazing service! Everything was perfect for our special day.
                        </p>
                        <div className="flex items-center justify-between">
                          <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-foreground h-7 text-xs">
                            <ThumbsUp className="mr-1.5 h-3 w-3" /> Helpful
                          </Button>
                          <Button variant="outline" size="sm" className="border-white/20 text-foreground h-7 text-xs">
                            <MessageSquare className="mr-1.5 h-3 w-3" /> Respond
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay with Lock Message */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/85 p-6">
              <Card className="max-w-md w-full border-0 shadow-2xl bg-card">
                <CardContent className="p-8 text-center">
                  {/* Animated Lock Icon */}
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                      <Lock className="h-12 w-12 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
                    <Zap className="h-6 w-6 text-secondary" />
                    Reviews Coming Soon
                  </h2>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                    Build your reputation with smart review requests and customer feedback management.
                  </p>

                  {/* Features Preview */}
                  <div className="space-y-3 mb-6 text-left">
                    {[
                      { icon: Mail, text: 'Request reviews from customers' },
                      { icon: Star, text: 'Track ratings & feedback' },
                      { icon: MessageSquare, text: 'Respond to reviews' },
                      { icon: TrendingUp, text: 'Build your reputation' }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <feature.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-foreground/80">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Badge */}
                  <Badge className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-0 px-4 py-2 font-semibold">
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            </div>
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
            <h1 className="text-2xl font-bold text-foreground">Reviews & Reputation</h1>
            <p className="text-foreground/60">Manage your customer reviews</p>
          </div>
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-secondary text-secondary-foreground"
                onClick={handleOpenRequestDialog}
              >
                <Mail className="mr-2 h-4 w-4" /> Request Review
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">Request a Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : eligibleOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-foreground/60">No completed orders available for review requests.</p>
                    <p className="text-sm text-foreground/40 mt-2">Complete some orders first to request reviews.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-foreground/60 text-sm">
                      Select a completed order to send a review request:
                    </p>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {eligibleOrders.map((order) => (
                        <div
                          key={order.orderId}
                          onClick={() => order.eligible && setSelectedOrderId(order.orderId)}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            selectedOrderId === order.orderId
                              ? 'border-primary bg-primary/5'
                              : order.eligible
                              ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                              : 'border-border bg-muted/20 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-foreground">{order.customerName}</p>
                                <span className="text-foreground/40">•</span>
                                <p className="text-sm text-foreground/60">{order.eventType}</p>
                              </div>
                              <p className="text-xs text-foreground/40">
                                Event: {format(new Date(order.eventDate), 'MMM dd, yyyy')}
                              </p>
                              <div className={`flex items-center gap-2 mt-2 text-sm ${getEligibilityColor(order)}`}>
                                {getEligibilityIcon(order)}
                                <span className="font-medium">
                                  {order.eligible 
                                    ? (order.recommendation || 'Eligible') 
                                    : order.reason}
                                </span>
                              </div>
                            </div>
                            {selectedOrderId === order.orderId && (
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <Button 
                        onClick={handleSendReviewRequest}
                        disabled={!selectedOrderId || sendingRequest}
                        className="w-full bg-secondary text-secondary-foreground"
                      >
                        {sendingRequest ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" /> Send Review Request
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Overview */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Rating Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-foreground">{overallRating.toFixed(1)}</span>
                  <Star className="h-10 w-10 text-secondary fill-vendor-gold" />
                </div>
                <p className="text-foreground/60">{totalReviews} reviews</p>
              </div>

              <div className="space-y-3">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-foreground text-sm">{item.stars}</span>
                      <Star className="h-3 w-3 text-secondary fill-vendor-gold" />
                    </div>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-foreground/60 text-sm w-12 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <Star className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                  <p className="text-foreground/60">No reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="glass-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold text-lg">
                            {review.customer?.name?.[0]?.toUpperCase() || 'C'}
                          </span>
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{review.customer?.name || 'Anonymous'}</p>
                          <p className="text-sm text-foreground/60">
                            {review.order?.eventType || 'Event'} • {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-secondary fill-vendor-gold' : 'text-foreground/20'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-foreground/80 mb-4">{review.comment}</p>
                    )}

                    {review.vendorResponse && (
                      <div className="p-4 rounded-xl bg-secondary/10 border border-vendor-gold/20 mb-4">
                        <p className="text-sm text-secondary font-medium mb-1">Your Response:</p>
                        <p className="text-foreground/80 text-sm">{review.vendorResponse}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-foreground">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Helpful
                      </Button>
                      {!review.vendorResponse && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                              className="border-white/20 text-foreground hover:bg-white/10"
                            >
                              <MessageSquare className="mr-2 h-4 w-4" /> Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Respond to Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="p-4 rounded-xl bg-muted/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-foreground font-medium">{review.customer?.name || 'Customer'}</span>
                                  <div className="flex">
                                    {[...Array(review.rating)].map((_, i) => (
                                      <Star key={i} className="h-3 w-3 text-secondary fill-vendor-gold" />
                                    ))}
                                  </div>
                                </div>
                                {review.comment && (
                                  <p className="text-foreground/60 text-sm">{review.comment}</p>
                                )}
                              </div>
                              <Textarea 
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Write your response..."
                                className="bg-muted/50 border-border text-foreground min-h-[120px]"
                              />
                              <Button 
                                onClick={handleSubmitResponse}
                                disabled={submittingResponse || !responseText.trim()}
                                className="w-full bg-secondary text-secondary-foreground"
                              >
                                {submittingResponse ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                                  </>
                                ) : (
                                  'Post Response'
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
