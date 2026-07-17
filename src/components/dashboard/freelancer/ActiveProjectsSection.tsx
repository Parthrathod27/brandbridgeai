"use client";

import Link from "next/link";
import { Rocket } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

export interface ActiveProject {
  _id: string;
  clientName: string;
  campaignTitle?: string;
  rate?: number;
}

interface ActiveProjectsSectionProps {
  projects: ActiveProject[];
}

export default function ActiveProjectsSection({ projects }: ActiveProjectsSectionProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Rocket size={18} className="text-purple" />
          <h2 className="bb-display text-lg font-medium">Active Projects</h2>
        </div>
        <Link
          href="/dashboard/freelancer/earnings"
          className="text-xs text-purple hover:text-purple"
        >
          View all
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No active projects"
          description="Once a brand hires you and you accept, active projects will appear here."
          action={
            <Link
              href="/dashboard/freelancer/projects"
              className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
            >
              Browse Projects
            </Link>
          }
        />
      ) : (
        <div className="mt-4 space-y-3">
          {projects.map((p) => (
            <div
              key={p._id}
              className="flex flex-col gap-2 rounded-xl bg-[var(--surface-strong)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">{p.clientName}</p>
                {p.campaignTitle && (
                  <p className="text-xs text-ink-faint">{p.campaignTitle}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {p.rate != null && (
                  <span className="text-xs font-medium text-purple">
                    ${p.rate}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-[10px] font-medium text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  In Progress
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
