"use client";

import Link from "next/link";
import { Star, Users } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

export interface RecommendedFreelancer {
  userId: string;
  name: string;
  avatar?: string;
  skill: string;
  rating: number;
  hourlyRate: number;
  portfolioThumb?: string;
}

interface RecommendedFreelancersSectionProps {
  freelancers: RecommendedFreelancer[];
}

export default function RecommendedFreelancersSection({
  freelancers,
}: RecommendedFreelancersSectionProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Users size={18} className="text-purple" />
        <h2 className="bb-display text-lg font-medium">Recommended Freelancers</h2>
      </div>

      {freelancers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No freelancers yet"
          description="Browse the marketplace to find creative talent for your campaigns."
          action={
            <Link
              href="/dashboard/brand/marketplace"
              className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
            >
              Browse Marketplace
            </Link>
          }
        />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freelancers.map((f) => (
            <div
              key={f.userId}
              className="bb-glass bb-card-interactive rounded-2xl p-4 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20 text-sm font-semibold text-purple">
                  {f.avatar ? (
                    <img src={f.avatar} alt={f.name} className="h-full w-full object-cover" />
                  ) : (
                    f.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium">{f.name}</h3>
                  <span className="text-xs text-purple">{f.skill}</span>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <Star size={12} className="text-yellow-400" fill="currentColor" />
                    <span>{f.rating.toFixed(1)}</span>
                    <span className="text-ink-faint">from ${f.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
              {f.portfolioThumb && (
                <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-[var(--surface-strong)]">
                  <img
                    src={f.portfolioThumb}
                    alt="Portfolio"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/dashboard/brand/marketplace?freelancer=${f.userId}`}
                  className="flex-1 rounded-xl border border-[var(--border)] py-2 text-center text-xs text-ink-soft hover:bg-[var(--surface-strong)]"
                >
                  View Profile
                </Link>
                <Link
                  href={`/dashboard/brand/marketplace?hire=${f.userId}`}
                  className="bb-btn-primary flex-1 rounded-xl py-2 text-center text-xs font-medium"
                >
                  Hire
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
