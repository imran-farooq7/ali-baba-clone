import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import { supabaseRealtime } from "@/lib/supabase/realtime";
import { uploadChatFile } from "@/lib/supabase/realtime";

// GET /api/conversations/[id]/messages - Get messages
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");
    const after = searchParams.get("after");

    // Build where clause
    const whereClause: any = { conversationId };

    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    if (after) {
      whereClause.createdAt = { gt: new Date(after) };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            company: true,
            avatar: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Get total count
    const totalCount = await prisma.message.count({
      where: { conversationId },
    });

    // Update last read time
    await prisma.participant.update({
      where: { id: participant?.id },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total: totalCount,
        limit,
        hasMore: before ? true : messages.length === limit,
        oldestMessageId: messages[0]?.id,
        newestMessageId: messages[messages.length - 1]?.id,
      },
    });
  } catch (error: any) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/messages - Send message
export async function POST(
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

    // Parse form data (supports file uploads)
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const type = (formData.get("type") as string) || "TEXT";
    const file = formData.get("file") as File | null;

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let fileType: string | null = null;

    // Handle file upload
    if (file && file.size > 0) {
      try {
        const uploadResult = await uploadChatFile(
          file,
          conversationId,
          user.id
        );
        fileUrl = uploadResult.url;
        fileName = uploadResult.metadata.name;
        fileSize = uploadResult.metadata.size;
        fileType = uploadResult.metadata.type;
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 }
        );
      }
    }

    // Validate content
    if (!content && !fileUrl) {
      return NextResponse.json(
        { error: "Message content or file is required" },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        type: type as any,
        fileUrl,
        fileName,
        fileSize,
        fileType,
        senderId: user.id,
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            company: true,
            avatar: true,
            type: true,
          },
        },
        conversation: {
          select: {
            id: true,
            title: true,
            participants: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    // Update conversation last message timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send real-time notification to all participants
    const channel = supabaseRealtime.channel(`conversation:${conversationId}`);
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: "new_message",
          payload: {
            message,
            timestamp: new Date().toISOString(),
          },
        });
      }
    });

    // Send push notifications to other participants
    const otherParticipants = message.conversation.participants
      .filter((p) => p.userId !== user.id)
      .map((p) => p.userId);

    // You would integrate with a push notification service here
    // await sendPushNotifications(otherParticipants, message)

    return NextResponse.json({
      success: true,
      message,
      fileInfo: fileUrl
        ? {
            url: fileUrl,
            name: fileName,
            size: fileSize,
            type: fileType,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Failed to send message", details: error.message },
      { status: 500 }
    );
  }
}
