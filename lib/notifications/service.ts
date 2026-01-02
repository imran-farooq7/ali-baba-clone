import { supabaseRealtime } from "@/lib/supabase/realtime";
import {
  NotificationPriority,
  NotificationType,
} from "../generated/prisma/enums";

// ===================== PURE FUNCTIONS =====================

// Type definitions
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

interface Notification {
  id: string;
  type: NotificationType;
  recipientId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  metadata: any;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
    company: string | null;
  } | null;
}

// ===================== UTILITY FUNCTIONS =====================

// Check if notification should be sent based on user preferences
export const shouldSendNotification = (
  type: NotificationType,
  settings: UserNotificationSettings | null
): boolean => {
  if (!settings) return true; // Default to true if no settings

  const now = new Date();
  const currentHour = now.getHours();

  // Check quiet hours
  if (
    settings.quietHoursEnabled &&
    settings.quietHoursStart &&
    settings.quietHoursEnd
  ) {
    if (settings.quietHoursStart <= settings.quietHoursEnd) {
      // Normal range (e.g., 22:00 to 8:00)
      if (
        currentHour >= settings.quietHoursStart ||
        currentHour < settings.quietHoursEnd
      ) {
        return false;
      }
    } else {
      // Wrap-around range (e.g., 22:00 to 8:00)
      if (
        currentHour >= settings.quietHoursStart ||
        currentHour < settings.quietHoursEnd
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
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days default
  }
};

// Broadcast notification via Supabase Realtime
export const broadcastNotification = async (
  notification: Notification
): Promise<void> => {
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
            unreadCount: 1, // Client will increment
          },
        });
      }
    });
  } catch (error) {
    console.error("Failed to broadcast notification:", error);
  }
};

// Broadcast read status update
export const broadcastReadStatus = async (
  notificationId: string,
  userId: string,
  isRead: boolean
): Promise<void> => {
  try {
    const channel = supabaseRealtime.channel(`user:${userId}`);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: "notification_read",
          payload: {
            notificationId,
            isRead,
            timestamp: new Date().toISOString(),
          },
        });
      }
    });
  } catch (error) {
    console.error("Failed to broadcast read status:", error);
  }
};

// Broadcast "all read" status
export const broadcastAllReadStatus = async (userId: string): Promise<void> => {
  try {
    const channel = supabaseRealtime.channel(`user:${userId}`);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: "all_notifications_read",
          payload: {
            userId,
            timestamp: new Date().toISOString(),
          },
        });
      }
    });
  } catch (error) {
    console.error("Failed to broadcast all read status:", error);
  }
};

// Queue email notification (placeholder - integrate with your email service)
export const queueEmailNotification = async (
  notification: Notification,
  settings: UserNotificationSettings
): Promise<void> => {
  // This would integrate with your email service (Resend, SendGrid, etc.)
  console.log("Email notification queued:", {
    recipientId: notification.recipientId,
    type: notification.type,
    title: notification.title,
  });
};
