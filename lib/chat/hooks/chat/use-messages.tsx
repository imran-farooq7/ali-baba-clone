// components/chat/hooks/use-messages.ts
import { createClient } from "@/lib/supabase/client";
import { useState, useCallback, useEffect } from "react";
import { validateMessageInput } from "../../validators";

export interface Message {
  id: string;
  content?: string;
  senderId: string;
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  type: "TEXT" | "FILE";
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    type: string;
  };
}

// Create supabase client once
const supabase = createClient();

// Simplified hook
export const useMessages = (
  conversationId?: string,
  currentUserId?: string
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(
    async (loadMore = false) => {
      if (!conversationId || !currentUserId) return;

      setIsLoading(true);
      try {
        const url = new URL(
          `/api/chat/${conversationId}`,
          window.location.origin
        );
        if (loadMore && cursor) {
          url.searchParams.set("cursor", cursor);
        }

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();

        if (loadMore) {
          setMessages((prev) => [...prev, ...data.messages]);
        } else {
          setMessages(data.messages);
        }

        setHasMore(data.nextCursor !== null);
        setCursor(data.nextCursor);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, currentUserId, cursor]
  );

  // Send message
  const sendMessage = useCallback(
    async (content?: string, file?: File): Promise<Message> => {
      if (!conversationId) {
        throw new Error("No active conversation");
      }

      const validation = validateMessageInput(content, file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setIsSending(true);
      try {
        let fileData = null;

        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("conversationId", conversationId);

          const uploadResponse = await fetch("/api/chat/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(error.error || "Failed to upload file");
          }

          fileData = await uploadResponse.json();
        }

        const response = await fetch(`/api/chat/${conversationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content?.trim(),
            fileUrl: fileData?.url,
            fileName: fileData?.fileName,
            fileSize: fileData?.fileSize,
            fileType: fileData?.fileType,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to send message");
        }

        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
        return newMessage;
      } catch (err) {
        console.error("Error sending message:", err);
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId]
  );

  // Setup realtime subscription
  useEffect(() => {
    if (!conversationId || !supabase) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Load initial messages
  useEffect(() => {
    if (conversationId && currentUserId) {
      fetchMessages(false);
    }
  }, [conversationId, currentUserId, fetchMessages]);

  return {
    messages,
    isLoading,
    isSending,
    hasMore,
    fetchMessages: () => fetchMessages(true),
    sendMessage,
  };
};
