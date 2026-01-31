import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

const faqs = [
  {
    question: 'What is cartevent?',
    answer: 'cartevent is an event service marketplace connecting vendors with people planning events. Discover, compare, and book trusted vendors for weddings, birthdays, corporate events, and more — all in one place.',
  },
  {
    question: 'Who are vendors and customers?',
    answer: 'Vendors are event professionals — photographers, decorators, caterers, DJs, makeup artists, and more — who offer their services through cartevent. Customers are individuals or businesses looking to book these services for their events.',
  },
  {
    question: 'What problem does cartevent solve?',
    answer: 'Finding reliable event vendors is often stressful and time-consuming. cartevent bridges this gap by providing a curated platform where customers can easily browse verified vendors, compare prices, read reviews, and book services — while vendors get a professional storefront to showcase their work and receive leads.',
  },
  {
    question: 'Is cartevent available for customers yet?',
    answer: 'We\'re currently in Phase 1, focused on onboarding quality vendors. Customer bookings are coming soon! Join our waitlist to be notified when we launch for customers.',
  },
  {
    question: 'How can I join as a vendor?',
    answer: 'Click "Join as Vendor" to create your free account. Set up your profile, add your services and pricing, upload your portfolio, and start receiving leads once we launch for customers.',
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-amber-50/80 via-orange-50/50 to-amber-50/80 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <Badge className="mb-3 bg-white text-primary border-primary/20 px-4 py-1.5 text-xs font-medium shadow-sm hover:bg-white hover:text-primary hover:border-primary/30 transition-all duration-200">
            <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
            FAQ
          </Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Everything you need to know about cartevent
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={cn(
                  "rounded-xl border transition-all duration-300 cursor-pointer group",
                  isOpen 
                    ? "bg-white dark:bg-slate-900 border-primary/30 shadow-lg shadow-primary/10 scale-[1.01]" 
                    : "bg-white dark:bg-slate-900/50 border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01] hover:-translate-y-0.5"
                )}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <button
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={cn(
                    "font-medium text-sm md:text-base pr-4 transition-colors duration-200",
                    isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                  )}>
                    {faq.question}
                  </span>
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    isOpen 
                      ? "bg-primary text-white rotate-180" 
                      : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                  )}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
