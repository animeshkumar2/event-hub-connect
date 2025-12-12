import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Send, Loader2, Wifi, WifiOff, Sparkles, CheckCheck } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { useWebSocket, ChatMessage } from '@/shared/hooks/useWebSocket';
import { useAuth } from '@/shared/contexts/AuthContext';
import { customerApi } from '@/shared/services/api';
import { toast } from 'sonner';
import { DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format, isToday, isYesterday } from 'date-fns';

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
  onClose?: () => void;  // Note: Dialog already has a close button, this is optional
}

// Customer quick suggestions
const CUSTOMER_SUGGESTIONS = [
  { icon: '📅', text: "What dates are you available?" },
  { icon: '💰', text: "Can you share your pricing?" },
  { icon: '📸', text: "Do you have a portfolio?" },
  { icon: '📦', text: "What packages do you offer?" },
];

export const PremiumChatWindow = ({ vendorId, vendorName, onClose }: PremiumChatWindowProps) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const response = await customerApi.getMessages(threadId, 0, 50);
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
          setMessages(orderedMessages);
        } else {
          showWelcomeMessage();
        }
      }
    } catch {
      // Silently fail and show welcome
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
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    setInputValue('');

    if (isTyping && currentThreadId && user?.id) {
      setIsTyping(false);
      sendTypingIndicator(currentThreadId, user.id, 'CUSTOMER', false);
    }

    if (!isAuthenticated) {
      toast.error('Please log in to send messages');
      return;
    }

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    setSending(true);
    try {
      if (!currentThreadId) {
        const threadResponse = await customerApi.getOrCreateThread(vendorId);
        if (threadResponse.success && threadResponse.data) {
          const newThreadId = threadResponse.data.id || threadResponse.data.threadId;
          setCurrentThreadId(newThreadId);
          await customerApi.sendMessage(newThreadId, messageText);
        }
      } else {
        if (isConnected && user?.id) {
          const sent = wsSendMessage(currentThreadId, user.id, 'CUSTOMER', messageText);
          if (!sent) {
            await customerApi.sendMessage(currentThreadId, messageText);
          }
        } else {
          await customerApi.sendMessage(currentThreadId, messageText);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setInputValue(messageText);
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

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = msg.timestamp.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = { date: msg.timestamp, messages: [] };
    }
    acc[dateKey].messages.push(msg);
    return acc;
  }, {} as Record<string, { date: Date; messages: Message[] }>);

  return (
    <Card className="flex flex-col h-[600px] rounded-2xl border shadow-lg overflow-hidden">
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
      
      {/* Messages */}
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {Object.values(groupedMessages).map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date Divider */}
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {formatDateLabel(group.date)}
                    </span>
                  </div>
                  
                  {/* Messages */}
                  {group.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 mb-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'vendor' && (
                        <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {vendorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="max-w-[75%]">
                        <div
                          className={`rounded-2xl px-3.5 py-2 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.sender === 'user' && (
                            <CheckCheck className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {otherTyping && (
                <div className="flex gap-2 justify-start mb-3">
                  <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {vendorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        {/* Suggestions - Only show when no messages or authenticated */}
        {isAuthenticated && messages.length <= 1 && (
          <div className="px-4 py-2 border-t bg-muted/30">
            <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Suggested questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CUSTOMER_SUGGESTIONS.map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestion(suggestion.text)}
                  className="text-[11px] h-7 gap-1 hover:bg-primary/5 hover:border-primary/30"
                >
                  <span>{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="border-t bg-card p-3">
          <div className="flex gap-2 items-center">
            <Input
              placeholder={isAuthenticated ? "Type a message..." : "Log in to send messages"}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && !sending && handleSend()}
              className="flex-1 h-10 text-sm"
              disabled={!isAuthenticated || sending}
            />
            <Button 
              onClick={handleSend} 
              size="icon"
              className="h-10 w-10 rounded-full"
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
  );
};
