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
}

interface BrandRecommendationCardProps {
  rec: BrandRecommendation;
  onViewDetails: () => void;
  onSendRequest: () => void;
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
      <span className="absolute text-[10px] font-semibold text-purple-200">{score}%</span>
    </div>
  );
}

export default function BrandRecommendationCard({
  rec,
  onViewDetails,
  onSendRequest,
}: BrandRecommendationCardProps) {
  return (
    <div
      className="bb-glass bb-card-interactive cursor-pointer rounded-2xl p-5 transition-all duration-200"
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onViewDetails()}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20">
          {rec.logo ? (
            <img src={rec.logo} alt={rec.companyName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-semibold text-purple-200">
              {rec.companyName.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="bb-display font-medium">{rec.companyName}</h3>
              {rec.industry && (
                <p className="text-xs text-purple-300">{rec.industry}</p>
              )}
            </div>
            <ScoreRing score={rec.compatibilityScore} />
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-white/50">{rec.reason}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
            <Sparkles size={12} className="text-purple-300" />
            Est. Reach: {rec.estimatedReach}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onViewDetails}
          className="flex-1 rounded-xl border border-white/10 py-2 text-xs text-white/70 transition hover:bg-white/5"
        >
          View Brand Details
        </button>
        <button
          onClick={onSendRequest}
          className="bb-btn-primary flex-1 rounded-xl py-2 text-xs font-medium"
        >
          Send Collaboration Request
        </button>
      </div>
    </div>
  );
}
