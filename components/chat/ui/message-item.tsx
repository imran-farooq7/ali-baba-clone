// components/chat/ui/message-item.tsx
import { FileText, Image as ImageIcon } from "lucide-react";
import { getFileIconType } from "@/lib/chat/file-utils";
import { formatFileSize, formatMessageTime } from "@/lib/chat/formatters";

interface MessageItemProps {
  message: {
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
  };
  isOwnMessage: boolean;
}

export const MessageItem = ({ message, isOwnMessage }: MessageItemProps) => {
  const fileIconType = getFileIconType(message.fileType);

  const getFileIcon = () => {
    switch (fileIconType) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 ${
          isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-sm">
            {message.sender?.name || "Unknown"}
          </span>
          <span
            className={`text-xs ${
              isOwnMessage ? "text-blue-200" : "text-gray-500"
            }`}
          >
            {formatMessageTime(message.createdAt)}
          </span>
        </div>

        {message.content && (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}

        {message.fileUrl && (
          <div className="mt-2">
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                isOwnMessage
                  ? "bg-blue-400 hover:bg-blue-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {getFileIcon()}
              <span className="truncate max-w-37.5">{message.fileName}</span>
              {message.fileSize && (
                <span className="text-xs opacity-75">
                  ({formatFileSize(message.fileSize)})
                </span>
              )}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
