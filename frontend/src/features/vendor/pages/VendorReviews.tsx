import { useState } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp,
  Mail,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useMyVendorReviews, useVendorReviewStatistics } from '@/shared/hooks/useApi';
import { format } from 'date-fns';

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

export default function VendorReviews() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [page, setPage] = useState(0);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  
  const { data: reviewsData, loading: reviewsLoading, error: reviewsError } = useMyVendorReviews(page, 10);
  const { data: statsData, loading: statsLoading } = useVendorReviewStatistics();

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

  const handleRequestReview = () => {
    toast.success('Review request email sent!');
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
            <h1 className="text-2xl font-bold text-foreground">Reviews & Reputation</h1>
            <p className="text-foreground/60">Manage your customer reviews</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-secondary text-secondary-foreground">
                <Mail className="mr-2 h-4 w-4" /> Request Review
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Request a Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-foreground/60">Send a review request email to a recent customer.</p>
                <Button onClick={handleRequestReview} className="w-full bg-secondary text-secondary-foreground">
                  Send Review Request
                </Button>
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
            {reviewsError ? (
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-destructive">{reviewsError}</p>
                </CardContent>
              </Card>
            ) : reviews.length === 0 ? (
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
