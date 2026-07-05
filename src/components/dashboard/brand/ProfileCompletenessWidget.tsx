"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";

interface ProfileCompletenessWidgetProps {
  percent: number;
  missing: string[];
  profileHref?: string;
}

export default function ProfileCompletenessWidget({
  percent,
  missing,
  profileHref = "/dashboard/brand/profile",
}: ProfileCompletenessWidgetProps) {
  return (
    <div className="bb-glass bb-card-interactive rounded-2xl p-5 transition-all duration-200">
      <div className="flex items-center gap-2">
        <UserCircle size={18} className="text-purple-300" />
        <h3 className="bb-display text-sm font-medium">Profile Completeness</h3>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/55">Profile {percent}% complete</span>
          <span className="text-purple-300">{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(135deg,#8b5cf6,#4f8cff)",
            }}
          />
        </div>
      </div>
      {missing.length > 0 && percent < 100 && (
        <ul className="mt-3 space-y-1">
          {missing.slice(0, 3).map((item) => (
            <li key={item} className="text-xs text-white/40">
              • {item}
            </li>
          ))}
        </ul>
      )}
      {percent < 100 && (
        <Link
          href={profileHref}
          className="bb-btn-primary mt-4 inline-block rounded-xl px-4 py-2 text-xs font-medium"
        >
          Complete Profile
        </Link>
      )}
    </div>
  );
}
