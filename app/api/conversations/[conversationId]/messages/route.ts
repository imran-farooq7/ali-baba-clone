// app/api/conversations/[conversationId]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import { supabaseRealtime } from "@/lib/supabase/realtime";

// GET /api/conversations/[conversationId]/messages
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Verify user is a participant
    const participant = await prisma.participant.findUnique({
      where: {
        userId_conversationId: {
          userId: user.id,
          conversationId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Update last read time
    await prisma.participant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    // Get messages (using Supabase for consistency)
    const { data: messages, error } = await supabaseRealtime
      .from("Message")
      .select(
        `
        *,
        sender:users(id, name, avatar, company, type)
      `
      )
      .eq("conversationId", conversationId)
      .order("createdAt", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase messages fetch error:", error);
      // Fallback to Prisma
      const prismaMessages = await prisma.message.findMany({
        where: { conversationId },
        include: {
          User_Message_senderIdToUser: {
            select: {
              id: true,
              name: true,
              avatar: true,
              company: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      return NextResponse.json({
        messages: prismaMessages,
        limit,
        offset,
      });
    }

    return NextResponse.json({
      messages: messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        type: msg.type,
        fileUrl: msg.file_url,
        fileName: msg.file_name,
        fileSize: msg.file_size,
        fileType: msg.file_type,
        isEdited: msg.isEdited,
        isDeleted: msg.isDeleted,
        senderId: msg.senderId,
        conversationId: msg.conversationId,
        createdAt: new Date(msg.createdAtt),
        updatedAt: new Date(msg.updatedAt),
        sender: msg.sender,
      })),
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[conversationId]/messages
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
    const participant = await prisma.participant.findUnique({
      where: {
        userId_conversationId: {
          userId: user.id,
          conversationId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const content = formData.get("content") as string;
    const type = (formData.get("type") as string) || "TEXT";
    const file = formData.get("file") as File;

    // Handle file upload if present
    let fileData = null;
    if (file) {
      const supabase = supabaseRealtime;
      const fileExt = file.name.split(".").pop();
      const fileName = `${conversationId}/${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-attachments").getPublicUrl(filePath);

      fileData = {
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      };
    }

    // =============================================
    // 🚨 CRITICAL FIX: Use Supabase insert for realtime
    // =============================================
    const { data: supabaseMessage, error: supabaseError } =
      await supabaseRealtime
        .from("Message")
        .insert({
          content: content || null,
          type,
          conversationId: conversationId,
          senderId: user.id,
          ...(fileData && {
            file_url: fileData.file_url,
            file_name: fileData.file_name,
            file_size: fileData.file_size,
            file_type: fileData.file_type,
          }),
          isEdited: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select("*")
        .single();

    if (supabaseError) {
      console.error("Supabase insert failed:", supabaseError);
      throw new Error(`Failed to send message: ${supabaseError.message}`);
    }

    // Convert to camelCase
    const message = {
      id: supabaseMessage.id,
      content: supabaseMessage.content,
      type: supabaseMessage.type,
      fileUrl: supabaseMessage.file_url,
      fileName: supabaseMessage.file_name,
      fileSize: supabaseMessage.file_size,
      fileType: supabaseMessage.file_type,
      isEdited: supabaseMessage.isEdited,
      isDeleted: supabaseMessage.isDeleted,
      senderId: supabaseMessage.senderId,
      conversationId: supabaseMessage.conversationId,
      createdAt: new Date(supabaseMessage.createdAt),
      updatedAt: new Date(supabaseMessage.updatedAt),
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        company: user.company,
        type: user.type,
      },
    };

    // Sync to Prisma for consistency
    try {
      await prisma.message.create({
        data: {
          id: message.id,
          content: message.content,
          type: message.type,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileSize: message.fileSize,
          fileType: message.fileType,
          senderId: user.id,
          conversationId,
          updatedAt: new Date(),
        },
      });

      // Update conversation last message time
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });
    } catch (prismaError) {
      console.warn("Prisma sync failed (non-critical):", prismaError);
      // Continue anyway - Supabase insert succeeded
    }

    // =============================================
    // Update: Conversation realtime update
    // =============================================
    try {
      const { error: conversationError } = await supabaseRealtime
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", conversationId);

      if (conversationError) {
        console.warn(
          "Failed to update conversation timestamp:",
          conversationError
        );
      }
    } catch (conversationUpdateError) {
      console.warn("Conversation update failed:", conversationUpdateError);
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Failed to send message", details: error.message },
      { status: 500 }
    );
  }
}
