// components/chat/ui/conversation-item.tsx

import { formatConversationTime } from "@/lib/chat/formatters";
import { Conversation } from "@/lib/chat/hooks/chat/use-conversations";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) => {
  const lastMessage = conversation.messages[0];
  const otherParticipants = conversation.participants
    .filter((p) => p.userId !== "current-user") // You'll need to pass current user ID
    .map((p) => p.user.name)
    .join(", ");

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
        isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`p-2 rounded-lg ${
            isActive ? "bg-blue-100" : "bg-gray-100"
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-gray-300" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 truncate">
              {conversation.title || otherParticipants || "Untitled Chat"}
            </h3>
            {conversation.lastMessageAt && (
              <span className="text-xs text-gray-500">
                {formatConversationTime(conversation.lastMessageAt)}
              </span>
            )}
          </div>

          {lastMessage && (
            <p className="text-sm text-gray-500 truncate">
              {lastMessage.content || "📎 Attachment"}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1">
              {conversation.participants.slice(0, 3).map((participant) => (
                <span
                  key={participant.id}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                >
                  {participant.user.name.split(" ")[0]}
                </span>
              ))}
            </div>
            {/* Unread badge placeholder */}
          </div>
        </div>
      </div>
    </button>
  );
};
