import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, Rocket, Mail, Calendar } from 'lucide-react';

export const LaunchingSoon = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0">
        <CardContent className="p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20">
              <Rocket className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Badge */}
          <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-4 py-2 shadow-lg uppercase tracking-wider border-0">
            Coming Soon
          </Badge>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Customer Features
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Launching Soon!
            </span>
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            We're currently onboarding vendors to build India's best event marketplace. 
            Customer features for browsing and booking will be available soon!
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Phase 1: Vendors</h3>
              <p className="text-xs text-muted-foreground">Currently onboarding service providers</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <Rocket className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Phase 2: Customers</h3>
              <p className="text-xs text-muted-foreground">Browse & book features coming soon</p>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Want to be notified?</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Reach out to us for updates on the customer launch
            </p>
            <a 
              href="mailto:cartevent.welcome@gmail.com" 
              className="text-sm font-medium text-primary hover:text-primary-glow transition-colors"
            >
              cartevent.welcome@gmail.com
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
              <Link to="/join-vendors">
                Are you a Vendor?
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
