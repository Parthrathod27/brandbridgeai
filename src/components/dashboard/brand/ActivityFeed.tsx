"use client";

import { Activity } from "lucide-react";
import { formatDistanceToNow } from "@/lib/format-time";

export interface ActivityItem {
  type: string;
  message: string;
  timestamp: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-purple-300" />
        <h2 className="bb-display text-lg font-medium">Recent Activity</h2>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center py-6 text-center">
          <Activity size={32} className="text-white/15" />
          <p className="mt-3 text-sm text-white/45">No recent activity yet</p>
          <p className="mt-1 text-xs text-white/30">
            Collaborations and hires will show up here
          </p>
        </div>
      ) : (
        <div className="relative mt-6 space-y-0">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10" />
          {items.map((item, i) => (
            <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
              <div
                className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-purple-500/50"
                style={{ background: "#0a0a12" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/70">{item.message}</p>
                <p className="mt-0.5 text-xs text-white/35">
                  {formatDistanceToNow(item.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
