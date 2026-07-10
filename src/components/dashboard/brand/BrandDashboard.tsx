"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles, Handshake, Megaphone, Store, Globe } from "lucide-react";
import { ROLE_LABELS } from "@/lib/roles";
import StatCard, { type StatCardConfig } from "@/components/dashboard/StatCard";
import QuickActionsBar from "@/components/dashboard/brand/QuickActionsBar";
import ProfileCompletenessWidget from "@/components/dashboard/brand/ProfileCompletenessWidget";
import EscrowOverviewCard from "@/components/dashboard/brand/EscrowOverviewCard";
import ActivityFeed, { type ActivityItem } from "@/components/dashboard/brand/ActivityFeed";
import BrandRecommendationCard, {
  type BrandRecommendation,
} from "@/components/dashboard/brand/BrandRecommendationCard";
import BrandDetailModal, {
  type BrandDetail,
  type CompatibilityDetail,
} from "@/components/dashboard/brand/BrandDetailModal";
import ProposalPreviewModal from "@/components/dashboard/brand/ProposalPreviewModal";
import PendingProposalRow, {
  type PendingProposal,
} from "@/components/dashboard/brand/PendingProposalRow";
import RecommendedFreelancersSection, {
  type RecommendedFreelancer,
} from "@/components/dashboard/brand/RecommendedFreelancersSection";
import {
  StatCardSkeleton,
  CardSkeleton,
  RecommendationSkeleton,
} from "@/components/dashboard/Skeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import ExternalBrandCard from "@/components/dashboard/brand/ExternalBrandCard";
import OutreachEmailModal from "@/components/dashboard/brand/OutreachEmailModal";
import type { ExternalBrandRecommendation } from "@/lib/ai/matching";
import MatchesToolbar, { type FilterState } from "@/components/dashboard/brand/MatchesToolbar";

interface UserData {
  name: string;
}

const STAT_META: Omit<StatCardConfig, "value">[] = [
  {
    label: "Brand Matches",
    icon: Sparkles,
    href: "/dashboard/brand/matches",
    emptyMessage: "Discover compatible brand partners with AI",
    emptyCta: "Explore AI Matches",
  },
  {
    label: "Active Collaborations",
    icon: Handshake,
    href: "/dashboard/brand/collaborations",
    emptyMessage: "No active collaborations yet",
    emptyCta: "Explore AI Matches",
  },
  {
    label: "Campaigns",
    icon: Megaphone,
    href: "/dashboard/brand/campaigns",
    emptyMessage: "You haven't launched a campaign",
    emptyCta: "Create Campaign",
  },
  {
    label: "Freelancers Hired",
    icon: Store,
    href: "/dashboard/brand/hires",
    emptyMessage: "No freelancers hired yet",
    emptyCta: "Hire Freelancer",
  },
];

interface BrandDashboardProps {
  standaloneMatches?: boolean;
}

