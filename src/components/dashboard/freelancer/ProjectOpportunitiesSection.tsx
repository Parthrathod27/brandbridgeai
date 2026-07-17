"use client";

import Link from "next/link";
import { Briefcase, Send } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

export interface ProjectOpportunity {
  _id: string;
  title: string;
  description?: string;
  budget?: number;
  brandName: string;
  createdAt: string;
}

interface ProjectOpportunitiesSectionProps {
  projects: ProjectOpportunity[];
  onPropose?: (campaignId: string) => void;
}

export default function ProjectOpportunitiesSection({
  projects,
  onPropose,
}: ProjectOpportunitiesSectionProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-purple" />
          <h2 className="bb-display text-lg font-medium">Project Opportunities</h2>
        </div>
        <Link
          href="/dashboard/freelancer/projects"
          className="text-xs text-purple hover:text-purple"
        >
          View all
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open projects right now"
          description="Brands will post campaigns here when they need creative talent."
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
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bb-glass bb-card-interactive rounded-2xl p-4 transition-all duration-200"
            >
              <h3 className="truncate text-sm font-medium">{p.title}</h3>
              <p className="mt-0.5 text-xs text-purple">by {p.brandName}</p>
              {p.description && (
                <p className="mt-2 line-clamp-2 text-xs text-ink-faint">{p.description}</p>
              )}
              {p.budget != null && (
                <p className="mt-2 text-xs text-ink-faint">Budget: ${p.budget}</p>
              )}
              <button
                onClick={() => onPropose?.(p._id)}
                className="bb-btn-primary mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs"
              >
                <Send size={12} />
                Send Proposal
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
