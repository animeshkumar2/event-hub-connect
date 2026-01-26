import { useState } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { 
  Phone,
  Mail,
  ChevronDown,
  Clock,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Headphones,
  BookOpen,
  Zap
} from 'lucide-react';
import { SUPPORT_CONFIG } from '@/shared/config/supportConfig';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

export default function VendorHelp() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const copyToClipboard = async (text: string, type: 'phone' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'phone') {
        setCopiedPhone(text);
        setTimeout(() => setCopiedPhone(null), 2000);
      } else {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const { contact, hours, faqs } = SUPPORT_CONFIG;

  return (
    <VendorLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Headphones className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">How can we help?</h1>
          <p className="text-muted-foreground mt-2">
            Get support and answers to your questions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Call Support */}
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
            <CardContent className="p-0">
              <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Call Us</h3>
                    <p className="text-xs text-muted-foreground">Fastest response</p>
                  </div>
                  <Zap className="h-4 w-4 text-amber-500 ml-auto" />
                </div>
                
                <div className="space-y-2">
                  {contact.phones.map((phone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <a 
                        href={phone.href}
                        className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-card rounded-lg text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
                      >
                        <Phone className="h-4 w-4 text-primary" />
                        {phone.display}
                      </a>
                      <button
                        onClick={() => copyToClipboard(phone.number, 'phone')}
                        className="p-2.5 rounded-lg bg-white dark:bg-card hover:bg-primary/5 transition-colors"
                      >
                        {copiedPhone === phone.number ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="px-5 py-3 bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{hours.availability}</span>
              </div>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-violet-500/30">
            <CardContent className="p-0">
              <div className="p-5 bg-gradient-to-br from-violet-500/5 to-violet-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email Us</h3>
                    <p className="text-xs text-muted-foreground">Detailed queries</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <a 
                    href={contact.email.href}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-card rounded-lg text-sm font-medium text-foreground hover:bg-violet-500/5 transition-colors truncate"
                  >
                    <Mail className="h-4 w-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                    <span className="truncate">{contact.email.display}</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(contact.email.address, 'email')}
                    className="p-2.5 rounded-lg bg-white dark:bg-card hover:bg-violet-500/5 transition-colors flex-shrink-0"
                  >
                    {copiedEmail ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Response {hours.responseTime}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Frequently Asked Questions</h2>
              <p className="text-xs text-muted-foreground">Quick answers to common questions</p>
            </div>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={cn(
                  "rounded-xl border-2 transition-all duration-200 overflow-hidden",
                  expandedFaq === index 
                    ? "border-primary/20 bg-primary/5 shadow-sm" 
                    : "border-border hover:border-primary/20"
                )}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    expandedFaq === index ? "bg-primary/20" : "bg-muted"
                  )}>
                    <span className={cn(
                      "text-sm font-semibold",
                      expandedFaq === index ? "text-primary" : "text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                  </div>
                  <span className="flex-1 font-medium text-foreground text-sm">{faq.question}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    expandedFaq === index && "rotate-180"
                  )} />
                </button>
                
                {expandedFaq === index && (
                  <div className="px-4 pb-4">
                    <div className="pl-11">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: 'Listings', href: '/vendor/listings', color: 'text-blue-500 bg-blue-500/10' },
            { icon: MessageCircle, label: 'Leads', href: '/vendor/leads', color: 'text-green-500 bg-green-500/10' },
            { icon: HelpCircle, label: 'FAQs', href: '/vendor/faqs', color: 'text-amber-500 bg-amber-500/10' },
            { icon: ExternalLink, label: 'Profile', href: '/vendor/profile', color: 'text-violet-500 bg-violet-500/10' },
          ].map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary/20 hover:bg-muted/50 transition-all group"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", link.color)}>
                <link.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{link.label}</span>
            </a>
          ))}
        </div>

        {/* Support Hours Notice */}
        <Card className="border-2 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm mb-1">Support Hours</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {hours.fullDescription}
                </p>
                <p className="text-xs text-muted-foreground">
                  💡 {hours.urgentNote}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
