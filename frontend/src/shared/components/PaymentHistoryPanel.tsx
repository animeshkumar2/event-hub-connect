import React from 'react';
import { CreditCard, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface PaymentDetail {
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

interface PaymentHistoryPanelProps {
  orderId: string;
  totalAmount: number;
  tokenAmount: number;
  totalPaid: number;
  balanceDue: number;
  paymentStatus: string;
  payments: PaymentDetail[];
}

export const PaymentHistoryPanel: React.FC<PaymentHistoryPanelProps> = ({
  totalAmount,
  tokenAmount,
  totalPaid,
  balanceDue,
  paymentStatus,
  payments,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'TOKEN':
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'REFUND':
        return <ArrowUpCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'TOKEN':
        return 'Token Payment';
      case 'FULL':
        return 'Full Payment';
      case 'PARTIAL':
        return 'Partial Payment';
      case 'REFUND':
        return 'Refund';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Summary Section */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Token Required</p>
            <p className="text-xl font-bold text-rose-600">{formatCurrency(tokenAmount)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">Total Paid</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-600 mb-1">Balance Due</p>
            <p className="text-xl font-bold text-amber-700">{formatCurrency(balanceDue)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Payment Progress</span>
            <span>{Math.round((totalPaid / totalAmount) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
              style={{ width: `${Math.min((totalPaid / totalAmount) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No payments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.paymentId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getPaymentTypeIcon(payment.paymentType)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {getPaymentTypeLabel(payment.paymentType)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </p>
                    {payment.transactionId && (
                      <p className="text-xs text-gray-400 font-mono">
                        {payment.transactionId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    payment.paymentType === 'REFUND' ? 'text-purple-600' : 'text-gray-900'
                  }`}>
                    {payment.paymentType === 'REFUND' ? '-' : '+'}{formatCurrency(payment.amount)}
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    {getStatusIcon(payment.status)}
                    <span className="text-sm text-gray-500">{payment.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPanel;
