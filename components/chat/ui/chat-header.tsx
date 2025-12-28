// components/chat/ui/chat-header.tsx
import { FC } from "react";
import { Users, FileText, Briefcase, MoreVertical } from "lucide-react";

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
  conversation: ChatHeaderProps["conversation"]
): string => {
  const participantCount = conversation.participants.length;

  if (conversation.brief) {
    return `${participantCount} participant${
      participantCount !== 1 ? "s" : ""
    } • ${conversation.brief.status}`;
  }

  if (conversation.proposal) {
    return `${participantCount} participant${
      participantCount !== 1 ? "s" : ""
    } • ${conversation.proposal.status}`;
  }

  return `${participantCount} participant${participantCount !== 1 ? "s" : ""}`;
};

export const ChatHeader: FC<ChatHeaderProps> = ({ conversation }) => {
  const title = getConversationTitle(conversation);
  const subtitle = getConversationSubtitle(conversation);
  const icon = getConversationIcon(conversation.brief, conversation.proposal);

  return (
    <div className="px-6 py-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-gray-100">{icon}</div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Participants avatars */}
          <div className="flex -space-x-2">
            {conversation.participants.slice(0, 3).map((participant) => (
              <div
                key={participant.id}
                className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs text-white"
                title={participant.user.name}
              >
                {participant.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
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

            {conversation.brief && (
              <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {conversation.brief.status}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
