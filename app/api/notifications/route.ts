import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  broadcastManualNotification,
  calculateExpiration,
  shouldSendNotification, // Updated import
} from "@/lib/notifications/service";
import { supabaseRealtime } from "@/lib/supabase/realtime"; // Import Supabase client

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const showArchived = searchParams.get("archived") === "true";
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");

    // Build where clause
    const whereClause: any = {
      recipientId: user.id,
      isArchived: showArchived,
    };

    if (type) {
      whereClause.type = type;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            company: true,
            type: true,
          },
        },
        brief: {
          select: {
            id: true,
            title: true,
          },
        },
        proposal: {
          select: {
            id: true,
            price: true,
            status: true,
          },
        },
        conversation: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get counts for badges
    const counts = await prisma.notification.groupBy({
      by: ["isRead"],
      where: {
        recipientId: user.id,
        isArchived: false,
      },
      _count: {
        _all: true,
      },
    });

    const unreadCount = counts.find((c) => !c.isRead)?._count?._all || 0;
    const totalCount = counts.reduce(
      (sum, c) => sum + (c._count?._all || 0),
      0
    );

    return NextResponse.json({
      notifications,
      counts: {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
      },
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit,
      },
    });
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a notification (admin/internal use)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      type,
      recipientId,
      senderId,
      title,
      message,
      metadata,
      priority,
      entityIds,
    } = data;

    // Validate required fields
    if (!type || !recipientId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user notification settings
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId: recipientId },
    });

    // Check if notification should be sent
    if (!shouldSendNotification(type, settings)) {
      return NextResponse.json({
        success: true,
        message: "Notification skipped based on user preferences",
        skipped: true,
      });
    }

    // =============================================
    // 🚨 CRITICAL FIX: Use DIRECT Supabase insert
    // instead of Prisma to trigger realtime
    // =============================================

    // Create notification DIRECTLY in Supabase (triggers realtime automatically)
    const { data: supabaseData, error: supabaseError } = await supabaseRealtime
      .from("notifications")
      .insert({
        // Map to your actual database column names (snake_case)
        type: type,
        recipient_id: recipientId,
        sender_id: senderId || user.id,
        title: title,
        message: message,
        metadata: metadata || {},
        priority: priority || "MEDIUM",
        brief_id: entityIds?.briefId,
        proposal_id: entityIds?.proposalId,
        conversation_id: entityIds?.conversationId,
        expires_at: calculateExpiration(type),
        is_read: false,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        sender:users (
          id, name, avatar, company
        )
      `
      )
      .single();

    if (supabaseError) {
      console.error("Supabase insert error:", supabaseError);
      throw new Error(
        `Failed to create notification: ${supabaseError.message}`
      );
    }

    // Convert snake_case to camelCase for frontend
    const notification = {
      id: supabaseData.id,
      type: supabaseData.type,
      recipientId: supabaseData.recipient_id,
      senderId: supabaseData.sender_id,
      title: supabaseData.title,
      message: supabaseData.message,
      metadata: supabaseData.metadata,
      priority: supabaseData.priority,
      briefId: supabaseData.brief_id,
      proposalId: supabaseData.proposal_id,
      conversationId: supabaseData.conversation_id,
      isRead: supabaseData.is_read,
      isArchived: supabaseData.is_archived,
      createdAt: new Date(supabaseData.created_at),
      expiresAt: supabaseData.expires_at
        ? new Date(supabaseData.expires_at)
        : null,
      updatedAt: supabaseData.updated_at
        ? new Date(supabaseData.updated_at)
        : null,
      sender: supabaseData.sender
        ? {
            id: supabaseData.sender.id,
            name: supabaseData.sender.name,
            avatar: supabaseData.sender.avatar,
            company: supabaseData.sender.company,
          }
        : null,
    };

    // =============================================
    // OPTIONAL: Also create in Prisma for consistency
    // =============================================
    try {
      await prisma.notification.create({
        data: {
          id: notification.id, // Use same ID
          type,
          recipientId,
          senderId: senderId || user.id,
          title,
          message,
          metadata: metadata || {},
          priority: priority || "MEDIUM",
          briefId: entityIds?.briefId,
          proposalId: entityIds?.proposalId,
          conversationId: entityIds?.conversationId,
          expiresAt: calculateExpiration(type),
          isRead: false,
          isArchived: false,
        },
      });
    } catch (prismaError) {
      console.warn("Prisma sync failed (non-critical):", prismaError);
      // Continue anyway - Supabase insert already succeeded
    }

    // Optional: Send manual broadcast (not required for realtime)
    await broadcastManualNotification(notification);

    return NextResponse.json({
      success: true,
      notification,
      message: "Notification created and sent",
      realtimeTriggered: true, // Confirm realtime will work
    });
  } catch (error: any) {
    console.error("Notification creation error:", error);
    return NextResponse.json(
      { error: "Failed to create notification", details: error.message },
      { status: 500 }
    );
  }
}
