"use client";

import { getFileIcon, isImageFile, isPDFFile } from "@/lib/supabase/realtime";
import { formatDistanceToNow } from "date-fns";
import {
  Download,
  File,
  FileText,
  Film,
  Image as ImageIcon,
  Maximize2,
  X,
} from "lucide-react";
import { useState } from "react";

interface MessageItemProps {
  message: any;
  isOwn: boolean;
  showAvatar: boolean;
  showName: boolean;
}

export default function MessageItem({
  message,
  isOwn,
  showAvatar,
  showName,
}: MessageItemProps) {
  const [imagePreview, setImagePreview] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(false);

  const getFileIconComponent = (fileType: string) => {
    const iconType = getFileIcon(fileType);

    switch (iconType) {
      case "image":
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "video":
        return <Film className="h-8 w-8 text-purple-500" />;
      case "document":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "spreadsheet":
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderFileMessage = () => {
    const fileType = message.fileType || "";
    const fileName = message.fileName || "File";
    const fileSize = message.fileSize
      ? formatFileSize(message.fileSize)
      : "Unknown size";
    const fileUrl = message.fileUrl;

    return (
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* File header */}
        <div className="flex items-center gap-3 p-4 border-b">
          {getFileIconComponent(fileType)}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{fileName}</div>
            <div className="text-sm text-gray-500">{fileSize}</div>
          </div>
          {fileUrl && (
            <a
              href={fileUrl}
              download={fileName}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </a>
          )}
        </div>

        {/* File preview/content */}
        <div className="p-4">
          {isImageFile(fileType) ? (
            <div className="relative">
              <img
                src={fileUrl}
                alt={fileName}
                className="rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90"
                onClick={() => setImagePreview(true)}
              />
              <button
                onClick={() => setImagePreview(true)}
                className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          ) : isPDFFile(fileType) ? (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div>
                  <div className="font-medium">PDF Document</div>
                  <div className="text-sm text-gray-500">
                    Click to view or download
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
                >
                  View
                </a>
                <a
                  href={fileUrl}
                  download={fileName}
                  className="flex-1 px-4 py-2 border border-gray-300 text-center rounded-lg hover:bg-gray-50"
                >
                  Download
                </a>
              </div>
            </div>
          ) : (
            <div className="text-gray-700">
              {message.content || `Attached ${fileName}`}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="px-4 py-2 border-t text-xs text-gray-500 bg-gray-50">
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
          })}
        </div>
      </div>
    );
  };

  const renderTextMessage = () => {
    return (
      <div
        className={`rounded-lg px-4 py-2 max-w-[70%] ${
          isOwn ? "bg-blue-600 text-white ml-auto" : "bg-gray-100 text-gray-900"
        }`}
      >
        {showName && !isOwn && (
          <div className="font-medium text-sm mb-1 text-gray-700">
            {message.sender?.name}
          </div>
        )}

        <div className="prose prose-sm max-w-none">{message.content}</div>

        <div
          className={`text-xs mt-2 ${
            isOwn ? "text-blue-200" : "text-gray-500"
          }`}
        >
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
          })}
        </div>
      </div>
    );
  };

  const renderSystemMessage = () => {
    return (
      <div className="text-center my-4">
        <div className="inline-block bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
          {message.content}
          <div className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </div>
        </div>
      </div>
    );
  };

  // Image preview modal
  if (imagePreview && message.fileUrl) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setImagePreview(false)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={message.fileUrl}
              alt={message.fileName || "Image"}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              <div className="inline-block bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                {message.fileName}
                {message.fileSize && (
                  <span className="ml-2 text-gray-300">
                    ({formatFileSize(message.fileSize)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {renderFileMessage()}
      </>
    );
  }

  return (
    <div className={`flex gap-3 ${isOwn ? "justify-end" : ""}`}>
      {/* Avatar for others' messages */}
      {!isOwn && showAvatar && (
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
            {message.sender?.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                {message.sender?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message content */}
      <div className={`flex-1 ${isOwn ? "text-right" : ""}`}>
        {message.type === "FILE" && renderFileMessage()}
        {message.type === "TEXT" && renderTextMessage()}
        {message.type === "SYSTEM" && renderSystemMessage()}
        {message.type === "PROPOSAL_UPDATE" && renderSystemMessage()}
      </div>

      {/* Avatar for own messages */}
      {isOwn && showAvatar && (
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-200">
            {/* Current user's avatar */}
          </div>
        </div>
      )}
    </div>
  );
}
