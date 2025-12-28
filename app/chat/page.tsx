import { ChatContainer } from "@/components/chat/container/chat-container";
import { getCurrentUser } from "@/lib/auth";
import { MessageSquare } from "lucide-react";

export default async function ChatPage() {
  const user = await getCurrentUser();
  return (
    <div className="h-screen bg-gray-50">
      <div className="container mx-auto h-full max-w-7xl px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-500">
                Communicate with brands and manufacturers
              </p>
            </div>
          </div>
        </div>

        {/* Chat interface */}
        <ChatContainer user={user!} />
      </div>
    </div>
  );
}
