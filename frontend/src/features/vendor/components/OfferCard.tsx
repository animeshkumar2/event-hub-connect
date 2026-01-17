import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { HandCoins, IndianRupee, Clock, CheckCircle2, XCircle, Package, User, Calendar, CreditCard, Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface OfferCardProps {
  offer: {
    id: string;
    listingName: string;
    originalPrice: number;
    customizedPrice?: number;
    offeredPrice: number;
    counterPrice?: number;
    counterMessage?: string;
    message?: string;
    status: string;
    customization?: string;
    eventType?: string;
    eventDate?: string;
    eventTime?: string;
    guestCount?: number;
    createdAt: string;
    orderId?: string;
    tokenAmount?: number;
    tokenPaid?: boolean;
  };
  isVendor?: boolean;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onCounter?: (offerId: string) => void;
  onAcceptCounter?: (offerId: string) => void;
  onWithdraw?: (offerId: string) => void;
  onPayToken?: (offerId: string, orderId: string, tokenAmount: number) => void;
}

export const OfferCard = ({
  offer,
  isVendor = false,
  onAccept,
  onReject,
  onCounter,
  onAcceptCounter,
  onWithdraw,
  onPayToken,
}: OfferCardProps) => {
  const hasCustomization = offer.customizedPrice && offer.customizedPrice !== offer.originalPrice;
  const customizationData = offer.customization ? JSON.parse(offer.customization) : null;
  
  // Check if customer needs to pay token (vendor accepted but no token paid yet)
  const needsTokenPayment = offer.status === 'ACCEPTED' && offer.orderId && !offer.tokenPaid && !isVendor;

  const getStatusBadge = (status: string) => {
    // Special case: show "Awaiting Payment" for accepted offers that need token payment
    if (needsTokenPayment) {
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse"><Wallet className="h-3 w-3 mr-1" />Pay to Confirm</Badge>;
    }
    
    switch (status) {
      case 'ACCEPTED':
        if (offer.tokenPaid) {
          return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Confirmed</Badge>;
        }
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'COUNTERED':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Clock className="h-3 w-3 mr-1" />Countered</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const basePrice = offer.customizedPrice || offer.originalPrice;
  const discount = ((basePrice - offer.offeredPrice) / basePrice * 100).toFixed(1);

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <HandCoins className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-base">
                    {isVendor ? 'Offer from Customer' : 'Your Offer'}
                  </span>
                </div>
                {getStatusBadge(offer.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                <span className="truncate">{offer.listingName}</span>
              </div>
            </div>
          </div>

          {/* Customization Details */}
          {hasCustomization && customizationData && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1.5">
                    Customization Request
                  </p>
                  {customizationData.quantity && (
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      Quantity: {customizationData.originalQuantity || 1} → {customizationData.quantity} {customizationData.unit || 'units'}
                    </div>
                  )}
                  {customizationData.addOns && customizationData.addOns.length > 0 && (
                    <div className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                      Add-ons: {customizationData.addOns.length} selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Original Price</span>
              <span className="font-medium line-through">
                ₹{offer.originalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            {hasCustomization && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Customized Price</span>
                <span className="font-medium">
                  ₹{offer.customizedPrice!.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <HandCoins className="h-3.5 w-3.5 text-primary" />
                {isVendor ? 'Customer Offer' : 'Your Offer'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary flex items-center gap-0.5">
                  <IndianRupee className="h-4 w-4" />
                  {offer.offeredPrice.toLocaleString('en-IN')}
                </span>
                <Badge variant="outline" className="text-xs">
                  {discount}% off
                </Badge>
              </div>
            </div>
          </div>

          {/* Counter Offer */}
          {offer.counterPrice && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/50">
                  <HandCoins className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                    {isVendor ? 'Your Counter Offer' : 'Vendor Counter Offer'}
                  </p>
                  <p className="text-base font-bold text-green-700 dark:text-green-300">
                    ₹{offer.counterPrice.toLocaleString('en-IN')}
                  </p>
                  {offer.counterMessage && (
                    <p className="text-xs text-muted-foreground mt-1.5">{offer.counterMessage}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {offer.message && (
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm text-foreground">{offer.message}</p>
            </div>
          )}

          {/* Event Details */}
          {(offer.eventType || offer.eventDate || offer.eventTime || offer.guestCount) && (
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {offer.eventType && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>{offer.eventType}</span>
                </div>
              )}
              {offer.eventDate && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(offer.eventDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              {offer.guestCount && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  <span>{offer.guestCount} guests</span>
                </div>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(offer.createdAt), 'MMM d, yyyy • h:mm a')}</span>
          </div>

          {/* Action Buttons */}
          {isVendor ? (
            <>
              {offer.status === 'PENDING' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => onAccept?.(offer.id)}
                    className="flex-1 font-semibold"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCounter?.(offer.id)}
                    className="flex-1"
                  >
                    <HandCoins className="h-4 w-4 mr-2" />
                    Counter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject?.(offer.id)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {/* Vendor view: Show waiting for payment status */}
              {offer.status === 'ACCEPTED' && offer.orderId && !offer.tokenPaid && (
                <div className="pt-2 border-t">
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Clock className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Waiting for customer to pay token
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                      Booking will be confirmed once payment is received
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Customer: Pay Token to Confirm when vendor accepted */}
              {needsTokenPayment && (
                <div className="pt-2 border-t space-y-2">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Vendor accepted your offer!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                      Pay token amount to confirm your booking
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onPayToken?.(offer.id, offer.orderId!, offer.tokenAmount || 0)}
                    className="w-full font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₹{(offer.tokenAmount || 0).toLocaleString('en-IN')} to Confirm Booking
                  </Button>
                </div>
              )}
              
              {/* Customer: Accept Counter Offer (will lead to payment) */}
              {offer.status === 'COUNTERED' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => onAcceptCounter?.(offer.id)}
                    className="flex-1 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Accept & Pay Token
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onWithdraw?.(offer.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
              
              {/* Customer: Withdraw pending offer */}
              {offer.status === 'PENDING' && (
                <div className="pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onWithdraw?.(offer.id)}
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Withdraw Offer
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

