"use client";

import { useState } from "react";
import { Check, X, MessageSquare, Info, ChevronDown, ChevronUp } from "lucide-react";

interface CollaborationCardProps {
  partnerName: string;
  status: string;
  message?: string;
  proposal?: string;
  compatibilityScore?: number;
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onOpenChat?: () => void;
  onViewDetails?: () => void;
}

export default function CollaborationCard({
  partnerName,
  status,
  message,
  proposal,
  compatibilityScore,
  isIncoming,
  onAccept,
  onDecline,
  onOpenChat,
  onViewDetails,
}: CollaborationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColor =
    status === "accepted"
      ? "text-green-400"
      : status === "declined"
        ? "text-red-400"
        : status === "completed"
          ? "text-purple"
          : "text-yellow-400";

  const getStepIndex = () => {
    if (status === "pending") return 1;
    if (status === "accepted") return 2;
    if (status === "in_progress") return 3;
    if (status === "completed") return 4;
    return 0; // declined
  };
  const stepIndex = getStepIndex();

  return (
    <div className="bb-glass rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="bb-display font-medium">{partnerName}</h3>
          <span className={`mt-1 inline-block text-xs capitalize ${statusColor}`}>{status}</span>
          {compatibilityScore != null && (
            <span className="ml-2 text-xs text-purple">{compatibilityScore}% match</span>
          )}
        </div>
      </div>
      
      {/* Status Progress Stepper */}
      {status !== "declined" && (
        <div className="mt-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`h-1.5 flex-1 rounded-full ${step <= stepIndex ? "bg-purple-500" : "bg-[var(--surface-strong)]"}`} 
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-ink-faint">
            <span>Sent</span>
            <span>Accepted</span>
            <span>Active</span>
            <span>Done</span>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-ink-soft">{message}</p>}
      
      {proposal && (
        <div className="mt-3 rounded-xl bg-[var(--surface-strong)] p-3 flex-1">
          <p className={`text-xs text-ink-faint ${!isExpanded && "line-clamp-3"}`}>
            {proposal}
          </p>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="mt-2 flex items-center gap-1 text-[11px] text-purple hover:text-purple"
          >
            {isExpanded ? (
              <><ChevronUp size={12} /> Show less</>
            ) : (
              <><ChevronDown size={12} /> Read more</>
            )}
          </button>
        </div>
      )}

      {status === "pending" && isIncoming && onAccept && onDecline && (
        <div className="mt-5 flex gap-2">
          <button
            onClick={onAccept}
            className="bb-btn-primary flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs"
          >
            <Check size={14} />
            Accept
          </button>
          <button
            onClick={onDecline}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[var(--border)] py-2 text-xs text-ink-soft hover:bg-[var(--surface-strong)]"
          >
            <X size={14} />
            Decline
          </button>
        </div>
      )}

      {status === "accepted" && (
        <div className="mt-5 flex gap-2">
          {onOpenChat && (
             <button
              onClick={onOpenChat}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--surface-strong)] py-2 text-xs text-ink hover:bg-[var(--surface-strong)] transition-colors"
            >
              <MessageSquare size={14} />
              Open Chat
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-purple-500/10 text-purple hover:bg-purple-500/20 py-2 text-xs transition-colors"
            >
              <Info size={14} />
              Details
            </button>
          )}
        </div>
      )}
    </div>
  );
}
