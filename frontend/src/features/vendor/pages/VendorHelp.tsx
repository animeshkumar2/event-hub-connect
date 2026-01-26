import { useState } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { 
  Phone,
  Mail,
  ChevronDown,
  Clock,
  MessageCircleQuestion,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { SUPPORT_CONFIG } from '@/shared/config/supportConfig';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

export default function VendorHelp() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0); // First one open by default
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2000);
      toast.success('Copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const { contact, hours, faqs } = SUPPORT_CONFIG;

  return (
    <VendorLayout>
      <div className="p-4 md:p-6 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-violet-600 p-6 md:p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium text-white/80">Support Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">We're here to help!</h1>
            <p className="text-white/80 text-sm md:text-base max-w-md">
              Have questions? Reach out to us anytime. We typically respond within 24 hours.
            </p>
          </div>
        </div>

        {/* Contact Options - Stacked on mobile, side by side on desktop */}
        <div className="grid gap-4">
          {/* Call Us */}
          <div className="bg-card border rounded-2xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Call Us</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                      Fastest
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{hours.availability}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {contact.phones.map((phone, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <a 
                      href={phone.href}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl text-sm font-semibold text-green-700 dark:text-green-400 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {phone.display}
                    </a>
                    <button
                      onClick={() => copyToClipboard(phone.number, `phone-${index}`)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="Copy number"
                    >
                      {copiedItem === `phone-${index}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Email Us */}
          <div className="bg-card border rounded-2xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email Us</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Response {hours.responseTime}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <a 
                  href={contact.email.href}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-xl text-sm font-semibold text-violet-700 dark:text-violet-400 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {contact.email.display}
                </a>
                <button
                  onClick={() => copyToClipboard(contact.email.address, 'email')}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Copy email"
                >
                  {copiedItem === 'email' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <MessageCircleQuestion className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="font-semibold text-lg text-foreground">Common Questions</h2>
            </div>
            <span className="text-xs text-muted-foreground">{faqs.length} FAQs</span>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={cn(
                  "rounded-xl border overflow-hidden transition-all duration-300",
                  expandedFaq === index 
                    ? "bg-gradient-to-r from-primary/5 to-violet-500/5 border-primary/20 shadow-sm" 
                    : "bg-card hover:border-primary/20"
                )}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 flex items-start gap-3 text-left"
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300",
                    expandedFaq === index 
                      ? "bg-primary text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="flex-1 font-medium text-foreground text-sm leading-relaxed pr-2">
                    {faq.question}
                  </span>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                    expandedFaq === index && "rotate-180 text-primary"
                  )} />
                </button>
                
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  expandedFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="px-4 pb-4 pl-14">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Hours Info - Simple footer */}
        <div className="text-center py-4 border-t">
          <p className="text-xs text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            Support available {hours.days} • {hours.availability}
          </p>
        </div>
      </div>
    </VendorLayout>
  );
}
