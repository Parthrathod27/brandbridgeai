"use client";

import { Check, X, Eye } from "lucide-react";

export interface PendingProposal {
  _id: string;
  type: string;
  status: string;
  isIncoming: boolean;
  partnerName: string;
  partnerAvatar?: string;
  compatibilityScore?: number;
  proposal?: string;
}

interface PendingProposalRowProps {
  item: PendingProposal;
  onAccept?: () => void;
  onDecline?: () => void;
  onView?: () => void;
}

export default function PendingProposalRow({
  item,
  onAccept,
  onDecline,
  onView,
}: PendingProposalRowProps) {
  return (
    <div className="bb-glass bb-card-interactive flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20 text-sm font-semibold text-purple-200">
          {item.partnerAvatar ? (
            <img src={item.partnerAvatar} alt={item.partnerName} className="h-full w-full object-cover" />
          ) : (
            item.partnerName.charAt(0)
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{item.partnerName}</div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/45">{item.type}</span>
            <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-yellow-400">
              {item.status}
            </span>
            {item.compatibilityScore != null && (
              <span className="text-purple-300">{item.compatibilityScore}% match</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {onView && (
          <button
            onClick={onView}
            className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
          >
            <Eye size={12} />
            View
          </button>
        )}
        {item.isIncoming && onAccept && onDecline && (
          <>
            <button
              onClick={onAccept}
              className="flex items-center gap-1 rounded-xl bg-green-500/15 px-3 py-1.5 text-xs text-green-400 hover:bg-green-500/25"
            >
              <Check size={12} />
              Accept
            </button>
            <button
              onClick={onDecline}
              className="flex items-center gap-1 rounded-xl bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
            >
              <X size={12} />
              Decline
            </button>
          </>
        )}
      </div>
    </div>
  );
}
