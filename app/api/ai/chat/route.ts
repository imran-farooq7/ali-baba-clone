import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse, logAIInteraction } from "@/lib/ai/gemini";
import { getCurrentUser } from "@/lib/auth";
import { AiAssistantLog } from "@/lib/types";
export async function POST(request: NextRequest) {
  try {
    // Get user session for authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversationId, briefId, proposalId } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message.trim(), {
      conversationId: conversationId || `user_${user.id}_${Date.now()}`,
      userId: user.id,
      briefId,
      proposalId,
      userType: user.type as "brand" | "manufacturer",
    });

    return NextResponse.json({
      success: true,
      conversationId,
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for conversation history
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get("conversationId");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Fetch conversation history from database
    // This would query your AiAssistantLog model
    const history: AiAssistantLog[] = []; // Placeholder - implement based on your schema

    return NextResponse.json({
      success: true,
      conversationId,
      messages: history,
      userType: user.type,
    });
  } catch (error) {
    console.error("AI Chat History Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
