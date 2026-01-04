"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Settings, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRealtimeNotifications } from "@/lib/notifications/useNotifications";
import NotificationList from "./NotificationList";

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearLatest: refresh,
  } = useRealtimeNotifications(userId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Request notification permission
  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };
  console.log(notifications, "from bell");

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1.5 bg-red-600 text-white text-xs font-bold rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 max-h-[80vh] overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 -mb-px mt-3">
              <button className="flex-1 py-2 text-center text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                All
              </button>
              <button className="flex-1 py-2 text-center text-sm font-medium text-gray-500 hover:text-gray-700">
                Unread
              </button>
              <button className="flex-1 py-2 text-center text-sm font-medium text-gray-500 hover:text-gray-700">
                Archived
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">
                Notification Settings
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Desktop Notifications
                  </span>
                  <button
                    onClick={requestNotificationPermission}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    {Notification.permission === "granted"
                      ? "Enabled"
                      : "Enable"}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Email Notifications
                  </span>
                  <Link
                    href="/settings/notifications"
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-100">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Updates will appear here
                </p>
              </div>
            ) : (
              <NotificationList
                notifications={notifications}
                onMarkRead={async () => refresh()}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={refresh}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                Refresh
              </button>

              <Link
                href="/notifications"
                className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
