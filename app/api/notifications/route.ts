import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  broadcastNotification,
  calculateExpiration,
  shouldSendNotification,
} from "@/lib/notifications/service";

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

    // Create notification
    const notification = await prisma.notification.create({
      data: {
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
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            company: true,
          },
        },
      },
    });

    // Broadcast in real-time
    await broadcastNotification(notification);

    return NextResponse.json({
      success: true,
      notification,
      message: "Notification created and sent",
    });
  } catch (error: any) {
    console.error("Notification creation error:", error);
    return NextResponse.json(
      { error: "Failed to create notification", details: error.message },
      { status: 500 }
    );
  }
}
