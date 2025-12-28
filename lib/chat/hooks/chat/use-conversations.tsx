// components/chat/hooks/use-conversations.ts
import { useState, useEffect, useCallback } from "react";
import { validateConversationCreation } from "../../validators";

export interface Conversation {
  id: string;
  title?: string;
  lastMessageAt?: string;
  participants: Array<{
    id: string;
    userId: string;
    userRole: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      type: string;
      company?: string;
    };
  }>;
  messages: Array<{
    id: string;
    content?: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  brief?: { id: string; title: string; status: string };
  proposal?: { id: string; message: string; status: string };
}

// Factory function for conversations hook
export const createUseConversations = (currentUserId: string) => {
  return () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/conversations");
        if (!response.ok) throw new Error("Failed to fetch conversations");

        const data = await response.json();
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching conversations:", err);
      } finally {
        setIsLoading(false);
      }
    }, []);

    // Create new conversation
    const createConversation = useCallback(
      async (
        participantIds: string[],
        title?: string,
        briefId?: string,
        proposalId?: string
      ) => {
        const validation = validateConversationCreation(participantIds);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        try {
          const response = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participantIds,
              title,
              briefId,
              proposalId,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to create conversation");
          }

          const conversation = await response.json();
          await fetchConversations(); // Refresh list
          return conversation;
        } catch (err) {
          console.error("Error creating conversation:", err);
          throw err;
        }
      },
      [fetchConversations]
    );

    // Delete conversation
    const deleteConversation = useCallback(async (conversationId: string) => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete conversation");

        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        return true;
      } catch (err) {
        console.error("Error deleting conversation:", err);
        throw err;
      }
    }, []);

    // Calculate unread count
    const getUnreadCount = useCallback(() => {
      // This would need to be implemented based on your read status logic
      return conversations.reduce((count, conversation) => {
        // Add your unread logic here
        return count;
      }, 0);
    }, [conversations]);

    // Initial fetch
    useEffect(() => {
      if (currentUserId) {
        fetchConversations();
      }
    }, [currentUserId, fetchConversations]);

    return {
      conversations,
      isLoading,
      error,
      fetchConversations,
      createConversation,
      deleteConversation,
      getUnreadCount,
    };
  };
};
