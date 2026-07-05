"use client";

import Link from "next/link";
import { FolderPlus, Image } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

export interface PortfolioHighlight {
  _id: string;
  title: string;
  mediaUrl: string;
  category?: string;
}

interface PortfolioHighlightsSectionProps {
  items: PortfolioHighlight[];
}

export default function PortfolioHighlightsSection({ items }: PortfolioHighlightsSectionProps) {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderPlus size={18} className="text-purple-300" />
          <h2 className="bb-display text-lg font-medium">Portfolio Highlights</h2>
        </div>
        <Link
          href="/dashboard/freelancer/portfolio"
          className="text-xs text-purple-300 hover:text-purple-200"
        >
          Manage portfolio
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Image}
          title="Showcase your work"
          description="Upload portfolio samples to attract more brand collaborations."
          action={
            <Link
              href="/dashboard/freelancer/portfolio"
              className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
            >
              Add Work
            </Link>
          }
        />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item._id}
              href="/dashboard/freelancer/portfolio"
              className="bb-card-interactive group overflow-hidden rounded-xl border border-white/10"
            >
              <div className="aspect-square overflow-hidden bg-white/5">
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium">{item.title}</p>
                {item.category && (
                  <p className="truncate text-[10px] text-purple-300">{item.category}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
