"use client";

import Link from "next/link";
import { Star, Award, DollarSign, Tag } from "lucide-react";

export interface FreelancerMeta {
  rating: number;
  completedProjects: number;
  hourlyRate?: number;
  categories: string[];
  skills: string[];
}

interface SkillsRatingWidgetProps {
  meta: FreelancerMeta;
}

function StarDisplay({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} size={14} className="fill-yellow-400 text-yellow-400" />
      ))}
      {half && (
        <div className="relative">
          <Star size={14} className="text-white/15" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} size={14} className="text-white/15" />
      ))}
    </div>
  );
}

export default function SkillsRatingWidget({ meta }: SkillsRatingWidgetProps) {
  return (
    <div className="bb-glass bb-card-interactive rounded-2xl p-5 transition-all duration-200">
      <div className="flex items-center gap-2">
        <Award size={18} className="text-purple-300" />
        <h3 className="bb-display text-sm font-medium">Your Profile Stats</h3>
      </div>

      {/* Rating & Stats Row */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <StarDisplay rating={meta.rating} />
          <span className="text-sm font-medium text-white/80">
            {meta.rating > 0 ? meta.rating.toFixed(1) : "—"}
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-1.5 text-xs text-white/55">
          <Award size={12} className="text-purple-300" />
          {meta.completedProjects} completed
        </div>
        {meta.hourlyRate != null && meta.hourlyRate > 0 && (
          <>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs text-white/55">
              <DollarSign size={12} className="text-purple-300" />
              ${meta.hourlyRate}/hr
            </div>
          </>
        )}
      </div>

      {/* Categories */}
      {meta.categories.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/35">
            <Tag size={10} />
            Categories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {meta.categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-purple-500/15 px-2.5 py-1 text-[11px] font-medium text-purple-300"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {meta.skills.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/35">
            <Tag size={10} />
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {meta.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {meta.skills.length === 0 && meta.categories.length === 0 && (
        <div className="mt-4">
          <p className="text-xs text-white/40">
            Add skills and categories to your profile to attract more brands.
          </p>
          <Link
            href="/dashboard/freelancer/profile"
            className="bb-btn-primary mt-3 inline-block rounded-xl px-4 py-2 text-xs font-medium"
          >
            Update Profile
          </Link>
        </div>
      )}
    </div>
  );
}
