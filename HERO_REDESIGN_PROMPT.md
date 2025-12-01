# Hero Section Redesign Prompt

## Product Overview

I'm building **Event Hub Connect** - a comprehensive event vendor marketplace platform that connects users with verified event service providers. The platform allows users to:

- **Browse and discover** vendors across multiple categories (Photographers, Decorators, DJs, Makeup Artists, Caterers, Event Coordinators, etc.)
- **Book multiple vendors** in a single checkout for complete event planning
- **Customize packages** with add-ons and personalized options
- **View real event photos** and portfolios from verified vendors
- **Get AI-powered recommendations** based on budget and event details
- **Book exact setups** they see in vendor portfolios

The platform serves various event types: Weddings, Birthdays, Corporate Events, Anniversaries, Engagements, Baby Showers, and more.

## Current Brand Theme & Design System

### Color Palette
- **Primary Color**: Deep Indigo (HSL: 245 58% 51%) - Represents premium, trustworthy, professional
- **Primary Glow**: Lighter Indigo (HSL: 245 70% 65%) - Used for gradients and highlights
- **Secondary Color**: Warm Amber (HSL: 38 92% 50%) - Represents energy, celebration, joy
- **Background**: Clean white (HSL: 0 0% 100%)
- **Foreground**: Dark slate (HSL: 240 10% 3.9%)

### Design Philosophy
- **Premium & Elegant**: High-end, sophisticated aesthetic
- **Trustworthy & Professional**: Clean, reliable, business-focused
- **Celebratory & Energetic**: Warm accents that convey celebration and joy
- **Modern & Minimal**: Clean lines, ample whitespace, contemporary feel

### Typography
- **Headings**: Ultra-bold, black weight (font-black), large scale (text-6xl to text-9xl)
- **Body**: Light weight, spacious tracking
- **Gradients**: Text gradients using primary-to-primary-glow-to-secondary for emphasis

### Current Hero Section Structure
- Full viewport height (100vh)
- Single background image with 3px blur and dark gradient overlays
- Left-aligned content with bold typography
- Two alternating text slides (5-second intervals):
  1. "Find All Your Event Vendors" with vendor categories list
  2. "Plan Your Complete Event Experience" with event planner CTA
- Gradient buttons with icons (Browse Categories / Start Planning Now)
- Dark gradient overlays for text readability

## Redesign Requirements

I need a **complete hero section redesign** that:

### 1. Maintains Brand Identity
- Keep the **Deep Indigo** and **Warm Amber** color scheme
- Preserve the premium, elegant, trustworthy aesthetic
- Maintain the sophisticated, professional feel

### 2. Heavy Motion & Animation
- **Background**: Implement dynamic, cinematic video backgrounds or animated graphics showing:
  - Real event moments (weddings, celebrations, corporate events)
  - Vendor services in action (photography, decoration, catering, DJ performances)
  - Smooth transitions between different event types
  - Parallax effects and depth layers
  
- **Text Animations**: 
  - Smooth fade-in/slide-in animations for headlines
  - Typography that comes alive with motion
  - Dynamic gradient text effects
  - Staggered animations for different elements

- **Interactive Elements**:
  - Hover effects on CTAs
  - Floating particles or sparkles
  - Animated icons and graphics
  - Micro-interactions that respond to user actions

### 3. Visual Enhancements
- **Graphics**: 
  - Animated illustrations or icons representing different vendor categories
  - Decorative elements that enhance without overwhelming
  - Visual hierarchy that guides the eye naturally
  
- **Video/Media**:
  - Cinematic background videos showcasing events
  - Smooth transitions between video clips
  - Overlay effects that maintain text readability

### 4. Technical Specifications
- Built with **React** and **TypeScript**
- Using **Tailwind CSS** for styling
- **shadcn-ui** components for UI elements
- Must be performant and optimized
- Responsive design (mobile, tablet, desktop)
- Smooth 60fps animations

### 5. Content Structure
The hero should prominently feature:
- **Main Headline**: "BOOK EVENT VENDORS" (or similar impactful statement)
- **Subheadline**: Alternating between:
  - "Find All Your Event Vendors" with category list
  - "Plan Your Complete Event Experience" with value proposition
- **Primary CTAs**: 
  - "Browse Categories" button
  - "Start Planning Now" button
- **Visual Elements**: Event imagery, vendor category icons, celebration graphics

### 6. Design Goals
- **Impact**: Create a "wow" factor that immediately captures attention
- **Emotion**: Evoke feelings of celebration, elegance, and excitement
- **Clarity**: Maintain clear messaging despite heavy motion
- **Conversion**: Drive users to explore categories or start planning
- **Performance**: Fast loading, smooth animations, no jank

## Deliverables Expected

1. **Complete React Component** with TypeScript
2. **Tailwind CSS** styling that matches the brand theme
3. **Animation implementations** (using CSS animations, Framer Motion, or similar)
4. **Video/graphic recommendations** or placeholder implementations
5. **Responsive design** for all screen sizes
6. **Performance optimizations** (lazy loading, optimized animations)
7. **Code comments** explaining key animation and design decisions

## Inspiration Direction

Think: **Apple product launches** meets **luxury event planning** meets **modern SaaS platforms**. The hero should feel cinematic, premium, and celebratory while maintaining professionalism and trustworthiness.

---

**Please create a hero section that transforms our current static design into a dynamic, motion-rich experience while staying true to our Deep Indigo and Warm Amber brand identity.**


