// @/lib/notifications/service.ts
import { supabaseRealtime } from "@/lib/supabase/realtime";
import {
  NotificationPriority,
  NotificationType,
} from "../generated/prisma/enums";

// ===================== TYPES =====================

export interface CreateNotificationParams {
  type: NotificationType;
  recipientId: string;
  senderId?: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: NotificationPriority;
  entityIds?: {
    briefId?: string;
    proposalId?: string;
    conversationId?: string;
  };
}

export interface Notification {
  id: string;
  type: NotificationType;
  recipientId: string;
  senderId: string | null;
  title: string;
  message: string;
  metadata: Record<string, any>;
  priority: NotificationPriority;
  briefId: string | null;
  proposalId: string | null;
  conversationId: string | null;
  isRead: boolean;
  isArchived: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  sender?: {
    id: string;
    name: string;
    avatar: string | null;
    company: string | null;
  } | null;
}

interface UserNotificationSettings {
  inAppProposals: boolean;
  inAppMessages: boolean;
  inAppSystem: boolean;
  emailProposals: boolean;
  emailMessages: boolean;
  emailSystem: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: number | null;
  quietHoursEnd?: number | null;
}

// ===================== PURE UTILITY FUNCTIONS =====================

// Check if notification should be sent based on user preferences
export const shouldSendNotification = (
  type: NotificationType,
  settings: UserNotificationSettings | null
): boolean => {
  if (!settings) return true;

  const now = new Date();
  const currentHour = now.getHours();

  // Check quiet hours
  if (
    settings.quietHoursEnabled &&
    settings.quietHoursStart !== undefined &&
    settings.quietHoursEnd !== undefined
  ) {
    if (settings?.quietHoursStart! <= settings?.quietHoursEnd!) {
      if (
        currentHour >= settings.quietHoursStart! &&
        currentHour < settings.quietHoursEnd!
      ) {
        return false;
      }
    } else {
      if (
        currentHour >= settings.quietHoursStart! ||
        currentHour < settings.quietHoursEnd!
      ) {
        return false;
      }
    }
  }

  // Check type-specific preferences
  switch (type) {
    case "PROPOSAL_RECEIVED":
    case "PROPOSAL_ACCEPTED":
    case "PROPOSAL_REJECTED":
    case "PROPOSAL_COUNTERED":
      return settings.inAppProposals;

    case "NEW_MESSAGE":
    case "MENTION":
      return settings.inAppMessages;

    case "SYSTEM_ALERT":
    case "VERIFICATION_APPROVED":
    case "VERIFICATION_REJECTED":
      return settings.inAppSystem;

    default:
      return true;
  }
};

// Check if email should be sent
export const shouldSendEmail = (
  type: NotificationType,
  settings: UserNotificationSettings
): boolean => {
  switch (type) {
    case "PROPOSAL_RECEIVED":
    case "PROPOSAL_ACCEPTED":
    case "PROPOSAL_REJECTED":
    case "PROPOSAL_COUNTERED":
      return settings.emailProposals;

    case "NEW_MESSAGE":
    case "MENTION":
      return settings.emailMessages;

    case "SYSTEM_ALERT":
    case "VERIFICATION_APPROVED":
    case "VERIFICATION_REJECTED":
      return settings.emailSystem;

    default:
      return false;
  }
};

// Calculate expiration date based on notification type
export const calculateExpiration = (type: NotificationType): Date | null => {
  const now = new Date();

  switch (type) {
    case "PROPOSAL_RECEIVED":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    case "NEW_MESSAGE":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    case "SYSTEM_ALERT":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    default:
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
  }
};

// ===================== DATABASE FUNCTIONS =====================

/**
 * Create notification directly in Supabase (triggers realtime automatically)
 * Use this instead of Prisma for realtime to work
 */
