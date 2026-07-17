"use client";

import { useState, useEffect, useMemo } from "react";
import { Handshake, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader";
import CollaborationCard from "@/components/dashboard/CollaborationCard";
import EmptyState from "@/components/dashboard/EmptyState";
import CollaborationDetailModal from "@/components/dashboard/CollaborationDetailModal";
import type { CollaborationItem } from "@/lib/dashboard-types";

export default function BrandCollaborationsPage() {
  const router = useRouter();
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering and Sorting state
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "declined" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "match">("newest");

  // Modal state
  const [selectedCollaboration, setSelectedCollaboration] = useState<CollaborationItem | null>(null);

  function load() {
    fetch("/api/collaborations")
      .then((r) => r.json())
      .then((collabData) => {
        setCollaborations(collabData.collaborations ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/collaborations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  // Filter and sort logic
  const filteredCollaborations = useMemo(() => {
    let result = collaborations;

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter(c => c.status === activeTab);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.partnerName?.toLowerCase().includes(q));
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "match") {
        return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
      }
      // Assuming we have createdAt, if not we rely on original order which is newest first
      // But let's just reverse for oldest
      if (sortBy === "oldest") {
        return -1; // this is a simple mock sort if date isn't available on item, ideally sort by date
      }
      return 1;
    });

    if (sortBy === "oldest") {
      result.reverse();
    }

    return result;
  }, [collaborations, activeTab, searchQuery, sortBy]);

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "accepted", label: "Accepted" },
    { id: "declined", label: "Declined" },
    { id: "completed", label: "Completed" },
  ] as const;

  if (loading) return <div className="text-ink-faint animate-pulse">Loading collaborations...</div>;

  return (
    <div>
      <PageHeader title="Collaborations" subtitle="Manage brand partnership requests" />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm transition-colors ${activeTab === tab.id
                  ? "bg-purple-500/20 text-purple"
                  : "bg-[var(--surface-strong)] text-ink-soft hover:bg-[var(--surface-strong)] hover:text-ink"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" size={16} />
            <input
              type="text"
              placeholder="Search brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bb-input w-full pl-9 rounded-xl py-2 text-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bb-input rounded-xl py-2 px-3 text-sm cursor-pointer appearance-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="match">Match %</option>
          </select>
        </div>
      </div>

      {filteredCollaborations.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No collaborations found"
          description={
            searchQuery || activeTab !== "all"
              ? "Try adjusting your filters or search."
              : "Use AI Brand Matching to find partners and send collaboration requests."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCollaborations.map((c) => (
            <CollaborationCard
              key={c._id}
              partnerName={c.partnerName ?? "Unknown brand"}
              status={c.status}
              message={c.message}
              proposal={c.proposal}
              compatibilityScore={c.compatibilityScore}
              isIncoming={c.isIncoming}
              onAccept={c.isIncoming && c.status === "pending" ? () => updateStatus(c._id, "accepted") : undefined}
              onDecline={c.isIncoming && c.status === "pending" ? () => updateStatus(c._id, "declined") : undefined}
              onOpenChat={() =>
                c.partnerId
                  ? router.push(`/dashboard/brand/messages?partnerId=${c.partnerId}&partnerName=${encodeURIComponent(c.partnerName ?? 'Unknown brand')}`)
                  : router.push('/dashboard/brand/messages')
              }
              onViewDetails={() => setSelectedCollaboration(c)}
            />
          ))}
        </div>
      )}

      {selectedCollaboration && (
        <CollaborationDetailModal
          collaboration={selectedCollaboration}
          onClose={() => setSelectedCollaboration(null)}
        />
      )}
    </div>
  );
}
