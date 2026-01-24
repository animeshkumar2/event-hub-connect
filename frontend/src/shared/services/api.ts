/**
 * API Service Layer
 * Centralized API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Debug: Log the API URL being used (remove in production)
if (typeof window !== 'undefined') {
  console.log('[API] Base URL:', API_BASE_URL);
  console.log('[API] ENV VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
}

// API Performance Metrics Tracker
interface ApiMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: 'success' | 'error';
  timestamp: Date;
  statusCode?: number;
}

class ApiMetricsTracker {
  private metrics: ApiMetric[] = [];
  private maxMetrics = 100; // Keep last 100 calls

  add(metric: ApiMetric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    // Log with color coding based on duration
    const color = metric.duration < 200 ? '🟢' : metric.duration < 500 ? '🟡' : '🔴';
    console.log(
      `${color} [API ${metric.method}] ${metric.endpoint} - ${metric.duration}ms (${metric.status})`
    );
  }

  getMetrics() {
    return [...this.metrics];
  }

  getSummary() {
    if (this.metrics.length === 0) return null;
    
    const durations = this.metrics.map(m => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const slowest = this.metrics.reduce((a, b) => a.duration > b.duration ? a : b);
    const errorCount = this.metrics.filter(m => m.status === 'error').length;
    
    return {
      totalCalls: this.metrics.length,
      avgDuration: Math.round(avg),
      slowestCall: { endpoint: slowest.endpoint, duration: slowest.duration },
      errorRate: `${((errorCount / this.metrics.length) * 100).toFixed(1)}%`,
      slowCalls: this.metrics.filter(m => m.duration > 500).length,
    };
  }

  printSummary() {
    const summary = this.getSummary();
    if (!summary) {
      console.log('📊 No API metrics recorded yet');
      return;
    }
    console.log('📊 API Performance Summary:');
    console.table(summary);
    console.log('🐢 Slow calls (>500ms):');
    console.table(
      this.metrics
        .filter(m => m.duration > 500)
        .map(m => ({ endpoint: m.endpoint, duration: `${m.duration}ms`, method: m.method }))
    );
  }

  clear() {
    this.metrics = [];
  }
}

// Global metrics tracker - accessible via window.apiMetrics in browser console
export const apiMetrics = new ApiMetricsTracker();
if (typeof window !== 'undefined') {
  (window as any).apiMetrics = apiMetrics;
  console.log('💡 Tip: Use window.apiMetrics.printSummary() to see API performance stats');
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshPromise: Promise<boolean> | null = null; // Track ongoing refresh

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const startTime = performance.now();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Read token fresh from localStorage on each request
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : this.token;
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    // Get user ID from localStorage for header
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') : null;
    if (vendorId) {
      headers['X-Vendor-Id'] = vendorId;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      const duration = Math.round(performance.now() - startTime);

      // Handle 401 Unauthorized - try to refresh token
      // Skip token refresh for auth endpoints (login, register, etc.)
      const isAuthEndpoint = endpoint.includes('/auth/login') || 
                            endpoint.includes('/auth/register') || 
                            endpoint.includes('/auth/google') ||
                            endpoint.includes('/auth/refresh');
      
      if (response.status === 401 && !isRetry && !isAuthEndpoint) {
        console.log('🔄 401 detected, attempting token refresh...');
        
        // If refresh is already in progress, wait for it
        if (this.refreshPromise) {
          console.log('⏳ Refresh already in progress, waiting...');
          const refreshSuccess = await this.refreshPromise;
          if (refreshSuccess) {
            console.log('✅ Using refreshed token from parallel request');
            return this.request<T>(endpoint, options, true);
          } else {
            throw new Error('Session expired. Please log in again.');
          }
        }
        
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (refreshToken) {
          // Create refresh promise to prevent multiple simultaneous refreshes
          this.refreshPromise = (async () => {
            try {
              // Try to refresh the token
              const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': refreshToken,
                },
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.success && refreshData.data) {
                  const { token: newToken, refreshToken: newRefreshToken } = refreshData.data;
                  
                  // Update tokens
                  this.setToken(newToken);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('refresh_token', newRefreshToken);
                  }
                  
                  console.log('✅ Token refreshed successfully');
                  return true;
                }
              }
              
              console.error('❌ Token refresh failed - invalid response');
              return false;
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
              return false;
            } finally {
              // Clear the promise after completion
              this.refreshPromise = null;
            }
          })();
          
          const refreshSuccess = await this.refreshPromise;
          
          if (refreshSuccess) {
            console.log('✅ Token refreshed, retrying original request');
            // Retry the original request with new token
            return this.request<T>(endpoint, options, true);
          }
        }
        
        // If refresh failed or no refresh token, logout
        console.log('🚪 Logging out due to failed token refresh');
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login?session_expired=true';
        }
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Request failed' };
        }
        // Track error metric
        apiMetrics.add({
          endpoint,
          method,
          duration,
          status: 'error',
          timestamp: new Date(),
          statusCode: response.status,
        });
        // For 404 errors, return a structured error response
        if (response.status === 404) {
          console.error('API 404 Error:', errorData);
          return {
            success: false,
            message: errorData.message || errorData.details || 'Resource not found',
            data: null as T,
          };
        }
        console.error('API Error:', response.status, errorData);
        const errorMessage = errorData.message || errorData.details || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        // Attach error code and full response data to the error object
        (error as any).code = errorData.code;
        (error as any).errorCode = errorData.code;
        (error as any).response = { data: errorData };
        throw error;
      }

      const data = await response.json();
      
      // Track success metric
      apiMetrics.add({
        endpoint,
        method,
        duration,
        status: 'success',
        timestamp: new Date(),
        statusCode: response.status,
      });
      
      // Only log in development to reduce console noise and improve performance
      if (import.meta.env.DEV) {
        console.log('API Response:', endpoint, data);
      }
      
      // Handle ApiResponse wrapper - backend returns { success, data, message }
      if (data && typeof data === 'object' && 'success' in data) {
        // If success is false, return error response instead of throwing
        if (!data.success) {
          console.error('API returned success: false:', data);
          return {
            success: false,
            message: data.message || 'Request failed',
            data: null as T,
          };
        }
        return data;
      }
      
      // If response is not wrapped, wrap it
      return {
        success: true,
        data: data,
        message: 'Success'
      };
    } catch (error) {
      // Track error metric for network failures
      const duration = Math.round(performance.now() - startTime);
      apiMetrics.add({
        endpoint,
        method,
        duration,
        status: 'error',
        timestamp: new Date(),
      });
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Public API endpoints
export const publicApi = {
  // Stats
  getStats: () => apiClient.get<any>('/public/stats'),
  
  // Geocoding
  autocompleteLocation: (query: string, limit = 5) =>
    apiClient.get<any[]>(`/public/geocoding/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`),
  geocodeLocation: (query: string) =>
    apiClient.get<any>(`/public/geocoding/geocode?q=${encodeURIComponent(query)}`),
  reverseGeocode: (lat: number, lng: number) =>
    apiClient.get<any>(`/public/geocoding/reverse?lat=${lat}&lng=${lng}`),
  
  // Search
  searchListings: (params: {
    eventType?: number;
    category?: string;
    listingType?: string;
    city?: string;
    minBudget?: number;
    maxBudget?: number;
    q?: string;
    eventDate?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
    customerLat?: number;
    customerLng?: number;
    searchRadiusKm?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.eventType) queryParams.append('eventType', params.eventType.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.listingType) queryParams.append('listingType', params.listingType);
    if (params.city) queryParams.append('city', params.city);
    if (params.minBudget) queryParams.append('minBudget', params.minBudget.toString());
    if (params.maxBudget) queryParams.append('maxBudget', params.maxBudget.toString());
    if (params.q) queryParams.append('q', params.q);
    if (params.eventDate) queryParams.append('eventDate', params.eventDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.customerLat) queryParams.append('customerLat', params.customerLat.toString());
    if (params.customerLng) queryParams.append('customerLng', params.customerLng.toString());
    if (params.searchRadiusKm) queryParams.append('searchRadiusKm', params.searchRadiusKm.toString());
    
    return apiClient.get<any[]>(`/public/search/listings?${queryParams.toString()}`);
  },
  
  searchVendors: (params: {
    category?: string;
    city?: string;
    minBudget?: number;
    maxBudget?: number;
    q?: string;
    eventType?: number;
    eventDate?: string;
    sortBy?: string;
    customerLat?: number;
    customerLng?: number;
    searchRadiusKm?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.city) queryParams.append('city', params.city);
    if (params.minBudget) queryParams.append('minBudget', params.minBudget.toString());
    if (params.maxBudget) queryParams.append('maxBudget', params.maxBudget.toString());
    if (params.q) queryParams.append('q', params.q);
    if (params.eventType) queryParams.append('eventType', params.eventType.toString());
    if (params.eventDate) queryParams.append('eventDate', params.eventDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.customerLat) queryParams.append('customerLat', params.customerLat.toString());
    if (params.customerLng) queryParams.append('customerLng', params.customerLng.toString());
    if (params.searchRadiusKm) queryParams.append('searchRadiusKm', params.searchRadiusKm.toString());
    
    return apiClient.get<any[]>(`/public/search/vendors?${queryParams.toString()}`);
  },
  
  // Vendors
  getVendor: (vendorId: string) => apiClient.get<any>(`/public/vendors/${vendorId}`),
  getVendorPackages: (vendorId: string) => apiClient.get<any[]>(`/public/vendors/${vendorId}/packages`),
  getVendorListings: (vendorId: string) => apiClient.get<any[]>(`/public/vendors/${vendorId}/listings`),
  getVendorReviews: (vendorId: string, page = 0, size = 10) => 
    apiClient.get<any[]>(`/public/vendors/${vendorId}/reviews?page=${page}&size=${size}`),
  getVendorFAQs: (vendorId: string) => apiClient.get<any[]>(`/public/vendors/${vendorId}/faqs`),
  getVendorPastEvents: (vendorId: string) => apiClient.get<any[]>(`/public/vendors/${vendorId}/past-events`),
  getVendorBookableSetups: (vendorId: string) => apiClient.get<any[]>(`/public/vendors/${vendorId}/bookable-setups`),
  getVendorAvailability: (vendorId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiClient.get<any[]>(`/public/vendors/${vendorId}/availability?${params.toString()}`);
  },
  
  // Listings
  getPackage: (packageId: string) => apiClient.get<any>(`/public/packages/${packageId}`),
  getListing: (listingId: string) => apiClient.get<any>(`/public/listings/${listingId}`),
  getListingsByIds: (listingIds: string[]) => apiClient.post<any[]>('/public/listings/batch', listingIds),
  
  // Event Planner
  getRecommendations: (data: { budget: number; eventType: string; guestCount: number }) =>
    apiClient.post<any[]>('/public/event-planner/recommendations', data),
  
  // Reference data
  getEventTypes: () => apiClient.get<any[]>('/public/event-types'),
  getCategories: () => apiClient.get<any[]>('/public/categories'),
  getCities: () => apiClient.get<any[]>('/public/cities'),
  getEventTypeCategories: () => apiClient.get<any[]>('/public/event-type-categories'),
};

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; fullName: string; phone?: string; isVendor?: boolean }) =>
    apiClient.post<any>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<any>('/auth/login', data),
};

// Customer API
export const customerApi = {
  // Cart
  getCart: () => apiClient.get<any[]>('/customers/cart'),
  addToCart: (data: { listingId: string; quantity: number; addOnIds?: string[]; customizations?: any }) =>
    apiClient.post<any>('/customers/cart/items', data),
  updateCartItem: (itemId: string, data: { quantity?: number; addOnIds?: string[]; customizations?: any }) =>
    apiClient.put<any>(`/customers/cart/items/${itemId}`, data),
  removeFromCart: (itemId: string) => apiClient.delete<any>(`/customers/cart/items/${itemId}`),
  clearCart: () => apiClient.delete<any>('/customers/cart'),
  getCartSummary: () => apiClient.get<any>('/customers/cart/summary'),
  
  // Orders
  createOrder: (data: any) => apiClient.post<any>('/customers/orders', data),
  getOrders: () => apiClient.get<any[]>('/customers/orders'),
  getOrder: (orderId: string) => apiClient.get<any>(`/customers/orders/${orderId}`),
  
  // Payments
  initiatePayment: (orderId: string, paymentMethod: string) =>
    apiClient.post<any>(`/customers/payments/initiate?orderId=${orderId}&paymentMethod=${paymentMethod}`, {}),
  verifyPayment: (transactionId: string, paymentGatewayResponse?: string) =>
    apiClient.post<any>(`/customers/payments/verify?transactionId=${transactionId}`, { paymentGatewayResponse }),
  getPaymentStatus: (paymentId: string) => apiClient.get<any>(`/customers/payments/${paymentId}`),
  
  // Token Payments
  initiateTokenPayment: (orderId: string, data: { paymentMethod: string; paymentGateway?: string; returnUrl?: string }) =>
    apiClient.post<any>(`/payments/token/orders/${orderId}`, data),
  getTokenPaymentStatus: (paymentId: string) => apiClient.get<any>(`/payments/token/${paymentId}/status`),
  cancelOrderAndRefund: (orderId: string, reason?: string) =>
    apiClient.post<any>(`/payments/token/orders/${orderId}/cancel`, { reason }),
  mockCompletePayment: (paymentId: string) =>
    apiClient.post<any>(`/payments/token/mock-complete/${paymentId}`, {}),
  
  // Event Planner
  getRecommendations: (data: { budget: number; eventType: string; guestCount: number }) =>
    apiClient.post<any[]>('/public/event-planner/recommendations', data),
  
  // Chat
  getChatThreads: () => apiClient.get<any[]>('/customers/chat/threads'),
  getOrCreateThread: (vendorId: string) => apiClient.post<any>('/customers/chat/threads', { vendorId }),
  getMessages: (threadId: string, page = 0, size = 20) =>
    apiClient.get<any>(`/customers/chat/threads/${threadId}/messages?page=${page}&size=${size}`),
  sendMessage: (threadId: string, content: string) =>
    apiClient.post<any>(`/customers/chat/threads/${threadId}/messages`, { content }),
  markThreadAsRead: (threadId: string) =>
    apiClient.put<any>(`/customers/chat/threads/${threadId}/read`, {}),
  
  // Leads
  createLead: (data: any) => apiClient.post<any>('/customers/leads', data),
  getLeads: () => apiClient.get<any[]>('/customers/leads'),
  
  // Reviews
  submitReview: (orderId: string, data: { rating: number; comment: string; eventType?: string; images?: string[] }) =>
    apiClient.post<any>(`/customers/orders/${orderId}/review`, data),
  
  // Offers
  createOffer: (data: { threadId: string; listingId: string; offeredPrice: number; customizedPrice?: number; customization?: string; message?: string; eventType?: string; eventDate?: string; eventTime?: string; venueAddress?: string; guestCount?: number }) =>
    apiClient.post<any>('/customers/offers', data),
  getOffersByThread: (threadId: string) => apiClient.get<any[]>(`/customers/offers/thread/${threadId}`),
  getMyOffers: () => apiClient.get<any[]>('/customers/offers/my-offers'),
  getOffer: (offerId: string) => apiClient.get<any>(`/customers/offers/${offerId}`),
  acceptCounterOffer: (offerId: string) => apiClient.post<any>(`/customers/offers/${offerId}/accept-counter`, {}),
  withdrawOffer: (offerId: string) => apiClient.post<any>(`/customers/offers/${offerId}/withdraw`, {}),
};

// Vendor API
export const vendorApi = {
  // Onboarding
  onboard: (data: any) => apiClient.post<any>('/vendors/onboarding', data),
  
  // Profile
  getProfile: () => apiClient.get<any>('/vendors/profile'),
  updateProfile: (data: any) => apiClient.put<any>('/vendors/profile', data),
  getVendorByUserId: (userId: string) => apiClient.get<any>(`/vendors/by-user/${userId}`),
  
  // Location
  getLocation: () => apiClient.get<any>('/vendors/location'),
  updateLocation: (data: { locationName: string; latitude: number; longitude: number; serviceRadiusKm: number }) =>
    apiClient.put<any>('/vendors/location', data),
  
  // Listings
  getListings: () => apiClient.get<any[]>('/vendors/listings'),
  getListing: (listingId: string) => apiClient.get<any>(`/vendors/listings/${listingId}`),
  createPackage: (data: any) => apiClient.post<any>('/vendors/listings/packages', data),
  createItem: (data: any) => apiClient.post<any>('/vendors/listings/items', data),
  updateListing: (listingId: string, data: any) => apiClient.put<any>(`/vendors/listings/${listingId}`, data),
  deleteListing: (listingId: string) => apiClient.delete<any>(`/vendors/listings/${listingId}`),
  
  // Add-ons
  getPackageAddOns: (packageId: string) => apiClient.get<any[]>(`/vendors/listings/${packageId}/add-ons`),
  createAddOn: (packageId: string, data: any) => apiClient.post<any>(`/vendors/listings/${packageId}/add-ons`, data),
  updateAddOn: (packageId: string, addOnId: string, data: any) =>
    apiClient.put<any>(`/vendors/listings/${packageId}/add-ons/${addOnId}`, data),
  deleteAddOn: (packageId: string, addOnId: string) =>
    apiClient.delete<any>(`/vendors/listings/${packageId}/add-ons/${addOnId}`),
  
  // Orders (Legacy - kept for backward compatibility)
  getOrders: (status?: string, page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return apiClient.get<any>(`/vendors/orders?${params.toString()}`);
  },
  getOrder: (orderId: string) => apiClient.get<any>(`/vendors/orders/${orderId}`),
  updateOrderStatus: (orderId: string, status: string) =>
    apiClient.put<any>(`/vendors/orders/${orderId}/status`, { status }),
  confirmOrder: (orderId: string) => apiClient.post<any>(`/vendors/orders/${orderId}/confirm`, {}),
  getUpcomingOrders: () => apiClient.get<any[]>('/vendors/orders/upcoming'),
  
  // Bookings (New)
  getBookings: (page = 0, size = 10) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    return apiClient.get<any>(`/vendors/bookings?${params.toString()}`);
  },
  getUpcomingBookings: () => apiClient.get<any[]>('/vendors/bookings/upcoming'),
  getPastBookings: () => apiClient.get<any[]>('/vendors/bookings/past'),
  getBooking: (bookingId: string) => apiClient.get<any>(`/vendors/bookings/${bookingId}`),
  getBookingTimeline: (bookingId: string) => apiClient.get<any[]>(`/vendors/bookings/${bookingId}/timeline`),
  completeEvent: (bookingId: string, data: { images: string[]; description?: string }) =>
    apiClient.post<any>(`/vendors/bookings/${bookingId}/complete`, data),
  
  // Leads
  getLeads: () => apiClient.get<any[]>('/vendors/leads'),
  getLead: (leadId: string) => apiClient.get<any>(`/vendors/leads/${leadId}`),
  getLeadOffers: (leadId: string) => apiClient.get<any[]>(`/vendors/leads/${leadId}/offers`),
  updateLeadStatus: (leadId: string, status: string) =>
    apiClient.put<any>(`/vendors/leads/${leadId}/status`, { status }),
  acceptLead: (leadId: string) => apiClient.post<any>(`/vendors/leads/${leadId}/accept`, {}),
  rejectLead: (leadId: string, reason?: string) =>
    apiClient.post<any>(`/vendors/leads/${leadId}/reject`, { reason }),
  
  // Quotes
  createQuote: (leadId: string, data: any) => apiClient.post<any>(`/vendors/leads/${leadId}/quotes`, data),
  updateQuote: (leadId: string, quoteId: string, data: any) =>
    apiClient.put<any>(`/vendors/leads/${leadId}/quotes/${quoteId}`, data),
  deleteQuote: (leadId: string, quoteId: string) =>
    apiClient.delete<any>(`/vendors/leads/${leadId}/quotes/${quoteId}`),
  getLeadQuotes: (leadId: string) => apiClient.get<any[]>(`/vendors/leads/${leadId}/quotes`),
  
  // Reviews
  getReviews: (page = 0, size = 10) => apiClient.get<any>(`/vendors/reviews?page=${page}&size=${size}`),
  getReviewStatistics: () => apiClient.get<any>('/vendors/reviews/statistics'),
  getEligibleOrdersForReview: () => apiClient.get<any>('/vendors/reviews/eligible-orders'),
  sendReviewRequest: (orderId: string) => apiClient.post<any>('/vendors/reviews/request', { orderId }),
  
  // FAQs
  getFAQs: () => apiClient.get<any[]>('/vendors/faqs'),
  createFAQ: (data: any) => apiClient.post<any>('/vendors/faqs', data),
  updateFAQ: (faqId: string, data: any) => apiClient.put<any>(`/vendors/faqs/${faqId}`, data),
  deleteFAQ: (faqId: string) => apiClient.delete<any>(`/vendors/faqs/${faqId}`),
  
  // Chat
  getChatThreads: () => apiClient.get<any[]>('/vendors/chat/threads'),
  getMessages: (threadId: string, page = 0, size = 20) =>
    apiClient.get<any>(`/vendors/chat/threads/${threadId}/messages?page=${page}&size=${size}`),
  sendMessage: (threadId: string, content: string) =>
    apiClient.post<any>(`/vendors/chat/threads/${threadId}/messages`, { content }),
  markThreadAsRead: (threadId: string) =>
    apiClient.put<any>(`/vendors/chat/threads/${threadId}/read`, {}),
  
  // Offers
  getOffers: () => apiClient.get<any[]>('/vendors/offers'),
  getOffersByThread: (threadId: string) => apiClient.get<any[]>(`/vendors/offers/thread/${threadId}`),
  getOffer: (offerId: string) => apiClient.get<any>(`/vendors/offers/${offerId}`),
  acceptOffer: (offerId: string) => apiClient.post<any>(`/vendors/offers/${offerId}/accept`, {}),
  rejectOffer: (offerId: string) => apiClient.post<any>(`/vendors/offers/${offerId}/reject`, {}),
  counterOffer: (offerId: string, data: { counterPrice: number; counterMessage?: string }) =>
    apiClient.post<any>(`/vendors/offers/${offerId}/counter`, data),
  
  // Wallet
  getWallet: () => apiClient.get<any>('/vendors/wallet'),
  getWalletTransactions: (page = 0, size = 10) =>
    apiClient.get<any>(`/vendors/wallet/transactions?page=${page}&size=${size}`),
  requestWithdrawal: (data: any) => apiClient.post<any>('/vendors/wallet/withdraw', data),
  getPayoutHistory: (page = 0, size = 10) =>
    apiClient.get<any>(`/vendors/wallet/payouts?page=${page}&size=${size}`),
  
  // Analytics
  getDashboardStats: () => apiClient.get<any>('/vendors/dashboard/stats'),
  
  // Past Events
  getPastEvents: () => apiClient.get<any[]>('/vendors/past-events'),
  addPastEvent: (data: any) => apiClient.post<any>('/vendors/past-events', data),
  deletePastEvent: (eventId: string) => apiClient.delete<any>(`/vendors/past-events/${eventId}`),
  
  // Availability
  getAvailability: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiClient.get<any[]>(`/vendors/availability?${params.toString()}`);
  },
  createAvailabilitySlots: (date: string, timeSlots: any[]) =>
    apiClient.post<any[]>(`/vendors/availability?date=${date}`, timeSlots),
  updateSlot: (slotId: string, status: string) =>
    apiClient.put<any>(`/vendors/availability/${slotId}`, { status }),
  deleteSlot: (slotId: string) => apiClient.delete<any>(`/vendors/availability/${slotId}`),
  bulkUpdateAvailability: (startDate: string, endDate: string, status: string) =>
    apiClient.post<number>('/vendors/availability/bulk', { startDate, endDate, status }),
  
  // Bookable Setups
  getBookableSetups: () => apiClient.get<any[]>('/vendors/bookable-setups'),
  createBookableSetup: (data: any) => apiClient.post<any>('/vendors/bookable-setups', data),
  updateBookableSetup: (setupId: string, data: any) =>
    apiClient.put<any>(`/vendors/bookable-setups/${setupId}`, data),
  deleteBookableSetup: (setupId: string) => apiClient.delete<any>(`/vendors/bookable-setups/${setupId}`),
};
