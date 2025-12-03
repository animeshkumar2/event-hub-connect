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
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatThread {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  event: string;
  status: 'lead' | 'booked';
}

interface Message {
  id: string;
  sender: 'vendor' | 'customer';
  text: string;
  time: string;
  attachment?: { type: 'image' | 'pdf'; url: string; name: string };
}

export default function VendorChat() {
  const [selectedChat, setSelectedChat] = useState<ChatThread | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const threads: ChatThread[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      lastMessage: 'Can you share some samples of your work?',
      time: '2 min ago',
      unread: 2,
      avatar: 'P',
      event: 'Wedding - Dec 15',
      status: 'lead',
    },
    {
      id: '2',
      name: 'Rahul Mehta',
      lastMessage: 'Thanks for the quote! Let me discuss with my team.',
      time: '1 hour ago',
      unread: 0,
      avatar: 'R',
      event: 'Corporate - Dec 20',
      status: 'lead',
    },
    {
      id: '3',
      name: 'Sharma Family',
      lastMessage: 'Looking forward to the event!',
      time: '3 hours ago',
      unread: 0,
      avatar: 'S',
      event: 'Wedding - Dec 15',
      status: 'booked',
    },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      sender: 'customer',
      text: 'Hi, I saw your portfolio and loved your work!',
      time: '10:30 AM',
    },
    {
      id: '2',
      sender: 'vendor',
      text: 'Thank you so much! I\'d be happy to discuss your requirements. What kind of event are you planning?',
      time: '10:32 AM',
    },
    {
      id: '3',
      sender: 'customer',
      text: 'It\'s for my wedding on December 15th. We need photography for the entire day.',
      time: '10:35 AM',
    },
    {
      id: '4',
      sender: 'vendor',
      text: 'That sounds wonderful! I have that date available. Let me share some wedding samples with you.',
      time: '10:36 AM',
    },
    {
      id: '5',
      sender: 'vendor',
      text: '',
      time: '10:37 AM',
      attachment: { type: 'image', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', name: 'wedding-sample.jpg' },
    },
    {
      id: '6',
      sender: 'customer',
      text: 'Can you share some samples of your work?',
      time: '10:40 AM',
    },
  ];

  const cannedReplies = [
    'Thank you for reaching out! I\'d be happy to help.',
    'Let me check my availability and get back to you.',
    'I\'ll send you a detailed quote shortly.',
    'Feel free to ask any questions!',
  ];

  useEffect(() => {
    if (selectedChat) {
      setMessages(mockMessages);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'vendor',
      text: inputValue,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  const handleCannedReply = (reply: string) => {
    setInputValue(reply);
  };

  return (
    <VendorLayout>
      <div className="p-6 h-[calc(100vh-24px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <Card className="border-border shadow-card border-border h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground">Messages</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input placeholder="Search conversations..." className="pl-10 bg-muted/50 border-border text-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-240px)]">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedChat(thread)}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedChat?.id === thread.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold text-lg">{thread.avatar}</span>
                        </div>
                        {thread.unread > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-xs text-secondary-foreground font-bold">{thread.unread}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-foreground font-medium truncate">{thread.name}</p>
                          <span className="text-xs text-foreground/40">{thread.time}</span>
                        </div>
                        <p className="text-sm text-foreground/60 truncate">{thread.lastMessage}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={thread.status === 'booked' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'} variant="outline">
                            {thread.status}
                          </Badge>
                          <span className="text-xs text-foreground/40">{thread.event}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <Card className="border-border shadow-card border-border h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold text-lg">{selectedChat.avatar}</span>
                      </div>
                      <div>
                        <CardTitle className="text-foreground">{selectedChat.name}</CardTitle>
                        <p className="text-sm text-foreground/60">{selectedChat.event}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-foreground">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Booking CTA */}
                  {selectedChat.status === 'lead' && (
                    <div className="mt-4 p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-foreground">Ready to book?</span>
                      </div>
                      <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        Send Booking Link <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-[calc(100vh-420px)] p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl p-4 ${
                              message.sender === 'vendor'
                                ? 'bg-secondary text-secondary-foreground rounded-br-none'
                                : 'bg-white/10 text-foreground rounded-bl-none'
                            }`}
                          >
                            {message.attachment ? (
                              <div>
                                {message.attachment.type === 'image' && (
                                  <img 
                                    src={message.attachment.url} 
                                    alt={message.attachment.name}
                                    className="rounded-lg max-w-full h-auto mb-2"
                                  />
                                )}
                                {message.attachment.type === 'pdf' && (
                                  <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-sm">{message.attachment.name}</span>
                                  </div>
                                )}
                              </div>
                            ) : null}
                            {message.text && <p className="text-sm">{message.text}</p>}
                            <p className={`text-xs mt-1 ${message.sender === 'vendor' ? 'text-secondary-foreground/60' : 'text-foreground/40'}`}>
                              {message.time}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={scrollRef} />
                    </div>
                  </ScrollArea>
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 bg-muted/50 border-border text-foreground"
                    />
                    <Button 
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    >
                      <Send className="h-5 w-5" />
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
