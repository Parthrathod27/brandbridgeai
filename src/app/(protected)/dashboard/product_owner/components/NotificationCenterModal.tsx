"use client";

import { X, Check, Bell, Inbox, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

interface NotificationCenterModalProps {
  onClose: () => void;
}

export default function NotificationCenterModal({ onClose }: NotificationCenterModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  function load() {
    setLoading(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkRead(id: string) {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      load();
    }
  }

  async function handleMarkAllRead() {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    if (res.ok) {
      load();
    }
  }

  const displayed = filter === "all" ? notifications : notifications.filter((n) => !n.read);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bb-glass w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-purple" />
            <h3 className="bb-display text-base font-semibold text-ink">Centralized Notification Center</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-ink-soft hover:text-ink cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-[var(--border)] bg-white/2 px-6 py-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1 cursor-pointer transition ${
                filter === "all" ? "bg-purple-500/20 text-purple" : "text-ink-soft hover:text-ink"
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-3 py-1 cursor-pointer transition ${
                filter === "unread" ? "bg-purple-500/20 text-purple" : "text-ink-soft hover:text-ink"
              }`}
            >
              Unread Only
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-purple hover:text-purple font-semibold cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <p className="text-sm text-ink-faint">Loading notifications...</p>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <Inbox size={32} className="text-ink-faint" />
              <p className="text-sm text-ink-faint">No notifications found.</p>
            </div>
          ) : (
            displayed.map((n) => (
              <div
                key={n._id}
                className={`flex gap-3 rounded-xl p-4 border transition ${
                  n.read ? "bg-white/2 border-[var(--border)] opacity-60" : "bg-purple-500/5 border-purple-500/10"
                }`}
              >
                <div className="mt-0.5 text-purple shrink-0">
                  {n.type === "alert" ? <AlertCircle size={16} /> : <Info size={16} />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-ink">{n.title}</h4>
                    <span className="text-[10px] text-ink-faint">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft">{n.message}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="self-center flex h-6 w-6 items-center justify-center rounded bg-purple-500/10 text-purple hover:bg-purple-500/20 cursor-pointer"
                    title="Mark Read"
                  >
                    <Check size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
