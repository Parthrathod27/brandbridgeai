"use client";

import { X, ShieldCheck, Loader2 } from "lucide-react";

export interface BrandDetail {
  userId: string;
  name: string;
  companyName?: string;
  logo?: string;
  bio?: string;
  industry?: string;
  location?: string;
  website?: string;
  targetAudience?: string;
  verified?: boolean;
  audienceSize?: string;
  pastCollaborations?: number;
}

export interface CompatibilityDetail {
  score: number;
  reason: string;
  estimatedReach: string;
  breakdown: {
    audienceOverlap: number;
    categoryRelevance: number;
    engagementScore: number;
  };
}

interface BrandDetailModalProps {
  open: boolean;
  loading: boolean;
  brand: BrandDetail | null;
  compatibility: CompatibilityDetail | null;
  onClose: () => void;
  onSendRequest: () => void;
}

export default function BrandDetailModal({
  open,
  loading,
  brand,
  compatibility,
  onClose,
  onSendRequest,
}: BrandDetailModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="bb-glass-strong relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="bb-display text-lg font-semibold">Brand Details</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="animate-spin text-purple-400" size={28} />
              <p className="mt-3 text-sm text-white/50">Loading brand profile...</p>
            </div>
          ) : brand ? (
            <>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-purple-500/20 text-2xl font-semibold text-purple-200">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.companyName} className="h-full w-full object-cover" />
                  ) : (
                    (brand.companyName || brand.name).charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="bb-display text-xl font-semibold">
                    {brand.companyName || brand.name}
                  </h3>
                  {brand.industry && (
                    <p className="text-sm text-purple-300">{brand.industry}</p>
                  )}
                  {brand.verified && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-green-400">
                      <ShieldCheck size={14} />
                      Verified Business
                    </span>
                  )}
                </div>
              </div>

              {brand.bio && (
                <p className="mt-4 text-sm text-white/60">{brand.bio}</p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                {brand.audienceSize && (
                  <div className="rounded-xl bg-white/3 px-3 py-2">
                    <div className="text-[10px] uppercase text-white/35">Audience</div>
                    <div className="text-sm">{brand.audienceSize}</div>
                  </div>
                )}
                {brand.location && (
                  <div className="rounded-xl bg-white/3 px-3 py-2">
                    <div className="text-[10px] uppercase text-white/35">Location</div>
                    <div className="text-sm">{brand.location}</div>
                  </div>
                )}
              </div>

              {compatibility && (
                <div className="mt-5 rounded-2xl bg-purple-500/8 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Compatibility Score</span>
                    <span className="bb-grad-text text-2xl font-semibold">
                      {compatibility.score}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/50">{compatibility.reason}</p>
                  <div className="mt-4 space-y-2">
                    {[
                      { label: "Audience Overlap", val: compatibility.breakdown.audienceOverlap },
                      { label: "Category Relevance", val: compatibility.breakdown.categoryRelevance },
                      { label: "Engagement Score", val: compatibility.breakdown.engagementScore },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-white/45">
                          <span>{label}</span>
                          <span>{val}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${val}%`,
                              background: "linear-gradient(135deg,#8b5cf6,#4f8cff)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs text-white/40">
                {brand.pastCollaborations ?? 0} past collaborations on BrandBridge
              </p>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-white/50">Brand not found</p>
          )}
        </div>

        {brand && !loading && (
          <div className="flex gap-3 border-t border-white/10 px-6 py-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-white/70 hover:bg-white/5"
            >
              Close
            </button>
            <button
              onClick={onSendRequest}
              className="bb-btn-primary flex-1 rounded-xl py-2.5 text-sm font-medium"
            >
              Send Collaboration Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
