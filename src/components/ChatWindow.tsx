import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  onClose?: () => void;
}

export const ChatWindow = ({ vendorId, vendorName, onClose }: ChatWindowProps) => {
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

    // Simulate vendor response after 2 seconds
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
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{vendorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{vendorName}</CardTitle>
              <p className="text-xs text-muted-foreground">Usually replies within 1 hour</p>
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
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


