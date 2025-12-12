import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { 
  Search, 
  Send, 
  MessageSquare,
  Loader2,
  Wifi,
  WifiOff,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorChatThreads } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format, isToday, isYesterday } from 'date-fns';
import { useWebSocket, ChatMessage } from '@/shared/hooks/useWebSocket';
import { useAuth } from '@/shared/contexts/AuthContext';

interface ChatThread {
  id: string;
  customerName?: string;
  customerEmail?: string;
  customerInitials?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  isReadByVendor?: boolean;
  orderId?: string;
  leadId?: string;
}

interface Message {
  id: string;
  content: string;
  senderType: 'VENDOR' | 'CUSTOMER';
  createdAt: string;
}

const QUICK_REPLIES = [
  "Thank you for reaching out!",
  "Let me check availability.",
  "I'll send you a quote.",
  "Could you share more details?",
];

export default function VendorChat() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: threadsData, loading: threadsLoading, refetch: refetchThreads } = useVendorChatThreads();
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const threads: ChatThread[] = threadsData || [];

  // Restore selected thread from URL on load
  useEffect(() => {
    const threadId = searchParams.get('thread');
    if (threadId && threads.length > 0 && !selectedThread) {
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        setSelectedThread(thread);
        setShowMobileChat(true);
        // Load messages immediately when restoring from URL
        loadMessages(thread.id);
      }
    }
  }, [threads, searchParams]); // Removed selectedThread to avoid re-triggering

  // Update URL when thread is selected
  const handleSelectThread = (thread: ChatThread) => {
    setSelectedThread(thread);
    setSearchParams({ thread: thread.id });
  };

  const filteredThreads = threads.filter(thread => 
    !searchQuery || 
    thread.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIncomingMessage = useCallback((message: ChatMessage) => {
    if (selectedThread && message.threadId === selectedThread.id) {
      setMessages(prev => {
        const isDuplicate = prev.some(m => 
          m.id === message.id || 
          (m.content === message.content && 
           m.senderType?.toUpperCase() === message.senderType?.toUpperCase() &&
           Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000)
        );
        if (isDuplicate) return prev;
        return [...prev, {
          id: message.id,
          content: message.content,
          senderType: message.senderType?.toUpperCase() as 'VENDOR' | 'CUSTOMER',
          createdAt: message.createdAt,
        }];
      });
    }
    refetchThreads();
  }, [selectedThread, refetchThreads]);

  const handleTypingIndicator = useCallback((indicator: { threadId: string; userType: string; isTyping: boolean }) => {
    if (selectedThread && indicator.threadId === selectedThread.id && indicator.userType === 'CUSTOMER') {
      setOtherTyping(indicator.isTyping);
    }
  }, [selectedThread]);

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

  useEffect(() => {
    if (selectedThread && isConnected) {
      subscribeToThread(selectedThread.id);
      if (user?.id) {
        sendReadReceipt(selectedThread.id, user.id, true);
      }
    }
    return () => {
      if (selectedThread) {
        unsubscribeFromThread(selectedThread.id);
      }
    };
  }, [selectedThread, isConnected, subscribeToThread, unsubscribeFromThread, user, sendReadReceipt]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
      setShowMobileChat(true);
    }
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (selectedThread && user?.id && isConnected) {
      if (!isTyping) {
        setIsTyping(true);
        sendTypingIndicator(selectedThread.id, user.id, 'VENDOR', true);
      }
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(selectedThread.id, user.id, 'VENDOR', false);
      }, 2000);
    }
  };

  const loadMessages = async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const response = await vendorApi.getMessages(threadId, 0, 50);
      if (response.success) {
        const messagesData = response.data?.content || response.data || [];
        // Reverse to show oldest first (backend returns newest first)
        const normalizedMessages = messagesData.map((msg: any) => ({
          ...msg,
          senderType: msg.senderType?.toUpperCase() || 'CUSTOMER',
        })).reverse();
        setMessages(normalizedMessages);
        await vendorApi.markThreadAsRead(threadId);
        refetchThreads();
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedThread || !user?.id) return;

    const messageContent = inputValue.trim();
    setInputValue('');
    
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(selectedThread.id, user.id, 'VENDOR', false);
    }

    if (isConnected) {
      const sent = wsSendMessage(selectedThread.id, user.id, 'VENDOR', messageContent);
      if (sent) return;
    }

    setSending(true);
    try {
      const response = await vendorApi.sendMessage(selectedThread.id, messageContent);
      if (response.success) {
        await loadMessages(selectedThread.id);
        refetchThreads();
      } else {
        toast.error('Failed to send message');
        setInputValue(messageContent);
      }
    } catch {
      toast.error('Failed to send message');
      setInputValue(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return '';
    }
  };

  const formatThreadTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isToday(date)) return format(date, 'h:mm a');
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMM d');
    } catch {
      return '';
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  messages.forEach(msg => {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: getDateLabel(msg.createdAt), messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  const handleBack = () => {
    setShowMobileChat(false);
    setSelectedThread(null);
    setSearchParams({});
  };

  return (
    <VendorLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-semibold mb-4">Messages</h1>
        
        <Card className="h-[calc(100vh-180px)] flex overflow-hidden">
          {/* Thread List */}
          <div className={`w-full md:w-80 border-r flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Search Header */}
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {threads.length} conversation{threads.length !== 1 ? 's' : ''}
                </span>
                <div className={`flex items-center gap-1 text-xs ${isConnected ? 'text-green-600' : 'text-amber-600'}`}>
                  {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isConnected ? 'Live' : 'Offline'}
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-8 h-9 text-sm bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Thread List */}
            <ScrollArea className="flex-1">
              {threadsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No conversations</p>
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`flex items-start gap-3 p-3 cursor-pointer border-b transition-colors ${
                      selectedThread?.id === thread.id 
                        ? 'bg-primary/5 border-l-2 border-l-primary' 
                        : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                    }`}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {thread.customerInitials || thread.customerName?.charAt(0)?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${!thread.isReadByVendor ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                          {thread.customerName || 'Customer'}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0">
                          {formatThreadTime(thread.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${!thread.isReadByVendor ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                        {thread.lastMessagePreview || 'Start a conversation'}
                      </p>
                      {(thread.orderId || thread.leadId) && (
                        <Badge variant="secondary" className="mt-1 text-[10px] h-4 px-1.5">
                          {thread.orderId ? '📦 Order' : '✨ Lead'}
                        </Badge>
                      )}
                    </div>
                    {!thread.isReadByVendor && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col min-w-0 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedThread ? (
              <>
                {/* Chat Header */}
                <div className="h-14 border-b px-4 flex items-center gap-3 flex-shrink-0 bg-card">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden h-8 w-8"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {selectedThread.customerInitials || selectedThread.customerName?.charAt(0)?.toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm truncate">{selectedThread.customerName || 'Customer'}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedThread.customerEmail || 'Customer inquiry'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                      </div>
                    ) : (
                      groupedMessages.map((group, idx) => (
                        <div key={idx}>
                          <div className="flex justify-center my-4">
                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {group.date}
                            </span>
                          </div>
                          {group.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex mb-2 ${message.senderType === 'VENDOR' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] md:max-w-[70%]`}>
                                <div
                                  className={`rounded-2xl px-3 py-2 ${
                                    message.senderType === 'VENDOR'
                                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                                      : 'bg-muted text-foreground rounded-bl-sm'
                                  }`}
                                >
                                  <p className="text-sm break-words">{message.content}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-0.5 px-1 ${message.senderType === 'VENDOR' ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatMessageTime(message.createdAt)}
                                  </span>
                                  {message.senderType === 'VENDOR' && (
                                    <CheckCheck className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                    
                    {otherTyping && (
                      <div className="flex justify-start mb-2">
                        <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Replies */}
                <div className="px-3 py-2 border-t flex-shrink-0">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {QUICK_REPLIES.map((reply, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => setInputValue(reply)}
                        className="flex-shrink-0 text-xs h-7 px-2"
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 border-t flex-shrink-0 bg-card">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 h-10"
                      disabled={sending}
                    />
                    <Button 
                      onClick={handleSend}
                      disabled={!inputValue.trim() || sending}
                      size="icon"
                      className="h-10 w-10"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-medium mb-1">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">Choose from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </VendorLayout>
  );
}
