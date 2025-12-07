import { useState, useRef, useEffect } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { 
  Search, 
  Send, 
  Paperclip, 
  Image, 
  FileText,
  Phone,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorChatThreads } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format } from 'date-fns';

interface ChatThread {
  id: string;
  customer?: {
    name?: string;
    email?: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  order?: {
    id?: string;
    eventType?: string;
    eventDate?: string;
  };
}

interface Message {
  id: string;
  content: string;
  senderType: 'VENDOR' | 'CUSTOMER';
  createdAt: string;
}

export default function VendorChat() {
  const { data: threadsData, loading: threadsLoading, refetch: refetchThreads } = useVendorChatThreads();
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const threads: ChatThread[] = threadsData || [];

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const response = await vendorApi.getMessages(threadId, 0, 50);
      if (response.success) {
        const messagesData = response.data?.content || response.data || [];
        setMessages(messagesData);
        // Mark thread as read
        try {
          await vendorApi.markThreadAsRead(threadId);
          refetchThreads();
        } catch (err) {
          console.error('Error marking thread as read:', err);
        }
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedThread) return;

    setSending(true);
    try {
      const response = await vendorApi.sendMessage(selectedThread.id, inputValue.trim());
      if (response.success) {
        setInputValue('');
        await loadMessages(selectedThread.id);
        refetchThreads();
      } else {
        toast.error(response.message || 'Failed to send message');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) return 'Today';
      return format(date, 'MMM dd');
    } catch {
      return dateString;
    }
  };

  const cannedReplies = [
    'Thank you for reaching out! I\'d be happy to help.',
    'Let me check my availability and get back to you.',
    'I\'ll send you a detailed quote shortly.',
    'Feel free to ask any questions!',
  ];

  const handleCannedReply = (reply: string) => {
    setInputValue(reply);
  };

  return (
    <VendorLayout>
      <div className="p-6 h-[calc(100vh-24px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <Card className="border-border shadow-card border-border h-full flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground">Messages</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input placeholder="Search conversations..." className="pl-10 bg-muted/50 border-border text-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                {threadsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : threads.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-center">
                    <div>
                      <MessageSquare className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                      <p className="text-foreground/60">No conversations yet</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    {threads.map((thread) => (
                      <div
                        key={thread.id}
                        onClick={() => setSelectedThread(thread)}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedThread?.id === thread.id ? 'bg-white/10' : ''
                        }`}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-semibold text-lg">
                              {thread.customer?.name?.[0]?.toUpperCase() || 'C'}
                            </span>
                          </div>
                          {thread.unreadCount && thread.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                              <span className="text-xs text-secondary-foreground font-bold">{thread.unreadCount}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-foreground font-medium truncate">{thread.customer?.name || 'Customer'}</p>
                            {thread.lastMessageAt && (
                              <span className="text-xs text-foreground/40">{formatDate(thread.lastMessageAt)}</span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/60 truncate">{thread.lastMessage || 'No messages yet'}</p>
                          {thread.order && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-blue-500/20 text-blue-400" variant="outline">
                                {thread.order.eventType || 'Event'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedThread ? (
              <Card className="border-border shadow-card border-border h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold text-lg">
                          {selectedThread.customer?.name?.[0]?.toUpperCase() || 'C'}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-foreground">{selectedThread.customer?.name || 'Customer'}</CardTitle>
                        {selectedThread.order && (
                          <p className="text-sm text-foreground/60">
                            {selectedThread.order.eventType || 'Event'}
                            {selectedThread.order.eventDate && ` • ${formatDate(selectedThread.order.eventDate)}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-foreground">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-hidden p-0">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-420px)] p-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-foreground/60">No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.senderType === 'VENDOR' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl p-4 ${
                                  message.senderType === 'VENDOR'
                                    ? 'bg-secondary text-secondary-foreground rounded-br-none'
                                    : 'bg-white/10 text-foreground rounded-bl-none'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${message.senderType === 'VENDOR' ? 'text-secondary-foreground/60' : 'text-foreground/40'}`}>
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={scrollRef} />
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>

                {/* Canned Replies */}
                <div className="px-4 pb-2">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {cannedReplies.map((reply, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCannedReply(reply)}
                        className="border-white/20 text-foreground/60 hover:text-foreground whitespace-nowrap text-xs"
                      >
                        {reply.slice(0, 30)}...
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-3">
                    <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-foreground">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-foreground">
                      <Image className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      className="flex-1 bg-muted/50 border-border text-foreground"
                      disabled={sending}
                    />
                    <Button 
                      onClick={handleSend}
                      disabled={!inputValue.trim() || sending}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-border shadow-card border-border h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
                  <p className="text-foreground/40 text-lg">Select a conversation</p>
                  <p className="text-foreground/30 text-sm">Choose a chat from the list to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
