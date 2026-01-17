import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Send, Loader2, Wifi, WifiOff, Sparkles, CheckCheck, MessageSquare, HandCoins, IndianRupee, CheckCircle2, XCircle, Clock, User, Calendar, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { useWebSocket, ChatMessage } from '@/shared/hooks/useWebSocket';
import { useAuth } from '@/shared/contexts/AuthContext';
import { customerApi } from '@/shared/services/api';
import { useVendorListings } from '@/shared/hooks/useApi';
import { toast } from 'sonner';
import { DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format, isToday, isYesterday } from 'date-fns';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { OfferCard } from './components/OfferCard';
import { useListingDetails } from '@/shared/hooks/useApi';
import { useSearchParams } from 'react-router-dom';
import { eventTypes } from '@/shared/constants/mockData';
import { TokenPaymentModal } from '@/shared/components/TokenPaymentModal';

interface Message {
  id: string;
  sender: 'user' | 'vendor';
  text: string;
  timestamp: Date;
  read?: boolean;
}

interface PremiumChatWindowProps {
  vendorId: string;
  vendorName: string;
  listingId?: string;  // Optional: if provided, pre-select this listing and hide listing selector
  listingPrice?: number;  // Optional: original listing price for offer suggestions
  openForNegotiation?: boolean;  // Optional: whether negotiation is enabled for this listing
  onClose?: () => void;  // Note: Dialog already has a close button, this is optional
}

// Customer quick suggestions
const CUSTOMER_SUGGESTIONS = [
  { icon: '📅', text: "What dates are you available?" },
  { icon: '💰', text: "Can you share your pricing?" },
  { icon: '📸', text: "Do you have a portfolio?" },
  { icon: '📦', text: "What packages do you offer?" },
];

