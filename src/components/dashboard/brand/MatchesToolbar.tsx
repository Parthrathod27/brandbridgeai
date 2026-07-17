"use client";

import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

export interface FilterState {
  search: string;
  sort: string;
  industry: string;
  location: string;
  availability: string;
  collabType: string;
  savedOnly: boolean;
}

interface MatchesToolbarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  industries: string[];
}

export default function MatchesToolbar({ filters, onFilterChange, industries }: MatchesToolbarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const update = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      sort: "score",
      industry: "",
      location: "",
      availability: "",
      collabType: "",
      savedOnly: false,
    });
    setIsMobileOpen(false);
  };

  const hasActiveFilters = 
    filters.industry || filters.location || filters.availability || filters.collabType || filters.savedOnly;

  return (
    <div className="mb-6 flex flex-col gap-4">
      {/* Top Row: Search & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" size={18} />
          <input
            type="text"
            placeholder="Search brands..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-surface-strong py-2.5 pl-10 pr-4 text-sm text-ink placeholder-white/40 focus:border-purple focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
          />
        </div>
        
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={`flex items-center gap-2 rounded-xl border py-2.5 px-4 text-sm transition-colors md:hidden ${
            hasActiveFilters || isMobileOpen
              ? "border-purple bg-purple/10 text-purple"
              : "border-[var(--border)] bg-surface-strong text-ink-soft hover:bg-[var(--surface-strong)]"
          }`}
        >
          <Filter size={16} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple text-[10px] text-ink">
              !
            </span>
          )}
        </button>
      </div>

      {/* Filters (Desktop + Mobile Sheet) */}
      <div className={`gap-3 flex-wrap md:flex ${isMobileOpen ? "flex flex-col" : "hidden"}`}>
        <select
          value={filters.sort}
          onChange={(e) => update("sort", e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-surface-strong py-2 px-3 text-sm text-ink focus:border-purple focus:outline-none"
        >
          <option value="score">Sort by: Compatibility Score</option>
          <option value="newest">Sort by: Newest Match</option>
          <option value="az">Sort by: Alphabetical (A-Z)</option>
        </select>

        <select
          value={filters.industry}
          onChange={(e) => update("industry", e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-surface-strong py-2 px-3 text-sm text-ink focus:border-purple focus:outline-none"
        >
          <option value="">All Industries</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Location..."
          value={filters.location}
          onChange={(e) => update("location", e.target.value)}
          className="w-32 rounded-xl border border-[var(--border)] bg-surface-strong py-2 px-3 text-sm text-ink placeholder-white/40 focus:border-purple focus:outline-none flex-1 md:flex-none"
        />

        <select
          value={filters.availability}
          onChange={(e) => update("availability", e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-surface-strong py-2 px-3 text-sm text-ink focus:border-purple focus:outline-none"
        >
          <option value="">Any Availability</option>
          <option value="Actively looking">Actively looking</option>
          <option value="Open to offers">Open to offers</option>
          <option value="Not currently available">Not currently available</option>
        </select>

        <select
          value={filters.collabType}
          onChange={(e) => update("collabType", e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-surface-strong py-2 px-3 text-sm text-ink focus:border-purple focus:outline-none"
        >
          <option value="">Any Collab Type</option>
          <option value="Barter">Barter</option>
          <option value="Paid Partnership">Paid Partnership</option>
          <option value="Revenue Share">Revenue Share</option>
          <option value="Sponsorship">Sponsorship</option>
          <option value="Open to Discuss">Open to Discuss</option>
        </select>

        <button
          onClick={() => update("savedOnly", !filters.savedOnly)}
          className={`flex items-center gap-2 rounded-xl border py-2 px-4 text-sm transition-colors ${
            filters.savedOnly
              ? "border-purple bg-purple/10 text-purple"
              : "border-[var(--border)] bg-surface-strong text-ink-soft hover:bg-[var(--surface-strong)]"
          }`}
        >
          <svg className="w-4 h-4" fill={filters.savedOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
          </svg>
          Saved
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
