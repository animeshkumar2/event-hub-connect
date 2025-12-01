import { Card, CardContent } from '@/components/ui/card';
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
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to book your perfect event vendors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="text-center border-0 shadow-card hover-lift rounded-2xl"
              >
                <CardContent className="p-8 space-y-4">
                  <div className={`inline-flex p-6 rounded-2xl ${step.bgColor} ${step.color}`}>
                    <Icon className="h-12 w-12" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-muted-foreground">0{index + 1}</span>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};


