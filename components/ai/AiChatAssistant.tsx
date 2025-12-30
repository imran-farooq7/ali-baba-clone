"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Bot,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Briefcase,
  Factory,
} from "lucide-react";
import {
  generateAIResponse,
  getSuggestedPrompts,
  extractPageContext,
  type AIResponse,
} from "@/lib/ai/gemini";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  suggestions?: string[];
  followUpQuestions?: string[];
  requiresAction?: boolean;
}

interface AiChatAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialPrompt?: string;
  context?: {
    briefId?: string;
    proposalId?: string;
    manufacturerId?: string;
    userType?: "brand" | "manufacturer";
  };
}

export default function AiChatAssistant({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  initialPrompt,
  context: externalContext,
}: AiChatAssistantProps) {
  // Use internal state if no external control provided
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(
    () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Determine if controlled or uncontrolled
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose
    ? () => externalOnClose()
    : setInternalIsOpen;

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: getWelcomeMessage(),
          timestamp: new Date(),
          suggestions: getWelcomeSuggestions(),
        },
      ]);
    }
  }, []);

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && isOpen && messages.length <= 1) {
      // Small delay to ensure component is mounted
      setTimeout(() => {
        handleSend(initialPrompt);
      }, 500);
    }
  }, [initialPrompt, isOpen]);

  // Listen for external open events
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      setIsOpen(true);
      if (event.detail?.message) {
        setTimeout(() => handleSend(event.detail.message), 100);
      }
    };

    window.addEventListener("open-ai-chat", handleOpenChat as EventListener);
    return () =>
      window.removeEventListener(
        "open-ai-chat",
        handleOpenChat as EventListener
      );
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const getWelcomeMessage = () => {
    const pageContext = extractPageContext();
    if (pageContext.briefId) {
      return "Hello! I see you're viewing a brief. I can help you analyze it, suggest improvements, or find matching manufacturers. What would you like to know?";
    }
    if (pageContext.manufacturerId) {
      return "Hello! I see you're comparing manufacturers. I can help you analyze their capabilities, compare pricing, or suggest the best match for your needs.";
    }
    return "Hello! I'm your AI manufacturing assistant. I can help you with brief creation, manufacturer matching, proposal reviews, and more. How can I assist you today?";
  };

  const getWelcomeSuggestions = () => {
    const context = getContext();
    return getSuggestedPrompts(context);
  };

  // Get context from current page
  const getContext = useCallback(() => {
    const pageContext = extractPageContext();
    return {
      conversationId,
      userType: externalContext?.userType || "brand",
      briefId: externalContext?.briefId || pageContext.briefId,
      proposalId: externalContext?.proposalId || pageContext.proposalId,
      manufacturerId:
        externalContext?.manufacturerId || pageContext.manufacturerId,
      recentMessages: messages
        .filter((msg) => !msg.isLoading)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }))
        .slice(-10),
    };
  }, [conversationId, messages, externalContext]);

  // Handle sending a message
  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: `loading_${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const context = getContext();
      const aiResponse = await generateAIResponse(content, context);

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: aiResponse.message,
                isLoading: false,
                suggestions: aiResponse.suggestions,
                followUpQuestions: aiResponse.followUpQuestions,
                requiresAction: aiResponse.requiresAction,
              }
            : msg
        )
      );
    } catch (error) {
      // Replace loading message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
                isLoading: false,
              }
            : msg
        )
      );
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action
  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  // Clear conversation
  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: getWelcomeMessage(),
        timestamp: new Date(),
        suggestions: getWelcomeSuggestions(),
      },
    ]);
  };

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  // Get suggested prompts
  const suggestedPrompts = getSuggestedPrompts(getContext());

  // Determine page icon
  const getPageIcon = () => {
    const context = getContext();
    if (context.briefId) return <Briefcase className="w-5 h-5" />;
    if (context.manufacturerId) return <Factory className="w-5 h-5" />;
    return <MessageSquare className="w-5 h-5" />;
  };

  // Floating button - only show if not externally controlled
  const showFloatingButton = externalIsOpen === undefined;

  return (
    <>
      {/* Floating Chat Button - only when uncontrolled */}
      {showFloatingButton && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-50"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-150 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                {getPageIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  AI Manufacturing Assistant
                </h3>
                <p className="text-xs text-gray-600">
                  Powered by Google Gemini
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Clear conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : message.isLoading
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-50 border border-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse">Thinking...</div>
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>

                      {/* Suggestions */}
                      {message.role === "assistant" && message.suggestions && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium text-gray-500">
                            SUGGESTIONS
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleQuickAction(suggestion)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 pb-3">
              <div className="text-xs font-medium text-gray-500 mb-2">
                TRY ASKING:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.slice(0, 4).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(prompt)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about manufacturing, briefs, proposals..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              AI responses may not always be accurate. Always verify critical
              information.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
