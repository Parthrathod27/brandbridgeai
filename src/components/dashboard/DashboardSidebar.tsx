"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LogOut, X } from "lucide-react";
import {
  getRoleNavItems,
  getDashboardPath,
  ROLE_LABELS,
  type UserRole,
} from "@/lib/roles";

interface UserData {
  name: string;
  email: string;
  role?: UserRole;
  avatar?: string;
}

interface DashboardSidebarProps {
  user: UserData | null;
  sidebarOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function DashboardSidebar({
  user,
  sidebarOpen,
  onClose,
  onLogout,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const role = user?.role;
  const navItems = role ? getRoleNavItems(role) : [];

  function isActive(href: string) {
    if (href === getDashboardPath(role!)) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`bb-sidebar-mobile bg-surface fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] transition-transform lg:static lg:z-40 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between p-5">
        <Link
          href={role ? getDashboardPath(role) : "/dashboard"}
          className="bb-display flex items-center gap-2 text-lg font-semibold"
          onClick={onClose}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#4f8cff)" }}
          >
            <Sparkles size={16} className="text-ink" />
          </span>
          <span className="bb-grad-text">BrandBridge</span>
        </Link>
        <button onClick={onClose} className="text-ink-soft lg:hidden">
          <X size={20} />
        </button>
      </div>

      {role && (
        <div className="mx-3 mb-3 rounded-xl bg-purple-500/10 px-3 py-2 text-xs text-purple">
          {ROLE_LABELS[role]} Portal
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-purple-500/15 text-purple" : "text-ink-soft hover:bg-[var(--surface-strong)] hover:text-ink"}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        {user && (
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20 text-sm font-semibold text-purple">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user.name}</div>
              <div className="truncate text-xs text-ink-faint">{user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft transition hover:bg-[var(--surface-strong)] hover:text-ink"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
