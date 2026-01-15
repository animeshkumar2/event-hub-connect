import React, { useState } from 'react';
import { 
  User, Calendar, MapPin, Users, CreditCard, 
  CheckCircle, XCircle, Loader2, MessageSquare, Clock 
} from 'lucide-react';

interface LeadAcceptanceCardProps {
  leadId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventType: string;
  eventDate: string;
  venueAddress?: string;
  guestCount?: number;
  tokenAmount: number;
  totalAmount: number;
  message?: string;
  source: string;
  onAccept: (leadId: string) => Promise<void>;
  onReject: (leadId: string, reason: string) => Promise<void>;
}

export const LeadAcceptanceCard: React.FC<LeadAcceptanceCardProps> = ({
  leadId,
  customerName,
  customerEmail,
  customerPhone,
  eventType,
  eventDate,
  venueAddress,
  guestCount,
  tokenAmount,
  totalAmount,
  message,
  source,
  onAccept,
  onReject,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionResult, setActionResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(leadId);
      setActionResult({ type: 'success', message: 'Lead accepted successfully!' });
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to accept lead. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    
    setIsProcessing(true);
    try {
      await onReject(leadId, rejectReason);
      setActionResult({ type: 'success', message: 'Lead rejected. Refund will be processed.' });
      setShowRejectModal(false);
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to reject lead. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSourceBadge = () => {
    switch (source) {
      case 'DIRECT_ORDER':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Direct Order</span>;
      case 'OFFER':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">From Offer</span>;
      case 'CHAT':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">From Chat</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Inquiry</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">New Lead</h3>
            <p className="text-rose-100 text-sm">Token payment received</p>
          </div>
          {getSourceBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Customer Info */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{customerName}</h4>
            <p className="text-sm text-gray-500">{customerEmail}</p>
            {customerPhone && (
              <p className="text-sm text-gray-500">{customerPhone}</p>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Event Date</p>
              <p className="font-medium text-gray-900">{formatDate(eventDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Guest Count</p>
              <p className="font-medium text-gray-900">{guestCount || 'Not specified'}</p>
            </div>
          </div>
          {venueAddress && (
            <div className="flex items-center gap-3 col-span-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Venue</p>
                <p className="font-medium text-gray-900">{venueAddress}</p>
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Customer Message</span>
            </div>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
        )}

        {/* Payment Info - Comprehensive Breakdown */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-800">Payment Breakdown</span>
          </div>
          
          {/* Total Order Value */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Total Order Value</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
          </div>
          
          {/* Payment Components Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Token Received */}
            <div className="bg-green-100 rounded-lg p-3 text-center border border-green-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Token Received</span>
              </div>
              <p className="text-lg font-bold text-green-700">{formatCurrency(tokenAmount)}</p>
              <p className="text-xs text-green-600">25% of total</p>
            </div>
            
            {/* Balance from Customer */}
            <div className="bg-orange-100 rounded-lg p-3 text-center border border-orange-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Balance Due</span>
              </div>
              <p className="text-lg font-bold text-orange-700">{formatCurrency(totalAmount - tokenAmount)}</p>
              <p className="text-xs text-orange-600">From customer</p>
            </div>
          </div>
          
          {/* Your Earnings */}
          <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
            <h4 className="text-xs font-semibold text-blue-800 mb-2">Your Earnings</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Gross Amount</span>
                <span className="font-medium text-gray-800">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Platform Fee (5%)</span>
                <span className="font-medium text-red-600">-{formatCurrency(Math.round(totalAmount * 0.05))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="font-semibold text-blue-800">Net Payout</span>
                <span className="font-bold text-blue-700">{formatCurrency(Math.round(totalAmount * 0.95))}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Timeline */}
          <div className="mt-3 p-2 bg-white/50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-1">Payment Timeline:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span>Token (25%): Already received</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                <span>Balance (75%): Customer pays after service completion</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>Payout: Within 2-3 business days after balance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Result */}
        {actionResult && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            actionResult.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {actionResult.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{actionResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        {!actionResult && (
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Accept Lead
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Lead</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejection. The customer will receive a refund based on our refund policy.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadAcceptanceCard;
