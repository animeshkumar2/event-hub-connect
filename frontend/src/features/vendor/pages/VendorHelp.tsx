import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { 
  Search, 
  Video,
  MessageCircle,
  Phone,
  Mail,
  Sparkles
} from 'lucide-react';

export default function VendorHelp() {

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
                <a href="tel:8455943587" className="text-sm text-foreground/60 hover:text-primary transition-colors">
                  +91 84559 43587
                </a>
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
                <a href="mailto:support@cartevent.com" className="text-sm text-foreground/60 hover:text-primary transition-colors">
                  support@cartevent.com
                </a>
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
                  <h3 className="text-foreground font-semibold">Request Ops Assistance</h3>
                  <p className="text-foreground/60">Post Launch</p>
                </div>
              </div>
              <Button disabled className="bg-muted text-muted-foreground cursor-not-allowed">
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tutorials & Documentation - Post Launch */}
        <Card className="border-border shadow-card">
          <CardContent className="p-8 text-center">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Tutorials & Documentation</h3>
            <p className="text-muted-foreground">
              These will be enabled post launch for tutorials and Documentation section.
            </p>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
