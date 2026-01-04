// @/hooks/useRealtimeNotifications.ts
'use client';

import { useEffect, useState } from 'react';
import { subscribeToNotifications } from '@/lib/notifications/service';
import type { Notification } from '@/lib/notifications/service';

export const useRealtimeNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?limit=20`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setUnreadCount(data.counts.unread);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    // Subscribe to realtime updates
    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      console.log('🎯 Realtime notification received:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Update unread count
      if (!notification.is_read) {
        setUnreadCount(prev => prev + 1);
        setLatestNotification(notification);
        
        // Show browser notification if allowed
        if ('Notification' in window && Notification.permission === 'granted') {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: '/notification-icon.png'
          });
        }
      }
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      // Optimistic update
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST'
      });
      
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    latestNotification,
    markAsRead,
    markAllAsRead,
    clearLatest: () => setLatestNotification(null)
  };
};