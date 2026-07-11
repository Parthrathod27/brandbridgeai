"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Handshake, MessageSquare, FileCheck, Check, DollarSign, Repeat, Search, AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ReviewFormModal from "@/components/dashboard/ReviewFormModal";
import HireDeliverablesModal from "@/components/dashboard/HireDeliverablesModal";
import type { HireItem, FreelancerItem } from "@/lib/dashboard-types";

interface MyHiresPageProps {
  viewAs: "hirer" | "freelancer";
  title?: string;
  subtitle?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting Response",
  active: "In Progress",
  completed: "Completed",
  cancelled: "Declined",
};

export default function MyHiresPage({
  viewAs,
  title = "My Hires",
  subtitle = "Manage freelancer hire requests and projects",
}: MyHiresPageProps) {
  const router = useRouter();
  const [hires, setHires] = useState<HireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  
  // Modals
  const [reviewHire, setReviewHire] = useState<HireItem | null>(null);
  const [deliverablesHire, setDeliverablesHire] = useState<HireItem | null>(null);
  const [declineReasonHire, setDeclineReasonHire] = useState<HireItem | null>(null);

  function load() {
    fetch("/api/hires")
      .then((r) => r.json())
      .then((d) => setHires(d.hires ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string, declineReason?: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/hires/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, declineReason }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to update hire");
        return;
      }
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  const handleMessage = async (recipientId: string) => {
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, text: "Hi! Following up on our project." }),
      });
      router.push(`/dashboard/${viewAs}/messages`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReleasePayment = () => {
    // Mock functionality
    alert("Payment released successfully via Escrow placeholder.");
  };

  const filteredHires = useMemo(() => {
    if (activeTab === "all") return hires;
    return hires.filter(h => h.status === activeTab);
  }, [hires, activeTab]);

  // Summaries
  const totalSpent = useMemo(() => hires.filter(h => h.status === "completed").reduce((sum, h) => sum + (h.rate || 0), 0), [hires]);
  const activeCommitments = useMemo(() => hires.filter(h => h.status === "active").reduce((sum, h) => sum + (h.rate || 0), 0), [hires]);

  if (loading) return <div className="text-white/50 animate-pulse">Loading hires...</div>;

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      {/* Summary Cards */}
      {viewAs === "hirer" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <span className="text-xs text-white/50 uppercase tracking-wider">Total Spent</span>
            <p className="text-2xl font-semibold mt-1">${totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <span className="text-xs text-white/50 uppercase tracking-wider">Active Commitments</span>
            <p className="text-2xl font-semibold mt-1">${activeCommitments.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {(["all", "active", "completed", "cancelled"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm transition-colors ${
              activeTab === tab
                ? "bg-purple-500/20 text-purple-300"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab === "all" ? "All" : STATUS_LABELS[tab]}
          </button>
        ))}
      </div>

      {hires.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No hires yet"
          description={
            viewAs === "freelancer"
              ? "When a brand hires you, requests will appear here."
              : "You haven't hired any freelancers yet."
          }
          action={
            viewAs === "hirer" ? (
              <button onClick={() => router.push("/dashboard/brand/marketplace")} className="mt-4 bb-btn-primary px-4 py-2 rounded-xl text-sm">
                Find Freelancers
              </button>
            ) : undefined
          }
        />
      ) : filteredHires.length === 0 ? (
        <div className="text-white/50 text-center py-10">No hires match the current filter.</div>
      ) : (
        <div className="space-y-4">
          {filteredHires.map((h) => {
            const partner = viewAs === "freelancer" ? h.hirerId : h.freelancerId;
            const isUpdating = updatingId === h._id;

            return (
              <div key={h._id} className="bb-glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-lg font-semibold text-purple-200">
                      {partner?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="bb-display font-medium text-lg">{partner?.name}</h3>
                      {h.campaignId && (
                        <p className="text-xs text-white/50 mt-0.5">Campaign: <span className="text-white/80">{h.campaignId.title}</span></p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full uppercase font-medium tracking-wider
                          ${h.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            h.status === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                            h.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'}`}
                        >
                          {STATUS_LABELS[h.status]}
                        </span>
                        
                        {h.endDate && (
                          <span className="text-white/50 flex items-center gap-1">
                            Deadline: {new Date(h.endDate).toLocaleDateString()}
                          </span>
                        )}
                        {h.rate != null && (
                          <span className="text-white/50 flex items-center gap-1">
                            Rate: <span className="text-white/90 font-medium">${h.rate}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-2 sm:justify-end">
                    
                    {viewAs === "freelancer" && h.status === "pending" && (
                      <>
                        <button disabled={isUpdating} onClick={() => updateStatus(h._id, "active")} className="bb-btn-primary rounded-xl px-4 py-2 text-xs">
                          Accept
                        </button>
                        <button disabled={isUpdating} onClick={() => {
                          const reason = prompt("Optional: Reason for declining?");
                          updateStatus(h._id, "cancelled", reason || undefined);
                        }} className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5">
                          Decline
                        </button>
                      </>
                    )}

                    {viewAs === "hirer" && h.status === "pending" && (
                      <button disabled={isUpdating} onClick={() => updateStatus(h._id, "cancelled")} className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5 text-red-400 hover:text-red-300">
                        Cancel Request
                      </button>
                    )}

                    {h.status === "active" && (
                      <>
                        <button onClick={() => handleMessage(partner!._id)} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
                          <MessageSquare size={14} /> Message
                        </button>
                        <button onClick={() => setDeliverablesHire(h)} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
                          <FileCheck size={14} /> Deliverables
                        </button>
                        {viewAs === "hirer" && (
                          <>
                            <button onClick={handleReleasePayment} className="flex items-center gap-1.5 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-2 text-xs transition-colors">
                              <DollarSign size={14} /> Release Payment
                            </button>
                            <button disabled={isUpdating} onClick={() => updateStatus(h._id, "completed")} className="bb-btn-primary flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs">
                              <Check size={14} /> Mark Complete
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {h.status === "completed" && (
                      <>
                        <button onClick={() => setDeliverablesHire(h)} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
                          <FileCheck size={14} /> Files
                        </button>
                        {viewAs === "hirer" && (
                          <>
                            <button onClick={() => router.push(`/dashboard/brand/marketplace`)} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
                              <Repeat size={14} /> Hire Again
                            </button>
                            <button onClick={() => setReviewHire(h)} className="bb-btn-primary flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs">
                              Leave Review
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {h.status === "cancelled" && (
                      <>
                        {h.declineReason && (
                          <button onClick={() => setDeclineReasonHire(h)} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
                            <AlertCircle size={14} /> View Reason
                          </button>
                        )}
                        {viewAs === "hirer" && (
                          <button onClick={() => router.push("/dashboard/brand/marketplace")} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
                            <Search size={14} /> Find Similar
                          </button>
                        )}
                      </>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewHire && (
        <ReviewFormModal 
          hire={reviewHire} 
          onClose={() => setReviewHire(null)} 
          onSuccess={() => { setReviewHire(null); alert("Review submitted!"); }} 
        />
      )}

      {deliverablesHire && (
        <HireDeliverablesModal 
          hire={deliverablesHire} 
          role={viewAs}
          onClose={() => setDeliverablesHire(null)} 
          onUpdate={() => { load(); }}
        />
      )}

      {declineReasonHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a24] border border-white/10 w-full max-w-sm rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">Decline Reason</h3>
            <p className="text-sm text-white/70">{declineReasonHire.declineReason}</p>
            <button onClick={() => setDeclineReasonHire(null)} className="mt-6 w-full bb-btn-primary py-2 rounded-xl text-sm">Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
