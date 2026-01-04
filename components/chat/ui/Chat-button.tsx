// components/chat/ChatButton.tsx
"use client";

import { MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ChatButtonProps {
  briefId?: string;
  manufacturerId?: string;
  proposalId?: string;
  participants: string[]; // User IDs to include in chat
  title?: string; // Optional - will auto-generate if not provided
  className?: string;
  variant?: "default" | "outline" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
  disabled?: boolean;
  onSuccess?: (conversationId: string) => void;
  onError?: (error: Error) => void;
}

export default function ChatButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate participants
  // const isValid =
  //   participants.length > 0 && participants.every((id) => id.trim().length > 0);

  // Generate default title if not provided
  // const getDefaultTitle = () => {
  //   if (briefId) return `Brief Discussion`;
  //   if (proposalId) return `Proposal Discussion`;
  //   if (manufacturerId) return `Manufacturer Inquiry`;
  //   return `Chat with ${participants.length} participant${
  //     participants.length > 1 ? "s" : ""
  //   }`;
  // };

  // const handleStartChat = async () => {
  //   if (!isValid || disabled) return;

  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     // Create or get existing conversation
  //     const response = await fetch("/api/conversations", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         participantIds: participants,
  //         title: title || getDefaultTitle(),
  //         briefId,
  //         proposalId,
  //         manufacturerId,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error || "Failed to create conversation");
  //     }

  //     console.log("Conversation created:", data);

  //     // Call success callback if provided
  //     if (onSuccess && data.conversation?.id) {
  //       onSuccess(data.conversation.id);
  //     }

  //     // If no callback, navigate to chat
  //     if (!onSuccess && data.conversation?.id) {
  //       router.push(`/chat?conversationId=${data.conversation.id}`);
  //     }

  //     return data.conversation;
  //   } catch (error) {
  //     console.error("Error starting chat:", error);
  //     const errorMessage =
  //       error instanceof Error ? error.message : "Failed to start chat";
  //     setError(errorMessage);

  //     // Call error callback if provided
  //     if (onError) {
  //       onError(error instanceof Error ? error : new Error(errorMessage));
  //     }

  //     // Show user-friendly error message
  //     if (!onError) {
  //       alert(`Could not start chat: ${errorMessage}`);
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-3",
  };

  // Variant classes
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    outline:
      "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
  };

  // Icon size based on button size
  const iconSize = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Determine button text
  // const buttonText = showLabel ? "Start Chat" : "";

  // Determine if button should be disabled
  // const isButtonDisabled = disabled || isLoading || !isValid;

  return (
    <div className="relative">
      <button
        // onClick={handleStartChat}
        // disabled={isButtonDisabled}
        // title={!isValid ? "Add participants to start chat" : undefined}
        className={`
          inline-flex items-center justify-center rounded-lg font-medium transition-all
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
          active:scale-95
         }
        `}
      >
        {/* Loading spinner */}
        {/* {isLoading ? (
          <Loader2 className={`${iconSize[size]} animate-spin`} />
        ) : showIcon ? ( */}
        <MessageSquare />
        {/* ) : null} */}
        {/* Button text */}
        {/* {buttonText && <span>{buttonText}</span>} */}
        Chat
        {/* Participant count badge */}
        {/* {participants.length > 0 && size !== "sm" && !isLoading && (
          <span
            className={`
            ml-1 px-1.5 py-0.5 text-xs rounded-full font-medium
            ${
              variant === "outline"
                ? "bg-blue-100 text-blue-700"
                : variant === "ghost"
                ? "bg-gray-100 text-gray-700"
                : "bg-white/20 text-white"
            }
          `}
          >
            {participants.length}
          </span>
        )} */}
      </button>

      {/* Error message (small) */}
      {/* {error && size !== "sm" && (
        <div className="absolute -bottom-6 left-0 text-xs text-red-600">
          {error}
        </div>
      )} */}

      {/* Tooltip for disabled state */}
      {/* {!isValid && size !== "sm" && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500 whitespace-nowrap">
          Add participants to chat
        </div>
      )} */}
    </div>
  );
}
