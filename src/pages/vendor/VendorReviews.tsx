import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp,
  Mail,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  customer: string;
  avatar: string;
  rating: number;
  date: string;
  event: string;
  review: string;
  response?: string;
  helpful: number;
}

export default function VendorReviews() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');

  const overallRating = 4.9;
  const totalReviews = 142;
  const ratingDistribution = [
    { stars: 5, count: 118, percentage: 83 },
    { stars: 4, count: 18, percentage: 13 },
    { stars: 3, count: 4, percentage: 3 },
    { stars: 2, count: 2, percentage: 1 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  const reviews: Review[] = [
    {
      id: '1',
      customer: 'Priya Sharma',
      avatar: 'P',
      rating: 5,
      date: 'Dec 5, 2024',
      event: 'Wedding Photography',
      review: 'Absolutely stunning work! The photos captured every beautiful moment of our wedding. The team was professional, creative, and went above and beyond. Highly recommend!',
      helpful: 12,
    },
    {
      id: '2',
      customer: 'Rahul Mehta',
      avatar: 'R',
      rating: 5,
      date: 'Nov 28, 2024',
      event: 'Corporate Event',
      review: 'Professional and punctual. The corporate event photos turned out great and our marketing team loved them. Will definitely book again for future events.',
      response: 'Thank you so much, Rahul! It was a pleasure working with your team. Looking forward to future collaborations!',
      helpful: 8,
    },
    {
      id: '3',
      customer: 'Anita Desai',
      avatar: 'A',
      rating: 4,
      date: 'Nov 15, 2024',
      event: 'Birthday Party',
      review: 'Great photos of the birthday party. The candid shots were especially nice. Only wish there were a few more family group photos.',
      helpful: 5,
    },
  ];

  const handleSubmitResponse = () => {
    if (!responseText.trim()) return;
    toast.success('Response posted successfully!');
    setResponseText('');
    setSelectedReview(null);
  };

  const handleRequestReview = () => {
    toast.success('Review request email sent!');
  };

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
                <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Sharma Family</span>
                    <Badge className="bg-green-500/20 text-green-400">Wedding - Dec 15</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Mehta Corp</span>
                    <Badge className="bg-blue-500/20 text-blue-400">Corporate - Dec 10</Badge>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-foreground/60 mb-2">Email Preview:</p>
                  <p className="text-foreground text-sm">
                    "Hi [Customer Name], Thank you for choosing Royal Moments Photography for your [Event]. 
                    We'd love to hear about your experience! Would you mind leaving us a review?"
                  </p>
                </div>
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
                  <span className="text-5xl font-bold text-foreground">{overallRating}</span>
                  <Star className="h-10 w-10 text-secondary fill-vendor-gold" />
                </div>
                <p className="text-foreground/60">{totalReviews} reviews</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+0.2 this month</span>
                </div>
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
            {reviews.map((review) => (
              <Card key={review.id} className="glass-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold text-lg">{review.avatar}</span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{review.customer}</p>
                        <p className="text-sm text-foreground/60">{review.event} • {review.date}</p>
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

                  <p className="text-foreground/80 mb-4">{review.review}</p>

                  {review.response && (
                    <div className="p-4 rounded-xl bg-secondary/10 border border-vendor-gold/20 mb-4">
                      <p className="text-sm text-secondary font-medium mb-1">Your Response:</p>
                      <p className="text-foreground/80 text-sm">{review.response}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-foreground">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {review.helpful} found helpful
                    </Button>
                    {!review.response && (
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
                                <span className="text-foreground font-medium">{review.customer}</span>
                                <div className="flex">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 text-secondary fill-vendor-gold" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-foreground/60 text-sm">{review.review}</p>
                            </div>
                            <Textarea 
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Write your response..."
                              className="bg-muted/50 border-border text-foreground min-h-[120px]"
                            />
                            <Button 
                              onClick={handleSubmitResponse}
                              className="w-full bg-secondary text-secondary-foreground"
                            >
                              Post Response
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
