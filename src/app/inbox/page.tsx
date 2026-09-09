"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dock } from "@/components/dashboard/Dock";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NotificationCategory = "all" | "security" | "transactions" | "alerts";

interface Notification {
  id: string;
  category: "security" | "transaction" | "alert" | "promo";
  title: string;
  message: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  icon: React.ElementType;
  read: boolean;
}

function formatTimeAgo(timestamp: string): string {
  const notificationDate = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - notificationDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${diffInYears}y ago`;
}

export default function InboxPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationCategory>("all");

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  }, [userId, isLoaded, user, router]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "security") return n.category === "security";
    if (filter === "transactions")
      return n.category === "transaction" || n.category === "promo";
    if (filter === "alerts") return n.category === "alert";
    return true;
  });

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-32">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white">Inbox</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="w-10 h-10 rounded-xl bg-white dark:bg-[#151A1F] hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Mark all as read"
            >
              <CheckCheck className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={2} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <FilterPill
            label="All"
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={notifications.length}
          />
          <FilterPill
            label="Security"
            active={filter === "security"}
            onClick={() => setFilter("security")}
            count={
              notifications.filter((n) => n.category === "security").length
            }
          />
          <FilterPill
            label="Transactions"
            active={filter === "transactions"}
            onClick={() => setFilter("transactions")}
            count={
              notifications.filter(
                (n) => n.category === "transaction" || n.category === "promo"
              ).length
            }
          />
          <FilterPill
            label="Alerts"
            active={filter === "alerts"}
            onClick={() => setFilter("alerts")}
            count={notifications.filter((n) => n.category === "alert").length}
          />
        </div>
      </motion.header>

      <main className="flex-1 overflow-auto px-5 py-2">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-500/20 border-t-[#0D4F3C] dark:border-t-[#156B53] rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Loading notifications...
            </p>
          </motion.div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-[#151A1F] flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-[#0C0F14] dark:text-white mb-1">
              No notifications
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">You&apos;re all caught up</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleNotificationClick(notification.id)}
                className={`bg-white dark:bg-[#151A1F] rounded-2xl p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden ${
                  !notification.read ? "ring-1 ring-[#0D4F3C]/30 dark:ring-[#156B53]/30" : ""
                }`}
              >
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-[#0D4F3C] to-[#156B53]" />
                )}

                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      notification.priority === "high"
                        ? "bg-red-500/10"
                        : notification.category === "promo"
                        ? "bg-purple-500/10"
                        : "bg-emerald-50 dark:bg-emerald-500/10"
                    }`}
                  >
                    <notification.icon
                      className={`w-5 h-5 ${
                        notification.priority === "high"
                          ? "text-red-500 dark:text-red-400"
                          : notification.category === "promo"
                          ? "text-purple-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                      strokeWidth={2}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          notification.priority === "high"
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {notification.category}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <>
                          <span className="text-gray-500 dark:text-gray-400">•</span>
                          <Badge className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider rounded">
                            New
                          </Badge>
                        </>
                      )}
                    </div>
                    <h3
                      className={`text-sm font-bold mb-1.5 ${
                        !notification.read ? "text-[#0C0F14] dark:text-white" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pr-10">
                      {notification.message}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-red-500/0 hover:bg-red-500/10 flex items-center justify-center transition-colors group"
                  aria-label="Delete notification"
                >
                  <Trash2
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors"
                    strokeWidth={2}
                  />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Dock activeItem="" onItemClick={(href) => router.push(href)} />
    </main>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <Button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
        active
          ? "bg-[#0D4F3C] text-white"
          : "bg-white dark:bg-[#151A1F] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`ml-1.5 ${active ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}
        >
          ({count})
        </span>
      )}
    </Button>
  );
}
