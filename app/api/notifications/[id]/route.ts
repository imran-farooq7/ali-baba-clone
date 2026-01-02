import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import { broadcastReadStatus } from "@/lib/notifications/service";

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

    const notification = await prisma.notification.findUnique({
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

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Mark as read if not already read
    if (!notification.isRead) {
      await prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      await broadcastReadStatus(id, user.id, true);
    }

    return NextResponse.json({
      notification,
      relatedActions: getRelatedActions(
        notification.type,
        notification.metadata
      ),
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

    // Build update data
    const updateData: any = {};

    if (data.isRead !== undefined) {
      updateData.isRead = data.isRead;
      updateData.readAt = data.isRead ? new Date() : null;
    }

    if (data.isArchived !== undefined) {
      updateData.isArchived = data.isArchived;
      updateData.archivedAt = data.isArchived ? new Date() : null;
    }

    const notification = await prisma.notification.update({
      where: {
        id,
        recipientId: user.id,
      },
      data: updateData,
    });

    // Broadcast read status if changed
    if (data.isRead !== undefined) {
      await broadcastReadStatus(id, user.id, data.isRead);
    }

    return NextResponse.json({
      success: true,
      notification,
      message: "Notification updated successfully",
    });
  } catch (error: any) {
    console.error("Notification update error:", error);

    if (error.code === "P2025") {
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

    await prisma.notification.delete({
      where: {
        id,
        recipientId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("Notification delete error:", error);

    if (error.code === "P2025") {
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
        url: `/brand/proposals/${metadata?.proposalId}`,
        primary: true,
      });
      break;

    case "PROPOSAL_ACCEPTED":
      actions.push({
        label: "View Project",
        url: `/manufacturer/proposals/${metadata?.proposalId}`,
        primary: true,
      });
      break;

    case "NEW_MESSAGE":
      actions.push({
        label: "Open Chat",
        url: `/chat?conversationId=${metadata?.conversationId}`,
        primary: true,
      });
      break;

    case "BRIEF_PUBLISHED":
      actions.push({
        label: "View Brief",
        url: `/manufacturer/briefs/${metadata?.briefId}`,
        primary: true,
      });
      break;
  }

  return actions;
};