export const createNotificationDirect = async (
  params: CreateNotificationParams
): Promise<Notification> => {
  const expiresAt = calculateExpiration(params.type);

  const { data, error } = await supabaseRealtime
    .from("notifications")
    .insert({
      type: params.type,
      recipient_id: params.recipientId,
      sender_id: params.senderId || null,
      title: params.title,
      message: params.message,
      metadata: params.metadata || {},
      priority: params.priority || "MEDIUM",
      brief_id: params.entityIds?.briefId,
      proposal_id: params.entityIds?.proposalId,
      conversation_id: params.entityIds?.conversationId,
      expires_at: expiresAt?.toISOString() || null,
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

  if (error) {
    throw new Error(`Supabase notification creation failed: ${error.message}`);
  }

  // Convert snake_case to camelCase
  return {
    id: data.id,
    type: data.type,
    recipientId: data.recipient_id,
    senderId: data.sender_id,
    title: data.title,
    message: data.message,
    metadata: data.metadata,
    priority: data.priority,
    briefId: data.brief_id,
    proposalId: data.proposal_id,
    conversationId: data.conversation_id,
    isRead: data.is_read,
    isArchived: data.is_archived,
    expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    sender: data.sender
      ? {
          id: data.sender.id,
          name: data.sender.name,
          avatar: data.sender.avatar,
          company: data.sender.company,
        }
      : null,
  };
};

/**
 * DEPRECATED: Old broadcast function that doesn't work with Postgres changes
 * Keep for backward compatibility, but don't use
 */
export const broadcastNotification = async (
  notification: Notification
): Promise<void> => {
  console.warn(
    "⚠️ broadcastNotification is deprecated. Use createNotificationDirect instead."
  );

  try {
    const channel = supabaseRealtime.channel(
      `user:${notification.recipientId}`
    );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: "new_notification",
          payload: {
            notification,
            timestamp: new Date().toISOString(),
          },
        });
      }
    });

    // Clean up after 3 seconds
    setTimeout(() => {
      supabaseRealtime.removeChannel(channel);
    }, 3000);
  } catch (error) {
    console.error("Broadcast failed:", error);
  }
};

/**
 * Manual broadcast function (optional - for non-database events)
 * Use only for events not stored in database
 */
export const broadcastManualNotification = async (
  notification: Notification,
  eventType: "new_notification" | "notification_read" = "new_notification"
): Promise<void> => {
  try {
    const channel = supabaseRealtime.channel(
      `manual-notifications:${notification.recipientId}`,
      {
        config: {
          broadcast: { self: false, ack: false },
        },
      }
    );

    // Subscribe first
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // Send manual broadcast
        channel.send({
          type: "broadcast",
          event: eventType,
          payload: notification,
        });

        // Immediately unsubscribe
        setTimeout(() => {
          supabaseRealtime.removeChannel(channel);
        }, 1000);
      }
    });
  } catch (error) {
    console.error("Manual broadcast failed:", error);
  }
};

// ===================== STATUS UPDATE FUNCTIONS =====================

/**
 * Mark notification as read directly in Supabase
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabaseRealtime
    .from("notifications")
    .update({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("recipient_id", userId);

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<void> => {
  const { error } = await supabaseRealtime
    .from("notifications")
    .update({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .eq("recipient_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new Error(
      `Failed to mark all notifications as read: ${error.message}`
    );
  }
};

// ===================== HELPER FUNCTIONS =====================

/**
 * Get notification channel name for a user
 */
export const getNotificationChannelName = (userId: string): string => {
  return `notifications:${userId}`;
};

/**
 * Subscribe to user's notifications in realtime
 * Returns unsubscribe function
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: any) => void
): (() => void) => {
  const channel = supabaseRealtime
    .channel(getNotificationChannelName(userId))
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe((status) => {
      console.log(`Notification subscription status for ${userId}: ${status}`);
    });

  // Return unsubscribe function
  return () => {
    supabaseRealtime.removeChannel(channel);
  };
};

/**
 * Queue email notification (placeholder)
 */
export const queueEmailNotification = async (
  notification: Notification,
  settings: UserNotificationSettings
): Promise<void> => {
  // Integration with Resend, SendGrid, etc.
  console.log("Email notification queued:", {
    recipientId: notification.recipientId,
    type: notification.type,
    title: notification.title,
  });
};

// ===================== VALIDATION =====================

/**
 * Validate notification parameters
 */
export const validateNotificationParams = (
  params: CreateNotificationParams
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!params.type) errors.push("Type is required");
  if (!params.recipientId) errors.push("Recipient ID is required");
  if (!params.title || params.title.trim().length === 0)
    errors.push("Title is required");
  if (!params.message || params.message.trim().length === 0)
    errors.push("Message is required");

  // Validate type enum
  const validTypes = [
    "PROPOSAL_RECEIVED",
    "PROPOSAL_ACCEPTED",
    "PROPOSAL_REJECTED",
    "PROPOSAL_COUNTERED",
    "NEW_MESSAGE",
    "MENTION",
    "SYSTEM_ALERT",
    "VERIFICATION_APPROVED",
    "VERIFICATION_REJECTED",
  ];

  if (!validTypes.includes(params.type)) {
    errors.push(`Invalid notification type: ${params.type}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
