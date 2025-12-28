// components/chat/ui/conversation-list.tsx
import { FC } from "react";
import { ConversationItem } from "./conversation-item";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/lib/chat/hooks/chat/use-conversations";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string | null;
  onSelectConversation: (conversationId: string) => void;
  isLoading?: boolean;
}

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading = false,
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No conversations yet
        </h3>
        <p className="text-gray-500 text-center">
          Start a conversation from a brief or proposal
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            onClick={() => onSelectConversation(conversation.id)}
          />
        ))}
      </div>
    </div>
  );
};
