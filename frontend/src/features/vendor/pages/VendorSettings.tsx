import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent } from '@/shared/components/ui/card';
import { 
  FileText, 
  Mail,
  Phone
} from 'lucide-react';

export default function VendorSettings() {
  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-foreground/60">Manage your account preferences</p>
          </div>
        </div>

        {/* Post Launch Notice */}
        <Card className="border-border shadow-card">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Settings Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              These will be enabled post launch for tutorials and Documentation section.
            </p>
            
            {/* Contact Support */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Call Us</p>
                  <a href="tel:8455943587" className="text-foreground font-medium hover:text-primary transition-colors">
                    +91 84559 43587
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Email Support</p>
                  <a href="mailto:support@cartevent.com" className="text-foreground font-medium hover:text-primary transition-colors">
                    support@cartevent.com
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
