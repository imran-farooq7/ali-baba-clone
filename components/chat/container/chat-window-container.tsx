"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip,
  Image as ImageIcon,
  File,
  X,
  Loader2,
} from "lucide-react";
import { supabaseRealtime, uploadChatFile } from "@/lib/supabase/realtime";
import { ChatHeader } from "../ui/chat-header";
import { MessageList } from "../ui/message-list";
import { MessageInput } from "../ui/message-input";

interface ChatWindowContainerProps {
  conversation: any;
  onBack?: () => void;
  onTyping: (isTyping: boolean) => void;
  onMessageSent: () => void;
}

export default function ChatWindowContainer({
  conversation,
  onBack,
  onTyping,
  onMessageSent,
}: ChatWindowContainerProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>(null);

  // Fetch messages
  useEffect(() => {
    fetchMessages();
    setupRealtime();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [conversation.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/conversations/${conversation.id}/messages`
      );

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabaseRealtime.channel(`conversation:${conversation.id}`);

    channel
      .on("broadcast", { event: "new_message" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload.message]);
        scrollToBottom();
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId !== "current-user-id") {
          setTypingUsers((prev) => {
            if (payload.isTyping && !prev.includes(payload.userId)) {
              return [...prev, payload.userId];
            } else if (!payload.isTyping) {
              return prev.filter((id) => id !== payload.userId);
            }
            return prev;
          });
        }
      })
      .subscribe();

    channelRef.current = channel;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() && !filePreview) return;

    try {
      setSending(true);

      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", filePreview ? "FILE" : "TEXT");

      if (filePreview) {
        formData.append("file", filePreview);
      }

      const response = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // Add message to local state
      setMessages((prev) => [...prev, data.message]);
      setFilePreview(null);
      setShowFileUpload(false);

      onMessageSent();
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      onTyping(isTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 3000);
      }
    },
    [onTyping]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(
          "File type not supported. Please upload images, PDFs, or Office documents."
        );
        return;
      }

      setFilePreview(file);
      setShowFileUpload(true);
    }
  };

  const handleFileUpload = async () => {
    if (!filePreview) return;

    try {
      setUploadingFile(true);
      await handleSendMessage("");
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFilePreview = () => {
    setFilePreview(null);
    setShowFileUpload(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (fileType === "application/pdf") return <File className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        // onBack={onBack}
        // typingUsers={typingUsers}
        // onlineUsers={[]} // You would pass actual online users
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start the conversation
            </h3>
            <p className="text-gray-600 max-w-md">
              Send your first message to{" "}
              {conversation.participants
                .filter((p: any) => p.userId !== "current-user-id")
                .map((p: any) => p.user.name)
                .join(", ")}
            </p>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId="current-user-id" // You would get this from auth
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File upload preview */}
      {showFileUpload && filePreview && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {getFileIcon(filePreview.type)}
              <div>
                <div className="font-medium text-gray-900">
                  {filePreview.name}
                </div>
                <div className="text-sm text-gray-500">
                  {(filePreview.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
            <button
              onClick={removeFilePreview}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {filePreview.type.startsWith("image/") && (
            <div className="mt-3">
              <img
                src={URL.createObjectURL(filePreview)}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
              />
            </div>
          )}
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={removeFilePreview}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleFileUpload}
              disabled={uploadingFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadingFile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Uploading...
                </>
              ) : (
                "Send File"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />

          {/* Quick action buttons */}
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <ImageIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <File className="h-5 w-5" />
          </button>
        </div>

        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={sending || uploadingFile}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
}
