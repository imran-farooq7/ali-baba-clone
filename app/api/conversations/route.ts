import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import { supabaseRealtime } from "@/lib/supabase/realtime";

// GET /api/conversations - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";

    // Get user's conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            {
              participants: {
                some: {
                  user: {
                    OR: [
                      { name: { contains: search, mode: "insensitive" } },
                      { company: { contains: search, mode: "insensitive" } },
                    ],
                  },
                },
              },
            },
          ],
        }),
      },
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
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            content: true,
            type: true,
            fileUrl: true,
            fileName: true,
            senderId: true,
            createdAt: true,
          },
        },
        brief: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        proposal: {
          select: {
            id: true,
            status: true,
            price: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const participant = conversation.participants.find(
          (p) => p.userId === user.id
        );

        if (!participant) return { ...conversation, unreadCount: 0 };

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            createdAt: { gt: participant.lastReadAt },
          },
        });

        return {
          ...conversation,
          unreadCount,
          lastReadAt: participant.lastReadAt,
        };
      })
    );

    // Get total count for pagination
    const totalCount = await prisma.conversation.count({
      where: {
        participants: {
          some: { userId: user.id },
        },
      },
    });

    return NextResponse.json({
      conversations: conversationsWithUnread,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      search,
    });
  } catch (error: any) {
    console.error("Conversations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { participantIds, title, briefId, proposalId } = data;

    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one participant is required" },
        { status: 400 }
      );
    }

    // Ensure user is included in participants
    const allParticipantIds = [...new Set([user.id, ...participantIds])];

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: allParticipantIds },
          },
          some: {
            userId: { in: allParticipantIds },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        conversation: existingConversation,
        message: "Conversation already exists",
      });
    }

    // Validate participants exist
    const participants = await prisma.user.findMany({
      where: { id: { in: allParticipantIds } },
      select: { id: true, type: true },
    });

    if (participants.length !== allParticipantIds.length) {
      return NextResponse.json(
        { error: "One or more participants not found" },
        { status: 404 }
      );
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        title: title || `Chat with ${participants.length} participants`,
        briefId,
        proposalId,
        participants: {
          create: participants.map((participant) => ({
            userId: participant.id,
            userRole: participant.type,
          })),
        },
      },
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
              },
            },
          },
        },
      },
    });

    // Create initial welcome message
    await prisma.message.create({
      data: {
        content: "Conversation started",
        type: "SYSTEM",
        senderId: user.id,
        conversationId: conversation.id,
      },
    });

    // Send real-time notification to other participants
    allParticipantIds.forEach((participantId) => {
      if (participantId !== user.id) {
        const channel = supabaseRealtime.channel(`user:${participantId}`);
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            channel.send({
              type: "broadcast",
              event: "new_conversation",
              payload: {
                conversationId: conversation.id,
                createdBy: user.id,
                timestamp: new Date().toISOString(),
              },
            });
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      conversation,
      message: "Conversation created successfully",
    });
  } catch (error: any) {
    console.error("Conversation creation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation", details: error.message },
      { status: 500 }
    );
  }
}
