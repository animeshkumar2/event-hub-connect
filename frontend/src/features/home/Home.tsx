import { MinimalNavbar } from '@/features/home/MinimalNavbar';
import { CinematicHero } from '@/features/home/CinematicHero';
import { InteractiveEventShowcase } from '@/features/home/InteractiveEventShowcase';
import { CategoryServicesSection } from '@/features/home/CategoryServicesSection';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Star, Zap, Shield, Award } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const Home = () => {
  // How It Works steps for floating card
  const howItWorksSteps = [
    {
      step: '01',
      icon: Sparkles,
      title: 'Browse & Discover',
      description: 'Explore portfolios and packages',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      step: '02',
      icon: Zap,
      title: 'Customize & Book',
      description: 'Add customizations and select date',
      color: 'from-purple-500 to-pink-500',
    },
    {
      step: '03',
      icon: CheckCircle2,
      title: 'Pay & Confirm',
      description: 'Secure payment and instant confirmation',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <MinimalNavbar />

      {/* Cinematic Hero Section */}
      <div className="relative overflow-hidden">
        <CinematicHero />
      </div>

      {/* How It Works - Floating Above Next Section */}
      <section className="relative -mt-16 z-20 mb-16">
        <div className="container mx-auto px-4">
          <Card className={cn(
            "bg-white/95 backdrop-blur-md shadow-xl border-0 rounded-xl overflow-hidden animate-on-scroll",
            "animate-fade-in-up"
          )} ref={(el) => {
            const observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                  }
                });
              },
              { threshold: 0.1 }
            );
            if (el) observer.observe(el);
          }}>
            <CardContent className="p-4 md:p-6">
              {/* Steps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {howItWorksSteps.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/30 p-3 md:p-4 group hover:shadow-md transition-all duration-300 hover-lift",
                        "animate-on-scroll"
                      )}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        opacity: 0,
                      }}
                      ref={(el) => {
                        const observer = new IntersectionObserver(
                          (entries) => {
                            entries.forEach((entry) => {
                              if (entry.isIntersecting) {
                                entry.target.classList.add('visible');
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                              }
                            });
                          },
                          { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
                        );
                        if (el) observer.observe(el);
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} text-white shadow-md`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-2xl md:text-3xl font-black text-muted-foreground/20">
                            {item.step}
                          </div>
                        </div>
                        <h3 className="text-sm md:text-base font-bold mb-1 text-foreground">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Event Showcase */}
      <InteractiveEventShowcase />

      {/* Category Services Section */}
      <CategoryServicesSection />

      {/* Footer - Enhanced */}
      <footer className="border-t border-border py-10 md:py-12 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 mb-8">
            <div>
              <h3 className="font-black text-xl mb-3 text-[#5046E5]">
                cartevent<span className="text-[#7C6BFF]">.</span>
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                Your one-stop marketplace for all event services. Book trusted vendors with transparent pricing.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-base mb-3">For Customers</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Find Vendors
                  </Link>
                </li>
                <li>
                  <Link to="/event-planner" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Event Planner
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-3">For Vendors</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/vendor/signup" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Become a Vendor
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/login" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Vendor Login
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/benefits" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Vendor Benefits
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/pricing" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Commission Rates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-3">Support</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground text-center md:text-left">
                © 2025 cartevent. All rights reserved.
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/cookies" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
