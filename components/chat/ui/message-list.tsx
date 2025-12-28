// components/chat/ui/message-list.tsx
import { FC, useEffect, useRef } from "react";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: Array<{
    id: string;
    content?: string;
    senderId: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      avatar?: string;
    };
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  }>;
  currentUserId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const MessageList = ({
  messages,
  currentUserId,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div ref={listRef} className="h-full overflow-y-auto p-6">
      {hasMore && onLoadMore && (
        <div className="flex justify-center mb-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Load older messages
          </button>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
