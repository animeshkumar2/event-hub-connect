# Frontend - Event Hub Connect

React + TypeScript + Vite frontend application.

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Application entry point
│   │   ├── App.tsx            # Main app component with routing
│   │   ├── main.tsx           # React entry point
│   │   ├── index.css          # Global styles
│   │   └── App.css            # App-specific styles
│   │
│   ├── features/              # Feature-based modules
│   │   ├── home/              # Home page feature
│   │   │   ├── Home.tsx
│   │   │   ├── Index.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── MinimalNavbar.tsx
│   │   │   ├── CinematicHero.tsx
│   │   │   ├── PremiumHero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── InteractiveEventShowcase.tsx
│   │   │   └── FuturisticCategoryCarousel.tsx
│   │   │
│   │   ├── search/            # Search & browse feature
│   │   │   ├── Search.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── CategoryNavigation.tsx
│   │   │   ├── CategoryTile.tsx
│   │   │   ├── PackageCard.tsx
│   │   │   ├── PremiumPackageCard.tsx
│   │   │   ├── PackageTypeFilters.tsx
│   │   │   └── TrendingSetupCard.tsx
│   │   │
│   │   ├── vendor/            # Vendor feature
│   │   │   ├── VendorDetails.tsx
│   │   │   ├── VendorCard.tsx
│   │   │   ├── PremiumVendorCard.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── AvailabilityCalendar.tsx
│   │   │   ├── BookExactSetup.tsx
│   │   │   ├── PackageCustomization.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── PremiumChatWindow.tsx
│   │   │   ├── TestImageUpload.tsx
│   │   │   ├── components/    # Vendor-specific components
│   │   │   │   ├── VendorLayout.tsx
│   │   │   │   └── VendorSidebar.tsx
│   │   │   └── pages/         # Vendor dashboard pages
│   │   │       ├── VendorDashboard.tsx
│   │   │       ├── VendorProfile.tsx
│   │   │       ├── VendorListings.tsx
│   │   │       └── ... (other vendor pages)
│   │   │
│   │   ├── auth/              # Authentication feature
│   │   │   └── Auth.tsx
│   │   │
│   │   ├── cart/              # Shopping cart feature
│   │   │   ├── Cart.tsx
│   │   │   └── Checkout.tsx
│   │   │
│   │   └── booking/           # Booking feature
│   │       ├── EventPlanner.tsx
│   │       └── BookingSuccess.tsx
│   │
│   └── shared/                # Shared code across features
│       ├── components/        # Reusable components
│       │   ├── ui/           # Shadcn UI components
│       │   └── NavLink.tsx
│       ├── hooks/            # Custom React hooks
│       │   ├── use-mobile.tsx
│       │   └── use-toast.ts
│       ├── utils/            # Utility functions
│       │   ├── packageUtils.ts
│       │   ├── packageFilters.ts
│       │   ├── packageSort.ts
│       │   └── storage.ts
│       ├── lib/              # Library configurations
│       │   ├── supabase.ts
│       │   └── utils.ts
│       ├── contexts/         # React contexts
│       │   └── CartContext.tsx
│       └── constants/        # Constants and mock data
│           └── mockData.ts
│
├── public/                    # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

## 🎯 Architecture Principles

### Feature-Based Organization
- Each feature is self-contained in its own directory
- Features can have their own components, hooks, and utilities
- Shared code goes in `shared/` directory

### Import Paths
- `@/app/*` - App-level code
- `@/features/*` - Feature modules
- `@/shared/*` - Shared utilities, components, hooks

### Example Imports

```typescript
// Feature-specific component
import { Navbar } from '@/features/home/Navbar';

// Shared component
import { Button } from '@/shared/components/ui/button';

// Shared utility
import { cn } from '@/shared/lib/utils';

// Shared hook
import { useToast } from '@/shared/hooks/use-toast';

// Shared constant
import { mockVendors } from '@/shared/constants/mockData';
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Adding New Features

1. Create feature directory in `src/features/`
2. Add feature-specific components
3. Use shared components from `@/shared/`
4. Add route in `src/app/App.tsx`

## 🔧 Configuration

- **Vite**: `vite.config.ts`
- **TypeScript**: `tsconfig.json`
- **Tailwind**: `tailwind.config.ts`
- **ESLint**: `eslint.config.js`

## 📦 Dependencies

See `package.json` for full list of dependencies.

Key libraries:
- React 18
- React Router
- TanStack Query
- Shadcn UI
- Supabase Client
- Tailwind CSS

