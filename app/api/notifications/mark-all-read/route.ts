import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  markAllNotificationsAsRead,
  broadcastManualNotification,
} from "@/lib/notifications/service"; // Fixed import
import { supabaseRealtime } from "@/lib/supabase/realtime";

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // =============================================
    // 🚨 CRITICAL: First update in Supabase for realtime
    // =============================================
    const now = new Date().toISOString();

    // Get count of unread notifications before update
    const { count: unreadCount, error: countError } = await supabaseRealtime
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false)
      .eq("is_archived", false);

    if (countError) {
      console.error("Failed to count notifications:", countError);
    }

    // Update all unread notifications in Supabase
    const { data: updateResult, error: supabaseError } = await supabaseRealtime
      .from("notifications")
      .update({
        is_read: true,
        read_at: now,
        updated_at: now,
      })
      .eq("recipient_id", user.id)
      .eq("is_read", false)
      .eq("is_archived", false)
      .select("count"); // Get count of updated rows

    if (supabaseError) {
      console.error("Supabase mark-all-read failed:", supabaseError);
      throw new Error(
        `Failed to mark notifications as read: ${supabaseError.message}`
      );
    }

    const updatedCount = updateResult?.length || 0;

    // =============================================
    // Sync to Prisma for consistency
    // =============================================
    let prismaCount = 0;
    try {
      const prismaResult = await prisma.notification.updateMany({
        where: {
          recipientId: user.id,
          isRead: false,
          isArchived: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      prismaCount = prismaResult.count;
    } catch (prismaError) {
      console.warn("Prisma sync failed (non-critical):", prismaError);
      // Continue - Supabase update already succeeded
    }

    // =============================================
    // Broadcast realtime event
    // =============================================
    try {
      await broadcastManualNotification(
        {
          id: `batch-${Date.now()}`,
          recipientId: user.id,
          type: "SYSTEM_ALERT",
          title: "All notifications marked as read",
          message: `${updatedCount} notification${
            updatedCount !== 1 ? "s" : ""
          } marked as read`,
          isRead: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: null,
          metadata: { count: updatedCount },
          priority: "LOW",
          senderId: null,
          briefId: null,
          proposalId: null,
          conversationId: null,
        },
        "notification_read"
      );
    } catch (broadcastError) {
      console.warn("Broadcast failed:", broadcastError);
      // Continue - database updates already succeeded
    }

    return NextResponse.json({
      success: true,
      count: updatedCount,
      counts: {
        supabase: updatedCount,
        prisma: prismaCount,
        initial: unreadCount || 0,
      },
      message: `${updatedCount} notification${
        updatedCount !== 1 ? "s" : ""
      } marked as read`,
      timestamp: now,
    });
  } catch (error: any) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read", details: error.message },
      { status: 500 }
    );
  }
}

// OPTIONAL: GET endpoint to get unread count
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get counts from both sources for consistency check
    const [supabaseResult, prismaResult] = await Promise.allSettled([
      // Supabase count
      supabaseRealtime
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false)
        .eq("is_archived", false),

      // Prisma count
      prisma.notification.count({
        where: {
          recipientId: user.id,
          isRead: false,
          isArchived: false,
        },
      }),
    ]);

    const supabaseCount =
      supabaseResult.status === "fulfilled"
        ? supabaseResult.value.count || 0
        : 0;
    const prismaCount =
      prismaResult.status === "fulfilled" ? prismaResult.value : 0;

    const isInSync = Math.abs(supabaseCount - prismaCount) <= 1; // Allow small diff

    return NextResponse.json({
      unreadCount: supabaseCount, // Use Supabase as source of truth for realtime
      counts: {
        supabase: supabaseCount,
        prisma: prismaCount,
        inSync: isInSync,
        diff: Math.abs(supabaseCount - prismaCount),
      },
      lastChecked: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Get unread count error:", error);
    return NextResponse.json(
      { error: "Failed to get unread count", details: error.message },
      { status: 500 }
    );
  }
}
