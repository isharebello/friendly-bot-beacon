import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Headphones, Clock, ShoppingCart, CreditCard, HelpCircle } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickActions = [
  { icon: ShoppingCart, label: "Track Order", query: "track my order" },
  { icon: CreditCard, label: "Billing", query: "billing question" },
  { icon: HelpCircle, label: "Help", query: "I need help" },
];

const botResponses: Record<string, string> = {
  "track my order": "I'd be happy to help you track your order! Please provide your order number (usually starts with #) and I'll look it up for you right away.",
  "billing question": "I can help with billing inquiries. Are you looking to update payment information, view invoices, or resolve a billing issue? Please let me know more details.",
  "I need help": "I'm here to help! I can assist with order tracking, billing questions, account issues, product information, returns, and more. What specific area can I help you with today?",
  "hello": "Hello! Welcome to our customer support. I'm here to help you with any questions or concerns. How can I assist you today?",
  "hi": "Hi there! Thanks for reaching out. I'm your customer service assistant. What can I help you with today?",
  "refund": "I understand you're looking for information about refunds. Our refund policy allows returns within 30 days of purchase. Could you please provide your order number so I can check the details for you?",
  "return": "I can help you with returns! Items can be returned within 30 days in original condition. Do you have your order number handy? This will help me process your return request faster.",
  "cancel order": "I can help you cancel your order if it hasn't shipped yet. Please provide your order number and I'll check the status right away.",
  "shipping": "I can provide shipping information! Are you asking about shipping costs, delivery times, or tracking an existing shipment? Please let me know your specific question.",
  "account": "I can help with account-related questions. Are you having trouble logging in, need to update your information, or have other account concerns?",
  "password": "If you're having trouble with your password, I can guide you through resetting it. Please check your email for a password reset link, or let me know if you need me to send another one."
};

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your customer service assistant. I'm here to help with orders, billing, returns, and any other questions you might have. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(botResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    // Check for common keywords
    if (message.includes("order") && message.includes("status")) {
      return "I can help you check your order status. Please provide your order number and I'll look it up immediately.";
    }
    
    if (message.includes("cancel") || message.includes("cancelled")) {
      return "I understand you want to cancel something. Could you specify if it's an order, subscription, or service? I'll help you with the cancellation process.";
    }
    
    if (message.includes("thank")) {
      return "You're very welcome! I'm glad I could help. Is there anything else I can assist you with today?";
    }
    
    if (message.includes("bye") || message.includes("goodbye")) {
      return "Thank you for contacting us! Have a wonderful day and don't hesitate to reach out if you need any further assistance.";
    }
    
    // Default response
    return "I understand your concern. Let me connect you with the right information. Could you provide more details about your specific issue? This will help me assist you better.";
  };

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(textToSend),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gradient-chat">
      <div className="flex flex-col w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-gradient-primary">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                <Headphones className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-foreground">Customer Support</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online • Typically replies instantly
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-white border-b border-border">
          <p className="text-sm text-muted-foreground mb-3">Quick actions:</p>
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage(action.query)}
                className="flex items-center gap-2 h-8 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex animate-slide-up ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`flex gap-3 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8 bg-gradient-primary flex-shrink-0">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                        CS
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`space-y-1 ${
                    message.sender === 'user' ? 'items-end' : 'items-start'
                  } flex flex-col`}>
                    <Card className={`p-3 shadow-message border-0 ${
                      message.sender === 'user'
                        ? 'bg-gradient-primary text-primary-foreground'
                        : 'bg-white text-foreground'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </Card>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8 bg-gradient-primary">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                      CS
                    </AvatarFallback>
                  </Avatar>
                  <Card className="p-3 bg-white shadow-message border-0">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 bg-white border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border-input focus:ring-primary focus:border-primary"
              disabled={isTyping}
            />
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Our team typically responds within a few minutes during business hours
          </p>
        </div>
      </div>
    </div>
  );
};