"use client";

import { Notification } from "@/types/notifications";
import { format } from "date-fns";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

const notificationIcons: Record<string, React.ReactNode> = {
  REMINDER: <Bell className="h-4 w-4 text-blue-500" />,
  BOOKING: <CheckCircle className="h-4 w-4 text-green-500" />,
  CANCEL: <AlertCircle className="h-4 w-4 text-red-500" />,
};

const notificationLabels: Record<string, string> = {
  REMINDER: "Reminder",
  BOOKING: "Booking",
  CANCEL: "Cancelled",
};

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 border-b cursor-pointer transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-blue-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {notificationIcons[notification.type] || (
            <Bell className="h-4 w-4 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-sm",
              !notification.isRead && "font-semibold"
            )}
          >
            {notification.message}
          </div>
          {notification.appointmentTime && (
            <div className="text-xs text-muted-foreground mt-1">
              {format(
                new Date(notification.appointmentTime),
                "MMM d, yyyy • h:mm a"
              )}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {notificationLabels[notification.type] || notification.type}
            </span>
            {!notification.isRead && (
              <span className="text-xs text-blue-600 font-medium">New</span>
            )}
          </div>
          {notification.createdAt && (
            <div className="text-xs text-muted-foreground mt-1">
              {format(new Date(notification.createdAt), "p")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
