"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { getNotifications, getUnreadNotificationCount, markAsRead } from "@/actions/notifications";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: Date;
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s

    // Also refresh when the user comes back to the tab
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const fetchNotifications = async () => {
    const [data, count] = await Promise.all([
      getNotifications(),
      getUnreadNotificationCount(),
    ]);
    const safe = Array.isArray(data) ? data : [];
    setNotifications(safe);
    setUnreadCount(count);
  };

  const handleRead = async (id: string, url: string | null) => {
    await markAsRead(id);
    fetchNotifications(); // Optimistic update would be better but this is fine
    setIsOpen(false);
    if (url) router.push(url);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 rounded-full border-2 border-background text-[10px] font-bold text-white leading-none px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-xl shadow-xl py-2 z-[100] animate-in fade-in zoom-in-95">
            <div className="px-5 py-3 border-b border-border flex justify-between items-center">
              <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} unread</span>
              )}
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleRead(n.id, n.actionUrl)}
                    className={`px-5 py-3.5 border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer transition-colors ${
                      !n.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="text-[13px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1.5">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!n.isRead && <div className="h-2 w-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
      )}
    </div>
  );
}
