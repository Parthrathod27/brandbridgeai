"use client";

import { Sparkles } from "lucide-react";

export interface BrandRecommendation {
  brandId: string;
  companyName: string;
  logo?: string;
  industry?: string;
  compatibilityScore: number;
  reason: string;
  estimatedReach: string;
  campaignSuggestions: string[];
  matchedAt: string | Date;
  isSaved?: boolean;
  isRequested?: boolean;
}

interface BrandRecommendationCardProps {
  rec: BrandRecommendation;
  onViewDetails: () => void;
  onSendRequest: () => void;
  onToggleSave: () => void;
  onCampaignIdeaClick: (idea: string) => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <svg className="-rotate-90" width="48" height="48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4f8cff" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[10px] font-semibold text-purple">{score}%</span>
    </div>
  );
}

import { formatDistanceToNow } from "date-fns";

export default function BrandRecommendationCard({
  rec,
  onViewDetails,
  onSendRequest,
  onToggleSave,
  onCampaignIdeaClick,
}: BrandRecommendationCardProps) {
  let borderColorClass = "border-[var(--border)] border-l-[3px] border-l-gray-500/50";
  if (rec.compatibilityScore >= 80) borderColorClass = "border-[var(--border)] border-l-[3px] border-l-green-500";
  else if (rec.compatibilityScore >= 50) borderColorClass = "border-[var(--border)] border-l-[3px] border-l-yellow-500";

  const timeAgo = rec.matchedAt ? formatDistanceToNow(new Date(rec.matchedAt), { addSuffix: true }) : "recently";

  return (
    <div
      className={`bb-glass bb-card-interactive cursor-pointer rounded-2xl p-5 transition-all duration-200 group relative ${borderColorClass}`}
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onViewDetails()}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--surface-strong)] transition-colors z-10"
      >
        <svg className={`w-5 h-5 ${rec.isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-ink-faint'}`} stroke="currentColor" viewBox="0 0 24 24" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
        </svg>
      </button>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20">
          {rec.logo ? (
            <img src={rec.logo} alt={rec.companyName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-semibold text-purple">
              {rec.companyName.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 pr-8">
            <div>
              <h3 className="bb-display font-medium text-lg">{rec.companyName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {rec.industry && (
                  <span className="text-xs text-purple">{rec.industry}</span>
                )}
                <span className="text-[10px] text-ink-faint">•</span>
                <span className="text-[10px] text-ink-faint">Matched {timeAgo}</span>
              </div>
            </div>
            <ScoreRing score={rec.compatibilityScore} />
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-ink-soft leading-relaxed">{rec.reason}</p>
          
          {rec.campaignSuggestions && rec.campaignSuggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
              {rec.campaignSuggestions.slice(0, 2).map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => onCampaignIdeaClick(idea)}
                  className="rounded-full bg-[var(--surface-strong)] border border-[var(--border)] px-2.5 py-1 text-[10px] text-ink-soft hover:bg-[var(--surface-strong)] transition-colors line-clamp-1 text-left max-w-[200px]"
                >
                  {idea}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-1 text-xs text-ink-faint">
            <Sparkles size={12} className="text-purple" />
            Est. Reach: <span className="text-ink-soft">{rec.estimatedReach}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onViewDetails}
          className="flex-1 rounded-xl border border-[var(--border)] py-2 text-xs text-ink-soft transition hover:bg-[var(--surface-strong)]"
        >
          View Brand Details
        </button>
        <button
          onClick={rec.isRequested ? undefined : onSendRequest}
          disabled={rec.isRequested}
          className={`flex-1 rounded-xl py-2 text-xs font-medium transition-colors ${
            rec.isRequested 
              ? "bg-green-500/20 text-green-300 border border-green-500/30 cursor-default" 
              : "bb-btn-primary"
          }`}
        >
          {rec.isRequested ? "Request Sent ✓" : "Collaborate"}
        </button>
      </div>
    </div>
  );
}
