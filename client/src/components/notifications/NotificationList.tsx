// src/components/notifications/NotificationList.tsx
import Link from "next/link";
import { formatDate } from "@/utils/date";
import { FiAward, FiBook, FiClock } from "react-icons/fi";

type NotificationProps = {
  notifications: any[];
  emptyMessage?: string;
  maxItems?: number;
  showViewAll?: boolean;
  className?: string;
};

const NotificationList = ({
  notifications,
  emptyMessage = "Belum ada notifikasi",
  maxItems = 5,
  showViewAll = true,
  className = "",
}: NotificationProps) => {
  // Helper function to get the appropriate icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course_completed":
      case "certificate":
        return <FiAward />;
      case "enrollment":
        return <FiBook />;
      default:
        return <FiClock />;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <p className="text-neutral-600 dark:text-neutral-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800 ${className}`}>
      {notifications
        .slice(0, maxItems)
        .map((notification, index) => (
          <div
            key={notification.id}
            className={`flex items-start justify-between p-4 ${
              index !== notifications.slice(0, maxItems).length - 1
                ? "border-b border-neutral-200 dark:border-neutral-700"
                : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-primary-600 dark:bg-neutral-700 dark:text-primary-400">
                {getNotificationIcon(notification.type)}
              </span>
              <div>
                <p className="text-neutral-700 dark:text-neutral-300">
                  {notification.message}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatDate(notification.created_at, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-primary-400"></span>
            )}
          </div>
        ))}

      {showViewAll && notifications.length > 0 && (
        <div className="border-t border-neutral-200 p-4 text-center dark:border-neutral-700">
          <Link
            href="/dashboard/notifications"
            className="text-sm text-primary-400 hover:text-primary-500"
          >
            Lihat semua notifikasi
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationList;