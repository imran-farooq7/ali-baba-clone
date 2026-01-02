// components/chat/ChatButton.tsx
"use client";

import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ChatButtonProps {
  briefId?: string;
  manufacturerId?: string;
  proposalId?: string;
  participants: string[];
  title: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export default function ChatButton({
  briefId,
  manufacturerId,
  proposalId,
  participants,
  title,
  className = "",
  variant = "default",
  size = "md",
  showIcon = true,
}: ChatButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    setIsLoading(true);

    try {
      // Create or get existing conversation
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantIds: participants,
          title,
          briefId,
          proposalId,
          manufacturerId,
        }),
      });

      if (response.ok) {
        const conversation = await response.json();
        // Navigate to the chat
        console.log(conversation, "res from api conversation");
        router.push(`/chat?conversationId=${conversation.id}`);
      } else {
        console.error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-3",
  };

  // Variant classes
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={isLoading || participants.length === 0}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : showIcon ? (
        <MessageSquare className="h-4 w-4" />
      ) : null}
      <span>Start Chat</span>
    </button>
  );
}
