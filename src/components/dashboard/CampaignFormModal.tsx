"use client";

import { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Target, Briefcase } from "lucide-react";
import type { CollaborationItem } from "@/lib/dashboard-types";

interface CampaignFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialCollaborationId?: string;
}

export default function CampaignFormModal({ onClose, onSuccess, initialCollaborationId }: CampaignFormModalProps) {
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    collaborationId: initialCollaborationId || "",
    type: "",
    startDate: "",
    endDate: "",
    budget: "",
    goal: "",
    freelancerId: "",
  });

  useEffect(() => {
    // Fetch accepted collaborations
    fetch("/api/collaborations")
      .then((r) => r.json())
      .then((data) => {
        const accepted = (data.collaborations || []).filter((c: CollaborationItem) => c.status === "accepted");
        setCollaborations(accepted);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.collaborationId || !formData.type || !formData.startDate || !formData.endDate || !formData.goal) {
      setError("Please fill in all required fields.");
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError("End date must be after start date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? Number(formData.budget) : undefined,
          status: "draft",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create campaign");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-[#1a1a24] border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="bb-display text-xl font-semibold">New Campaign</h2>
            <p className="text-sm text-white/50 mt-1">Setup your marketing initiative</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form id="campaign-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Campaign Name *</label>
              <input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Summer Influencer Push"
                className="bb-input w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Linked Collaboration *</label>
              <select 
                name="collaborationId"
                value={formData.collaborationId}
                onChange={handleChange}
                className="bb-input w-full rounded-xl px-4 py-3 text-sm appearance-none"
                disabled={loading}
              >
                <option value="">Select an accepted collaboration</option>
                {collaborations.map(c => (
                  <option key={c._id} value={c._id}>{c.partnerName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Campaign Type *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="bb-input w-full rounded-xl pl-10 pr-4 py-3 text-sm appearance-none"
                  >
                    <option value="">Select type</option>
                    <option value="Co-branded Social Post">Co-branded Social Post</option>
                    <option value="Product Bundle">Product Bundle</option>
                    <option value="Influencer Push">Influencer Push</option>
                    <option value="Cross-promotion">Cross-promotion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Goal *</label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <select 
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className="bb-input w-full rounded-xl pl-10 pr-4 py-3 text-sm appearance-none"
                  >
                    <option value="">Select goal</option>
                    <option value="Awareness">Awareness</option>
                    <option value="Sales">Sales</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Reach">Reach</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Start Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input 
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="bb-input w-full rounded-xl pl-10 pr-4 py-3 text-sm [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">End Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input 
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="bb-input w-full rounded-xl pl-10 pr-4 py-3 text-sm [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Budget ($) (Optional)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input 
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="bb-input w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>

          </form>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/10 shrink-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button 
            type="submit"
            form="campaign-form"
            disabled={submitting}
            className="bb-btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Campaign"}
          </button>
        </div>

      </div>
    </div>
  );
}
