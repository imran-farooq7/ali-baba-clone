// components/chat/ui/chat-header.tsx
import { FC } from "react";
import {
  Users,
  FileText,
  Briefcase,
  MoreVertical,
  ArrowLeft,
  MessageSquare,
  Clock,
} from "lucide-react";

interface ChatHeaderProps {
  conversation: {
    id: string;
    title?: string;
    participants: Array<{
      id: string;
      userId: string;
      user: {
        id: string;
        name: string;
        type: string;
        company?: string;
      };
    }>;
    brief?: {
      id: string;
      title: string;
      status: string;
    };
    proposal?: {
      id: string;
      message: string;
      status: string;
    };
  };
  // Add the missing props
  onBack?: () => void;
  typingUsers?: string[];
  onlineUsers?: string[];
  showBackButton?: boolean;
}

// Pure function to get conversation icon
const getConversationIcon = (brief?: any, proposal?: any) => {
  if (brief) return <Briefcase className="w-5 h-5 text-blue-600" />;
  if (proposal) return <FileText className="w-5 h-5 text-green-600" />;
  return <Users className="w-5 h-5 text-gray-600" />;
};

// Pure function to get conversation title
const getConversationTitle = (
  conversation: ChatHeaderProps["conversation"]
): string => {
  if (conversation.title) return conversation.title;

  if (conversation.brief) return `Brief: ${conversation.brief.title}`;

  if (conversation.proposal) {
    const truncatedMessage =
      conversation.proposal.message.length > 30
        ? conversation.proposal.message.substring(0, 30) + "..."
        : conversation.proposal.message;
    return `Proposal: ${truncatedMessage}`;
  }

  return conversation.participants.map((p) => p.user.name).join(", ");
};

// Pure function to get conversation subtitle
const getConversationSubtitle = (
  conversation: ChatHeaderProps["conversation"],
  typingUsers: string[] = [],
  onlineUsers: string[] = []
): string => {
  const participantCount = conversation.participants.length;

  // Show typing status
  if (typingUsers.length > 0) {
    const typingNames = conversation.participants
      .filter((p) => typingUsers.includes(p.userId))
      .map((p) => p.user.name)
      .join(", ");
    return `${typingNames} ${typingUsers.length > 1 ? "are" : "is"} typing...`;
  }

  // Show online status
  const onlineCount = conversation.participants.filter((p) =>
    onlineUsers.includes(p.userId)
  ).length;

  let subtitle = `${participantCount} participant${
    participantCount !== 1 ? "s" : ""
  }`;

  if (onlineCount > 0) {
    subtitle += ` • ${onlineCount} online`;
  }

  if (conversation.brief) {
    subtitle += ` • ${conversation.brief.status}`;
  }

  if (conversation.proposal) {
    subtitle += ` • ${conversation.proposal.status}`;
  }

  return subtitle;
};

export const ChatHeader: FC<ChatHeaderProps> = ({
  conversation,
  onBack,
  typingUsers = [],
  onlineUsers = [],
  showBackButton = false,
}) => {
  const title = getConversationTitle(conversation);
  const subtitle = getConversationSubtitle(
    conversation,
    typingUsers,
    onlineUsers
  );
  const icon = getConversationIcon(conversation.brief, conversation.proposal);
  const isTyping = typingUsers.length > 0;

  return (
    <div className="px-6 py-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Back button (optional) */}
          {(showBackButton || onBack) && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Conversation icon */}
          <div className="p-2 rounded-lg bg-gray-100">{icon}</div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <div className="flex items-center gap-2">
              <p
                className={`text-sm ${
                  isTyping
                    ? "text-blue-600 font-medium animate-pulse"
                    : "text-gray-500"
                }`}
              >
                {subtitle}
              </p>
              {isTyping && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <Clock className="w-3 h-3" />
                  Typing...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Online indicator */}
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{onlineUsers.length} online</span>
            </div>
          )}

          {/* Participants avatars */}
          <div className="flex -space-x-2">
            {conversation.participants.slice(0, 3).map((participant) => {
              const isOnline = onlineUsers.includes(participant.userId);
              const isTyping = typingUsers.includes(participant.userId);

              return (
                <div
                  key={participant.id}
                  className="relative"
                  title={`${participant.user.name}${
                    isOnline ? " (online)" : ""
                  }${isTyping ? " (typing)" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs ${
                      isOnline ? "bg-green-500" : "bg-blue-500"
                    } text-white`}
                  >
                    {participant.user.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Online indicator dot */}
                  {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
              );
            })}
            {conversation.participants.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                +{conversation.participants.length - 3}
              </div>
            )}
          </div>

          {/* More options menu */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Brief/Proposal info if available */}
      {(conversation.brief || conversation.proposal) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {conversation.brief ? (
                <>
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Linked to brief:{" "}
                    <a
                      href={`/briefs/${conversation.brief.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {conversation.brief.title}
                    </a>
                  </span>
                </>
              ) : (
                conversation.proposal && (
                  <>
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Linked to proposal
                    </span>
                  </>
                )
              )}
            </div>

            {conversation.brief ? (
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  conversation.brief.status === "PUBLISHED"
                    ? "bg-green-100 text-green-800"
                    : conversation.brief.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-800"
                    : conversation.brief.status === "COMPLETED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {conversation.brief.status}
              </div>
            ) : (
              conversation.proposal && (
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    conversation.proposal.status === "ACCEPTED"
                      ? "bg-green-100 text-green-800"
                      : conversation.proposal.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : conversation.proposal.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {conversation.proposal.status}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
