import React, { useState } from 'react';
import { X, CreditCard, Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { customerApi } from '@/shared/services/api';

// TEST MODE FLAG - Set to false for production
const TEST_MODE = true;

interface TokenPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  tokenAmount: number;
  totalAmount: number;
  onPaymentSuccess: (paymentId?: string) => void;
  onPaymentFailure?: (error: string) => void;
}

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

interface PaymentState {
  status: 'idle' | 'processing' | 'success' | 'failed';
  message: string;
  paymentId?: string;
}

export const TokenPaymentModal: React.FC<TokenPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  tokenAmount,
  totalAmount,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: 'idle',
    message: '',
  });

  if (!isOpen) return null;

  const balanceAmount = totalAmount - tokenAmount;
  const tokenPercentage = Math.round((tokenAmount / totalAmount) * 100);

  const paymentMethods = [
    { id: 'card' as PaymentMethod, name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi' as PaymentMethod, name: 'UPI', icon: Wallet },
    { id: 'netbanking' as PaymentMethod, name: 'Net Banking', icon: CreditCard },
    { id: 'wallet' as PaymentMethod, name: 'Wallet', icon: Wallet },
  ];

  const handlePayment = async () => {
    setPaymentState({ status: 'processing', message: 'Processing payment...' });

    try {
      // Always call backend API to process the token payment
      // This updates the order status and lead status
      const response = await customerApi.initiateTokenPayment(orderId, {
        paymentMethod: selectedMethod,
        paymentGateway: TEST_MODE ? 'mock' : 'razorpay',
      });

      if (response.success && response.data) {
        // Payment processed successfully
        setPaymentState({
          status: 'success',
          message: TEST_MODE ? 'Payment successful! (Test Mode)' : 'Payment successful!',
          paymentId: response.data.paymentId || 'test-payment-' + Date.now(),
        });
        
        setTimeout(() => {
          onPaymentSuccess(response.data.paymentId || 'test-payment-' + Date.now());
        }, 1500);
      } else {
        setPaymentState({
          status: 'failed',
          message: response.message || 'Payment failed. Please try again.',
        });
        onPaymentFailure?.(response.message || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Token payment error:', error);
      setPaymentState({
        status: 'failed',
        message: error.message || 'Network error. Please try again.',
      });
      onPaymentFailure?.(error.message || 'Network error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Pay Token Amount</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Total Order Amount</span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Token Amount ({tokenPercentage}%)</span>
              <span className="font-bold text-rose-600 text-lg">
                {formatCurrency(tokenAmount)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Balance Due (after event)</span>
                <span className="font-semibold">{formatCurrency(balanceAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {paymentState.status !== 'idle' && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              paymentState.status === 'processing' ? 'bg-blue-50 text-blue-700' :
              paymentState.status === 'success' ? 'bg-green-50 text-green-700' :
              'bg-red-50 text-red-700'
            }`}>
              {paymentState.status === 'processing' && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              {paymentState.status === 'success' && (
                <CheckCircle className="w-5 h-5" />
              )}
              {paymentState.status === 'failed' && (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{paymentState.message}</span>
            </div>
          )}

          {/* Payment Methods */}
          {paymentState.status === 'idle' && (
            <>
              <h3 className="font-medium text-gray-900 mb-3">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <method.icon className={`w-6 h-6 mx-auto mb-2 ${
                      selectedMethod === method.id ? 'text-rose-500' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm ${
                      selectedMethod === method.id ? 'text-rose-700 font-medium' : 'text-gray-600'
                    }`}>
                      {method.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/25"
              >
                Pay {formatCurrency(tokenAmount)}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By proceeding, you agree to our terms and conditions.
                Token amount is non-refundable if cancelled within 15 days of event.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenPaymentModal;
