"use client";

import * as React from "react";
import { ChatMessage, PartialBusinessIntake, BusinessIntake } from "@/lib/types/contracts";
import { BusinessConfirmationCard } from "./business-confirmation-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Coffee,
  Stethoscope,
  Laptop,
  Package,
  ShoppingBag,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export interface ChatInterfaceProps {
  onIntakeConfirmed: (confirmedIntake: BusinessIntake) => void;
  initialIntake?: PartialBusinessIntake;
}

const PRESET_BUSINESSES = [
  {
    label: "Artisan Coffee Roastery",
    icon: <Coffee className="h-3.5 w-3.5" />,
    data: {
      businessName: "Third Wave Roastery & Artisan Cafe",
      category: "Coffee Roasters & Cafe",
      productsServices: [
        "Single-origin pour-overs",
        "House-roasted whole bean retail",
        "Fresh artisanal pastries",
        "Barista cupping workshops",
      ],
      targetCustomers: "Specialty coffee lovers, neighborhood regulars, and remote workers looking for a refined cafe atmosphere",
      businessGoals: [
        "Improve Google Local search discoverability",
        "Reply promptly to customer reviews",
        "Increase retail whole bean sales",
      ],
    },
  },
  {
    label: "Boutique Clothing Store",
    icon: <Package className="h-3.5 w-3.5" />,
    data: {
      businessName: "Velvet & Thread Boutique",
      category: "Clothing Store",
      productsServices: [
        "Curated women's designer apparel",
        "Premium seasonal outerwear",
        "Handcrafted accessories & bags",
        "Personal styling consultations",
      ],
      targetCustomers: "Fashion-conscious professionals, local residents, and boutique shoppers seeking unique wardrobe pieces",
      businessGoals: [
        "Drive boutique foot traffic from Google Maps",
        "Showcase new seasonal collection arrivals",
        "Build a 5-star reputation for customer styling",
      ],
    },
  },
  {
    label: "Family & Aesthetic Dental",
    icon: <Stethoscope className="h-3.5 w-3.5" />,
    data: {
      businessName: "Aura Dental Wellness & Aesthetics",
      category: "Dental Clinic",
      productsServices: [
        "Comprehensive preventative cleanings",
        "Invisalign clear aligners",
        "Professional teeth whitening",
        "Pediatric and family dental care",
      ],
      targetCustomers: "Local families, working professionals, and patients looking for gentle, modern aesthetic dentistry",
      businessGoals: [
        "Capture high-intent local dental searches on Google",
        "Increase patient consultation bookings",
        "Address patient reviews with warmth and care",
      ],
    },
  },
];

export function ChatInterface({ onIntakeConfirmed, initialIntake = {} }: ChatInterfaceProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "initial-advisor-msg",
      role: "assistant",
      content:
        "Welcome to Branvidia! I am your AI Business Advisor. To audit and optimize your Google Business Profile, I need to understand your business context.\n\nCould you share your **business name** and what **industry or category** you operate in?",
      timestamp: 1732185600000,
    },
  ]);

  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [intake, setIntake] = React.useState<PartialBusinessIntake>(initialIntake);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Parse intake tags out of assistant content
  const extractIntakeFromContent = (content: string): { cleanText: string; parsed?: PartialBusinessIntake } => {
    const intakeRegex = /<!--INTAKE:([\s\S]*?)-->/;
    const match = content.match(intakeRegex);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        const cleanText = content.replace(intakeRegex, "").trim();
        return { cleanText, parsed };
      } catch (e) {
        return { cleanText: content };
      }
    }
    return { cleanText: content };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    setInput("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          currentIntake: intake,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message (${response.status})`);
      }

      if (!response.body) {
        throw new Error("No response body received from server");
      }

      const assistantMsgId = `assistant-${Date.now()}`;
      let accumulatedText = "";

      // Add placeholder assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        const { cleanText, parsed } = extractIntakeFromContent(accumulatedText);

        if (parsed) {
          setIntake((prev) => ({ ...prev, ...parsed }));
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: cleanText } : m))
        );
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "I encountered a slight communication hiccup. You can continue typing, or use the Business Confirmation Card below to complete your business profile directly.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleLoadPreset = (presetData: BusinessIntake) => {
    setIntake(presetData);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-preset-${Date.now()}`,
        role: "user",
        content: `Loaded sample business profile: **${presetData.businessName}** (${presetData.category}).`,
        timestamp: Date.now(),
      },
      {
        id: `assistant-preset-${Date.now()}`,
        role: "assistant",
        content: `Excellent! I have fully loaded the profile for **${presetData.businessName}**. All 5 core business attributes are captured and ready. Please review the confirmation card below and click to proceed to Google Integration.`,
        timestamp: Date.now() + 10,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Quick Demo Presets Banner */}
      <div className="bg-paper-50 p-3 rounded-xl border border-paper-200/90 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-charcoal-600 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-branvidia-700" />
          <span>Quick Demo Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_BUSINESSES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleLoadPreset(preset.data)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white hover:bg-paper-200 text-charcoal-800 rounded-md border border-paper-300 shadow-subtle transition-all cursor-pointer"
            >
              {preset.icon}
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white/70 rounded-xl border border-paper-200 max-h-[460px] sm:max-h-[520px]">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? "bg-charcoal-800 text-white"
                    : "bg-branvidia-900 text-white ring-2 ring-branvidia-100"
                }`}
              >
                {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-subtle ${
                  isUser
                    ? "bg-branvidia-900 text-white rounded-tr-none"
                    : "bg-white text-charcoal-900 border border-paper-200 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-line font-sans">{message.content}</div>
                <div
                  suppressHydrationWarning
                  className={`text-[10px] mt-1.5 font-mono ${
                    isUser ? "text-branvidia-200" : "text-charcoal-400"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-charcoal-500 italic px-2">
            <span className="h-2 w-2 rounded-full bg-branvidia-700 animate-ping" />
            <span>Branvidia AI Advisor is formulating recommendation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Embedded Live Confirmation Card */}
      <BusinessConfirmationCard
        intake={intake}
        onConfirm={onIntakeConfirmed}
        onUpdate={(updated) => setIntake(updated)}
      />

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your business, services, customers, or goals..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 text-sm bg-white border border-paper-300 rounded-lg text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-branvidia-700/30 focus:border-branvidia-700 shadow-subtle transition-all"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!input.trim() || isStreaming}
          rightIcon={<Send className="h-4 w-4" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
