"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

export interface RecentProposal {
  _id: string;
  campaignTitle: string;
  status: string;
  rate?: number;
  createdAt: string;
}

interface RecentProposalsSectionProps {
  proposals: RecentProposal[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400",
  accepted: "text-green-400",
  rejected: "text-red-400",
  withdrawn: "text-white/40",
};

export default function RecentProposalsSection({ proposals }: RecentProposalsSectionProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-purple-300" />
          <h2 className="bb-display text-lg font-medium">Recent Proposals</h2>
        </div>
        <Link
          href="/dashboard/freelancer/proposals"
          className="text-xs text-purple-300 hover:text-purple-200"
        >
          View all
        </Link>
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No proposals sent yet"
          description="Browse open projects and submit proposals to get hired."
          action={
            <Link
              href="/dashboard/freelancer/projects"
              className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
            >
              Find Projects
            </Link>
          }
        />
      ) : (
        <div className="mt-4 space-y-3">
          {proposals.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between rounded-xl bg-white/3 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{p.campaignTitle}</p>
                {p.rate != null && (
                  <p className="text-xs text-white/40">${p.rate}</p>
                )}
              </div>
              <span className={`text-xs capitalize ${STATUS_COLORS[p.status] ?? "text-white/50"}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
