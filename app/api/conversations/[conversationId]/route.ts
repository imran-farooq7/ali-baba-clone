// app/api/chat/[conversationId]/route.ts
import { getCurrentUser } from "@/lib/auth";
import {
  createSendMessage,
  getConversation,
  getMessages,
} from "@/lib/chat/chat";
import { NextRequest, NextResponse } from "next/server";

// GET: Get conversation messages
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { conversationId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Verify user has access to conversation
    const conversation = await getConversation(conversationId, user.id);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    const result = await getMessages(conversationId, user.id, cursor!, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
};

// POST: Send message
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const data = await request.json();
    const { content, fileUrl, fileName, fileSize, fileType } = data;

    if (!content?.trim() && !fileUrl) {
      return NextResponse.json(
        { error: "Message content or file is required" },
        { status: 400 }
      );
    }

    // Create message using factory function
    const sendMessage = createSendMessage(require("@/lib/prisma").prisma);
    const message = await sendMessage({
      conversationId,
      senderId: user.id,
      content: content?.trim(),
      fileUrl,
      fileName,
      fileSize,
      fileType,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
};
