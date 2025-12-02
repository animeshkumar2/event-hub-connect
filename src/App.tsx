import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Home from "./pages/Home";
import Search from "./pages/Search";
import VendorDetails from "./pages/VendorDetails";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import EventPlanner from "./pages/EventPlanner";
import BookingSuccess from "./pages/BookingSuccess";

// Vendor Pages
import VendorOnboarding from "./pages/vendor/VendorOnboarding";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorCalendar from "./pages/vendor/VendorCalendar";
import VendorLeads from "./pages/vendor/VendorLeads";
import VendorListings from "./pages/vendor/VendorListings";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorChat from "./pages/vendor/VendorChat";
import VendorWallet from "./pages/vendor/VendorWallet";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorReviews from "./pages/vendor/VendorReviews";
import VendorSettings from "./pages/vendor/VendorSettings";
import VendorHelp from "./pages/vendor/VendorHelp";

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