export default function BrandDashboard({ standaloneMatches = false }: BrandDashboardProps = {}) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ label: string; value: number }[]>([]);
  
  // Tab & Filters State
  const [activeTab, setActiveTab] = useState<"registered" | "external">("registered");
  const [filters, setFilters] = useState<FilterState>({
    search: "", sort: "score", industry: "", location: "", availability: "", collabType: "", savedOnly: false
  });
  
  // Matches State
  const [recommendations, setRecommendations] = useState<BrandRecommendation[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesPage, setMatchesPage] = useState(1);
  const [matchesHasMore, setMatchesHasMore] = useState(false);
  const [matchesTotal, setMatchesTotal] = useState(0);
  const [externalRecommendations, setExternalRecommendations] = useState<ExternalBrandRecommendation[]>([]);
  const [externalLoading, setExternalLoading] = useState(true);
  const [externalSource, setExternalSource] = useState<"ai" | "curated" | "none">("none");
  const [externalQuotaBlocked, setExternalQuotaBlocked] = useState(false);
  const externalFetchStarted = useRef(false);
  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>([]);
  const [freelancers, setFreelancers] = useState<RecommendedFreelancer[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [profileCompleteness, setProfileCompleteness] = useState({ percent: 0, missing: [] as string[] });
  const [escrow, setEscrow] = useState({ inEscrow: 0, released: 0, pending: 0 });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandDetail | null>(null);
  const [selectedCompat, setSelectedCompat] = useState<CompatibilityDetail | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalText, setProposalText] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [proposalPartnerName, setProposalPartnerName] = useState("");

  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachTargetName, setOutreachTargetName] = useState("");
  const [outreachEmailDraft, setOutreachEmailDraft] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, dashRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/dashboard/brand", { credentials: "include" }),
      ]);
      const userData = await userRes.json();
      const dashData = await dashRes.json();
      setUser(userData.user);
      if (dashData.stats) setStats(dashData.stats);
      if (dashData.recommendations) setRecommendations(dashData.recommendations);
      if (dashData.pendingProposals) setPendingProposals(dashData.pendingProposals);
      if (dashData.recommendedFreelancers) setFreelancers(dashData.recommendedFreelancers);
      if (dashData.activity) setActivity(dashData.activity);
      if (dashData.profileCompleteness) setProfileCompleteness(dashData.profileCompleteness);
      if (dashData.escrow) setEscrow(dashData.escrow);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExternalBrands = useCallback(async (refresh = false) => {
    setExternalLoading(true);
    try {
      const url = refresh
        ? "/api/ai/external-brands?refresh=true"
        : "/api/ai/external-brands";
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.recommendations) setExternalRecommendations(data.recommendations);
      if (data.source) setExternalSource(data.source);
      setExternalQuotaBlocked(Boolean(data.quotaBlocked));
    } catch (err) {
      console.error(err);
    } finally {
      setExternalLoading(false);
    }
  }, []);

  const loadRegisteredMatches = useCallback(async (pageToLoad = 1, append = false) => {
    setMatchesLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.industry) params.append("industry", filters.industry);
      if (filters.location) params.append("location", filters.location);
      if (filters.availability) params.append("availability", filters.availability);
      if (filters.collabType) params.append("type", filters.collabType);
      params.append("page", pageToLoad.toString());

      const res = await fetch(`/api/brands/matches?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      
      let newMatches = data.matches || [];
      if (filters.savedOnly) {
        newMatches = newMatches.filter((m: any) => m.isSaved);
      }

      setRecommendations(prev => append ? [...prev, ...newMatches] : newMatches);
      setMatchesPage(data.page || 1);
      setMatchesHasMore((data.page || 1) < (data.pages || 1));
      setMatchesTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setMatchesLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRegisteredMatches(1, false);
    }, 400); // debounce search/filters
    return () => clearTimeout(timer);
  }, [loadRegisteredMatches]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (externalFetchStarted.current) return;
    externalFetchStarted.current = true;
    loadExternalBrands();
  }, [loadExternalBrands]);

  async function openBrandDetail(brandId: string) {
    setSelectedPartnerId(brandId);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/brands/${brandId}`, { credentials: "include" });
      const data = await res.json();
      setSelectedBrand(data.brand ?? null);
      setSelectedCompat(data.compatibility ?? null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function startCollaboration(partnerId: string, partnerName: string) {
    setSelectedPartnerId(partnerId);
    setProposalPartnerName(partnerName);
    setProposalOpen(true);
    setProposalLoading(true);
    setProposalText("");
    setEmailDraft("");
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ partnerId }),
      });
      const data = await res.json();
      setProposalText(data.proposal?.proposal ?? "");
      setEmailDraft(data.proposal?.emailDraft ?? "");
    } finally {
      setProposalLoading(false);
    }
  }

  async function generateOutreachEmail(targetBrandName: string) {
    setOutreachTargetName(targetBrandName);
    setOutreachOpen(true);
    setOutreachLoading(true);
    setOutreachEmailDraft("");
    
    try {
      const res = await fetch("/api/ai/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetBrandName }),
      });
      const data = await res.json();
      setOutreachEmailDraft(data.emailDraft ?? "");
    } catch (err) {
      console.error(err);
      setOutreachEmailDraft("Failed to generate draft. Please try again.");
    } finally {
      setOutreachLoading(false);
    }
  }

  async function sendCollaboration(editedProposal: string) {
    if (!selectedPartnerId) return;
    const score = recommendations.find((r) => r.brandId === selectedPartnerId)?.compatibilityScore;
    await fetch("/api/collaborations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        partnerId: selectedPartnerId,
        proposal: editedProposal,
        emailDraft,
        compatibilityScore: score,
      }),
    });
    setProposalOpen(false);
    setDetailOpen(false);
    loadDashboard();
  }

  async function handleProposalAction(id: string, status: "accepted" | "declined") {
    await fetch(`/api/collaborations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    loadDashboard();
  }

  async function handleToggleSave(brandId: string) {
    const rec = recommendations.find(r => r.brandId === brandId);
    if (!rec) return;
    const isSaved = rec.isSaved;

    // Optimistic update
    setRecommendations(prev => prev.map(r => r.brandId === brandId ? { ...r, isSaved: !isSaved } : r));

    try {
      if (isSaved) {
        await fetch(`/api/brands/saved?targetBrandId=${brandId}`, { method: "DELETE" });
      } else {
        await fetch("/api/brands/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetBrandId: brandId })
        });
      }
    } catch (err) {
      // Revert on error
      setRecommendations(prev => prev.map(r => r.brandId === brandId ? { ...r, isSaved } : r));
    }
  }

  const statCards: StatCardConfig[] = STAT_META.map((meta, i) => ({
    ...meta,
    value: stats[i]?.value ?? 0,
  }));

  return (
    <div>
      {!standaloneMatches && (
        <>
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
              {ROLE_LABELS.brand} Dashboard
            </div>
            <h1 className="bb-display text-2xl font-semibold sm:text-3xl">
              Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Manage brand collaborations and AI-powered partner matching.
            </p>
          </div>

          <QuickActionsBar />
        </>
      )}

      {loading ? (
        <>
          {!standaloneMatches && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          )}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </>
      ) : (
        <>
          {!standaloneMatches && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((s) => (
                  <StatCard key={s.label} {...s} />
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
                <ProfileCompletenessWidget
                  percent={profileCompleteness.percent}
                  missing={profileCompleteness.missing}
                />
                <EscrowOverviewCard {...escrow} />
                <ActivityFeed items={activity} />
              </div>
            </>
          )}

          <div className="mt-8 border-b border-white/10">
            <div className="flex gap-6">
              <button
                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'registered' ? 'text-purple-300' : 'text-white/50 hover:text-white/80'}`}
                onClick={() => setActiveTab('registered')}
              >
                Registered Brands
                {activeTab === 'registered' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 rounded-t-full" />
                )}
              </button>
              <button
                className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'external' ? 'text-purple-300' : 'text-white/50 hover:text-white/80'}`}
                onClick={() => setActiveTab('external')}
              >
                Discover External Brands
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/70">AI</span>
                {activeTab === 'external' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 rounded-t-full" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <MatchesToolbar 
              filters={filters} 
              onFilterChange={setFilters} 
              industries={["Fashion", "Technology", "Beauty", "Food & Beverage", "Fitness", "Gaming", "Travel"]} 
            />
          </div>

          {/* Matches Tab Content */}
          <div className="mt-4">
            {activeTab === 'registered' ? (
              matchesLoading && recommendations.length === 0 ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <RecommendationSkeleton key={i} />
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No matches found"
                description={filters.search || filters.industry || filters.location || filters.availability || filters.collabType || filters.savedOnly ? "Try adjusting your filters or search terms." : "Complete your profile to get AI-powered brand matches."}
                action={
                  (filters.search || filters.industry || filters.location || filters.availability || filters.collabType || filters.savedOnly) ? (
                    <button
                      onClick={() => setFilters({search: "", sort: "score", industry: "", location: "", availability: "", collabType: "", savedOnly: false})}
                      className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <a href="/dashboard/brand/profile" className="bb-btn-primary rounded-xl px-4 py-2 text-sm text-center inline-block">
                      Complete Profile
                    </a>
                  )
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {recommendations.map((rec) => (
                    <BrandRecommendationCard
                      key={rec.brandId}
                      rec={rec}
                      onViewDetails={() => openBrandDetail(rec.brandId)}
                      onSendRequest={() => startCollaboration(rec.brandId, rec.companyName)}
                      onToggleSave={() => handleToggleSave(rec.brandId)}
                      onCampaignIdeaClick={(idea) => {
                        setProposalText(`I really liked the idea: ${idea}`);
                        startCollaboration(rec.brandId, rec.companyName);
                      }}
                    />
                  ))}
                </div>
                {matchesHasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => loadRegisteredMatches(matchesPage + 1, true)}
                      disabled={matchesLoading}
                      className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {matchesLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )
            ) : (
              // External Brands Content
              <div className="pt-2">
                <p className="mb-4 text-sm text-white/50">
                  {externalSource === "ai"
                    ? "AI-generated suggestions for real-world brands that align with your profile. These brands are not yet on BrandBridge."
                    : externalSource === "curated"
                      ? "Profile-matched brand suggestions while Gemini AI is rate-limited. Refresh in a few minutes for fully AI-generated leads."
                      : "AI-generated suggestions for real-world brands that align with your profile. These brands are not yet on BrandBridge."}
                </p>
                {externalQuotaBlocked && externalSource === "curated" && (
                  <p className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200/90">
                    Gemini API quota reached — showing curated matches for your industry. Wait ~5 minutes, then click Retry for fresh AI suggestions.
                  </p>
                )}
                {externalLoading ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <RecommendationSkeleton key={i} />
                    ))}
                  </div>
                ) : externalRecommendations.length === 0 ? (
                  <EmptyState
                    icon={Globe}
                    title="No external leads found"
                    description={
                      externalQuotaBlocked
                        ? "Gemini API quota is temporarily exceeded. Wait a few minutes and retry, or complete your industry and location in your profile for better matches."
                        : "We couldn't generate external brand leads. Ensure GEMINI_API_KEY is set in .env.local and your profile is complete."
                    }
                    action={
                      <button
                        onClick={() => loadExternalBrands(true)}
                        className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
                      >
                        Retry AI Suggestions
                      </button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {externalRecommendations.map((rec) => (
                      <ExternalBrandCard
                        key={rec.companyName}
                        rec={rec}
                        onGenerateOutreach={() => generateOutreachEmail(rec.companyName)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pending Proposals & Recommended Freelancers */}
          {!standaloneMatches && (
            <>
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-2">
                  <Handshake size={18} className="text-purple-300" />
                  <h2 className="bb-display text-lg font-medium">Pending Proposals</h2>
                </div>
                <div className="bb-glass rounded-2xl p-6">
                  {pendingProposals.length === 0 ? (
                    <EmptyState
                      icon={Handshake}
                      title="No pending proposals right now"
                      description="Collaboration requests you send or receive will appear here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {pendingProposals.map((p) => (
                        <PendingProposalRow
                          key={p._id}
                          item={p}
                          onAccept={
                            p.isIncoming
                              ? () => handleProposalAction(p._id, "accepted")
                              : undefined
                          }
                          onDecline={
                            p.isIncoming
                              ? () => handleProposalAction(p._id, "declined")
                              : undefined
                          }
                          onView={
                            p.proposal
                              ? () => {
                                  setProposalText(p.proposal!);
                                  setEmailDraft("");
                                  setProposalPartnerName(p.partnerName);
                                  setProposalOpen(true);
                                  setProposalLoading(false);
                                }
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <RecommendedFreelancersSection freelancers={freelancers} />
              </div>
            </>
          )}
        </>
      )}

      <BrandDetailModal
        open={detailOpen}
        loading={detailLoading}
        brand={selectedBrand}
        compatibility={selectedCompat}
        onClose={() => setDetailOpen(false)}
        onSendRequest={() => {
          if (selectedPartnerId && selectedBrand) {
            startCollaboration(
              selectedPartnerId,
              selectedBrand.companyName || selectedBrand.name,
            );
          }
        }}
      />

      <ProposalPreviewModal
        open={proposalOpen}
        loading={proposalLoading}
        partnerName={proposalPartnerName}
        proposal={proposalText}
        emailDraft={emailDraft}
        onClose={() => setProposalOpen(false)}
        onSend={sendCollaboration}
      />

      <OutreachEmailModal
        open={outreachOpen}
        loading={outreachLoading}
        targetBrandName={outreachTargetName}
        emailDraft={outreachEmailDraft}
        onClose={() => setOutreachOpen(false)}
      />
    </div>
  );
}
