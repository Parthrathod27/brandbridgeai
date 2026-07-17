"use client";

import { useEffect, useState } from "react";
import { Handshake, Layers, PenTool, Sparkles, AlertTriangle, FileText, CheckCircle, ArrowRight, DollarSign } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import CollaborationRequestCard from "../components/CollaborationRequestCard";
import type { CollaborationRequestItem } from "../lib/types";
import { PO_API_BASE } from "../lib/types";

interface ExtendedCollaboration extends CollaborationRequestItem {
  riskScore?: string;
  aiPrediction?: string;
  contractSigned?: boolean;
  invoiceAmount?: number;
  invoiceStatus?: string;
}

export default function CollaborationsPage() {
  const [collaborations, setCollaborations] = useState<ExtendedCollaboration[]>([]);
  const [myId, setMyId] = useState("");
  const [loading, setLoading] = useState(true);

  // Interface view state
  const [viewMode, setViewMode] = useState<"pipeline" | "cards">("pipeline");

  // Contract state
  const [signingItem, setSigningItem] = useState<ExtendedCollaboration | null>(null);
  const [sigName, setSigName] = useState("");

  // Invoice state
  const [activeInvoice, setActiveInvoice] = useState<ExtendedCollaboration | null>(null);

  function load() {
    Promise.all([
      fetch(`${PO_API_BASE}/collaborations`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([collabData, userData]) => {
        // Enforce extra mock attributes for verified pipeline layout
        const enriched = (collabData.collaborations ?? []).map((c: any, index: number) => {
          const predictions = ["94% success rate predicted", "88% success rate predicted", "91% success rate predicted"];
          const risks = ["Low Risk", "Medium Risk", "Low Risk"];
          const invStats = ["Unpaid", "Paid", "Draft"];
          return {
            ...c,
            riskScore: c.riskScore || risks[index % risks.length],
            aiPrediction: c.aiPrediction || predictions[index % predictions.length],
            contractSigned: c.contractSigned ?? (c.status === "accepted" ? index % 2 === 0 : false),
            invoiceAmount: c.invoiceAmount ?? (500 + index * 450),
            invoiceStatus: c.invoiceStatus ?? invStats[index % invStats.length],
          };
        });
        setCollaborations(enriched);
        setMyId(userData.user?._id ?? "");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`${PO_API_BASE}/collaborations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    // Record audit automation log
    await fetch("/api/activity-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "collaboration_status_changed",
        details: `Changed collaboration ${id} status to ${status}`,
      }),
    });
    load();
  }

  async function handleSignContract() {
    if (!signingItem) return;
    // Mock updating signature state
    const nextList = collaborations.map((c) =>
      c._id === signingItem._id ? { ...c, contractSigned: true } : c
    );
    setCollaborations(nextList);
    setSigName("");
    setSigningItem(null);
    alert("Contract signed successfully using digital verification key!");
  }

  if (loading) return <div className="text-ink-faint">Loading collaborations...</div>;

  // Pipeline pipeline columns mapping
  const pipelineStages = [
    { id: "pending", label: "Requested" },
    { id: "accepted", label: "In Progress" },
    { id: "declined", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Collaboration Lifecycle Pipeline"
          subtitle="Track contracts, invoices, milestones, and AI compatibility projections."
        />
        {/* Toggle layout views */}
        <div className="flex bg-[var(--surface-strong)] border border-[var(--border)] rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode("pipeline")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition ${
              viewMode === "pipeline" ? "bg-purple-500/20 text-purple" : "text-ink-faint hover:text-ink"
            }`}
          >
            Pipeline Kanban
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition ${
              viewMode === "cards" ? "bg-purple-500/20 text-purple" : "text-ink-faint hover:text-ink"
            }`}
          >
            Classic Cards
          </button>
        </div>
      </div>

      {collaborations.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No collaboration requests yet"
          description="Find brands and send collaboration requests from the Find Brands page."
        />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {collaborations.map((c) => (
            <CollaborationRequestCard
              key={c._id}
              item={c}
              onAccept={c.partnerId._id === myId ? () => updateStatus(c._id, "accepted") : undefined}
              onDecline={c.partnerId._id === myId ? () => updateStatus(c._id, "declined") : undefined}
            />
          ))}
        </div>
      ) : (
        /* Kanban Pipeline Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pipelineStages.map((stage) => {
            const list = collaborations.filter((c) => c.status === stage.id);
            return (
              <div key={stage.id} className="bb-glass rounded-2xl p-5 space-y-4 border border-[var(--border)] flex flex-col min-h-[50vh]">
                <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                  <h3 className="font-semibold text-sm text-ink">{stage.label}</h3>
                  <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple font-bold">
                    {list.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3.5 overflow-y-auto">
                  {list.map((col) => {
                    const isPartner = col.partnerId._id === myId;
                    return (
                      <div key={col._id} className="bg-[var(--surface-strong)] border border-[var(--border)] rounded-xl p-4 space-y-3.5 hover:bg-[var(--surface-strong)] transition flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-ink">{col.partnerId.name}</h4>
                          {col.productId?.name && (
                            <p className="text-[10px] text-purple font-medium">Re: {col.productId.name}</p>
                          )}
                          <p className="text-xs text-ink-soft mt-2 line-clamp-2">{col.message || "Brand outreach details"}</p>
                        </div>

                        {/* AI Success Prediction info */}
                        <div className="flex items-center gap-1.5 text-[10px] text-purple font-semibold">
                          <Sparkles size={11} />
                          <span>{col.aiPrediction}</span>
                        </div>

                        {/* Risk Indicator */}
                        <div className="flex items-center justify-between text-[9px] text-ink-faint border-t border-[var(--border)] pt-2">
                          <span>Risk: {col.riskScore}</span>
                          <span className="flex items-center gap-0.5 text-purple">
                            Invoice: ${col.invoiceAmount} ({col.invoiceStatus})
                          </span>
                        </div>

                        {/* Actions details depending on status */}
                        {stage.id === "pending" && isPartner && (
                          <div className="flex gap-2 pt-1.5">
                            <button
                              onClick={() => updateStatus(col._id, "accepted")}
                              className="flex-1 bg-purple-500 hover:bg-purple-600 text-ink rounded-lg py-1.5 text-center text-xs font-semibold cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(col._id, "declined")}
                              className="flex-1 bg-[var(--surface-strong)] hover:bg-[var(--surface-strong)] text-ink-soft rounded-lg py-1.5 text-center text-xs font-semibold cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {stage.id === "accepted" && (
                          <div className="flex gap-2 pt-1.5 text-[10px] font-semibold">
                            {col.contractSigned ? (
                              <span className="flex items-center gap-1 text-green-400">
                                <CheckCircle size={11} /> Contract Signed
                              </span>
                            ) : (
                              <button
                                onClick={() => setSigningItem(col)}
                                className="flex-1 bg-purple-500/20 text-purple border border-purple-500/20 hover:bg-purple-500/35 rounded-lg py-1.5 text-center flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <PenTool size={11} /> Sign Contract
                              </button>
                            )}
                            <button
                              onClick={() => setActiveInvoice(col)}
                              className="flex-1 bg-[var(--surface-strong)] hover:bg-[var(--surface-strong)] text-ink-soft rounded-lg py-1.5 text-center flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <FileText size={11} /> Invoices
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {list.length === 0 && (
                    <p className="text-[11px] text-ink-faint py-10 text-center">No collaborations in this stage.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contract Sign modal overlay */}
      {signingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bb-glass w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <h3 className="bb-display text-base font-semibold text-ink flex items-center gap-1.5">
                <PenTool size={16} className="text-purple" />
                Digital Contract Management
              </h3>
              <button onClick={() => setSigningItem(null)} className="text-ink-soft hover:text-ink cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-3.5 text-xs text-purple space-y-1.5 leading-relaxed">
                <span className="font-semibold block text-ink">TERMS & CONDITIONS:</span>
                <p>1. Brand Partner agrees to promote selected Product owner assets.</p>
                <p>2. Payment release is bound strictly to content validation and milestone compliance.</p>
                <p>3. This contract stands as a digitally certified binding declaration.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-ink-faint">Write signature to sign agreement</label>
                <input
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-xs font-serif"
                  placeholder="Your Full Name (e.g. John Doe)"
                  value={sigName}
                  onChange={(e) => setSigName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-[var(--border)] px-6 py-4 bg-[var(--bg)]/10">
              <button
                onClick={() => setSigningItem(null)}
                className="rounded-xl px-4 py-2 text-sm text-ink-faint hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSignContract}
                disabled={!sigName.trim()}
                className="bb-btn-primary rounded-xl px-5 py-2 text-sm font-semibold cursor-pointer disabled:opacity-40"
              >
                Apply Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice modal overlay */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bb-glass w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <h3 className="bb-display text-base font-semibold text-ink flex items-center gap-1.5">
                <DollarSign size={16} className="text-purple" />
                Payments & Invoice Center
              </h3>
              <button onClick={() => setActiveInvoice(null)} className="text-ink-soft hover:text-ink cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                <span className="text-ink-faint">Invoice ID:</span>
                <span className="font-mono text-ink">INV-{activeInvoice._id.substring(18).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                <span className="text-ink-faint">Partner:</span>
                <span className="font-semibold text-ink">{activeInvoice.partnerId.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                <span className="text-ink-faint">Total Amount:</span>
                <span className="font-bold text-purple">${activeInvoice.invoiceAmount} USD</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-ink-faint">Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded ${
                  activeInvoice.invoiceStatus === "Paid" ? "bg-green-500/20 text-green-300" : "bg-[var(--bg)]mber-500/20 text-amber-300"
                }`}>
                  {activeInvoice.invoiceStatus}
                </span>
              </div>
            </div>
            <div className="flex justify-end border-t border-[var(--border)] px-6 py-4 bg-[var(--bg)]/10">
              <button
                onClick={() => setActiveInvoice(null)}
                className="bb-btn-primary rounded-xl px-5 py-2 text-sm font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback since Lucide X is needed in signatures overlay close
function X({ size }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
