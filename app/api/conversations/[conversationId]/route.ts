import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import { supabaseRealtime } from "@/lib/supabase/realtime";

// GET /api/conversations/[id] - Get conversation details
// GET /api/conversations/[id] - Get conversation details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a participant
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    });

    if (!participant && user.type !== "ADMIN") {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Get conversation with all details
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                company: true,
                avatar: true,
                type: true,
                verified: true,
                description: true,
              },
            },
          },
        },
        brief: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            category: true,
            brand: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
        },
        proposal: {
          select: {
            id: true,
            status: true,
            price: true,
            timelineDays: true,
            manufacturer: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
        },
        _count: {
          select: { Message: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Update last read time
    await prisma.participant.update({
      where: { id: participant?.id },
      data: { lastReadAt: new Date() },
    });

    // Get typing status from realtime - FIXED
    const channel = supabaseRealtime.channel(`conversation:${conversationId}`);
    let presenceState = {};

    // Track user presence
    const presenceTrackResponse = await channel.track({
      userId: user.id,
      isTyping: false,
      lastSeen: new Date().toISOString(),
    });

    // If tracking was successful, get the presence state
    if (presenceTrackResponse === "ok") {
      // You might want to get the presence state differently
      // Depending on your Supabase setup, you might need to:
      // 1. Subscribe to presence state changes
      // 2. Or query the current presence state separately

      // For now, we'll create a simple presence object
      presenceState = {
        [user.id]: {
          userId: user.id,
          isTyping: false,
          lastSeen: new Date().toISOString(),
        },
      };
    }

    return NextResponse.json({
      ...conversation,
      presence: presenceState,
    });
  } catch (error: any) {
    console.error("Conversation fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations/[id] - Update conversation
// PATCH /api/conversations/[id] - Update conversation
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await context.params;
    const user = await getCurrentUser();
    const data = await request.json();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a participant
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Allowed updates
    const allowedUpdates: any = {};
    if (data.title !== undefined) allowedUpdates.title = data.title;

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: allowedUpdates,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
        },
      },
    });

    // Notify participants about update
    // Create channel and send broadcast without waiting for subscription
    const channel = supabaseRealtime.channel(`conversation:${conversationId}`);

    // Send broadcast (this will handle subscription internally)
    try {
      await channel.send({
        type: "broadcast",
        event: "conversation_updated",
        payload: {
          updatedBy: user.id,
          updates: allowedUpdates,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (broadcastError) {
      console.warn("Failed to send broadcast:", broadcastError);
      // Don't fail the request if broadcast fails
    }

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
      message: "Conversation updated successfully",
    });
  } catch (error: any) {
    console.error("Conversation update error:", error);
    return NextResponse.json(
      { error: "Failed to update conversation", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Leave conversation
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a participant
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Remove participant
    await prisma.participant.delete({
      where: { id: participant.id },
    });

    // Check if conversation has any participants left
    const remainingParticipants = await prisma.participant.count({
      where: { conversationId },
    });

    if (remainingParticipants === 0) {
      // Delete conversation if no participants left
      await prisma.conversation.delete({
        where: { id: conversationId },
      });
    }

    // Notify remaining participants
    const channel = supabaseRealtime.channel(`conversation:${conversationId}`);
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: "participant_left",
          payload: {
            userId: user.id,
            timestamp: new Date().toISOString(),
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Left conversation successfully",
    });
  } catch (error: any) {
    console.error("Leave conversation error:", error);
    return NextResponse.json(
      { error: "Failed to leave conversation", details: error.message },
      { status: 500 }
    );
  }
}
