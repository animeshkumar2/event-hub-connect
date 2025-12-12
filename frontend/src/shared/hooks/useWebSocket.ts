import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8081/ws';

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderType: 'VENDOR' | 'CUSTOMER';
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface TypingIndicator {
  threadId: string;
  userId: string;
  userType: 'VENDOR' | 'CUSTOMER';
  isTyping: boolean;
}

export interface ReadReceipt {
  threadId: string;
  userId: string;
  isVendor: boolean;
}

interface UseWebSocketOptions {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (indicator: TypingIndicator) => void;
  onRead?: (receipt: ReadReceipt) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  enabled?: boolean; // Allow disabling WebSocket
}

// Track if WebSocket feature is working to prevent spam
let wsDisabled = false;
let failureCount = 0;
const MAX_FAILURES = 3;

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true } = options;
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const isConnectingRef = useRef(false);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    // Don't connect if disabled globally or locally
    if (wsDisabled || !enabled) {
      console.log('WebSocket disabled, skipping connection');
      return;
    }

    // Prevent multiple simultaneous connections
    if (isConnectingRef.current || clientRef.current?.active) {
      return;
    }

    isConnectingRef.current = true;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 10000, // Increase delay to reduce spam
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (import.meta.env.DEV && !str.includes('>>> PING') && !str.includes('<<< PONG')) {
          console.log('[STOMP]', str);
        }
      },
      onConnect: () => {
        if (!mountedRef.current) return;
        console.log('WebSocket connected');
        failureCount = 0; // Reset failure count on success
        setIsConnected(true);
        setConnectionError(null);
        isConnectingRef.current = false;
        options.onConnect?.();
      },
      onDisconnect: () => {
        if (!mountedRef.current) return;
        console.log('WebSocket disconnected');
        setIsConnected(false);
        isConnectingRef.current = false;
        options.onDisconnect?.();
      },
      onStompError: (frame) => {
        if (!mountedRef.current) return;
        console.error('STOMP error:', frame.headers['message']);
        const error = new Error(frame.headers['message'] || 'STOMP connection error');
        setConnectionError(error);
        isConnectingRef.current = false;
        failureCount++;
        if (failureCount >= MAX_FAILURES) {
          wsDisabled = true;
          console.warn('WebSocket disabled after too many failures');
        }
      },
      onWebSocketError: () => {
        if (!mountedRef.current) return;
        // Don't spam error logs - just increment counter
        isConnectingRef.current = false;
        failureCount++;
        if (failureCount >= MAX_FAILURES) {
          wsDisabled = true;
          console.warn('WebSocket disabled after too many failures. Chat will use HTTP fallback.');
          // Deactivate the client to stop reconnection attempts
          client.deactivate();
        }
      },
    });

    client.activate();
    clientRef.current = client;
  }, [options, enabled]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      // Unsubscribe all
      subscriptionsRef.current.forEach((sub) => {
        try { sub.unsubscribe(); } catch (e) { /* ignore */ }
      });
      subscriptionsRef.current.clear();
      
      try {
        clientRef.current.deactivate();
      } catch (e) {
        // Ignore deactivation errors
      }
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const subscribeToThread = useCallback((threadId: string) => {
    if (!clientRef.current?.active) {
      return;
    }

    // Don't subscribe twice
    if (subscriptionsRef.current.has(`chat-${threadId}`)) {
      return;
    }

    try {
      // Subscribe to messages
      const messageSub = clientRef.current.subscribe(
        `/topic/chat/${threadId}`,
        (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          options.onMessage?.(chatMessage);
        }
      );
      subscriptionsRef.current.set(`chat-${threadId}`, messageSub);

      // Subscribe to typing indicators
      const typingSub = clientRef.current.subscribe(
        `/topic/chat/${threadId}/typing`,
        (message: IMessage) => {
          const indicator: TypingIndicator = JSON.parse(message.body);
          options.onTyping?.(indicator);
        }
      );
      subscriptionsRef.current.set(`typing-${threadId}`, typingSub);

      // Subscribe to read receipts
      const readSub = clientRef.current.subscribe(
        `/topic/chat/${threadId}/read`,
        (message: IMessage) => {
          const receipt: ReadReceipt = JSON.parse(message.body);
          options.onRead?.(receipt);
        }
      );
      subscriptionsRef.current.set(`read-${threadId}`, readSub);
    } catch (e) {
      console.error('Error subscribing to thread:', e);
    }
  }, [options]);

  const unsubscribeFromThread = useCallback((threadId: string) => {
    ['chat', 'typing', 'read'].forEach((type) => {
      const key = `${type}-${threadId}`;
      const sub = subscriptionsRef.current.get(key);
      if (sub) {
        try { sub.unsubscribe(); } catch (e) { /* ignore */ }
        subscriptionsRef.current.delete(key);
      }
    });
  }, []);

  const sendMessage = useCallback((threadId: string, senderId: string, senderType: 'VENDOR' | 'CUSTOMER', content: string) => {
    if (!clientRef.current?.active) {
      return false;
    }

    try {
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          threadId,
          senderId,
          senderType,
          content,
        }),
      });
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const sendTypingIndicator = useCallback((threadId: string, userId: string, userType: 'VENDOR' | 'CUSTOMER', isTyping: boolean) => {
    if (!clientRef.current?.active) return;

    try {
      clientRef.current.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({
          threadId,
          userId,
          userType,
          isTyping,
        }),
      });
    } catch (e) {
      // Ignore typing indicator errors
    }
  }, []);

  const sendReadReceipt = useCallback((threadId: string, userId: string, isVendor: boolean) => {
    if (!clientRef.current?.active) return;

    try {
      clientRef.current.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({
          threadId,
          userId,
          isVendor,
        }),
      });
    } catch (e) {
      // Ignore read receipt errors
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    // Only connect if enabled and not already disabled
    if (enabled && !wsDisabled) {
      // Delay connection slightly to avoid React StrictMode double-mount issues
      const timeout = setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, 100);
      
      return () => {
        clearTimeout(timeout);
        mountedRef.current = false;
        disconnect();
      };
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [enabled]); // Remove connect/disconnect from deps to prevent loops

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribeToThread,
    unsubscribeFromThread,
    sendMessage,
    sendTypingIndicator,
    sendReadReceipt,
    isDisabled: wsDisabled,
  };
}
