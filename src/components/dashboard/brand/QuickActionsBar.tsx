"use client";

import Link from "next/link";
import { Sparkles, Megaphone, UserPlus, MessageSquare } from "lucide-react";

const actions = [
  {
    href: "/dashboard/brand/matches",
    icon: Sparkles,
    label: "Find Brand Match",
  },
  {
    href: "/dashboard/brand/campaigns",
    icon: Megaphone,
    label: "Post Campaign",
  },
  {
    href: "/dashboard/brand/marketplace",
    icon: UserPlus,
    label: "Hire Freelancer",
  },
  {
    href: "/dashboard/brand/messages",
    icon: MessageSquare,
    label: "View Messages",
  },
];

export default function QuickActionsBar() {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className="bb-glass bb-card-interactive flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(139,92,246,0.18)" }}
          >
            <Icon size={16} className="text-purple" />
          </div>
          <span className="text-xs font-medium text-ink sm:text-sm">{label}</span>
        </Link>
      ))}
    </div>
  );
}
