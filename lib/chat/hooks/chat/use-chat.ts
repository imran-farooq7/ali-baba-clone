// components/chat/hooks/use-chat.ts
import { useState } from "react";
import { useMessages as createUseMessages } from "./use-messages";
import { useConversations as createConversations } from "./use-conversations";

// Main chat hook factory
export const useChat = (supabaseClient: any, currentUserId: string) => {
  const useConversations = createConversations(currentUserId);
  const useMessages = createUseMessages(supabaseClient);

  return () => {
    const [activeConversationId, setActiveConversationId] = useState<
      string | null
    >(null);

    // Use the specialized hooks
    const conversations = useConversations();
    const messages = useMessages(activeConversationId!, currentUserId);

    // Combined actions
    const setActiveConversation = (conversationId: string | null) => {
      setActiveConversationId(conversationId);
    };

    const startConversation = async (
      participantIds: string[],
      title?: string,
      briefId?: string,
      proposalId?: string
    ) => {
      const conversation = await conversations.createConversation(
        participantIds,
        title,
        briefId,
        proposalId
      );
      setActiveConversationId(conversation.id);
      return conversation;
    };

    return {
      // Conversations
      conversations: conversations.conversations,
      conversationsLoading: conversations.isLoading,
      conversationsError: conversations.error,
      createConversation: conversations.createConversation,
      deleteConversation: conversations.deleteConversation,
      getUnreadCount: conversations.getUnreadCount,
      refreshConversations: conversations.fetchConversations,

      // Active conversation
      activeConversationId,
      activeConversation: conversations.conversations.find(
        (c) => c.id === activeConversationId
      ),
      setActiveConversation,
      startConversation,

      // Messages
      messages: messages.messages,
      messagesLoading: messages.isLoading,
      messagesSending: messages.isSending,
      hasMoreMessages: messages.hasMore,
      sendMessage: messages.sendMessage,
      loadMoreMessages: messages.fetchMessages,
    };
  };
};
