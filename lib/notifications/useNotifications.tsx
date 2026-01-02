"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseRealtime } from "@/lib/supabase/realtime";
import { NotificationType } from "../generated/prisma/enums";

// Hook for real-time notifications
export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<any>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications");

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.counts.unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  // Archive notification
  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        // Don't decrement unread count here - it's already counted in unread
      }
    } catch (error) {
      console.error("Failed to archive notification:", error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );
          // Update unread count if the deleted notification was unread
          const deletedNotification = notifications.find(
            (n) => n.id === notificationId
          );
          if (deletedNotification && !deletedNotification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    },
    [notifications]
  );

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    // Create real-time channel
    const newChannel = supabaseRealtime.channel(`user:${userId}`);

    newChannel
      .on("broadcast", { event: "new_notification" }, ({ payload }) => {
        // Add new notification to the top
        setNotifications((prev) => [payload.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show desktop notification if browser supports it
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(payload.notification.title, {
            body: payload.notification.message,
            icon: payload.notification.sender?.avatar,
            tag: payload.notification.id,
          });
        }
      })
      .on("broadcast", { event: "notification_read" }, ({ payload }) => {
        // Update read status
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === payload.notificationId
              ? { ...n, isRead: payload.isRead }
              : n
          )
        );

        if (payload.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else {
          setUnreadCount((prev) => prev + 1);
        }
      })
      .on("broadcast", { event: "all_notifications_read" }, () => {
        // Mark all as read
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      })
      .subscribe();

    setChannel(newChannel);

    // Cleanup on unmount
    return () => {
      if (newChannel) {
        newChannel.unsubscribe();
      }
    };
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    refresh: fetchNotifications,
  };
};

// Hook for creating notifications (for use in other components)
export const useCreateNotification = () => {
  const createNotification = useCallback(
    async (
      type: NotificationType,
      recipientId: string,
      title: string,
      message: string,
      options?: {
        senderId?: string;
        metadata?: Record<string, any>;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
        entityIds?: {
          briefId?: string;
          proposalId?: string;
          conversationId?: string;
        };
      }
    ) => {
      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            recipientId,
            senderId: options?.senderId,
            title,
            message,
            metadata: options?.metadata,
            priority: options?.priority || "MEDIUM",
            entityIds: options?.entityIds,
          }),
        });

        return await response.json();
      } catch (error) {
        console.error("Failed to create notification:", error);
        return { success: false, error: "Network error" };
      }
    },
    []
  );

  return { createNotification };
};
