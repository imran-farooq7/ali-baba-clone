// components/chat/containers/chat-container.tsx
"use client";

import { User } from "@/app/generated/prisma/client";
import { useChat as createUseChat } from "@/lib/chat/hooks/chat/use-chat";
import { createClient } from "@/lib/supabase/client";
import { ConversationList } from "../ui/conversation-list";
import { ChatWindowContainer } from "./chat-window-container";

export const ChatContainer = ({ user }: { user: User }) => {
  const supabaseClient = createClient();

  // Create chat hook instance
  const useChat = createUseChat(supabaseClient, user.id || "");

  const chat = useChat();

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      {/* Conversations sidebar */}
      <div className="col-span-12 md:col-span-4 lg:col-span-3 h-full border-r bg-white">
        <ConversationList
          conversations={chat.conversations}
          activeConversationId={chat.activeConversationId}
          onSelectConversation={chat.setActiveConversation}
          isLoading={chat.conversationsLoading}
        />
      </div>

      {/* Main chat area */}
      <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full">
        <ChatWindowContainer
          activeConversation={chat.activeConversation}
          messages={chat.messages}
          currentUserId={user?.id || ""}
          onSendMessage={chat.sendMessage}
          isLoading={chat.messagesLoading}
          isSending={chat.messagesSending}
        />
      </div>
    </div>
  );
};
