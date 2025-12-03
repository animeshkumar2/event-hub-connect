import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Send, MessageCircle, X, Phone, Video } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

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
  onClose?: () => void;
}

export const PremiumChatWindow = ({ vendorId, vendorName, onClose }: PremiumChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'vendor',
      text: `Hello! Thanks for your interest in ${vendorName}. How can I help you today?`,
      timestamp: new Date(Date.now() - 3600000),
      read: true,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Simulate vendor response
    setTimeout(() => {
      const responses = [
        'Thank you for your message! Let me check that for you.',
        'That sounds great! I can definitely help with that.',
        'I\'ll get back to you with more details shortly.',
        'Yes, we can accommodate that request.',
      ];
      const vendorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'vendor',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        read: false,
      };
      setMessages((prev) => [...prev, vendorResponse]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-[700px] rounded-2xl border-0 shadow-elegant overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary-glow/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {vendorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{vendorName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
                  Usually replies within 1 hour
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Video className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 bg-muted/20">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'vendor' && (
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {vendorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-white rounded-tl-none border'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        <div className="border-t bg-white p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="rounded-xl border-2 focus:border-primary"
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="rounded-xl shadow-md hover-lift"
              disabled={!inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