export const PremiumChatWindow = ({ vendorId, vendorName, listingId, listingPrice, openForNegotiation = true, onClose }: PremiumChatWindowProps) => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Log props on mount and when they change
  useEffect(() => {
    console.log('🔍 PremiumChatWindow Props:', {
      vendorId,
      vendorName,
      listingId,
      listingIdType: typeof listingId,
      listingIdLength: listingId?.length,
      listingIdTrimmed: listingId?.trim(),
      listingIdIsEmpty: !listingId || listingId.trim() === '',
      listingPrice,
      openForNegotiation,
      componentKey: `chat-${listingId || 'unknown'}`,
    });
  }, [vendorId, vendorName, listingId, listingPrice, openForNegotiation]);
  
  // Offer state
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string>(listingId || '');
  
  // Log initial selectedListingId
  useEffect(() => {
    console.log('🔍 Initial selectedListingId:', {
      selectedListingId,
      selectedListingIdType: typeof selectedListingId,
      selectedListingIdLength: selectedListingId?.length,
      selectedListingIdTrimmed: selectedListingId?.trim(),
      listingIdProp: listingId,
    });
  }, []);
  
  // Helper function to check if a value is a valid listing ID
  const isValidListingIdValue = (value: any): boolean => {
    if (!value) return false;
    const strValue = String(value).trim();
    return strValue !== '' && strValue !== 'undefined' && strValue !== 'null';
  };
  
  // Update selectedListingId when listingId prop changes
  useEffect(() => {
    const isValid = isValidListingIdValue(listingId);
    
    console.log('🔍 listingId prop changed:', {
      listingId,
      listingIdType: typeof listingId,
      listingIdString: listingId ? String(listingId) : null,
      listingIdTrimmed: listingId ? String(listingId).trim() : null,
      isValid,
      isEmpty: !isValid,
      currentSelectedListingId: selectedListingId,
    });
    
    if (isValid) {
      const listingIdStr = String(listingId).trim();
      console.log('✅ Setting selectedListingId to:', listingIdStr);
      setSelectedListingId(listingIdStr);
    } else {
      console.warn('⚠️ listingId is empty or invalid, not updating selectedListingId', {
        listingId,
        type: typeof listingId,
        stringValue: listingId ? String(listingId) : null,
      });
    }
  }, [listingId]);
  
  // Log when selectedListingId changes
  useEffect(() => {
    console.log('🔍 selectedListingId state changed:', {
      selectedListingId,
      selectedListingIdType: typeof selectedListingId,
      selectedListingIdLength: selectedListingId?.length,
      selectedListingIdTrimmed: selectedListingId?.trim(),
      isEmpty: !selectedListingId || selectedListingId.trim() === '',
    });
  }, [selectedListingId]);
  
  // Determine if we have a valid listing ID - handle both string and other types
  const hasValidListingId = useMemo(() => {
    const listingIdValid = isValidListingIdValue(listingId);
    const selectedListingIdValid = isValidListingIdValue(selectedListingId);
    const isValid = listingIdValid || selectedListingIdValid;
    
    return isValid;
  }, [listingId, selectedListingId]);
  
  // Log hasValidListingId calculation
  useEffect(() => {
    const listingIdValid = isValidListingIdValue(listingId);
    const selectedListingIdValid = isValidListingIdValue(selectedListingId);
    const isValid = listingIdValid || selectedListingIdValid;
    
    console.log('🔍 hasValidListingId calculation:', {
      listingId,
      listingIdType: typeof listingId,
      listingIdString: listingId ? String(listingId) : null,
      listingIdValid,
      selectedListingId,
      selectedListingIdValid,
      hasValidListingId: isValid,
    });
  }, [listingId, selectedListingId, hasValidListingId]);
  // Inline offer form state
  const [customRequirements, setCustomRequirements] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [offeredPrice, setOfferedPrice] = useState<string>('');
  const [offerMessage, setOfferMessage] = useState<string>('');
  // Auto-fill from URL params if available (from search filters)
  const [eventType, setEventType] = useState<string>(searchParams.get('eventType') || '');
  const [eventDate, setEventDate] = useState<string>(searchParams.get('eventDate') || '');
  const [eventTime, setEventTime] = useState<string>('');
  const [venueAddress, setVenueAddress] = useState<string>('');
  const [guestCount, setGuestCount] = useState<string>('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerFormExpanded, setOfferFormExpanded] = useState(true);
  const [enableCustomization, setEnableCustomization] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [customizationData, setCustomizationData] = useState<{ customizedPrice?: number; customization?: string } | null>(null);
  
  // Token payment modal state
  const [showTokenPaymentModal, setShowTokenPaymentModal] = useState(false);
  const [tokenPaymentOrderId, setTokenPaymentOrderId] = useState<string | null>(null);
  const [tokenPaymentAmount, setTokenPaymentAmount] = useState(0);
  const [tokenPaymentTotalAmount, setTokenPaymentTotalAmount] = useState(0);

  // Reset customization fields when toggled off
  useEffect(() => {
    if (!enableCustomization) {
      setCustomRequirements('');
      setCustomPrice('');
    }
  }, [enableCustomization]);
  
  // Fetch vendor listings for offer form (only if listingId not provided)
  const { data: listingsData } = useVendorListings(listingId ? null : vendorId);
  const listings = listingsData || [];
  
  // Fetch listing details for customization (if listingId is provided)
  const finalListingId = listingId || selectedListingId;
  const { data: listingDetails } = useListingDetails(finalListingId || null);
  const selectedListing = listingId ? listingDetails : listings.find((l: any) => l.id === selectedListingId);
  
  // Get current listing price
  const currentListingPrice = listingPrice || (selectedListingId ? listings.find((l: any) => l.id === selectedListingId)?.price : null);
  
  // Calculate base price for offer (custom price if set, otherwise original)
  const basePriceForOffer = useMemo(() => {
    if (enableCustomization && customPrice && parseFloat(customPrice) > 0) {
      return parseFloat(customPrice);
    }
    return currentListingPrice || 0;
  }, [enableCustomization, customPrice, currentListingPrice]);
  
  // Price suggestion algorithm (OLX-style)
  const priceSuggestions = useMemo(() => {
    if (!basePriceForOffer || basePriceForOffer <= 0) return [];
    return [
      { price: Math.round(basePriceForOffer * 0.95), label: '5%', discount: 5 },
      { price: Math.round(basePriceForOffer * 0.90), label: '10%', discount: 10 },
      { price: Math.round(basePriceForOffer * 0.85), label: '15%', discount: 15 },
      { price: Math.round(basePriceForOffer * 0.80), label: '20%', discount: 20 },
      { price: Math.round(basePriceForOffer * 0.75), label: '25%', discount: 25 },
      { price: Math.round(basePriceForOffer * 0.70), label: '30%', discount: 30 },
    ];
  }, [basePriceForOffer]);
  
  // Handle quick discount button click
  const handleQuickDiscount = (suggestion: typeof priceSuggestions[0]) => {
    setOfferedPrice(suggestion.price.toString());
  };

  // Handle incoming WebSocket message
  const handleIncomingMessage = useCallback((message: ChatMessage) => {
    if (currentThreadId && message.threadId === currentThreadId) {
      setMessages(prev => {
        const isDuplicate = prev.some(m => 
          m.id === message.id || 
          (m.text === message.content && 
           Math.abs(new Date(m.timestamp).getTime() - new Date(message.createdAt).getTime()) < 5000)
        );
        if (isDuplicate) return prev;
        return [...prev, {
          id: message.id,
          sender: message.senderType?.toUpperCase() === 'VENDOR' ? 'vendor' : 'user',
          text: message.content,
          timestamp: new Date(message.createdAt),
          read: message.isRead,
        }];
      });
    }
  }, [currentThreadId]);

  // Handle typing indicator
  const handleTypingIndicator = useCallback((indicator: { threadId: string; userType: string; isTyping: boolean }) => {
    if (currentThreadId && indicator.threadId === currentThreadId && indicator.userType === 'VENDOR') {
      setOtherTyping(indicator.isTyping);
    }
  }, [currentThreadId]);

  const {
    isConnected,
    subscribeToThread,
    unsubscribeFromThread,
    sendMessage: wsSendMessage,
    sendTypingIndicator,
    sendReadReceipt,
  } = useWebSocket({
    onMessage: handleIncomingMessage,
    onTyping: handleTypingIndicator,
    enabled: isAuthenticated,
  });

  // Subscribe to thread
  useEffect(() => {
    if (currentThreadId && isConnected) {
      subscribeToThread(currentThreadId);
      if (user?.id) {
        sendReadReceipt(currentThreadId, user.id, false);
      }
    }
    return () => {
      if (currentThreadId) {
        unsubscribeFromThread(currentThreadId);
      }
    };
  }, [currentThreadId, isConnected, subscribeToThread, unsubscribeFromThread, user, sendReadReceipt]);

  // Initialize chat
  useEffect(() => {
    if (isAuthenticated) {
      initializeChat();
    } else {
      setMessages([{
        id: '1',
        sender: 'vendor',
        text: `Hi! Thanks for your interest in ${vendorName}. Please log in to start a conversation.`,
        timestamp: new Date(),
        read: true,
      }]);
    }
  }, [isAuthenticated, vendorId, vendorName]);
  
  // Load offers when thread is available (always load for unified timeline)
  useEffect(() => {
    if (currentThreadId && isAuthenticated) {
      loadOffers();
    }
  }, [currentThreadId, isAuthenticated]);
  
  const loadOffers = async () => {
    if (!currentThreadId) {
      console.warn('⚠️ loadOffers: currentThreadId is missing', {
        currentThreadId,
        isAuthenticated,
        vendorId,
      });
      return;
    }
    
    setLoadingOffers(true);
    try {
      console.log('🔍 [loadOffers] Starting to load offers', {
        threadId: currentThreadId,
        timestamp: new Date().toISOString(),
      });
      
      const response = await customerApi.getOffersByThread(currentThreadId);
      
      console.log('✅ [loadOffers] API response received', {
        success: response.success,
        dataLength: response.data?.length || 0,
        hasData: !!response.data,
        timestamp: new Date().toISOString(),
      });
      
      if (response.success) {
        const offersData = response.data || [];
        setOffers(offersData);
        console.log('✅ [loadOffers] Offers loaded successfully', {
          count: offersData.length,
          offerIds: offersData.map((o: any) => o.id),
        });
      } else {
        const errorMsg = response.message || 'Unknown error';
        console.error('❌ [loadOffers] API returned error', {
          message: errorMsg,
          response,
          threadId: currentThreadId,
        });
        toast.error(`Failed to load offers: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error('❌ [loadOffers] Exception caught', {
        error: err,
        errorType: err?.constructor?.name,
        message: err?.message,
        stack: err?.stack,
        threadId: currentThreadId,
        timestamp: new Date().toISOString(),
      });
      toast.error('Failed to load offers. Please try again.');
    } finally {
      setLoadingOffers(false);
    }
  };
  
  const handleCreateOffer = async () => {
    // Get final listing ID - convert to string and validate
    const finalListingId = listingId 
      ? String(listingId).trim() 
      : (selectedListingId ? String(selectedListingId).trim() : null);
    
    console.log('🔍 handleCreateOffer called:', {
      listingId,
      listingIdType: typeof listingId,
      selectedListingId,
      finalListingId,
      finalListingIdType: typeof finalListingId,
      currentThreadId,
      offeredPrice,
      listingPrice,
      listingsCount: listings.length,
      hasValidListingId,
    });
    
    if (!currentThreadId) {
      console.error('❌ handleCreateOffer: currentThreadId is missing');
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!isValidListingIdValue(finalListingId)) {
      console.error('❌ handleCreateOffer: finalListingId is missing or invalid', {
        listingId,
        listingIdType: typeof listingId,
        selectedListingId,
        finalListingId,
        finalListingIdType: typeof finalListingId,
      });
      toast.error('Please select a listing to make an offer');
      return;
    }
    
    if (!offeredPrice) {
      console.error('❌ handleCreateOffer: offeredPrice is missing');
      toast.error('Please fill in all required fields');
      return;
    }
    
    // If listingId is provided, use listingPrice directly; otherwise find from listings
    let listingPriceToCheck = listingPrice;
    if (!listingPriceToCheck) {
      console.log('🔍 Finding listing price from listings array:', {
        finalListingId,
        listingsCount: listings.length,
        listingIds: listings.map((l: any) => l.id),
      });
      const selectedListing = listings.find((l: any) => l.id === finalListingId);
      if (!selectedListing) {
        console.error('❌ handleCreateOffer: Selected listing not found in listings array', {
          finalListingId,
          availableListingIds: listings.map((l: any) => l.id),
        });
        toast.error('Please select a listing');
        return;
      }
      listingPriceToCheck = selectedListing.price;
      console.log('✅ Found listing price:', listingPriceToCheck);
    }
    
    const price = parseFloat(offeredPrice);
    if (isNaN(price) || price <= 0) {
      console.error('❌ handleCreateOffer: Invalid price', { offeredPrice, parsedPrice: price });
      toast.error('Please enter a valid price');
      return;
    }
    
    // Use customized price if available, otherwise use listing price
    const basePrice = customizationData?.customizedPrice || listingPriceToCheck;
    if (basePrice && price >= basePrice) {
      console.error('❌ handleCreateOffer: Offered price must be less than base price', {
        offeredPrice: price,
        basePrice: basePrice,
        customizedPrice: customizationData?.customizedPrice,
        originalPrice: listingPriceToCheck,
      });
      toast.error('Offered price must be less than the base price');
      return;
    }
    
    setSubmittingOffer(true);
    try {
      const offerData = {
        threadId: currentThreadId,
        listingId: finalListingId,
        offeredPrice: price,
        customizedPrice: customizationData?.customizedPrice,
        customization: customizationData?.customization,
        message: offerMessage || undefined,
        eventType: eventType || undefined,
        eventDate: eventDate || undefined,
        eventTime: eventTime || undefined,
        venueAddress: venueAddress || undefined,
        guestCount: guestCount ? parseInt(guestCount) : undefined,
      };
      
      console.log('🔍 Creating offer with data:', offerData);
      const response = await customerApi.createOffer(offerData);
      console.log('🔍 Create offer response:', {
        success: response.success,
        message: response.message,
        data: response.data,
      });
      
      if (response.success) {
        toast.success('Offer sent successfully!');
        setOfferedPrice('');
        setOfferMessage('');
        setEventType('');
        setEventDate('');
        setEventTime('');
        setVenueAddress('');
        setGuestCount('');
        setCustomizationData(null);
        setShowOfferForm(false);
        await loadOffers();
      } else {
        console.error('❌ handleCreateOffer: API returned error', {
          success: response.success,
          message: response.message,
          data: response.data,
        });
        throw new Error(response.message || 'Failed to create offer');
      }
    } catch (err: any) {
      console.error('❌ handleCreateOffer: Exception caught', {
        error: err,
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
        offerData: {
          threadId: currentThreadId,
          listingId: listingId || selectedListingId,
          offeredPrice,
        },
      });
      toast.error(err.message || 'Failed to create offer');
    } finally {
      setSubmittingOffer(false);
    }
  };
  
  const handleAcceptCounterOffer = async (offerId: string) => {
    try {
      console.log('🔍 [handleAcceptCounterOffer] Starting', {
        offerId,
        threadId: currentThreadId,
        timestamp: new Date().toISOString(),
      });

      const response = await customerApi.acceptCounterOffer(offerId);
      
      console.log('✅ [handleAcceptCounterOffer] API response', {
        success: response.success,
        message: response.message,
        data: response.data,
        offerId,
      });

      if (response.success) {
        // Reload offers to get the updated offer with orderId
        await loadOffers();
        
        // Get the updated offer with orderId and tokenAmount
        const updatedOffer = offers.find(o => o.id === offerId) || response.data;
        
        if (updatedOffer?.orderId) {
          // Show token payment modal
          toast.success('Counter offer accepted! Please complete token payment to confirm booking.');
          handlePayToken(offerId, updatedOffer.orderId, updatedOffer.tokenAmount || 0);
        } else {
          toast.success('Counter offer accepted! Order created successfully.');
        }
      } else {
        const errorMsg = response.message || 'Failed to accept counter offer';
        console.error('❌ [handleAcceptCounterOffer] API returned error', {
          message: errorMsg,
          offerId,
          response,
        });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [handleAcceptCounterOffer] Exception caught', {
        error: err,
        errorType: err?.constructor?.name,
        message: err?.message,
        stack: err?.stack,
        offerId,
        timestamp: new Date().toISOString(),
      });
      toast.error(err?.message || 'Failed to accept counter offer. Please try again.');
    }
  };
  
  const handleWithdrawOffer = async (offerId: string) => {
    try {
      console.log('🔍 [handleWithdrawOffer] Starting', {
        offerId,
        threadId: currentThreadId,
        timestamp: new Date().toISOString(),
      });

      const response = await customerApi.withdrawOffer(offerId);
      
      console.log('✅ [handleWithdrawOffer] API response', {
        success: response.success,
        message: response.message,
        offerId,
      });

      if (response.success) {
        toast.success('Offer withdrawn successfully');
        await loadOffers();
      } else {
        const errorMsg = response.message || 'Failed to withdraw offer';
        console.error('❌ [handleWithdrawOffer] API returned error', {
          message: errorMsg,
          offerId,
          response,
        });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [handleWithdrawOffer] Exception caught', {
        error: err,
        errorType: err?.constructor?.name,
        message: err?.message,
        stack: err?.stack,
        offerId,
        timestamp: new Date().toISOString(),
      });
      toast.error(err?.message || 'Failed to withdraw offer. Please try again.');
    }
  };

  // Handle Pay Token for accepted offers
  const handlePayToken = (offerId: string, orderId: string, tokenAmount: number) => {
    console.log('🔍 [handlePayToken] Opening payment modal', {
      offerId,
      orderId,
      tokenAmount,
    });
    
    // Find the offer to get total amount
    const offer = offers.find(o => o.id === offerId);
    const totalAmount = offer?.offeredPrice || offer?.counterPrice || tokenAmount * 4;
    
    setTokenPaymentOrderId(orderId);
    setTokenPaymentAmount(tokenAmount);
    setTokenPaymentTotalAmount(totalAmount);
    setShowTokenPaymentModal(true);
  };

  // Handle successful token payment
  const handleTokenPaymentSuccess = async (paymentId: string) => {
    console.log('✅ [handleTokenPaymentSuccess] Payment completed', {
      paymentId,
      orderId: tokenPaymentOrderId,
    });
    
    toast.success('🎉 Booking confirmed! Token payment received.');
    setShowTokenPaymentModal(false);
    setTokenPaymentOrderId(null);
    
    // Reload offers to get updated status
    await loadOffers();
  };

  // Handle inline offer form submit
  const handleInlineOfferSubmit = async () => {
    const finalListingId = listingId || selectedListingId;
    
    console.log('🔍 [handleInlineOfferSubmit] Starting', {
      finalListingId,
      currentThreadId,
      offeredPrice,
      customPrice,
      customRequirements,
      timestamp: new Date().toISOString(),
    });

    if (!currentThreadId) {
      console.error('❌ [handleInlineOfferSubmit] Missing currentThreadId');
      toast.error('Chat not initialized. Please refresh and try again.');
      return;
    }

    if (!finalListingId) {
      console.error('❌ [handleInlineOfferSubmit] Missing finalListingId', {
        listingId,
        selectedListingId,
      });
      toast.error('Please select a listing');
      return;
    }

    // When customization is enabled, use customPrice as the offer price
    // Otherwise, use offeredPrice field
    let offerPrice: number;
    if (enableCustomization) {
      if (!customPrice || parseFloat(customPrice) <= 0) {
        toast.error('Please enter a valid custom price');
        return;
      }
      offerPrice = parseFloat(customPrice);
    } else {
      if (!offeredPrice || parseFloat(offeredPrice) <= 0) {
        toast.error('Please enter a valid offer price');
        return;
      }
      offerPrice = parseFloat(offeredPrice);
    }

    const basePrice = enableCustomization 
      ? (currentListingPrice || 0)  // When customized, compare against original price
      : basePriceForOffer;  // Otherwise use current base price
    
    if (offerPrice >= basePrice) {
      toast.error(`Offer must be less than ${basePrice > 0 ? `₹${basePrice.toLocaleString('en-IN')}` : 'the listing price'}`);
      return;
    }

    // Validate mandatory fields: Event Type and Event Date
    if (!eventType.trim()) {
      toast.error('Please select an event type');
      return;
    }
    
    if (!eventDate) {
      toast.error('Please select an event date');
      return;
    }

    setSubmittingOffer(true);
    try {
      // Build customization object (only if user opted-in)
      const customizedPrice = enableCustomization && customPrice && parseFloat(customPrice) > 0 
        ? parseFloat(customPrice) 
        : (currentListingPrice || 0);
      
      const customizationObj = enableCustomization && (customRequirements.trim() || customPrice) 
        ? {
            customRequirements: customRequirements.trim() || undefined,
            customPrice: customPrice && parseFloat(customPrice) > 0 ? parseFloat(customPrice) : undefined,
            originalPrice: currentListingPrice || 0,
          }
        : undefined;

      const offerData = {
        threadId: currentThreadId,
        listingId: finalListingId,
        offeredPrice: offerPrice,
        customizedPrice: customizedPrice !== (currentListingPrice || 0) ? customizedPrice : undefined,
        customization: customizationObj ? JSON.stringify(customizationObj) : undefined,
        message: offerMessage.trim() || undefined,
        eventType: eventType.trim() || undefined,
        eventDate: eventDate || undefined,
        eventTime: eventTime || undefined,
        venueAddress: venueAddress.trim() || undefined,
        guestCount: guestCount ? parseInt(guestCount) : undefined,
      };

      console.log('📤 [handleInlineOfferSubmit] Creating offer', {
        offerData: {
          ...offerData,
          customization: offerData.customization ? 'present' : 'none',
        },
      });

      const response = await customerApi.createOffer(offerData);
      
      console.log('✅ [handleInlineOfferSubmit] API response', {
        success: response.success,
        message: response.message,
        hasData: !!response.data,
      });

      if (response.success) {
        toast.success('Offer sent successfully!');
        
        // Reset form
        setCustomRequirements('');
        setCustomPrice('');
        setOfferedPrice('');
        setOfferMessage('');
        setEventType('');
        setEventDate('');
        setEventTime('');
        setVenueAddress('');
        setGuestCount('');
        
        await loadOffers();
      } else {
        const errorMsg = response.message || 'Failed to create offer';
        console.error('❌ [handleInlineOfferSubmit] API returned error', {
          message: errorMsg,
          response,
        });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [handleInlineOfferSubmit] Exception caught', {
        error: err,
        errorType: err?.constructor?.name,
        message: err?.message,
        stack: err?.stack,
        finalListingId,
        currentThreadId,
        timestamp: new Date().toISOString(),
      });
      toast.error(err?.message || 'Failed to create offer. Please try again.');
    } finally {
      setSubmittingOffer(false);
    }
  };
  
  const getOfferStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const initializeChat = async () => {
    setLoading(true);
    try {
      const response = await customerApi.getOrCreateThread(vendorId);
      if (response.success && response.data) {
        const threadId = response.data.id || response.data.threadId;
        setCurrentThreadId(threadId);
        await loadMessages(threadId);
      } else {
        showWelcomeMessage();
      }
    } catch {
      showWelcomeMessage();
    } finally {
      setLoading(false);
    }
  };

  const showWelcomeMessage = () => {
    setMessages([{
      id: 'welcome',
      sender: 'vendor',
      text: `Hi! 👋 Thanks for reaching out to ${vendorName}. How can I help you today?`,
      timestamp: new Date(),
      read: true,
    }]);
  };

  const loadMessages = async (threadId: string) => {
    try {
      console.log('📥 [loadMessages] Loading messages for thread', { threadId });
      const response = await customerApi.getMessages(threadId, 0, 50);
      console.log('📥 [loadMessages] API response', { 
        success: response.success, 
        hasData: !!response.data,
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
        contentLength: response.data?.content?.length || response.data?.length || 0,
      });
      
      if (response.success) {
        const data = response.data?.content || response.data || [];
        if (data.length > 0) {
          // Reverse to show oldest first (backend returns newest first)
          const orderedMessages = data.map((msg: any) => ({
            id: msg.id,
            sender: msg.senderType?.toUpperCase() === 'VENDOR' ? 'vendor' : 'user',
            text: msg.content,
            timestamp: new Date(msg.createdAt),
            read: msg.isRead,
          })).reverse();
          console.log('✅ [loadMessages] Loaded messages', { count: orderedMessages.length });
          setMessages(orderedMessages);
        } else {
          console.log('ℹ️ [loadMessages] No messages found, showing welcome message');
          showWelcomeMessage();
        }
      } else {
        console.warn('⚠️ [loadMessages] API returned unsuccessful response', { response });
        showWelcomeMessage();
      }
    } catch (err: any) {
      console.error('❌ [loadMessages] Error loading messages', {
        error: err,
        message: err?.message,
        threadId,
      });
      // Don't show welcome message on error - preserve existing messages if any
      // Only show welcome if we have no messages
      if (messages.length === 0) {
        showWelcomeMessage();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (currentThreadId && user?.id && isConnected) {
      if (!isTyping) {
        setIsTyping(true);
        sendTypingIndicator(currentThreadId, user.id, 'CUSTOMER', true);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (currentThreadId && user?.id) {
          sendTypingIndicator(currentThreadId, user.id, 'CUSTOMER', false);
        }
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) {
      console.warn('⚠️ [handleSend] Empty message, skipping send');
      return;
    }

    const messageText = inputValue.trim();
    setInputValue('');
    setSending(true);

    // Create optimistic message before try block so it's available in catch
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
      read: false,
    };

    try {
      console.log('🔍 [handleSend] Starting to send message', {
        messageLength: messageText.length,
        currentThreadId,
        isAuthenticated,
        timestamp: new Date().toISOString(),
      });

      if (!currentThreadId) {
        console.error('❌ [handleSend] No currentThreadId, cannot send message');
        toast.error('Chat not initialized. Please refresh and try again.');
        setInputValue(messageText); // Restore message
        return;
      }

      if (!isAuthenticated) {
        console.error('❌ [handleSend] User not authenticated');
        toast.error('Please log in to send messages');
        setInputValue(messageText); // Restore message
        return;
      }

      // Optimistic update
      setMessages(prev => [...prev, optimisticMessage]);

      // Send message
      if (isConnected && user?.id) {
        console.log('📤 [handleSend] Sending via WebSocket', {
          threadId: currentThreadId,
          userId: user.id,
        });
        const sent = wsSendMessage(currentThreadId, user.id, 'CUSTOMER', messageText);
        if (!sent) {
          console.warn('⚠️ [handleSend] WebSocket send failed, falling back to HTTP', {
            threadId: currentThreadId,
          });
          await customerApi.sendMessage(currentThreadId, messageText);
        }
      } else {
        console.log('📤 [handleSend] WebSocket not connected, using HTTP', {
          threadId: currentThreadId,
          isConnected,
          hasUserId: !!user?.id,
        });
        await customerApi.sendMessage(currentThreadId, messageText);
      }

      console.log('✅ [handleSend] Message sent successfully', {
        threadId: currentThreadId,
        timestamp: new Date().toISOString(),
      });

      // Stop typing indicator
      if (currentThreadId && user?.id && isConnected) {
        sendTypingIndicator(currentThreadId, user.id, 'CUSTOMER', false);
        setIsTyping(false);
      }
    } catch (err: any) {
      console.error('❌ [handleSend] Exception caught', {
        error: err,
        errorType: err?.constructor?.name,
        message: err?.message,
        stack: err?.stack,
        threadId: currentThreadId,
        messageText: messageText.substring(0, 50), // Log first 50 chars only
        timestamp: new Date().toISOString(),
      });

      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setInputValue(messageText); // Restore message
      toast.error(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setInputValue(text);
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Create unified timeline: merge messages and offers chronologically
  type TimelineItem = {
    id: string;
    type: 'message' | 'offer';
    timestamp: Date;
    data: Message | any; // Message or Offer
  };

  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];
    
    // Add messages
    messages.forEach(msg => {
      items.push({
        id: `msg-${msg.id}`,
        type: 'message',
        timestamp: msg.timestamp,
        data: msg,
      });
    });
    
    // Add offers
    offers.forEach(offer => {
      items.push({
        id: `offer-${offer.id}`,
        type: 'offer',
        timestamp: new Date(offer.createdAt),
        data: offer,
      });
    });
    
    // Sort by timestamp (oldest first)
    items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return items;
  }, [messages, offers]);

  // Group timeline items by date for display
  const groupedTimeline = useMemo(() => {
    const grouped: Record<string, { date: Date; items: TimelineItem[] }> = {};
    timelineItems.forEach(item => {
      const dateKey = item.timestamp.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: item.timestamp, items: [] };
      }
      grouped[dateKey].items.push(item);
    });
    return grouped;
  }, [timelineItems]);

  // Group messages by date (for backward compatibility if needed)
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = msg.timestamp.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = { date: msg.timestamp, messages: [] };
    }
    acc[dateKey].messages.push(msg);
    return acc;
  }, {} as Record<string, { date: Date; messages: Message[] }>);

  console.log('🎯 [PremiumChatWindow] Component Render', {
    loading,
    messagesCount: messages.length,
    offersCount: offers.length,
    timelineItemsLength: timelineItems.length,
    groupedTimelineKeys: Object.keys(groupedTimeline).length,
    isAuthenticated,
    currentThreadId,
    hasValidListingId,
    openForNegotiation,
    hasSelectedListing: !!selectedListing,
    cardHeight: 'h-[600px] max-h-[90vh]',
  });

  return (
    <>
    <Card className="flex flex-col h-[85vh] max-h-[800px] rounded-2xl border shadow-lg overflow-hidden">
      <VisuallyHidden>
        <DialogTitle>Chat with {vendorName}</DialogTitle>
        <DialogDescription>Send messages to {vendorName}</DialogDescription>
      </VisuallyHidden>
      
      {/* Header */}
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {vendorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base">{vendorName}</h3>
              <div className="flex items-center gap-1.5">
                {isConnected ? (
                  <Badge variant="secondary" className="text-[10px] h-5 gap-1 bg-green-500/10 text-green-600">
                    <Wifi className="h-2.5 w-2.5" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                    <WifiOff className="h-2.5 w-2.5" />
                    {isAuthenticated ? 'Connecting...' : 'Log in to chat'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
{/* Close button handled by Dialog component */}
        </div>
      </CardHeader>
      
      {/* Unified Timeline View */}
      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        {/* Scrollable Messages Area - Using native scroll instead of Radix ScrollArea for better flex behavior */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-muted/10" style={{ scrollbarWidth: 'thin' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : timelineItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center py-8">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Send a message or make an offer to get started with {vendorName}
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {/* Unified Timeline: Messages and Offers merged chronologically */}
              {Object.values(groupedTimeline).map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date Divider */}
                  <div className="flex items-center justify-center my-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs font-medium text-muted-foreground bg-background px-3 py-1 rounded-full border">
                        {formatDateLabel(group.date)}
                      </span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                  </div>
                  
                  {/* Timeline Items (Messages and Offers) */}
                  {group.items.map((item) => {
                    // Render Offer
                    if (item.type === 'offer') {
                      const offer = item.data;
                      return (
                        <div key={item.id} className="mb-4">
                          <OfferCard
                            offer={offer}
                            isVendor={false}
                            onAcceptCounter={(id) => handleAcceptCounterOffer(id)}
                            onWithdraw={(id) => handleWithdrawOffer(id)}
                            onPayToken={(offerId, orderId, tokenAmount) => handlePayToken(offerId, orderId, tokenAmount)}
                          />
                        </div>
                      );
                    }
                    
                    // Render Message
                    const message = item.data;
                    return (
                    <div
                      key={message.id}
                      className={`flex gap-3 mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'vendor' && (
                        <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                            {vendorName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${message.sender === 'user' ? 'items-end max-w-[75%]' : 'items-start max-w-[75%]'}`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
                              : 'bg-muted/80 backdrop-blur-sm border border-border/50 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1.5 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.sender === 'user' && (
                            <CheckCheck className={`h-3.5 w-3.5 ${message.read ? 'text-primary' : 'text-muted-foreground'}`} />
                          )}
                        </div>
                      </div>
                      {message.sender === 'user' && (
                        <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background">
                          <AvatarFallback className="bg-gradient-to-br from-muted to-muted/80 text-foreground text-sm font-semibold">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {otherTyping && (
                <div className="flex gap-3 justify-start mb-4">
                  <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                      {vendorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Compact Inline Offer Form - Scrollable within max-height */}
        {(() => {
          const shouldShow = isAuthenticated && currentThreadId && hasValidListingId && openForNegotiation && selectedListing;
          console.log('🎯 [PremiumChatWindow] Offer Form Conditional Check', {
            isAuthenticated,
            currentThreadId,
            hasValidListingId,
            openForNegotiation,
            hasSelectedListing: !!selectedListing,
            shouldShowOfferForm: shouldShow,
          });
          return shouldShow;
        })() && (
          <div className="border-t bg-gradient-to-b from-muted/30 to-background/95 flex-shrink-0 max-h-[45%] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="p-3">
              <Card className="border-2 shadow-md bg-card/95 backdrop-blur">
                <CardContent className="p-3 space-y-2.5">
                {/* Header with collapse toggle */}
                <div className="flex items-start justify-between pb-2 border-b gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base leading-tight">Make an Offer</span>
                      <span className="text-[11px] text-muted-foreground">Negotiate directly from chat</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-0.5">Original Price</div>
                      <div className="font-bold text-primary flex items-center gap-1 text-lg">
                        <IndianRupee className="h-4 w-4" />
                        {(currentListingPrice || 0).toLocaleString('en-IN')}
                        {selectedListing.minimumQuantity && selectedListing.unit && (
                          <span className="text-xs text-muted-foreground font-normal ml-1">
                            ({selectedListing.minimumQuantity} {selectedListing.unit})
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setOfferFormExpanded((prev) => !prev)}
                      aria-label={offerFormExpanded ? 'Collapse offer form' : 'Expand offer form'}
                    >
                      {offerFormExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {offerFormExpanded && (
                  <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-2">
                    {/* Customize toggle */}
                    <div className="flex items-center justify-between bg-muted/50 border rounded-lg px-3 py-2">
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={enableCustomization}
                          onChange={(e) => setEnableCustomization(e.target.checked)}
                        />
                        Customize order
                      </label>
                      <span className="text-xs text-muted-foreground">Add requirements or a custom price</span>
                    </div>

                    {/* Customization fields (visible only when checked) */}
                    {enableCustomization && (
                      <div className="grid grid-cols-2 gap-2">
                        {/* Custom Requirements */}
                        <div className="space-y-1">
                          <Label htmlFor="customRequirements" className="text-xs font-medium">
                            Custom Requirements <span className="text-muted-foreground">(Optional)</span>
                          </Label>
                          <Textarea
                            id="customRequirements"
                            placeholder="e.g., 50 chairs, white color..."
                            value={customRequirements}
                            onChange={(e) => setCustomRequirements(e.target.value)}
                            rows={1}
                            className="resize-none text-xs border focus:border-primary/50 min-h-[32px]"
                          />
                        </div>

                        {/* Custom Price */}
                        <div className="space-y-1">
                          <Label htmlFor="customPrice" className="text-xs font-medium">
                            Custom Price <span className="text-muted-foreground">(Optional)</span>
                          </Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground z-10" />
                            <Input
                              id="customPrice"
                              type="number"
                              placeholder="Customized price"
                              value={customPrice}
                              onChange={(e) => setCustomPrice(e.target.value)}
                              className="pl-7 h-8 text-xs border focus:border-primary/50"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Offer Price - Only show when customization is NOT enabled */}
                    {!enableCustomization && (
                      <div className="space-y-1.5">
                        <Label htmlFor="offeredPrice" className="text-xs font-semibold flex items-center gap-1.5">
                          <HandCoins className="h-3 w-3 text-primary" />
                          Your Offer Price <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                          <Input
                            id="offeredPrice"
                            type="number"
                            placeholder="Enter your offer"
                            value={offeredPrice}
                            onChange={(e) => setOfferedPrice(e.target.value)}
                            className="pl-8 h-9 text-sm font-semibold border-2 border-primary/30 focus:border-primary"
                          />
                        </div>
                        {/* Quick Discount Buttons - Inline */}
                        {basePriceForOffer > 0 && priceSuggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {priceSuggestions.map((suggestion, idx) => (
                              <Button
                                key={idx}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] px-2 hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleQuickDiscount(suggestion)}
                              >
                                {suggestion.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Event Details - Single row (Event Type & Date are mandatory) */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="relative">
                        <Select value={eventType} onValueChange={setEventType}>
                          <SelectTrigger className={`h-7 text-xs ${!eventType.trim() ? 'border-orange-400' : 'border-green-400'}`}>
                            <SelectValue placeholder="Event *" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map((type) => (
                              <SelectItem key={type} value={type} className="text-xs">
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className={`h-7 text-xs ${!eventDate ? 'border-orange-400 focus:border-orange-500' : 'border-green-400'}`}
                          placeholder="Date *"
                        />
                      </div>
                      <Input
                        type="number"
                        placeholder="Guests"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleInlineOfferSubmit}
                      disabled={
                        submittingOffer ||
                        !eventType.trim() ||
                        !eventDate ||
                        (enableCustomization 
                          ? !customPrice || parseFloat(customPrice) <= 0 || parseFloat(customPrice) >= (currentListingPrice || 0)
                          : !offeredPrice || parseFloat(offeredPrice) <= 0 || parseFloat(offeredPrice) >= basePriceForOffer
                        )
                      }
                      className="w-full h-9 font-semibold text-sm"
                      size="sm"
                    >
                      {submittingOffer ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <HandCoins className="h-3.5 w-3.5 mr-1.5" />
                          Send Offer
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </div>
        )}
          
          {/* Chat Input */}
          <div className="border-t bg-background/95 backdrop-blur-sm px-4 pb-4 pt-3 flex-shrink-0">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  placeholder={isAuthenticated ? "Type a message..." : "Log in to send messages"}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !sending && !e.shiftKey) {
                      e.preventDefault();
                      try {
                        handleSend();
                      } catch (err: any) {
                        console.error('❌ Error sending message (Enter key):', {
                          error: err,
                          message: err?.message,
                        });
                      }
                    }
                  }}
                  className="h-11 pr-12 text-sm rounded-xl border-2 focus:border-primary/50 transition-all"
                  disabled={!isAuthenticated || sending}
                />
              </div>
              <Button 
                onClick={() => {
                  try {
                    handleSend();
                  } catch (err: any) {
                    console.error('❌ Error sending message (button click):', {
                      error: err,
                      message: err?.message,
                    });
                  }
                }}
                size="icon"
                className="h-11 w-11 rounded-xl shadow-sm hover:shadow-md transition-all"
                disabled={!inputValue.trim() || !isAuthenticated || sending}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
      </CardContent>
    </Card>
    
    {/* Token Payment Modal */}
    {showTokenPaymentModal && tokenPaymentOrderId && (
      <TokenPaymentModal
        isOpen={showTokenPaymentModal}
        onClose={() => setShowTokenPaymentModal(false)}
        orderId={tokenPaymentOrderId}
        tokenAmount={tokenPaymentAmount}
        totalAmount={tokenPaymentTotalAmount}
        onPaymentSuccess={handleTokenPaymentSuccess}
      />
    )}
  </>
  );
};
