import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Send, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useWebSocket, ChatMessage } from '@/shared/hooks/useWebSocket';
import { useAuth } from '@/shared/contexts/AuthContext';
import { customerApi } from '@/shared/services/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'user' | 'vendor';
  text: string;
  timestamp: Date;
  read?: boolean;
}

interface ChatWindowProps {
  vendorId: string;
  vendorName: string;
  threadId?: string;
  onClose?: () => void;
}

export const ChatWindow = ({ vendorId, vendorName, threadId, onClose }: ChatWindowProps) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(threadId || null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle incoming WebSocket message
  const handleIncomingMessage = useCallback((message: ChatMessage) => {
    if (currentThreadId && message.threadId === currentThreadId) {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, {
          id: message.id,
          sender: message.senderType === 'VENDOR' ? 'vendor' : 'user',
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
  });

  // Subscribe to thread when we have one
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

  // Load existing messages
  useEffect(() => {
    if (currentThreadId && isAuthenticated) {
      loadMessages();
    } else if (!currentThreadId) {
      // Show initial greeting
      setMessages([{
        id: '1',
        sender: 'vendor',
        text: `Hello! Thanks for your interest in ${vendorName}. How can I help you today?`,
        timestamp: new Date(),
        read: true,
      }]);
    }
  }, [currentThreadId, isAuthenticated, vendorName]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!currentThreadId) return;
    
    setLoading(true);
    try {
      const response = await customerApi.getMessages(currentThreadId, 0, 50);
      if (response.success) {
        const data = response.data?.content || response.data || [];
        setMessages(data.map((msg: any) => ({
          id: msg.id,
          sender: msg.senderType === 'VENDOR' ? 'vendor' : 'user',
          text: msg.content,
          timestamp: new Date(msg.createdAt),
          read: msg.isRead,
        })));
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
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
        sendTypingIndicator(currentThreadId, user.id, 'CUSTOMER', false);
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    setInputValue('');

    // Stop typing indicator
    if (isTyping && currentThreadId && user?.id) {
      setIsTyping(false);
      sendTypingIndicator(currentThreadId, user.id, 'CUSTOMER', false);
    }

    if (!isAuthenticated) {
      toast.error('Please log in to send messages');
      return;
    }

    // If no thread exists, create one first
    if (!currentThreadId) {
      setSending(true);
      try {
        const response = await customerApi.getOrCreateThread(vendorId);
        if (response.success && response.data) {
          const newThreadId = response.data.threadId || response.data.id;
          setCurrentThreadId(newThreadId);
          
          // Now send the first message
          const msgResponse = await customerApi.sendMessage(newThreadId, messageText);
          if (msgResponse.success) {
            const newMessage: Message = {
              id: Date.now().toString(),
              sender: 'user',
              text: messageText,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, newMessage]);
          }
        } else {
          toast.error('Failed to start chat');
          setInputValue(messageText);
        }
      } catch (err: any) {
        console.error('Error starting chat:', err);
        toast.error(err.message || 'Failed to start chat');
        setInputValue(messageText);
      } finally {
        setSending(false);
      }
      return;
    }

    // Send via WebSocket if connected
    if (isConnected && user?.id) {
      const sent = wsSendMessage(currentThreadId, user.id, 'CUSTOMER', messageText);
      if (sent) {
        console.log('Message sent via WebSocket');
        return;
      }
    }

    // Fallback to REST API
    setSending(true);
    try {
      const response = await customerApi.sendMessage(currentThreadId, messageText);
      if (response.success) {
        await loadMessages();
      } else {
        toast.error('Failed to send message');
        setInputValue(messageText);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error(err.message || 'Failed to send message');
      setInputValue(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{vendorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{vendorName}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span>Live chat</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-yellow-500" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'vendor' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{vendorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {otherTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{vendorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder={isAuthenticated ? "Type your message..." : "Please log in to chat"}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={!isAuthenticated || sending}
            />
            <Button onClick={handleSend} size="icon" disabled={!isAuthenticated || sending || !inputValue.trim()}>
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
  );
};
