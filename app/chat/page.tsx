"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Users,
  Plus,
  Filter,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { supabaseRealtime } from "@/lib/supabase/realtime";
import ChatWindowContainer from "@/components/chat/container/chat-window-container";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const userChannels = useRef<Map<string, any>>(new Map());

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversations.length) return;

    // Subscribe to each conversation
    conversations.forEach((conversation) => {
      const channel = supabaseRealtime.channel(
        `conversation:${conversation.id}`
      );

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const users = Object.keys(state).map(
            (key) => (state[key] as any[])[0]?.userId
          );
          setOnlineUsers((prev) => [...new Set([...prev, ...users])]);
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          setOnlineUsers((prev) => [
            ...new Set([...prev, newPresences[0]?.userId]),
          ]);
        })
        .on("presence", { event: "leave" }, ({ key }) => {
          setOnlineUsers((prev) => prev.filter((id) => id !== key));
        })
        .on("broadcast", { event: "new_message" }, ({ payload }) => {
          handleNewMessage(payload.message);
        })
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          handleTypingIndicator(payload.userId, payload.isTyping);
        })
        .subscribe();

      userChannels.current.set(conversation.id, channel);
    });

    // Cleanup on unmount
    return () => {
      userChannels.current.forEach((channel) => {
        channel.unsubscribe();
      });
    };
  }, [conversations]);

  // Handle URL conversation selection
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/conversations");

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();
      setConversations(data.conversations);

      // Select first conversation if none selected
      if (!selectedConversation && data.conversations.length > 0) {
        setSelectedConversation(data.conversations[0]);
        router.push(`/chat?conversationId=${data.conversations[0].id}`);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: any) => {
    // Update conversations list with new message
    setConversations((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((c) => c.id === message.conversationId);

      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          messages: [message],
          lastMessageAt: new Date().toISOString(),
          unreadCount:
            updated[index].id === selectedConversation?.id
              ? 0
              : (updated[index].unreadCount || 0) + 1,
        };

        // Move to top
        const [moved] = updated.splice(index, 1);
        updated.unshift(moved);
      }

      return updated;
    });

    // Update current conversation messages
    if (selectedConversation?.id === message.conversationId) {
      // This will be handled by the chat window component
    }
  };

  const handleTypingIndicator = (userId: string, isTyping: boolean) => {
    // Update typing status in UI
    console.log(`User ${userId} is ${isTyping ? "typing" : "not typing"}`);
  };

  const handleSendTyping = (conversationId: string, isTyping: boolean) => {
    const channel = userChannels.current.get(conversationId);
    if (channel) {
      channel.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: "current-user-id", isTyping },
      });
    }
  };

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    router.push(`/chat?conversationId=${conversation.id}`);

    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleNewConversation = async (
    participantIds: string[],
    title?: string
  ) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds, title }),
      });

      if (!response.ok) throw new Error("Failed to create conversation");

      const data = await response.json();

      // Add to conversations list
      setConversations((prev) => [data.conversation, ...prev]);
      setSelectedConversation(data.conversation);
      setIsCreatingNew(false);

      router.push(`/chat?conversationId=${data.conversation.id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      conversation.title?.toLowerCase().includes(query) ||
      conversation.participants.some(
        (p: any) =>
          p.user.name.toLowerCase().includes(query) ||
          p.user.company?.toLowerCase().includes(query)
      )
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="p-2 text-blue-600 hover:text-blue-800"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)] lg:h-screen">
        {/* Conversations sidebar */}
        <div
          className={`${
            selectedConversation ? "hidden lg:block" : "block"
          } w-full lg:w-96 border-r bg-white`}
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="overflow-y-auto h-[calc(100vh-180px)]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No conversations yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start a conversation with a manufacturer or brand
                </p>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Participants avatars */}
                    <div className="relative">
                      {conversation.participants
                        .slice(0, 2)
                        .map((participant: any, index: number) => (
                          <div
                            key={participant.userId}
                            className={`w-10 h-10 rounded-full overflow-hidden border-2 border-white ${
                              index === 0 ? "" : "absolute top-0 left-4"
                            }`}
                            style={{ zIndex: 2 - index }}
                          >
                            {participant.user.avatar ? (
                              <img
                                src={participant.user.avatar}
                                alt={participant.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                      {conversation.participants.length > 2 && (
                        <div className="absolute top-0 left-8 w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700">
                          +{conversation.participants.length - 2}
                        </div>
                      )}
                    </div>

                    {/* Conversation info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conversation.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            conversation.lastMessageAt || conversation.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 truncate">
                        {conversation.messages[0]?.type === "FILE"
                          ? `📎 ${conversation.messages[0]?.fileName}`
                          : conversation.messages[0]?.content?.replace(
                              /<[^>]*>/g,
                              ""
                            ) || "No messages yet"}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {conversation.participants
                            .slice(0, 3)
                            .map((participant: any) => (
                              <span
                                key={participant.userId}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  onlineUsers.includes(participant.userId)
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {participant.user.name.split(" ")[0]}
                              </span>
                            ))}
                        </div>

                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full .s text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div
          className={`${
            selectedConversation ? "block" : "hidden lg:block"
          } flex-1 flex flex-col`}
        >
          {selectedConversation ? (
            <ChatWindowContainer
              conversation={selectedConversation}
              onBack={() => {
                setSelectedConversation(null);
                router.push("/chat");
              }}
              onTyping={(isTyping: boolean) =>
                handleSendTyping(selectedConversation.id, isTyping)
              }
              onMessageSent={fetchConversations}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the list or start a new one
                </p>
              </div>
            </div>
          )}
        </div>

        {/* New conversation modal */}
        {isCreatingNew && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  New Conversation
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Start a chat with manufacturers or brands
                </p>
              </div>

              <div className="p-6">
                {/* Search users component would go here */}
                <p className="text-gray-500 text-center py-8">
                  User search component will be implemented here
                </p>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleNewConversation(["user-id"], "New Chat")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
