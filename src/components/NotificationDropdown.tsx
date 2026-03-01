"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { getNotifications, markAsRead } from "@/actions/notifications";
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
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const data = await getNotifications();
    const safe = Array.isArray(data) ? data : [];
    setNotifications(safe);
    setUnreadCount(safe.filter((n) => !n.isRead).length);
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
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-background animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg py-2 z-[100] animate-in fade-in zoom-in-95">
            <div className="px-4 py-2 border-b border-border flex justify-between items-center">
              <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
              <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleRead(n.id, n.actionUrl)}
                    className={`px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer transition-colors ${
                      !n.isRead ? "bg-secondary/10" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className={`text-sm ${!n.isRead ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
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
