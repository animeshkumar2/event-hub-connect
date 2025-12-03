import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/shared/contexts/CartContext";
import Home from "@/features/home/Home";
import Search from "@/features/search/Search";
import VendorDetails from "@/features/vendor/VendorDetails";
import Auth from "@/features/auth/Auth";
import NotFound from "@/features/home/NotFound";
import Cart from "@/features/cart/Cart";
import Checkout from "@/features/cart/Checkout";
import EventPlanner from "@/features/booking/EventPlanner";
import BookingSuccess from "@/features/booking/BookingSuccess";
import TestImageUpload from "@/features/vendor/TestImageUpload";

// Vendor Pages
import VendorOnboarding from "@/features/vendor/pages/VendorOnboarding";
import VendorDashboard from "@/features/vendor/pages/VendorDashboard";
import VendorProfile from "@/features/vendor/pages/VendorProfile";
import VendorCalendar from "@/features/vendor/pages/VendorCalendar";
import VendorLeads from "@/features/vendor/pages/VendorLeads";
import VendorListings from "@/features/vendor/pages/VendorListings";
import VendorOrders from "@/features/vendor/pages/VendorOrders";
import VendorChat from "@/features/vendor/pages/VendorChat";
import VendorWallet from "@/features/vendor/pages/VendorWallet";
import VendorAnalytics from "@/features/vendor/pages/VendorAnalytics";
import VendorReviews from "@/features/vendor/pages/VendorReviews";
import VendorSettings from "@/features/vendor/pages/VendorSettings";
import VendorHelp from "@/features/vendor/pages/VendorHelp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/vendor/:vendorId" element={<VendorDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/event-planner" element={<EventPlanner />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/test-upload" element={<TestImageUpload />} />
            
            {/* Vendor Routes */}
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />
            <Route path="/vendor/calendar" element={<VendorCalendar />} />
            <Route path="/vendor/leads" element={<VendorLeads />} />
            <Route path="/vendor/listings" element={<VendorListings />} />
            <Route path="/vendor/orders" element={<VendorOrders />} />
            <Route path="/vendor/chat" element={<VendorChat />} />
            <Route path="/vendor/wallet" element={<VendorWallet />} />
            <Route path="/vendor/analytics" element={<VendorAnalytics />} />
            <Route path="/vendor/reviews" element={<VendorReviews />} />
            <Route path="/vendor/settings" element={<VendorSettings />} />
            <Route path="/vendor/help" element={<VendorHelp />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
