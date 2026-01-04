// hooks/useMessages.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseRealtime } from "@/lib/supabase/realtime";

export const useMessages = (
  conversationId: string | null,
  currentUserId: string
) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?limit=50`
      );
      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data.messages.reverse()); // Oldest first
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabaseRealtime
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch sender data for the new message
          const { data: senderData } = await supabaseRealtime
            .from("users")
            .select("id, name, avatar, company, type")
            .eq("id", payload.new.senderId)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              id: payload.new.id,
              content: payload.new.content,
              type: payload.new.type,
              fileUrl: payload.new.file_url,
              fileName: payload.new.file_name,
              fileSize: payload.new.file_size,
              fileType: payload.new.file_type,
              isEdited: payload.new.isEdited,
              isDeleted: payload.new.isDeleted,
              senderId: payload.new.senderId,
              conversationId: payload.new.conversation_id,
              createdAt: new Date(payload.new.created_at),
              updatedAt: new Date(payload.new.updatedAt),
              sender: senderData,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!conversationId) return;

      setSending(true);
      try {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("type", file ? "FILE" : "TEXT");

        if (file) {
          formData.append("file", file);
        }

        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) throw new Error("Failed to send message");

        return await response.json();
      } catch (err) {
        console.error("Error sending message:", err);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  return {
    messages,
    loading,
    sending,
    error,
    fetchMessages,
    sendMessage,
  };
};
