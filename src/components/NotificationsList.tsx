"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "@/actions/notifications";
import { EmptyState } from "@/components/EmptyState";
import { Bell, CheckCircle2 } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";
import Link from "next/link";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: Date;
};

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse"><LogoMark size={36} /></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="You're all caught up! Important updates will appear here."
        primaryCtaLabel="Go to Dashboard"
        primaryCtaHref="/dashboard"
      />
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((n) => (
        <Link
          key={n.id}
          href={n.actionUrl || "#"}
          onClick={(e) => {
            if (!n.actionUrl) e.preventDefault();
            if (!n.isRead) handleMarkAsRead(n.id, e);
          }}
          className={`block p-6 rounded-xl border transition-all ${
            n.isRead 
              ? "bg-card border-border hover:border-primary/30" 
              : "bg-primary/5 border-primary/20 hover:border-primary/50 shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-4">
              <div className={`mt-1 p-2 rounded-full ${
                n.type === 'success' ? 'bg-green-100 text-green-600' :
                n.type === 'alert' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                  {n.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            {!n.isRead && (
              <button
                onClick={(e) => handleMarkAsRead(n.id, e)}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 className="w-3 h-3" /> Mark as read
              </button>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
