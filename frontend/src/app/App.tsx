import { lazy, Suspense } from "react";
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/shared/contexts/CartContext";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { useEffect } from "react";
import { publicApi } from "@/shared/services/api";
import { Loader2 } from "lucide-react";

// Eagerly loaded pages (critical path)
import Home from "@/features/home/Home";
import Search from "@/features/search/Search";
import VendorDetails from "@/features/vendor/VendorDetails";
import Auth from "@/features/auth/Auth";
import NotFound from "@/features/home/NotFound";
import Cart from "@/features/cart/Cart";
import Checkout from "@/features/cart/Checkout";
import EventPlanner from "@/features/booking/EventPlanner";
import BookingSuccess from "@/features/booking/BookingSuccess";
import ListingDetail from "@/features/listing/ListingDetail";
import UserProfile from "@/features/user/pages/UserProfile";
import OrderDetails from "@/features/user/pages/OrderDetails";

// Lazy loaded vendor pages (code splitting for better performance)
const VendorOnboarding = lazy(() => import("@/features/vendor/pages/VendorOnboarding"));
const VendorDashboard = lazy(() => import("@/features/vendor/pages/VendorDashboard"));
const VendorProfile = lazy(() => import("@/features/vendor/pages/VendorProfile"));
const VendorCalendar = lazy(() => import("@/features/vendor/pages/VendorCalendar"));
const VendorLeads = lazy(() => import("@/features/vendor/pages/VendorLeads"));
const VendorListings = lazy(() => import("@/features/vendor/pages/VendorListings"));
const VendorOrders = lazy(() => import("@/features/vendor/pages/VendorOrders"));
const VendorChat = lazy(() => import("@/features/vendor/pages/VendorChat"));
const VendorWallet = lazy(() => import("@/features/vendor/pages/VendorWallet"));
const VendorAnalytics = lazy(() => import("@/features/vendor/pages/VendorAnalytics"));
const VendorReviews = lazy(() => import("@/features/vendor/pages/VendorReviews"));
const VendorFAQs = lazy(() => import("@/features/vendor/pages/VendorFAQs"));
const VendorSettings = lazy(() => import("@/features/vendor/pages/VendorSettings"));
const VendorHelp = lazy(() => import("@/features/vendor/pages/VendorHelp"));
const VendorLandingPage = lazy(() => import("@/features/vendor/pages/VendorLandingPage"));
const VendorTerms = lazy(() => import("@/features/vendor/pages/VendorTerms"));
const VendorPrivacy = lazy(() => import("@/features/vendor/pages/VendorPrivacy"));
const TestImageUpload = lazy(() => import("@/features/vendor/TestImageUpload"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Configure QueryClient with optimal caching for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Data is fresh for 1 minute
      gcTime: 5 * 60 * 1000, // Cache data for 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Use cached data if available
      retry: 1, // Only retry once on failure
      retryDelay: 500, // Reduced to 500ms for faster retry
      // Network mode: prefer cache over network for faster initial load
      networkMode: 'offlineFirst', // Try cache first, then network
    },
  },
});

// Prefetch critical reference data on app initialization for faster first load
function PrefetchCriticalData() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Prefetch eventTypes and categories in parallel immediately on app load
    // This ensures they're available when user navigates to search page
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['eventTypes'],
        queryFn: async () => {
          const response = await publicApi.getEventTypes();
          return response.success ? response.data : null;
        },
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['categories'],
        queryFn: async () => {
          const response = await publicApi.getCategories();
          return response.success ? response.data : null;
        },
        staleTime: 5 * 60 * 1000,
      }),
    ]).catch(err => {
      console.error('Error prefetching critical data:', err);
    });
  }, [queryClient]);
  
  return null;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <PrefetchCriticalData />
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/listing/:listingId" element={<ListingDetail />} />
            <Route path="/vendor/:vendorId" element={<VendorDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/event-planner" element={<EventPlanner />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/for-vendors" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorLandingPage />
              </Suspense>
            } />
            <Route path="/vendor-terms" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorTerms />
              </Suspense>
            } />
            <Route path="/vendor-privacy" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorPrivacy />
              </Suspense>
            } />
            <Route path="/test-upload" element={
              <Suspense fallback={<LoadingFallback />}>
                <TestImageUpload />
              </Suspense>
            } />
            
            {/* User Routes */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            
            {/* Vendor Routes - Lazy loaded with Suspense */}
            <Route path="/vendor/onboarding" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorOnboarding />
              </Suspense>
            } />
            <Route path="/vendor/dashboard" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorDashboard />
              </Suspense>
            } />
            <Route path="/vendor/profile" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorProfile />
              </Suspense>
            } />
            <Route path="/vendor/calendar" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorCalendar />
              </Suspense>
            } />
            <Route path="/vendor/leads" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorLeads />
              </Suspense>
            } />
            <Route path="/vendor/listings" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorListings />
              </Suspense>
            } />
            <Route path="/vendor/orders" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorOrders />
              </Suspense>
            } />
            <Route path="/vendor/chat" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorChat />
              </Suspense>
            } />
            <Route path="/vendor/wallet" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorWallet />
              </Suspense>
            } />
            <Route path="/vendor/analytics" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorAnalytics />
              </Suspense>
            } />
            <Route path="/vendor/reviews" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorReviews />
              </Suspense>
            } />
            <Route path="/vendor/faqs" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorFAQs />
              </Suspense>
            } />
            <Route path="/vendor/settings" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorSettings />
              </Suspense>
            } />
            <Route path="/vendor/help" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorHelp />
              </Suspense>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
