"use client";

import Link from "next/link";
import { Handshake, Check, X } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

export interface PendingHireRequest {
  _id: string;
  hirerName: string;
  campaignTitle?: string;
  rate?: number;
  createdAt: string;
}

interface PendingHireRequestsSectionProps {
  requests: PendingHireRequest[];
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export default function PendingHireRequestsSection({
  requests,
  onAccept,
  onDecline,
}: PendingHireRequestsSectionProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Handshake size={18} className="text-purple" />
          <h2 className="bb-display text-lg font-medium">Pending Hire Requests</h2>
        </div>
        <Link
          href="/dashboard/freelancer/earnings"
          className="text-xs text-purple hover:text-purple"
        >
          Manage all
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No pending requests"
          description="When brands hire you, requests will appear here for you to accept."
        />
      ) : (
        <div className="mt-4 space-y-3">
          {requests.map((r) => (
            <div
              key={r._id}
              className="flex flex-col gap-3 rounded-xl bg-[var(--surface-strong)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">{r.hirerName}</p>
                {r.campaignTitle && (
                  <p className="text-xs text-ink-faint">{r.campaignTitle}</p>
                )}
                {r.rate != null && (
                  <p className="mt-0.5 text-xs text-purple">${r.rate}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onAccept?.(r._id)}
                  className="bb-btn-primary flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs"
                >
                  <Check size={12} />
                  Accept
                </button>
                <button
                  onClick={() => onDecline?.(r._id)}
                  className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs text-ink-soft hover:bg-[var(--surface-strong)]"
                >
                  <X size={12} />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
