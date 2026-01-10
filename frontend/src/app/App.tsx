import { lazy, Suspense } from "react";
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/shared/contexts/CartContext";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { PreLaunchProvider, PreLaunchGuard } from "@/shared/contexts/PreLaunchContext";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { useEffect } from "react";
import { publicApi } from "@/shared/services/api";
import { Loader2 } from "lucide-react";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Google OAuth Client ID - Replace with your actual client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Eagerly loaded pages (critical path)
import Home from "@/features/home/Home";
import Search from "@/features/search/Search";
import VendorDetails from "@/features/vendor/VendorDetails";
import Auth from "@/features/auth/Auth";
import ForgotPassword from "@/features/auth/ForgotPassword";
import ResetPassword from "@/features/auth/ResetPassword";
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
const VendorListingsDrafts = lazy(() => import("@/features/vendor/pages/VendorListingsDrafts"));
const VendorListingsPackages = lazy(() => import("@/features/vendor/pages/VendorListingsPackages"));
const VendorListingsItems = lazy(() => import("@/features/vendor/pages/VendorListingsItems"));
const VendorOrders = lazy(() => import("@/features/vendor/pages/VendorOrders"));
const VendorBookings = lazy(() => import("@/features/vendor/pages/VendorBookings"));
const VendorChat = lazy(() => import("@/features/vendor/pages/VendorChat"));
const VendorWallet = lazy(() => import("@/features/vendor/pages/VendorWallet"));
const VendorAnalytics = lazy(() => import("@/features/vendor/pages/VendorAnalytics"));
const VendorReviews = lazy(() => import("@/features/vendor/pages/VendorReviews"));
const VendorFAQs = lazy(() => import("@/features/vendor/pages/VendorFAQs"));
// PHASE 1: Settings removed - not needed for initial release
// const VendorSettings = lazy(() => import("@/features/vendor/pages/VendorSettings"));
const VendorHelp = lazy(() => import("@/features/vendor/pages/VendorHelp"));
const VendorLandingPage = lazy(() => import("@/features/vendor/pages/VendorLandingPage"));
const VendorTerms = lazy(() => import("@/features/vendor/pages/VendorTerms"));
const VendorPrivacy = lazy(() => import("@/features/vendor/pages/VendorPrivacy"));
const TestImageUpload = lazy(() => import("@/features/vendor/TestImageUpload"));

// Admin pages
const AdminLogin = lazy(() => import("@/features/admin/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/features/admin/pages/AdminDashboard"));
const AdminVendorsList = lazy(() => import("@/features/admin/pages/AdminVendorsList"));
const AdminVendorDetail = lazy(() => import("@/features/admin/pages/AdminVendorDetail"));
const AdminListingsList = lazy(() => import("@/features/admin/pages/AdminListingsList"));

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
    // Prefetch eventTypes, categories, and stats in parallel immediately on app load
    // This ensures they're available when user navigates to pages
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
      queryClient.prefetchQuery({
        queryKey: ['stats'],
        queryFn: async () => {
          const response = await publicApi.getStats();
          if (!response || !response.success) {
            return null;
          }
          const responseData = response.data;
          // Unwrap if data has nested data property (same logic as unwrapResponse)
          if (responseData && typeof responseData === 'object' && 'data' in responseData) {
            return (responseData as any).data;
          }
          return responseData;
        },
        staleTime: 10 * 1000, // 10 seconds for stats
      }),
    ]).catch(err => {
      console.error('Error prefetching critical data:', err);
    });
  }, [queryClient]);
  
  return null;
}

const App = () => (
  <ErrorBoundary>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <PrefetchCriticalData />
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <PreLaunchProvider>
              <Routes>
            {/* Home Route - Accessible to everyone (even in pre-launch) */}
            <Route path="/" element={<Home />} />
            
            {/* Customer Routes - Protected by PreLaunchGuard */}
            <Route path="/search" element={<PreLaunchGuard><Search /></PreLaunchGuard>} />
            <Route path="/listing/:listingId" element={<PreLaunchGuard><ListingDetail /></PreLaunchGuard>} />
            <Route path="/vendor/:vendorId" element={<PreLaunchGuard><VendorDetails /></PreLaunchGuard>} />
            <Route path="/cart" element={<PreLaunchGuard><Cart /></PreLaunchGuard>} />
            <Route path="/checkout" element={<PreLaunchGuard><Checkout /></PreLaunchGuard>} />
            <Route path="/event-planner" element={<PreLaunchGuard><EventPlanner /></PreLaunchGuard>} />
            <Route path="/booking-success" element={<PreLaunchGuard><BookingSuccess /></PreLaunchGuard>} />
            
            {/* Auth Routes - Always accessible */}
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
            
            {/* User Routes - Protected by PreLaunchGuard */}
            <Route path="/profile" element={<PreLaunchGuard><UserProfile /></PreLaunchGuard>} />
            <Route path="/orders/:orderId" element={<PreLaunchGuard><OrderDetails /></PreLaunchGuard>} />
            
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
            <Route path="/vendor/listings/drafts" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorListingsDrafts />
              </Suspense>
            } />
            <Route path="/vendor/listings/packages" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorListingsPackages />
              </Suspense>
            } />
            <Route path="/vendor/listings/items" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorListingsItems />
              </Suspense>
            } />
            <Route path="/vendor/bookings" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorBookings />
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
            {/* PHASE 1: Settings route removed - not needed for initial release */}
            {/* <Route path="/vendor/settings" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorSettings />
              </Suspense>
            } /> */}
            <Route path="/vendor/help" element={
              <Suspense fallback={<LoadingFallback />}>
                <VendorHelp />
              </Suspense>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminLogin />
              </Suspense>
            } />
            <Route path="/admin/dashboard" element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            } />
            <Route path="/admin/vendors" element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminVendorsList />
              </Suspense>
            } />
            <Route path="/admin/vendors/:vendorId" element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminVendorDetail />
              </Suspense>
            } />
            <Route path="/admin/listings" element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminListingsList />
              </Suspense>
            } />
            
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<PreLaunchGuard><NotFound /></PreLaunchGuard>} />
              </Routes>
              </PreLaunchProvider>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
  </ErrorBoundary>
);

export default App;
