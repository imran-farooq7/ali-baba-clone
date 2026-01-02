import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import { broadcastAllReadStatus } from "@/lib/notifications/service";

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark all unread notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        recipientId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Broadcast that all notifications are read
    await broadcastAllReadStatus(user.id);

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} notifications marked as read`,
    });
  } catch (error: any) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read", details: error.message },
      { status: 500 }
    );
  }
}
