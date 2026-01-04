import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  markNotificationAsRead,
  broadcastManualNotification,
} from "@/lib/notifications/service"; // Fixed import
import { supabaseRealtime } from "@/lib/supabase/realtime";

// GET /api/notifications/[id] - Get single notification
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to fetch from Supabase first for realtime consistency
    let notification: any = null;
    let source = "prisma";

    try {
      // First try Supabase for realtime consistency
      const { data: supabaseData, error } = await supabaseRealtime
        .from("notifications")
        .select(
          `
          *,
          sender:users(id, name, avatar, company, type),
          brief:briefs(id, title, description),
          proposal:proposals(id, price, timeline_days, status),
          conversation:conversations(
            id, 
            title,
            participants:conversation_participants(
              user:users(id, name)
            )
          )
        `
        )
        .eq("id", id)
        .eq("recipient_id", user.id)
        .single();

      if (!error && supabaseData) {
        notification = {
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
          readAt: supabaseData.read_at ? new Date(supabaseData.read_at) : null,
          archivedAt: supabaseData.archived_at
            ? new Date(supabaseData.archived_at)
            : null,
          createdAt: new Date(supabaseData.created_at),
          updatedAt: new Date(supabaseData.updated_at),
          expiresAt: supabaseData.expires_at
            ? new Date(supabaseData.expires_at)
            : null,
          sender: supabaseData.sender
            ? {
                id: supabaseData.sender.id,
                name: supabaseData.sender.name,
                avatar: supabaseData.sender.avatar,
                company: supabaseData.sender.company,
                type: supabaseData.sender.type,
              }
            : null,
          brief: supabaseData.brief
            ? {
                id: supabaseData.brief.id,
                title: supabaseData.brief.title,
                description: supabaseData.brief.description,
              }
            : null,
          proposal: supabaseData.proposal
            ? {
                id: supabaseData.proposal.id,
                price: supabaseData.proposal.price,
                timelineDays: supabaseData.proposal.timeline_days,
                status: supabaseData.proposal.status,
              }
            : null,
          conversation: supabaseData.conversation
            ? {
                id: supabaseData.conversation.id,
                title: supabaseData.conversation.title,
                participants:
                  supabaseData.conversation.participants?.map((p: any) => ({
                    user: p.user,
                  })) || [],
              }
            : null,
        };
        source = "supabase";
      }
    } catch (supabaseError) {
      console.log(
        "Falling back to Prisma for notification fetch:",
        supabaseError
      );
    }

    // Fallback to Prisma if Supabase fetch failed
    if (!notification) {
      notification = await prisma.notification.findUnique({
        where: {
          id,
          recipientId: user.id,
        },
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
              description: true,
            },
          },
          proposal: {
            select: {
              id: true,
              price: true,
              timelineDays: true,
              status: true,
            },
          },
          conversation: {
            select: {
              id: true,
              title: true,
              participants: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Mark as read if not already read (using Supabase for realtime)
    if (!notification.isRead) {
      try {
        // Update in Supabase first for realtime
        await markNotificationAsRead(id, user.id);

        // Sync to Prisma for consistency
        await prisma.notification
          .update({
            where: { id },
            data: {
              isRead: true,
              readAt: new Date(),
            },
          })
          .catch((err) => {
            console.warn("Prisma sync failed for read status:", err);
          });

        // Optional: Broadcast via manual channel as backup
        await broadcastManualNotification(
          {
            ...notification,
            isRead: true,
            updatedAt: new Date(),
          },
          "notification_read"
        );
      } catch (updateError) {
        console.error("Failed to mark notification as read:", updateError);
        // Continue anyway - don't fail the whole request
      }
    }

    return NextResponse.json({
      notification,
      relatedActions: getRelatedActions(
        notification.type,
        notification.metadata
      ),
      source, // Debug info
    });
  } catch (error: any) {
    console.error("Notification fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/[id] - Update notification (mark read/archive)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    const data = await request.json();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate allowed updates
    const allowedUpdates = ["isRead", "isArchived"];
    const updates = Object.keys(data).filter((key) =>
      allowedUpdates.includes(key)
    );

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    // =============================================
    // 🚨 CRITICAL: Update in Supabase FIRST for realtime
    // =============================================
    const updateData: any = {};
    const now = new Date().toISOString();

    if (data.isRead !== undefined) {
      updateData.is_read = data.isRead;
      updateData.read_at = data.isRead ? now : null;
    }

    if (data.isArchived !== undefined) {
      updateData.is_archived = data.isArchived;
      updateData.archived_at = data.isArchived ? now : null;
    }

    updateData.updated_at = now;

    // Update in Supabase
    const { data: supabaseData, error: supabaseError } = await supabaseRealtime
      .from("notifications")
      .update(updateData)
      .eq("id", id)
      .eq("recipient_id", user.id)
      .select("*")
      .single();

    if (supabaseError) {
      console.error("Supabase update failed:", supabaseError);
      throw new Error(
        `Failed to update notification: ${supabaseError.message}`
      );
    }

    // Convert back to camelCase
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
      readAt: supabaseData.read_at ? new Date(supabaseData.read_at) : null,
      archivedAt: supabaseData.archived_at
        ? new Date(supabaseData.archived_at)
        : null,
      createdAt: new Date(supabaseData.created_at),
      updatedAt: new Date(supabaseData.updated_at),
      expiresAt: supabaseData.expires_at
        ? new Date(supabaseData.expires_at)
        : null,
    };

    // =============================================
    // Sync to Prisma for consistency
    // =============================================
    try {
      const prismaUpdateData: any = {};

      if (data.isRead !== undefined) {
        prismaUpdateData.isRead = data.isRead;
        prismaUpdateData.readAt = data.isRead ? new Date() : null;
      }

      if (data.isArchived !== undefined) {
        prismaUpdateData.isArchived = data.isArchived;
        prismaUpdateData.archivedAt = data.isArchived ? new Date() : null;
      }

      await prisma.notification.update({
        where: {
          id,
          recipientId: user.id,
        },
        data: prismaUpdateData,
      });
    } catch (prismaError) {
      console.warn("Prisma sync failed (non-critical):", prismaError);
      // Continue - Supabase update already succeeded
    }

    // Optional: Broadcast read status if changed
    if (data.isRead !== undefined) {
      await broadcastManualNotification(notification, "notification_read");
    }

    return NextResponse.json({
      success: true,
      notification,
      message: "Notification updated successfully",
      realtimeUpdated: true,
    });
  } catch (error: any) {
    console.error("Notification update error:", error);

    if (
      error.message?.includes("Failed to update notification") ||
      error.code === "PGRST116"
    ) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update notification", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // =============================================
    // 🚨 CRITICAL: Delete from Supabase FIRST for realtime
    // =============================================

    // 1. First get the notification before deleting
    const { data: notification, error: fetchError } = await supabaseRealtime
      .from("notifications")
      .select("*")
      .eq("id", id)
      .eq("recipient_id", user.id)
      .single();

    if (fetchError || !notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // 2. Delete from Supabase (will trigger realtime DELETE event)
    const { error: deleteError } = await supabaseRealtime
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("recipient_id", user.id);

    if (deleteError) {
      throw new Error(`Supabase delete failed: ${deleteError.message}`);
    }

    // 3. Sync delete to Prisma
    try {
      await prisma.notification.delete({
        where: {
          id,
          recipientId: user.id,
        },
      });
    } catch (prismaError) {
      console.warn("Prisma delete sync failed (non-critical):", prismaError);
      // Continue - Supabase delete already succeeded
    }

    // 4. Broadcast deletion event (optional)
    try {
      await broadcastManualNotification({
        id,
        recipientId: user.id,
        type: notification.type as any,
        title: "Notification deleted",
        message: "A notification was removed",
        isRead: true,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: null,
        metadata: {},
        priority: "LOW",
        senderId: null,
        briefId: null,
        proposalId: null,
        conversationId: null,
      });
    } catch (broadcastError) {
      console.warn("Broadcast failed for deletion:", broadcastError);
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
      realtimeDeleted: true,
    });
  } catch (error: any) {
    console.error("Notification delete error:", error);

    if (error.message?.includes("Notification not found")) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete notification", details: error.message },
      { status: 500 }
    );
  }
}

