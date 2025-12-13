import { Card, CardContent } from '@/shared/components/ui/card';
import { Search, Layers, CalendarCheck } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse Vendors',
    description: 'Explore portfolios, packages, and real event photos',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Layers,
    title: 'Choose Packages',
    description: 'Fixed pricing + add your customizations',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    icon: CalendarCheck,
    title: 'Book Instantly',
    description: 'Pay securely and get confirmed vendors',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">How It Works</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Three simple steps to book your perfect event vendors
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="text-center border-0 shadow-card hover-lift rounded-2xl"
              >
                <CardContent className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
                  <div className={`inline-flex p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl ${step.bgColor} ${step.color}`}>
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl font-bold text-muted-foreground">0{index + 1}</span>
                    <h3 className="text-xl sm:text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};


