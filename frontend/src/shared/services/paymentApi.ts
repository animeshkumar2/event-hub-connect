import { api } from './api';

// Types
export interface TokenPaymentRequest {
  paymentMethod: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  paymentUrl: string;
  amount: number;
  transactionId: string;
  message: string;
  status: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  amount: number;
  completedAt?: string;
  message: string;
  failureReason?: string;
}

export interface PaymentDetail {
  paymentId: string;
  amount: number;
  paymentType: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface PaymentHistoryResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  tokenAmount: number;
  totalPaid: number;
  balanceDue: number;
  paymentStatus: string;
  payments: PaymentDetail[];
}

export interface RefundEstimate {
  orderId: string;
  originalAmount: number;
  refundAmount: number;
  refundPercentage: number;
  refundPolicy: string;
  eventDate: string;
}

export interface RefundResponse {
  orderId: string;
  paymentId: string;
  refundAmount: number;
  originalAmount: number;
  status: string;
  message: string;
}

export interface TokenConfig {
  tokenPercentage: number;
  currency: string;
}

// Token Payment APIs
export const paymentApi = {
  // Get token payment configuration
  getTokenConfig: async (): Promise<TokenConfig> => {
    const response = await api.get('/payments/token/config');
    return response.data;
  },

  // Initiate token payment for an order
  initiateTokenPayment: async (
    orderId: string,
    request: TokenPaymentRequest
  ): Promise<PaymentInitiationResponse> => {
    const response = await api.post(`/payments/token/orders/${orderId}`, request);
    return response.data;
  },

  // Initiate token payment for an offer
  initiateTokenPaymentForOffer: async (
    offerId: string,
    request: TokenPaymentRequest
  ): Promise<PaymentInitiationResponse> => {
    const response = await api.post(`/payments/token/offers/${offerId}`, request);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId: string): Promise<PaymentStatusResponse> => {
    const response = await api.get(`/payments/token/${paymentId}/status`);
    return response.data;
  },

  // Check if order has token payment
  checkOrderTokenPayment: async (orderId: string): Promise<{ orderId: string; hasTokenPayment: boolean }> => {
    const response = await api.get(`/payments/token/orders/${orderId}/status`);
    return response.data;
  },

  // Get payment history for an order
  getPaymentHistory: async (orderId: string): Promise<PaymentHistoryResponse> => {
    const response = await api.get(`/orders/${orderId}/payments`);
    return response.data.data;
  },

  // Get balance due for an order
  getBalanceDue: async (orderId: string): Promise<{ orderId: string; totalPaid: number; balanceDue: number }> => {
    const response = await api.get(`/orders/${orderId}/balance`);
    return response.data;
  },

  // Get refund estimate
  getRefundEstimate: async (orderId: string): Promise<RefundEstimate> => {
    const response = await api.get(`/orders/${orderId}/refund-estimate`);
    return response.data;
  },

  // Cancel order and process refund
  cancelOrder: async (orderId: string, reason?: string): Promise<RefundResponse> => {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data.data;
  },
};

// Lead Management APIs
export const leadApi = {
  // Get vendor leads
  getVendorLeads: async () => {
    const response = await api.get('/vendors/leads');
    return response.data.data;
  },

  // Get lead details
  getLeadDetails: async (leadId: string) => {
    const response = await api.get(`/vendors/leads/${leadId}`);
    return response.data.data;
  },

  // Accept a lead
  acceptLead: async (leadId: string) => {
    const response = await api.post(`/vendors/leads/${leadId}/accept`);
    return response.data.data;
  },

  // Reject a lead
  rejectLead: async (leadId: string, reason: string) => {
    const response = await api.post(`/vendors/leads/${leadId}/reject`, { reason });
    return response.data.data;
  },

  // Get lead offers
  getLeadOffers: async (leadId: string) => {
    const response = await api.get(`/vendors/leads/${leadId}/offers`);
    return response.data.data;
  },
};

export default paymentApi;
