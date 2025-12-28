// components/chat/containers/chat-window-container.tsx
import { FC } from "react";
import { MessageList } from "../ui/message-list";
import { MessageInput } from "../ui/message-input";
import { Send } from "lucide-react";
import { Message } from "@/lib/chat/hooks/chat/use-messages";

interface ChatWindowContainerProps {
  activeConversation?: any;
  messages: any[];
  currentUserId: string;
  onSendMessage: (content?: string, file?: File) => Promise<Message>;
  isLoading?: boolean;
  isSending?: boolean;
}

export const ChatWindowContainer: FC<ChatWindowContainerProps> = ({
  activeConversation,
  messages,
  currentUserId,
  onSendMessage,
  isLoading = false,
  isSending = false,
}) => {
  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      <ChatHeader conversation={activeConversation} />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoading}
      />
      <MessageInput onSendMessage={onSendMessage} disabled={isSending} />
    </div>
  );
};
