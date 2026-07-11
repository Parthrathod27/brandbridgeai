"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Megaphone, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import CampaignFormModal from "@/components/dashboard/CampaignFormModal";
import CampaignDetailModal from "@/components/dashboard/CampaignDetailModal";
import type { CampaignItem, CollaborationItem } from "@/lib/dashboard-types";

// Inner component to safely use useSearchParams
function BrandCampaignsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewCampaign = searchParams.get("new") === "true";
  const initialCollabId = searchParams.get("collabId") || "";

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [acceptedCollaborationsCount, setAcceptedCollaborationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showForm, setShowForm] = useState(isNewCampaign);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "active" | "completed" | "paused">("all");
  const [searchQuery, setSearchQuery] = useState("");

  function load() {
    // Load campaigns
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load collaborations count to check if user has accepted collaborations
    fetch("/api/collaborations")
      .then((r) => r.json())
      .then((d) => {
        const accepted = (d.collaborations || []).filter((c: CollaborationItem) => c.status === "accepted");
        setAcceptedCollaborationsCount(accepted.length);
      })
      .catch(console.error);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (isNewCampaign && acceptedCollaborationsCount > 0) {
      setShowForm(true);
    }
  }, [isNewCampaign, acceptedCollaborationsCount]);

  const handleCreateClick = () => {
    if (acceptedCollaborationsCount === 0) {
      // Smart Empty-State Redirect
      router.push("/dashboard/brand/collaborations");
      return;
    }
    setShowForm(true);
  };

  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    if (activeTab !== "all") {
      result = result.filter(c => c.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q));
    }
    return result;
  }, [campaigns, activeTab, searchQuery]);

  const tabs = [
    { id: "all", label: "All" },
    { id: "draft", label: "Draft" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "paused", label: "Paused" },
  ] as const;

  if (loading) return <div className="text-white/50 animate-pulse">Loading campaigns...</div>;

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Create and manage marketing campaigns"
        action={
          <button onClick={handleCreateClick} className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
            <Plus size={16} />
            New Campaign
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:w-64 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bb-input w-full pl-9 rounded-xl py-2 text-sm"
          />
        </div>
      </div>

      {campaigns.length === 0 && !searchQuery && activeTab === "all" ? (
        <EmptyState 
          icon={Megaphone} 
          title="No campaigns yet" 
          description={
            acceptedCollaborationsCount === 0 
            ? "You need an accepted collaboration before creating a campaign."
            : "Create your first campaign to start collaborating."
          }
          action={
            acceptedCollaborationsCount === 0 ? (
              <button 
                onClick={() => router.push("/dashboard/brand/collaborations")}
                className="mt-4 bb-btn-primary px-4 py-2 rounded-xl text-sm"
              >
                Go to Collaborations
              </button>
            ) : undefined
          }
        />
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-10 text-white/50">No campaigns match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((c) => {
            const partnerName = c.collaborationId?.partnerId?.name;
            const progress = c.status === "active" ? 60 : c.status === "completed" ? 100 : 0; // Mock progress for UI
            
            return (
              <div 
                key={c._id} 
                className="bb-glass rounded-2xl p-5 cursor-pointer hover:border-purple-500/30 transition-colors"
                onClick={() => setSelectedCampaign(c)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="bb-display font-medium text-lg leading-tight">{c.title}</h3>
                    {partnerName && <p className="text-xs text-white/50 mt-1">w/ {partnerName}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase font-medium tracking-wider
                    ${c.status === "active" ? "bg-green-500/20 text-green-400" :
                      c.status === "completed" ? "bg-purple-500/20 text-purple-400" :
                      c.status === "paused" ? "bg-orange-500/20 text-orange-400" :
                      "bg-white/10 text-white/50"}`}
                  >
                    {c.status}
                  </span>
                </div>
                
                {c.status === "active" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                      <span>Timeline</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">Spent</p>
                    <p className="text-sm font-medium text-white/80">${c.spent || 0} / ${c.budget || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">Goal</p>
                    <p className="text-sm font-medium text-white/80">{c.goal || "N/A"}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <CampaignFormModal 
          onClose={() => setShowForm(false)} 
          onSuccess={() => { setShowForm(false); load(); router.replace("/dashboard/brand/campaigns"); }} 
          initialCollaborationId={initialCollabId}
        />
      )}

      {selectedCampaign && (
        <CampaignDetailModal 
          campaign={selectedCampaign} 
          onClose={() => setSelectedCampaign(null)} 
        />
      )}

    </div>
  );
}

export default function BrandCampaignsPage() {
  return (
    <Suspense fallback={<div className="text-white/50 animate-pulse">Loading...</div>}>
      <BrandCampaignsContent />
    </Suspense>
  );
}
