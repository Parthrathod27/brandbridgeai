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
          ? "text-purple-400"
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
            <span className="ml-2 text-xs text-purple-300">{compatibilityScore}% match</span>
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
                className={`h-1.5 flex-1 rounded-full ${step <= stepIndex ? "bg-purple-500" : "bg-white/10"}`} 
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-white/40">
            <span>Sent</span>
            <span>Accepted</span>
            <span>Active</span>
            <span>Done</span>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-white/60">{message}</p>}
      
      {proposal && (
        <div className="mt-3 rounded-xl bg-white/3 p-3 flex-1">
          <p className={`text-xs text-white/50 ${!isExpanded && "line-clamp-3"}`}>
            {proposal}
          </p>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="mt-2 flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200"
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
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 py-2 text-xs text-white/70 hover:bg-white/5"
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
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/5 py-2 text-xs text-white hover:bg-white/10 transition-colors"
            >
              <MessageSquare size={14} />
              Open Chat
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 py-2 text-xs transition-colors"
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
