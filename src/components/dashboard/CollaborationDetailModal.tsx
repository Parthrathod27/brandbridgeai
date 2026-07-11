"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Activity, ArrowRight, Briefcase } from "lucide-react";
import type { CollaborationItem } from "@/lib/dashboard-types";
import { useRouter } from "next/navigation";

interface CollaborationDetailModalProps {
  collaboration: CollaborationItem;
  onClose: () => void;
}

interface LogEntry {
  _id: string;
  action: string;
  details: string;
  createdAt: string;
}

export default function CollaborationDetailModal({
  collaboration,
  onClose,
}: CollaborationDetailModalProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    fetch(`/api/activity?entityId=${collaboration._id}&entityType=collaboration`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || []);
      })
      .catch(console.error)
      .finally(() => setLoadingLogs(false));
  }, [collaboration._id]);

  const handleCreateCampaign = () => {
    // Navigate to campaigns with this collaboration pre-selected
    // Using a query param or state. Let's use a query param.
    router.push(`/dashboard/brand/campaigns?new=true&collabId=${collaboration._id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-[#1a1a24] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="bb-display text-xl font-semibold">Collaboration Details</h2>
            <p className="text-sm text-white/50 mt-1">Partnership with {collaboration.partnerName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Status & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 rounded-xl p-4">
            <div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Current Status</span>
              <p className="font-medium mt-1 capitalize text-purple-400">{collaboration.status}</p>
            </div>
            {collaboration.status === "accepted" && (
              <button 
                onClick={handleCreateCampaign}
                className="bb-btn-primary rounded-xl px-4 py-2 text-sm flex items-center gap-2"
              >
                <Briefcase size={16} />
                Start a Campaign
              </button>
            )}
          </div>

          {/* Proposal Details */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Activity size={16} className="text-purple-400" />
              Proposal Summary
            </h3>
            <div className="bg-white/5 rounded-xl p-4 space-y-4">
              {collaboration.message && (
                <div>
                  <span className="text-xs text-white/40 mb-1 block">Introductory Message</span>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{collaboration.message}</p>
                </div>
              )}
              {collaboration.proposal && (
                <div>
                  <span className="text-xs text-white/40 mb-1 block">Full Proposal</span>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{collaboration.proposal}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-purple-400" />
              Activity Timeline
            </h3>
            
            <div className="bg-white/5 rounded-xl p-5">
              {loadingLogs ? (
                <div className="text-sm text-white/50 animate-pulse">Loading timeline...</div>
              ) : logs.length === 0 ? (
                <div className="text-sm text-white/50">No activity recorded yet.</div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  {logs.map((log, i) => (
                    <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-purple-500 bg-[#1a1a24] text-purple-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-white/5 border border-white/10 shadow">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-purple-300">{log.action}</span>
                          <span className="text-[10px] text-white/40">{new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-white/70">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
