// components/NotificationList.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Briefcase,
  Check,
  CheckCircle,
  ExternalLink,
  FileText,
  MessageSquare,
  MoreVertical,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Notification as NotificationType } from "@/lib/notifications/service";

interface NotificationListProps {
  notifications: NotificationType[];
  onMarkRead: (notificationId: string) => Promise<void>;
  onMarkAllRead?: () => Promise<void>;
  onDelete?: (notificationId: string) => Promise<void>;
  showActions?: boolean;
  realtimeEnabled?: boolean;
  showUnreadBadge?: boolean;
}

export default function NotificationList({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  showActions = true,
  realtimeEnabled = true,
  showUnreadBadge = true,
}: NotificationListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "PROPOSAL_RECEIVED":
        return <FileText className="h-5 w-5 text-blue-600 animate-pulse" />;
      case "PROPOSAL_ACCEPTED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "PROPOSAL_REJECTED":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "PROPOSAL_COUNTERED":
        return <FileText className="h-5 w-5 text-yellow-600" />;

      case "NEW_MESSAGE":
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case "MENTION":
        return <MessageSquare className="h-5 w-5 text-indigo-600" />;

      case "BRIEF_PUBLISHED":
        return <Briefcase className="h-5 w-5 text-teal-600" />;
      case "BRIEF_MATCHED":
        return <Briefcase className="h-5 w-5 text-cyan-600" />;

      case "VERIFICATION_APPROVED":
        return <Shield className="h-5 w-5 text-emerald-600" />;
      case "VERIFICATION_REJECTED":
        return <Shield className="h-5 w-5 text-rose-600" />;

      case "SYSTEM_ALERT":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;

      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (notification: NotificationType) => {
    // Highlight new realtime notifications
    if (realtimeEnabled && !notification.isRead) {
      return "bg-blue-50/50 border-blue-200 hover:bg-blue-100/50 shadow-sm";
    }

    if (!notification.isRead) {
      return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }

    switch (notification.type) {
      case "PROPOSAL_ACCEPTED":
      case "VERIFICATION_APPROVED":
        return "bg-green-50/50 border-green-100 hover:bg-green-100/50";

      case "PROPOSAL_REJECTED":
      case "VERIFICATION_REJECTED":
        return "bg-red-50/50 border-red-100 hover:bg-red-100/50";

      case "PROPOSAL_COUNTERED":
        return "bg-yellow-50/50 border-yellow-100 hover:bg-yellow-100/50";

      case "NEW_MESSAGE":
        return "bg-purple-50/50 border-purple-100 hover:bg-purple-100/50";

      default:
        return "bg-white border-gray-100 hover:bg-gray-50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full animate-pulse">
            🔥 High Priority
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            ⚡ Medium Priority
          </span>
        );
      default:
        return null;
    }
  };

  const getActionUrl = (notification: NotificationType) => {
    if (notification.proposalId) {
      return `/brand/proposals/${notification.proposalId}`;
    }
    if (notification.briefId) {
      return `/manufacturer/briefs/${notification.briefId}`;
    }
    if (notification.conversationId) {
      return `/chat?conversationId=${notification.conversationId}`;
    }

    // Check metadata for custom URLs
    if (notification.metadata?.url) {
      return notification.metadata.url;
    }

    return null;
  };

  const handleNotificationClick = async (notification: NotificationType) => {
    if (!notification.isRead) {
      setLoadingId(notification.id);
      try {
        await onMarkRead(notification.id);
      } finally {
        setLoadingId(null);
      }
    }

    const url = getActionUrl(notification);
    if (url) {
      window.open(
        url,
        notification.metadata?.openInNewTab ? "_blank" : "_self"
      );
    }
  };

  const handleMarkRead = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    setLoadingId(notificationId);
    try {
      await onMarkRead(notificationId);
    } finally {
      setLoadingId(null);
      setShowMenuId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (onDelete) {
      setLoadingId(notificationId);
      try {
        await onDelete(notificationId);
      } finally {
        setLoadingId(null);
        setShowMenuId(null);
      }
    }
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata) return null;

    if (metadata.price) {
      return (
        <div className="flex items-center gap-1 text-sm font-medium text-green-700">
          <span>💲</span>
          <span>${metadata.price.toLocaleString()}</span>
        </div>
      );
    }

    if (metadata.quantity) {
      return (
        <div className="flex items-center gap-1 text-sm font-medium text-blue-700">
          <span>📦</span>
          <span>{metadata.quantity.toLocaleString()} units</span>
        </div>
      );
    }

    if (metadata.days) {
      return (
        <div className="flex items-center gap-1 text-sm font-medium text-amber-700">
          <span>⏰</span>
          <span>{metadata.days} days remaining</span>
        </div>
      );
    }

    return null;
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No notifications
        </h3>
        <p className="text-gray-500">
          You're all caught up! Notifications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header with stats */}
      {showUnreadBadge && unreadCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </span>
          </div>
          {onMarkAllRead && (
            <button
              onClick={onMarkAllRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              disabled={loadingId !== null}
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>
      )}

      {/* Notifications list */}
      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => {
          const actionUrl = getActionUrl(notification);
          const metadataText = formatMetadata(notification.metadata);
          const isRealtime =
            realtimeEnabled &&
            notification.createdAt > new Date(Date.now() - 60000); // Last minute

          return (
            <div
              key={notification.id}
              className={`p-4 border-l-4 cursor-pointer transition-all duration-200 ${getNotificationColor(
                notification
              )} ${
                !notification.isRead
                  ? "border-l-blue-500"
                  : "border-l-transparent"
              } ${isRealtime ? "ring-1 ring-blue-200" : ""}`}
              onClick={() => handleNotificationClick(notification)}
              onMouseEnter={() => setExpandedId(notification.id)}
              onMouseLeave={() => {
                setExpandedId(null);
                setShowMenuId(null);
              }}
            >
              <div className="flex gap-3">
                {/* Icon with realtime indicator */}
                <div className="shrink-0 relative">
                  {getNotificationIcon(notification.type)}
                  {isRealtime && !notification.isRead && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {notification.priority &&
                          getPriorityBadge(notification.priority)}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>

                      {/* Metadata and sender */}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {notification.sender && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                              {notification.sender.avatar ? (
                                <img
                                  src={notification.sender.avatar}
                                  alt={notification.sender.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-gray-400 m-1" />
                              )}
                            </div>
                            <span className="text-xs text-gray-700 font-medium">
                              {notification.sender.name}
                              {notification.sender.company &&
                                ` · ${notification.sender.company}`}
                            </span>
                          </div>
                        )}

                        {metadataText && (
                          <div className="flex items-center gap-1">
                            {metadataText}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time and actions */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                          {isRealtime && " • 🔴 Live"}
                        </span>

                        {showActions && (
                          <div className="relative">
                            <button
                              className="p-1 text-gray-400 hover:text-gray-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMenuId(
                                  showMenuId === notification.id
                                    ? null
                                    : notification.id
                                );
                              }}
                              disabled={loadingId === notification.id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Dropdown menu */}
                            {showMenuId === notification.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button
                                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  onClick={(e) =>
                                    handleMarkRead(e, notification.id)
                                  }
                                  disabled={
                                    loadingId === notification.id ||
                                    notification.isRead
                                  }
                                >
                                  <Check className="h-4 w-4" />
                                  {notification.isRead
                                    ? "Already read"
                                    : "Mark as read"}
                                </button>
                                {onDelete && (
                                  <button
                                    className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    onClick={(e) =>
                                      handleDelete(e, notification.id)
                                    }
                                    disabled={loadingId === notification.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete notification
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Loading indicator */}
                      {loadingId === notification.id && (
                        <div className="text-xs text-gray-500 animate-pulse">
                          Updating...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === notification.id && actionUrl && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <a
                        href={actionUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View details
                        {notification.metadata?.actionLabel &&
                          ` • ${notification.metadata.actionLabel}`}
                      </a>
                    </div>
                  )}
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="shrink-0">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Realtime status indicator */}
      {realtimeEnabled && (
        <div className="px-4 py-2 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <div
              className={`w-2 h-2 rounded-full ${
                unreadCount > 0 ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span>
              {unreadCount > 0
                ? `Realtime notifications active • ${unreadCount} new`
                : "Realtime notifications connected"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
