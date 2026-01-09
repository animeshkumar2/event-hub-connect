import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { HandCoins, IndianRupee, MessageSquare, Calendar, Loader2, Package } from 'lucide-react';

interface OfferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingName: string;
  originalPrice: number;
  customizedPrice?: number;
  customization?: {
    quantity?: number;
    selectedAddOns?: string[];
    customizedPrice: number;
    customization: string;
  };
  onSubmit: (data: {
    offeredPrice: number;
    message?: string;
    eventType?: string;
    eventDate?: string;
    eventTime?: string;
    venueAddress?: string;
    guestCount?: number;
  }) => Promise<void>;
  loading?: boolean;
}

export const OfferFormDialog = ({
  open,
  onOpenChange,
  listingName,
  originalPrice,
  customizedPrice,
  customization,
  onSubmit,
  loading = false,
}: OfferFormDialogProps) => {
  const [offeredPrice, setOfferedPrice] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('');
  const [venueAddress, setVenueAddress] = useState<string>('');
  const [guestCount, setGuestCount] = useState<string>('');

  const basePrice = customizedPrice || originalPrice;
  const hasCustomization = !!customization && customizedPrice !== originalPrice;

  // Price suggestions
  const priceSuggestions = useMemo(() => {
    return [
      { price: Math.round(basePrice * 0.95), label: '5% off' },
      { price: Math.round(basePrice * 0.90), label: '10% off' },
      { price: Math.round(basePrice * 0.85), label: '15% off' },
      { price: Math.round(basePrice * 0.80), label: '20% off' },
      { price: Math.round(basePrice * 0.75), label: '25% off' },
      { price: Math.round(basePrice * 0.70), label: '30% off' },
    ];
  }, [basePrice]);

  const handleSubmit = async () => {
    const price = parseFloat(offeredPrice);
    if (isNaN(price) || price <= 0) {
      return;
    }
    if (price >= basePrice) {
      return;
    }

    await onSubmit({
      offeredPrice: price,
      message: message || undefined,
      eventType: eventType || undefined,
      eventDate: eventDate || undefined,
      eventTime: eventTime || undefined,
      venueAddress: venueAddress || undefined,
      guestCount: guestCount ? parseInt(guestCount) : undefined,
    });

    // Reset form
    setOfferedPrice('');
    setMessage('');
    setEventType('');
    setEventDate('');
    setEventTime('');
    setVenueAddress('');
    setGuestCount('');
  };

  const discount = useMemo(() => {
    const price = parseFloat(offeredPrice);
    if (isNaN(price) || price <= 0) return 0;
    return ((basePrice - price) / basePrice * 100).toFixed(1);
  }, [offeredPrice, basePrice]);

  console.log('🎯 [OfferFormDialog] Rendering', {
    open,
    listingName,
    basePrice,
    hasCustomization,
    priceSuggestionsCount: priceSuggestions.length,
    timestamp: new Date().toISOString(),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] p-0 gap-0 !grid grid-rows-[auto_1fr_auto]"
        style={{ height: '90vh' }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-background">
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Make an Offer
          </DialogTitle>
          <DialogDescription>
            Make an offer on {listingName}
          </DialogDescription>
        </DialogHeader>

        <div 
          className="overflow-y-auto overflow-x-hidden px-6 py-4" 
          style={{ scrollbarWidth: 'thin', minHeight: 0 }}
          onScroll={(e) => {
            console.log('📜 [OfferFormDialog] Scroll event', {
              scrollTop: e.currentTarget.scrollTop,
              scrollHeight: e.currentTarget.scrollHeight,
              clientHeight: e.currentTarget.clientHeight,
            });
          }}
        >
          <div className="space-y-6">
          {/* Price Display */}
          <Card className="border-2">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {hasCustomization ? 'Customized Price' : 'Original Price'}
                  </p>
                  <p className="text-2xl font-bold text-primary flex items-center gap-1">
                    <IndianRupee className="h-5 w-5" />
                    {basePrice.toLocaleString('en-IN')}
                  </p>
                  {hasCustomization && (
                    <p className="text-xs text-muted-foreground mt-1 line-through">
                      Original: ₹{originalPrice.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>

              {/* Customization Info */}
              {customization && hasCustomization && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Customization Applied
                      </p>
                      {customization.quantity && (
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          Quantity: {customization.quantity}
                        </p>
                      )}
                      {customization.selectedAddOns && customization.selectedAddOns.length > 0 && (
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          Add-ons: {customization.selectedAddOns.length} selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offer Price Input */}
          <div className="space-y-3">
            <Label htmlFor="offeredPrice" className="text-sm font-semibold flex items-center gap-2">
              <HandCoins className="h-4 w-4" />
              Your Offer Price (₹) *
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="offeredPrice"
                type="number"
                placeholder="Enter your offer amount"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                className="pl-10 h-11 text-base font-medium"
              />
            </div>
            {offeredPrice && parseFloat(offeredPrice) > 0 && parseFloat(offeredPrice) < basePrice && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                  {discount}% discount
                </p>
              </div>
            )}
            {offeredPrice && parseFloat(offeredPrice) >= basePrice && (
              <p className="text-xs text-red-600">Offer must be less than {hasCustomization ? 'customized' : 'original'} price</p>
            )}

            {/* Quick Price Suggestions */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick Select</Label>
              <div className="grid grid-cols-3 gap-2">
                {priceSuggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 flex flex-col items-center gap-0.5"
                    onClick={() => setOfferedPrice(suggestion.price.toString())}
                  >
                    <span className="font-bold text-sm">₹{suggestion.price.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] opacity-80">{suggestion.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a message to explain your offer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event Details (Optional)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-xs">Event Type</Label>
                <Input
                  id="eventType"
                  placeholder="e.g., Wedding"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-xs">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventTime" className="text-xs">Event Time</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestCount" className="text-xs">Guest Count</Label>
                <Input
                  id="guestCount"
                  type="number"
                  placeholder="Number of guests"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueAddress" className="text-xs">Venue Address</Label>
              <Textarea
                id="venueAddress"
                placeholder="Enter the venue address..."
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
          </div>
        </div>

        {/* Footer with Action Buttons - Fixed at bottom */}
        <DialogFooter className="px-6 py-4 border-t bg-background sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 sm:flex-initial"
            disabled={!offeredPrice || parseFloat(offeredPrice) <= 0 || parseFloat(offeredPrice) >= basePrice || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <HandCoins className="h-4 w-4 mr-2" />
                Send Offer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