// Pure function: Get related actions based on notification type
const getRelatedActions = (type: string, metadata: any) => {
  const actions = [];

  switch (type) {
    case "PROPOSAL_RECEIVED":
      actions.push({
        label: "Review Proposal",
        url: `/brand/proposals/${
          metadata?.proposalId || metadata?.proposal_id
        }`,
        primary: true,
        icon: "file-text",
      });
      break;

    case "PROPOSAL_ACCEPTED":
      actions.push({
        label: "View Project",
        url: `/manufacturer/proposals/${
          metadata?.proposalId || metadata?.proposal_id
        }`,
        primary: true,
        icon: "briefcase",
      });
      actions.push({
        label: "Start Conversation",
        url: `/chat?proposalId=${
          metadata?.proposalId || metadata?.proposal_id
        }`,
        primary: false,
        icon: "message-square",
      });
      break;

    case "PROPOSAL_REJECTED":
      actions.push({
        label: "View Feedback",
        url: `/manufacturer/proposals/${
          metadata?.proposalId || metadata?.proposal_id
        }/feedback`,
        primary: true,
        icon: "alert-circle",
      });
      break;

    case "PROPOSAL_COUNTERED":
      actions.push({
        label: "Review Counter Offer",
        url: `/brand/proposals/${
          metadata?.proposalId || metadata?.proposal_id
        }/negotiate`,
        primary: true,
        icon: "refresh-cw",
      });
      break;

    case "NEW_MESSAGE":
      actions.push({
        label: "Open Chat",
        url: `/chat?conversationId=${
          metadata?.conversationId || metadata?.conversation_id
        }`,
        primary: true,
        icon: "message-square",
      });
      break;

    case "MENTION":
      actions.push({
        label: "View Message",
        url: `/chat?conversationId=${
          metadata?.conversationId || metadata?.conversation_id
        }&messageId=${metadata?.messageId}`,
        primary: true,
        icon: "at-sign",
      });
      break;

    case "BRIEF_PUBLISHED":
      actions.push({
        label: "View Brief",
        url: `/manufacturer/briefs/${metadata?.briefId || metadata?.brief_id}`,
        primary: true,
        icon: "file-text",
      });
      actions.push({
        label: "Submit Proposal",
        url: `/manufacturer/briefs/${
          metadata?.briefId || metadata?.brief_id
        }/propose`,
        primary: false,
        icon: "send",
      });
      break;

    case "BRIEF_MATCHED":
      actions.push({
        label: "View Matches",
        url: `/brand/briefs/${metadata?.briefId || metadata?.brief_id}/matches`,
        primary: true,
        icon: "users",
      });
      break;

    case "VERIFICATION_APPROVED":
      actions.push({
        label: "View Profile",
        url: `/manufacturer/profile`,
        primary: true,
        icon: "shield",
      });
      actions.push({
        label: "Browse Briefs",
        url: `/manufacturer/briefs`,
        primary: false,
        icon: "search",
      });
      break;

    case "SYSTEM_ALERT":
      if (metadata?.actionUrl) {
        actions.push({
          label: metadata.actionLabel || "Take Action",
          url: metadata.actionUrl,
          primary: true,
          icon: "external-link",
        });
      }
      break;
  }

  // Add common actions
  if (actions.length === 0 && metadata?.url) {
    actions.push({
      label: "View Details",
      url: metadata.url,
      primary: true,
      icon: "external-link",
    });
  }

  return actions;
};
