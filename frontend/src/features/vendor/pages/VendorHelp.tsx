import { useState } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { 
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { SUPPORT_CONFIG } from '@/shared/config/supportConfig';

export default function VendorHelp() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Destructure config for easier access
  const { contact, hours, faqs } = SUPPORT_CONFIG;

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
          <p className="text-foreground/60">Get support and learn how to grow your business</p>
        </div>

        {/* Phase 1: Direct Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Support */}
          <Card className="border-border shadow-card hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/20 flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold mb-2">Call Us</h3>
                  <p className="text-sm text-foreground/60 mb-3">
                    Speak directly with our support team
                  </p>
                  <div className="space-y-2">
                    {contact.phones.map((phone, index) => (
                      <a 
                        key={index}
                        href={phone.href} 
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">{phone.display}</span>
                      </a>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs text-foreground/60">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Available: {hours.availability}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card className="border-border shadow-card hover:border-secondary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-secondary/20 flex-shrink-0">
                  <Mail className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-foreground/60 mb-3">
                    Send us your questions anytime
                  </p>
                  <a 
                    href={contact.email.href} 
                    className="flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">{contact.email.display}</span>
                  </a>
                  <div className="flex items-center gap-2 mt-4 text-xs text-foreground/60">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Response {hours.responseTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs Section */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-border rounded-lg overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-foreground/60 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-foreground/60 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-foreground/70 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* PHASE 2: Features commented out for future use */}
        {/* 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border shadow-card hover:border-vendor-gold/50 transition-colors cursor-pointer">
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
        </div>
        */}

        {/* PHASE 2: Ops Assistance - Commented out for future use */}
        {/*
        <Card className="border-border shadow-card border-vendor-gold/30 bg-gradient-to-r from-vendor-gold/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/20">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">Request Ops Assistance</h3>
                  <p className="text-foreground/60">Get help with operations</p>
                </div>
              </div>
              <Button className="bg-secondary text-secondary-foreground">
                Request Assistance
              </Button>
            </div>
          </CardContent>
        </Card>
        */}

        {/* PHASE 2: Tutorials & Documentation - Commented out for future use */}
        {/*
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Tutorials & Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Play className="h-8 w-8 text-foreground/40" />
                  </div>
                  <h4 className="font-medium text-foreground mb-1">Getting Started</h4>
                  <p className="text-sm text-foreground/60">Learn the basics</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        */}

        {/* Support Hours Notice */}
        <Card className="border-border shadow-card bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-2">Support Hours</h3>
                <p className="text-foreground/70 mb-3">
                  {hours.fullDescription}
                </p>
                <p className="text-sm text-foreground/60">
                  {hours.urgentNote} We typically respond to all queries {hours.responseTime}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
