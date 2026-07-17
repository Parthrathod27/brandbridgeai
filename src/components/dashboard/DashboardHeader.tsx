"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Menu, Search, Sun, Moon } from "lucide-react";
import type { UserRole } from "@/lib/roles";
import { useTheme } from "@/components/ThemeProvider";

interface Notification {
  _id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
}

interface DashboardHeaderProps {
  role?: UserRole;
  onMenuOpen: () => void;
  onSearchOpen?: () => void;
}

export default function DashboardHeader({ role, onMenuOpen, onSearchOpen }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      })
      .catch(() => { });
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnreadCount(0);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  return (
    <header className="bb-glass relative flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
      <button onClick={onMenuOpen} className="text-ink-soft lg:hidden">
        <Menu size={22} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5 relative">
        <button
          onClick={onSearchOpen}
          className="rounded-xl p-2 text-ink-soft hover:bg-[var(--surface-strong)] hover:text-ink cursor-pointer"
          title="Search (Ctrl+K)"
        >
          <Search size={18} />
        </button>
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-ink-soft hover:bg-[var(--surface-strong)] hover:text-ink cursor-pointer"
          title="Toggle Theme"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="relative rounded-xl p-2 text-ink-soft hover:bg-[var(--surface-strong)] hover:text-ink"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] text-ink">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-purple hover:text-purple">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="py-4 text-center text-xs text-ink-faint">No notifications</p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    className={`rounded-xl p-3 text-xs ${n.read ? "bg-[var(--surface-strong)]" : "bg-purple-500/10"}`}
                  >
                    {n.link ? (
                      <Link href={n.link} onClick={() => setOpen(false)} className="block">
                        <div className="font-medium">{n.title}</div>
                        <div className="mt-1 text-ink-faint">{n.message}</div>
                      </Link>
                    ) : (
                      <>
                        <div className="font-medium">{n.title}</div>
                        <div className="mt-1 text-ink-faint">{n.message}</div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
