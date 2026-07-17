"use client";

import { useState } from "react";
import { X, Upload, Link, FileText } from "lucide-react";
import type { HireItem } from "@/lib/dashboard-types";
import type { UserRole } from "@/lib/roles";

interface HireDeliverablesModalProps {
  hire: HireItem;
  role: UserRole;
  onClose: () => void;
  onUpdate: () => void;
}

export default function HireDeliverablesModal({ hire, role, onClose, onUpdate }: HireDeliverablesModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const handleAddDeliverable = async () => {
    if (!fileUrl || !fileName) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hires/${hire._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverables: [{ fileUrl, name: fileName }]
        }),
      });

      if (!res.ok) throw new Error("Failed to add deliverable");
      
      setFileUrl("");
      setFileName("");
      onUpdate();
    } catch (err) {
      alert(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-[#1a1a24] border border-[var(--border)] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div>
            <h2 className="bb-display text-lg font-semibold">Deliverables</h2>
            <p className="text-xs text-ink-faint mt-1">Project files and assets</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--surface-strong)] transition-colors">
            <X size={18} className="text-ink-soft" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          
          <div className="space-y-3">
            {hire.deliverables && hire.deliverables.length > 0 ? (
              hire.deliverables.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-[var(--surface-strong)] p-3 rounded-xl border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 text-purple rounded-lg">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-medium">{d.name}</span>
                  </div>
                  <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple hover:text-purple hover:underline">
                    View File
                  </a>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-faint text-center py-6">No deliverables uploaded yet.</p>
            )}
          </div>

          {role === "freelancer" && hire.status === "active" && (
            <div className="pt-4 border-t border-[var(--border)]">
              <h3 className="text-sm font-medium mb-3">Add Deliverable</h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="File Name (e.g., Final Video v1)" 
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className="bb-input w-full rounded-xl px-3 py-2 text-sm"
                />
                <input 
                  type="url" 
                  placeholder="File URL (e.g., Google Drive link)" 
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  className="bb-input w-full rounded-xl px-3 py-2 text-sm"
                />
                <button 
                  onClick={handleAddDeliverable}
                  disabled={submitting || !fileName || !fileUrl}
                  className="w-full bb-btn-primary py-2 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Upload size={14} /> {submitting ? "Adding..." : "Add Link"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
