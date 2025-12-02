import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  Video,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Package,
  Calendar,
  Wallet,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: React.ElementType;
  category: string;
}

export default function VendorHelp() {
  const [showOpsModal, setShowOpsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'paid' | null>(null);

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Creating Your First Listing',
      description: 'Learn how to create compelling listings that attract customers',
      duration: '5 min',
      icon: Package,
      category: 'Getting Started',
    },
    {
      id: '2',
      title: 'Managing Your Calendar',
      description: 'Set up availability and sync with Google Calendar',
      duration: '4 min',
      icon: Calendar,
      category: 'Calendar',
    },
    {
      id: '3',
      title: 'Handling Leads & Quotes',
      description: 'Best practices for converting leads into bookings',
      duration: '6 min',
      icon: Users,
      category: 'Sales',
    },
    {
      id: '4',
      title: 'Understanding Payouts',
      description: 'How commissions work and when you get paid',
      duration: '3 min',
      icon: Wallet,
      category: 'Payments',
    },
  ];

  const faqs = [
    {
      question: 'How do I get more leads?',
      answer: 'Complete your profile, add high-quality photos, respond quickly to inquiries, and maintain a good rating to improve your visibility.',
    },
    {
      question: 'When will I receive my payment?',
      answer: 'Payments are released after the event is completed and customer confirms delivery. Standard processing takes 2-3 business days.',
    },
    {
      question: 'How do I handle cancellations?',
      answer: 'Your cancellation policy is applied automatically. Refunds are processed based on the policy you selected in settings.',
    },
    {
      question: 'Can I edit a listing after publishing?',
      answer: 'Yes, you can edit your listings anytime. Changes take effect immediately.',
    },
  ];

  const handleRequestOps = () => {
    toast.success('Ops assistance request submitted! Our team will contact you within 24 hours.');
    setShowOpsModal(false);
  };

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
            <p className="text-foreground/60">Get support and learn how to grow your business</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input placeholder="Search for help..." className="pl-10 bg-muted/50 border-border text-foreground w-64" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border shadow-card border-border hover:border-vendor-gold/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/20">
                <MessageCircle className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-foreground font-medium">Live Chat</p>
                <p className="text-sm text-foreground/60">Chat with support</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card border-border hover:border-vendor-purple/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium">Call Us</p>
                <p className="text-sm text-foreground/60">+91 1800 123 4567</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card border-border hover:border-blue-500/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-foreground font-medium">Email Support</p>
                <p className="text-sm text-foreground/60">vendors@eventory.com</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ops Assistance */}
        <Card className="border-border shadow-card border-vendor-gold/30 bg-gradient-to-r from-vendor-gold/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/20">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">Need help creating listings?</h3>
                  <p className="text-foreground/60">Let our ops team create 5 listings for you</p>
                </div>
              </div>
              <Dialog open={showOpsModal} onOpenChange={setShowOpsModal}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    Request Ops Assistance
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Request Ops Assistance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <p className="text-foreground/60">Our team will create professional listings based on your portfolio and services.</p>
                    
                    <div className="space-y-3">
                      <div 
                        onClick={() => setSelectedPlan('free')}
                        className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                          selectedPlan === 'free' ? 'border-vendor-gold bg-secondary/10' : 'border-border hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-foreground font-medium">Free Assistance</p>
                            <p className="text-sm text-foreground/60">2 listings • 5-7 days delivery</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">Free</Badge>
                        </div>
                      </div>

                      <div 
                        onClick={() => setSelectedPlan('paid')}
                        className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                          selectedPlan === 'paid' ? 'border-vendor-gold bg-secondary/10' : 'border-border hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-foreground font-medium">Premium Assistance</p>
                            <p className="text-sm text-foreground/60">5 listings • 24-48 hours delivery</p>
                          </div>
                          <Badge className="bg-secondary/20 text-secondary">₹499</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-foreground/60">Additional Notes</p>
                      <Textarea 
                        placeholder="Tell us about your services, specialties, and any specific requirements..."
                        className="bg-muted/50 border-border text-foreground"
                      />
                    </div>

                    <Button 
                      onClick={handleRequestOps}
                      disabled={!selectedPlan}
                      className="w-full bg-secondary text-secondary-foreground"
                    >
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tutorials */}
          <Card className="border-border shadow-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Tutorials
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {tutorials.map((tutorial) => (
                <div 
                  key={tutorial.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="p-3 rounded-xl bg-primary/20">
                    <tutorial.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{tutorial.title}</p>
                    <p className="text-sm text-foreground/60">{tutorial.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-white/20 text-foreground/60">{tutorial.duration}</Badge>
                    <ChevronRight className="h-4 w-4 text-foreground/40 group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card className="border-border shadow-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-secondary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between p-4 rounded-xl bg-muted/50 cursor-pointer list-none">
                    <span className="text-foreground font-medium">{faq.question}</span>
                    <ChevronRight className="h-4 w-4 text-foreground/40 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="p-4 text-foreground/60 text-sm">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Documentation */}
        <Card className="border-border shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'Getting Started', count: '12 articles' },
                { title: 'Listings & Packages', count: '8 articles' },
                { title: 'Bookings & Orders', count: '15 articles' },
                { title: 'Payments & Payouts', count: '10 articles' },
              ].map((doc, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/50 hover:bg-white/10 transition-colors cursor-pointer">
                  <p className="text-foreground font-medium">{doc.title}</p>
                  <p className="text-sm text-foreground/60">{doc.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
