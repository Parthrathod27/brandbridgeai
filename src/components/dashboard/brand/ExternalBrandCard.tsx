"use client";

import { Sparkles, Globe } from "lucide-react";
import type { ExternalBrandRecommendation } from "@/lib/ai/matching";

interface ExternalBrandCardProps {
  rec: ExternalBrandRecommendation;
  onGenerateOutreach: () => void;
}

export default function ExternalBrandCard({
  rec,
  onGenerateOutreach,
}: ExternalBrandCardProps) {
  return (
    <div className="bb-glass bb-card-interactive flex flex-col rounded-2xl p-5 transition-all duration-200 border-2 border-dashed border-[var(--border)] hover:border-purple-500/30">
      <div className="flex items-start gap-4 flex-1">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/10">
          <Globe size={24} className="text-purple" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="bb-display font-medium text-purple-100">{rec.companyName}</h3>
              {rec.industry && (
                <p className="text-xs text-purple/70">{rec.industry}</p>
              )}
            </div>
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple ring-1 ring-inset ring-purple-500/20 text-center whitespace-nowrap leading-tight">
              Not on BrandBridge
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-soft leading-relaxed">{rec.reason}</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-ink-faint">
            <Sparkles size={12} className="text-purple/50" />
            Est. Reach: {rec.estimatedReach}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-col gap-2">
        <p className="text-[10px] text-center italic text-ink-faint mb-1">
          {rec.source === "curated"
            ? "Curated match — verify before reaching out. Retry later for AI-generated leads."
            : "AI-generated — please verify before reaching out."}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGenerateOutreach();
          }}
          className="w-full rounded-xl border border-purple-500/30 bg-purple-500/10 py-2.5 text-xs font-medium text-purple transition hover:bg-purple-500/20 hover:text-ink flex items-center justify-center gap-2"
        >
          <Sparkles size={14} />
          Generate Outreach Email
        </button>
      </div>
    </div>
  );
}
