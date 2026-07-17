"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Activity, Check, Edit3, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import type { CampaignItem } from "@/lib/dashboard-types";

interface CampaignDetailModalProps {
  campaign: CampaignItem;
  onClose: () => void;
}

export default function CampaignDetailModal({ campaign, onClose }: CampaignDetailModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [brief, setBrief] = useState<string>("");
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [contentIdeas, setContentIdeas] = useState<string[]>([]);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    fetch(`/api/activity?entityId=${campaign._id}&entityType=campaign`)
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .catch(console.error)
      .finally(() => setLoadingLogs(false));
  }, [campaign._id]);

  const generateBrief = async () => {
    setGeneratingBrief(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/campaign-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: campaign.title,
          type: campaign.type,
          goal: campaign.goal,
          budget: campaign.budget,
          partnerName: campaign.collaborationId?.partnerId?.name || "Partner",
          initiatorName: campaign.collaborationId?.initiatorId?.name || "Our Brand",
        })
      });
      if (!res.ok) throw new Error("Failed to generate brief");
      const data = await res.json();
      setBrief(data.brief);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setGeneratingBrief(false);
    }
  };

  const generateIdeas = async () => {
    setGeneratingIdeas(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/campaign-content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: campaign.title,
          type: campaign.type,
          goal: campaign.goal,
          partnerName: campaign.collaborationId?.partnerId?.name || "Partner",
          initiatorName: campaign.collaborationId?.initiatorId?.name || "Our Brand",
        })
      });
      if (!res.ok) throw new Error("Failed to generate ideas");
      const data = await res.json();
      setContentIdeas(data.ideas);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setGeneratingIdeas(false);
    }
  };

  // Safe formatting for dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-[#1a1a24] border border-[var(--border)] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] shrink-0">
          <div>
            <h2 className="bb-display text-2xl font-semibold flex items-center gap-3">
              {campaign.title}
              <span className="text-xs bg-purple-500/20 text-purple px-2 py-1 rounded-md uppercase font-medium">
                {campaign.status}
              </span>
            </h2>
            <p className="text-sm text-ink-faint mt-1">
              Collaboration with {campaign.collaborationId?.partnerId?.name || "Partner"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--surface-strong)] transition-colors">
            <X size={20} className="text-ink-soft" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[var(--surface-strong)] p-4 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-ink-faint">Type</span>
                <p className="text-sm mt-1">{campaign.type || "N/A"}</p>
              </div>
              <div className="bg-[var(--surface-strong)] p-4 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-ink-faint">Goal</span>
                <p className="text-sm mt-1">{campaign.goal || "N/A"}</p>
              </div>
              <div className="bg-[var(--surface-strong)] p-4 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-ink-faint">Start Date</span>
                <p className="text-sm mt-1">{formatDate(campaign.startDate)}</p>
              </div>
              <div className="bg-[var(--surface-strong)] p-4 rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-ink-faint">End Date</span>
                <p className="text-sm mt-1">{formatDate(campaign.endDate)}</p>
              </div>
            </div>

            {/* AI Assistant Section */}
            <div className="border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl p-5">
              <h3 className="font-medium flex items-center gap-2 mb-4 text-purple">
                <Sparkles size={16} /> AI Campaign Assistant
              </h3>
              
              {aiError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={14} /> {aiError}
                </div>
              )}

              <div className="flex gap-3 mb-6">
                <button 
                  onClick={generateBrief} 
                  disabled={generatingBrief}
                  className="bg-purple-500/20 text-purple hover:bg-purple-500/30 px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Edit3 size={14} /> {generatingBrief ? "Generating Brief..." : "Generate Brief"}
                </button>
                <button 
                  onClick={generateIdeas} 
                  disabled={generatingIdeas}
                  className="bg-purple-500/20 text-purple hover:bg-purple-500/30 px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Activity size={14} /> {generatingIdeas ? "Generating Ideas..." : "Suggest Content Ideas"}
                </button>
              </div>

              {brief && (
                <div className="mb-6">
                  <h4 className="text-xs uppercase tracking-wider text-ink-faint mb-2">Campaign Brief</h4>
                  <div className="bg-[#1a1a24] p-4 rounded-xl border border-[var(--border)] text-sm text-ink whitespace-pre-wrap">
                    {brief}
                  </div>
                </div>
              )}

              {contentIdeas.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-ink-faint mb-2">Content Ideas</h4>
                  <div className="flex flex-wrap gap-2">
                    {contentIdeas.map((idea, idx) => (
                      <div key={idx} className="bg-[#1a1a24] border border-[var(--border)] text-sm text-ink p-3 rounded-xl w-full">
                        {idea}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Placeholder Assets */}
            <div>
              <h3 className="text-sm font-medium text-ink mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-purple" />
                Campaign Assets
              </h3>
              <div className="bg-[var(--surface-strong)] border border-dashed border-[var(--border)] rounded-xl p-8 text-center">
                <p className="text-sm text-ink-faint mb-3">Upload visual assets, copy drafts, and references</p>
                <button className="bb-btn-primary px-4 py-2 text-sm rounded-xl">Browse Files</button>
              </div>
            </div>

          </div>

          <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-[var(--border)] lg:pl-6 pt-6 lg:pt-0">
            {/* Performance Stats */}
            <div>
              <h3 className="text-sm font-medium text-ink mb-3">Performance</h3>
              <div className="space-y-3">
                <div className="bg-[var(--surface-strong)] p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-ink-faint">Reach</span>
                  <span className="text-sm font-medium">{campaign.stats?.reach || 0}</span>
                </div>
                <div className="bg-[var(--surface-strong)] p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-ink-faint">Engagement</span>
                  <span className="text-sm font-medium">{campaign.stats?.engagement || 0}</span>
                </div>
                <div className="bg-[var(--surface-strong)] p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-ink-faint">Clicks</span>
                  <span className="text-sm font-medium">{campaign.stats?.clicks || 0}</span>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-xl flex justify-between items-center mt-4">
                  <span className="text-xs text-purple">Budget Spent</span>
                  <span className="text-sm font-medium text-purple">
                    ${campaign.spent || 0} / ${campaign.budget || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div>
              <h3 className="text-sm font-medium text-ink mb-3">Activity Log</h3>
              <div className="space-y-4">
                {loadingLogs ? (
                  <p className="text-xs text-ink-faint">Loading...</p>
                ) : logs.length === 0 ? (
                  <p className="text-xs text-ink-faint">No activity yet</p>
                ) : (
                  logs.map((log) => (
                    <div key={log._id} className="relative pl-4 border-l border-[var(--border)]">
                      <div className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full -translate-x-1/2"></div>
                      <p className="text-[11px] font-medium text-purple mb-0.5">{log.action}</p>
                      <p className="text-xs text-ink-soft">{log.details}</p>
                      <p className="text-[10px] text-ink-faint mt-1">{new Date(log.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
