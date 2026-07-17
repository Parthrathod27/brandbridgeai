"use client";

import { Star, Heart, UserPlus } from "lucide-react";

interface FreelancerCardProps {
  name: string;
  avatar?: string;
  skills?: string[];
  categories?: string[];
  hourlyRate?: number;
  rating?: number;
  portfolio?: { mediaUrl: string; title: string }[];
  saved?: boolean;
  onHire?: () => void;
  onSave?: () => void;
  onMessage?: () => void;
}

export default function FreelancerCard({
  name,
  avatar,
  skills = [],
  categories = [],
  hourlyRate,
  rating = 0,
  portfolio = [],
  saved,
  onHire,
  onSave,
  onMessage,
  onTagClick,
  onViewProfile,
}: FreelancerCardProps & { onTagClick?: (tag: string) => void; onViewProfile?: () => void }) {
  return (
    <div className="bb-glass bb-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-colors" onClick={onViewProfile}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20 text-lg font-semibold text-purple">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="bb-display truncate font-medium">{name}</h3>
            {onSave && (
              <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="text-ink-faint hover:text-purple">
                <Heart size={16} fill={saved ? "currentColor" : "none"} className={saved ? "text-purple" : ""} />
              </button>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            {rating > 0 ? (
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={12} fill="currentColor" />
                <span>{rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple font-medium tracking-wider uppercase">
                New Freelancer
              </span>
            )}
            {hourlyRate != null && (
              <span className="text-ink-faint before:content-['•'] before:mr-2 before:text-ink-faint">${hourlyRate}/hr</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {[...categories, ...skills].slice(0, 4).map((tag) => (
              <button 
                key={tag} 
                onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
                className="rounded-full bg-[var(--surface-strong)] px-2 py-0.5 text-[10px] text-ink-faint hover:bg-purple-500/20 hover:text-purple transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
      {portfolio.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {portfolio.slice(0, 3).map((p) => (
            <div key={p.title} className="aspect-video overflow-hidden rounded-lg bg-[var(--surface-strong)]">
              <img src={p.mediaUrl} alt={p.title} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        {onHire && (
          <button onClick={(e) => { e.stopPropagation(); onHire(); }} className="bb-btn-primary flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs">
            <UserPlus size={14} />
            Hire
          </button>
        )}
        {onMessage && (
          <button
            onClick={(e) => { e.stopPropagation(); onMessage(); }}
            className="flex-1 rounded-xl border border-[var(--border)] py-2 text-xs text-ink-soft hover:bg-[var(--surface-strong)]"
          >
            Message
          </button>
        )}
      </div>
    </div>
  );
}
