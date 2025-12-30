// app/api/conversations/route.ts
import { getCurrentUser } from "@/lib/auth";
import {
  createConversationCreator,
  getUserConversations,
} from "@/lib/chat/chat";
import { NextRequest, NextResponse } from "next/server";
// GET: Get user's conversations
export const GET = async (request: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const conversations = await getUserConversations(user.id);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
};

// POST: Create new conversation
export const POST = async (request: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { participantIds, title, briefId, proposalId } = data;

    if (!participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Participant IDs are required" },
        { status: 400 }
      );
    }

    // Create conversation using factory function
    const createConversation = createConversationCreator(
      require("@/lib/generated/prisma").prisma
    );
    const conversation = await createConversation({
      participantIds,
      title,
      briefId,
      proposalId,
      creatorId: user.id,
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
};
