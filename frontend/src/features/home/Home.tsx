import { MinimalNavbar } from '@/features/home/MinimalNavbar';
import { CinematicHero } from '@/features/home/CinematicHero';
import { InteractiveEventShowcase } from '@/features/home/InteractiveEventShowcase';
import { CategoryServicesSection } from '@/features/home/CategoryServicesSection';
import { PremiumVendorCard } from '@/features/vendor/PremiumVendorCard';
import { TrendingSetupCard } from '@/features/search/TrendingSetupCard';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Star, TrendingUp, Zap, Shield, Users, Award, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { mockVendors, eventTypes } from '@/shared/constants/mockData';
import { cn } from '@/shared/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { useStats } from '@/shared/hooks/useApi';
import { useScrollAnimation, useStaggerAnimation } from '@/shared/hooks/useScrollAnimation';

const Home = () => {
  // Fetch stats from API
  const { data: statsData, loading: statsLoading } = useStats();

  // Get trending setups
  const trendingSetups = mockVendors
    .filter(v => v.bookableSetups && v.bookableSetups.length > 0)
    .flatMap(v => 
      v.bookableSetups!.map(setup => ({
        setup,
        vendorName: v.businessName,
        city: v.city,
        eventType: 'Wedding',
      }))
    )
    .slice(0, 8);

  // State for trending setups carousel
  const [activeSetupIndex, setActiveSetupIndex] = useState(0);
  const [isSetupPaused, setIsSetupPaused] = useState(false);

  // Auto-rotate setups every 5 seconds
  useEffect(() => {
    if (isSetupPaused || trendingSetups.length === 0) return;

    const interval = setInterval(() => {
      setActiveSetupIndex((prev) => (prev + 1) % trendingSetups.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isSetupPaused, trendingSetups.length]);

  const goToNextSetup = () => {
    setActiveSetupIndex((prev) => (prev + 1) % trendingSetups.length);
  };

  const goToPreviousSetup = () => {
    setActiveSetupIndex((prev) => (prev - 1 + trendingSetups.length) % trendingSetups.length);
  };

  // Transform API stats to display format
  const stats = useMemo(() => {
    if (!statsData) {
      // Fallback to default stats while loading
      return [
        { icon: Users, value: '500+', label: 'Verified Vendors', color: 'text-blue-500' },
        { icon: Award, value: '10K+', label: 'Events Completed', color: 'text-purple-500' },
        { icon: Star, value: '4.8', label: 'Average Rating', color: 'text-yellow-500' },
        { icon: TrendingUp, value: '98%', label: 'Satisfaction Rate', color: 'text-green-500' },
      ];
    }

    return [
      { 
        icon: Users, 
        value: statsData.totalVendors ? `${statsData.totalVendors}+` : '500+', 
        label: 'Verified Vendors', 
        color: 'text-blue-500' 
      },
      { 
        icon: Award, 
        value: statsData.totalEventsCompleted ? `${statsData.totalEventsCompleted}+` : '10K+', 
        label: 'Events Completed', 
        color: 'text-purple-500' 
      },
      { 
        icon: Star, 
        value: statsData.averageRating ? statsData.averageRating.toFixed(1) : '4.8', 
        label: 'Average Rating', 
        color: 'text-yellow-500' 
      },
      { 
        icon: TrendingUp, 
        value: statsData.satisfactionRate ? `${Math.round(statsData.satisfactionRate)}%` : '98%', 
        label: 'Satisfaction Rate', 
        color: 'text-green-500' 
      },
    ];
  }, [statsData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <MinimalNavbar />

      {/* Cinematic Hero Section */}
      <CinematicHero />

      {/* Stats Bar - Floating Above Next Section */}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "text-center group animate-on-scroll",
                        `stagger-${index + 1}`
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
                      <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary-glow/10 mb-2 group-hover:scale-110 micro-bounce smooth-transition">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div className="text-2xl md:text-3xl font-black text-foreground mb-0.5">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {stat.label}
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

      {/* Trending Setups Section */}
      {trendingSetups.length > 0 && (
        <section 
          className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-b from-background to-muted/30"
          onMouseEnter={() => setIsSetupPaused(true)}
          onMouseLeave={() => setIsSetupPaused(false)}
          ref={(el) => {
            if (!el) return;
            const observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Animate the main card
                    const card = entry.target.querySelector('.trending-setup-card');
                    if (card) {
                      setTimeout(() => {
                        (card as HTMLElement).style.opacity = '1';
                        (card as HTMLElement).style.transform = 'translateY(0) scale(1)';
                      }, 200);
                    }
                  }
                });
              },
              { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
            );
            observer.observe(el);
          }}
        >
          {/* Sliding Background Images */}
          <div className="absolute inset-0">
            {trendingSetups.map((item, index) => (
              <div
                key={item.setup.id}
                className={cn(
                  'absolute inset-0 transition-opacity duration-1000 ease-in-out',
                  index === activeSetupIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
                )}
                style={{
                  backgroundImage: `url(${item.setup.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-800/70 to-blue-900/80" />
              </div>
            ))}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

          {/* Content */}
          <div className="relative z-20 container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1 text-xs font-medium">
                <TrendingUp className="h-3 w-3 mr-1.5" />
                Trending Now
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
                Book This
                <br />
                <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                  Exact Setup
                </span>
              </h2>
            </div>

            {/* Main Card Container */}
            <div className="relative max-w-5xl mx-auto">
              {/* Navigation Arrows */}
              <button
                onClick={goToPreviousSetup}
                className="absolute -left-3 md:-left-10 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 hover-lift micro-bounce smooth-transition"
                aria-label="Previous setup"
              >
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>

              <button
                onClick={goToNextSetup}
                className="absolute -right-3 md:-right-10 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 hover-lift micro-bounce smooth-transition"
                aria-label="Next setup"
              >
                <ChevronRight className="h-5 w-5 text-primary" />
              </button>

              {/* Active Card */}
              {trendingSetups[activeSetupIndex] && (
                <Card className={cn(
                  "trending-setup-card relative border-0 shadow-xl overflow-hidden bg-white rounded-xl animate-on-scroll",
                  "animate-scale-in"
                )} style={{
                  opacity: 0,
                  transform: 'translateY(40px) scale(0.95)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Image Side - Clear without blur */}
                    <div className="relative aspect-square md:aspect-auto md:h-[400px] overflow-hidden">
                      <img
                        src={trendingSetups[activeSetupIndex].setup.image}
                        alt={trendingSetups[activeSetupIndex].setup.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content Side */}
                    <CardContent className="flex flex-col justify-between p-5 md:p-6 bg-gradient-to-br from-slate-50 to-white">
                      <div className="space-y-3">
                        {/* Badge */}
                        <Badge className="bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 text-xs font-medium w-fit">
                          {trendingSetups[activeSetupIndex].setup.category}
                        </Badge>

                        {/* Title - Smaller */}
                        <h3 className="text-xl md:text-2xl font-black text-foreground leading-tight">
                          {trendingSetups[activeSetupIndex].setup.title}
                        </h3>

                        {/* Description - Smaller */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {trendingSetups[activeSetupIndex].setup.description}
                        </p>

                        {/* Stats - Smaller */}
                        <div className="flex items-center gap-4 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                              <Users className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="text-base font-bold text-foreground">{trendingSetups[activeSetupIndex].vendorName}</div>
                              <div className="text-xs text-muted-foreground">Vendor</div>
                            </div>
                          </div>
                          <div className="h-6 w-px bg-border" />
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="text-base font-bold text-foreground">{trendingSetups[activeSetupIndex].city}</div>
                              <div className="text-xs text-muted-foreground">Location</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Price</div>
                          <div className="text-xl md:text-2xl font-black text-primary">
                            ₹{trendingSetups[activeSetupIndex].setup.price.toLocaleString()}
                          </div>
                        </div>
                        <Button 
                          size="default" 
                          className="w-full sm:w-auto text-sm px-6 py-5 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary font-semibold shadow-lg hover-lift transition-all duration-300 group"
                          asChild
                        >
                          <Link to={`/vendor/${trendingSetups[activeSetupIndex].setup.vendorId}`}>
                            Book This Setup
                            <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>

                    {/* Progress Indicator */}
                    {!isSetupPaused && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-5000 ease-linear"
                          style={{
                            width: '0%',
                          }}
                          key={activeSetupIndex}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Card Indicators */}
            <div className="mt-8 flex justify-center gap-2">
              {trendingSetups.map((item, index) => (
                <button
                  key={item.setup.id}
                  onClick={() => setActiveSetupIndex(index)}
                  className={cn(
                    'relative h-2 rounded-full transition-all duration-500',
                    index === activeSetupIndex
                      ? 'w-12 bg-white'
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  )}
                  aria-label={`Go to ${item.setup.title}`}
                >
                  {index === activeSetupIndex && (
                    <div className="absolute inset-0 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Vendors Section */}
      <section 
        className="relative py-12 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden"
        ref={(el) => {
          if (!el) return;
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
                  // Animate children with stagger
                  const cards = entry.target.querySelectorAll('.vendor-card');
                  cards.forEach((card, index) => {
                    setTimeout(() => {
                      (card as HTMLElement).style.opacity = '1';
                      (card as HTMLElement).style.transform = 'translateY(0)';
                    }, index * 100);
                  });
                }
              });
            },
            { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
          );
          observer.observe(el);
        }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-glow rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className={cn(
            "mb-8 text-center animate-on-scroll",
            "animate-fade-in-up"
          )} ref={(el) => {
            if (!el) return;
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
            observer.observe(el);
          }}>
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-medium">
              <Star className="h-3 w-3 mr-1.5 fill-primary text-primary" />
              Top Rated
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 leading-tight">
              Featured
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent animate-gradient-text">
                Vendors
              </span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Top-rated professionals ready to make your event special
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {mockVendors.slice(0, 6).map((vendor, index) => (
              <div
                key={vendor.id}
                className="vendor-card animate-on-scroll"
                style={{
                  opacity: 0,
                  transform: 'translateY(40px)',
                  transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                }}
              >
                <PremiumVendorCard vendor={vendor} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="default" asChild className="rounded-lg border-2 hover-lift text-sm px-6 py-5">
              <Link to="/search">
                View All Vendors
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section 
        className="py-12 md:py-20 bg-background relative"
        ref={(el) => {
          if (!el) return;
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
                  // Animate step cards with stagger
                  const cards = entry.target.querySelectorAll('.step-card');
                  cards.forEach((card, index) => {
                    setTimeout(() => {
                      (card as HTMLElement).style.opacity = '1';
                      (card as HTMLElement).style.transform = 'translateY(0) scale(1)';
                    }, index * 150);
                  });
                }
              });
            },
            { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
          );
          observer.observe(el);
        }}
      >
        <div className="container mx-auto px-4">
          <div className={cn(
            "text-center mb-10 animate-on-scroll",
            "animate-fade-in-up"
          )} ref={(el) => {
            if (!el) return;
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
            observer.observe(el);
          }}>
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-medium">
                <span>Simple Process</span>
              </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to book your perfect event vendors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                icon: Sparkles,
                title: 'Browse & Discover',
                description: 'Explore portfolios, packages, and real event photos from verified vendors',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                step: '02',
                icon: Zap,
                title: 'Customize & Book',
                description: 'Fixed pricing + add your customizations. Select date and time instantly',
                color: 'from-purple-500 to-pink-500',
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Pay & Confirm',
                description: 'Pay securely and get instant booking confirmation. All vendors in one checkout',
                color: 'from-green-500 to-emerald-500',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className={cn(
                    "step-card relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover-lift rounded-xl group animate-on-scroll",
                    "animate-scale-in"
                  )}
                  style={{
                    opacity: 0,
                    transform: 'translateY(40px) scale(0.9)',
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg micro-bounce`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-4xl font-black text-muted-foreground/20">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="border-t border-border py-10 md:py-12 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 mb-8">
            <div>
              <h3 className="font-black text-xl mb-3 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                EventHub
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
                © 2025 EventHub. All rights reserved.
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
