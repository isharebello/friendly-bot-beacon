import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Plane, Clock, Package, AlertCircle, MessageCircle, X, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface DroneLocation {
  lat: number;
  lng: number;
  address: string;
}

const quickActions = [
  { icon: Package, label: "Track Drone", query: "track my order" },
  { icon: AlertCircle, label: "Wrong Order", query: "wrong order" },
  { icon: MessageCircle, label: "Help", query: "I need help" },
];

const droneLocations: Record<string, { location: DroneLocation; eta: number; status: string }> = {
  "N001": { location: { lat: 40.7505, lng: -73.9934, address: "Near Washington Square Park" }, eta: 4, status: "In Transit" },
  "N002": { location: { lat: 40.7614, lng: -73.9776, address: "Above Union Square" }, eta: 7, status: "In Transit" },
  "N003": { location: { lat: 40.7831, lng: -73.9712, address: "Central Park South" }, eta: 12, status: "Preparing for delivery" },
};

const botResponses: Record<string, string> = {
  "track my order": "I'll help you track your Nibbly drone delivery! Please provide your order number (format: N001, N002, etc.) and I'll show you exactly where your drone is in Lower Manhattan.",
  "wrong order": "Oh no! I'm sorry your order isn't correct. Please provide your order number and tell me what's wrong - we'll get this fixed right away and send out a replacement drone if needed.",
  "I need help": "Hi! I'm here to help with your Nibbly drone delivery. I can track your drone's location, estimate delivery time, help with incorrect orders, or answer any questions about our service in Lower Manhattan!",
  "hello": "Hello! Welcome to Nibbly - Lower Manhattan's fastest drone delivery service! 🚁 How can I help you today?",
  "hi": "Hi there! Thanks for choosing Nibbly for your delivery needs. I can track your drone, help with order issues, or answer any questions!",
  "refund": "I understand you'd like a refund. For drone deliveries, we offer full refunds if there's an issue with your order. Please provide your order number and I'll process this for you.",
  "cancel order": "I can help cancel your order if the drone hasn't taken off yet. Please provide your order number and I'll check if we can still cancel it.",
  "delivery time": "Our drones typically deliver within 15 minutes anywhere in Lower Manhattan! Weather conditions may add a few extra minutes for safety.",
  "location": "We serve all of Lower Manhattan from Battery Park to 14th Street. Our drones launch from our hub near the Brooklyn Bridge and can reach you super quickly!",
  "how it works": "Simple! Order through our app, our drone picks up your items from local partners, and flies directly to your location. You'll get real-time tracking the whole way!"
};

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Nibbly support assistant. I can help track your drone delivery, handle order issues, or answer questions about our service in Lower Manhattan! 🚁",
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
    
    // Check for order numbers (N001, N002, etc.)
    const orderMatch = message.match(/n\d{3}/i);
    if (orderMatch) {
      const orderNum = orderMatch[0].toUpperCase();
      const droneData = droneLocations[orderNum];
      if (droneData) {
        return `🚁 Found your order ${orderNum}!\n\n📍 Current location: ${droneData.location.address}\n⏰ ETA: ${droneData.eta} minutes\n📦 Status: ${droneData.status}\n\nYour drone is flying at 400ft altitude for safety. You'll get a notification when it's 1 minute away!`;
      } else {
        return `I couldn't find order ${orderNum}. Please double-check your order number or contact us if you think this is an error.`;
      }
    }
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(botResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    // Check for drone-specific keywords
    if (message.includes("drone") && (message.includes("where") || message.includes("location"))) {
      return "To track your drone, please provide your order number (like N001). I'll show you exactly where it is and when it will arrive!";
    }
    
    if (message.includes("eta") || message.includes("when") || message.includes("arrive")) {
      return "Delivery times depend on your location in Lower Manhattan. Please share your order number and I'll give you the exact ETA!";
    }
    
    if (message.includes("thank")) {
      return "You're very welcome! Enjoy your Nibbly delivery! 🚁 Anything else I can help with?";
    }
    
    if (message.includes("bye") || message.includes("goodbye")) {
      return "Thanks for using Nibbly! Have a great day and don't hesitate to reach out if you need anything! 🚁";
    }
    
    // Default response
    return "I'm here to help with your Nibbly drone delivery! I can track your order, help with issues, or answer questions. What can I assist you with?";
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 shadow-2xl border-0 transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-primary text-primary-foreground p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-white/20">
                <AvatarFallback className="bg-white/20 text-primary-foreground text-xs">
                  <Plane className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">Nibbly Support</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Online
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 hover:bg-white/20"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Quick Actions */}
            <div className="p-3 bg-muted/30 border-b">
              <div className="flex gap-1 flex-wrap">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(action.query)}
                    className="flex items-center gap-1 h-7 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <action.icon className="h-3 w-3" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3 h-80">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex animate-fade-in ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`flex gap-2 max-w-[85%] ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      {message.sender === 'bot' && (
                        <Avatar className="h-6 w-6 bg-gradient-primary flex-shrink-0">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                            N
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`space-y-1 ${
                        message.sender === 'user' ? 'items-end' : 'items-start'
                      } flex flex-col`}>
                        <div className={`p-2 rounded-lg text-xs ${
                          message.sender === 'user'
                            ? 'bg-gradient-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-line">{message.text}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-2 w-2" />
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex gap-2 max-w-[85%]">
                      <Avatar className="h-6 w-6 bg-gradient-primary">
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                          N
                        </AvatarFallback>
                      </Avatar>
                      <div className="p-2 bg-muted rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your order..."
                  className="flex-1 h-8 text-xs"
                  disabled={isTyping}
                />
                <Button 
                  onClick={() => handleSendMessage()} 
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="h-8 w-8 p-0 bg-gradient-primary hover:opacity-90"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};