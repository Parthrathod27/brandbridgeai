"use client";

import { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Briefcase } from "lucide-react";
import type { CampaignItem, FreelancerItem } from "@/lib/dashboard-types";

interface HireFormModalProps {
  freelancer: FreelancerItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HireFormModal({ freelancer, onClose, onSuccess }: HireFormModalProps) {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    campaignId: "",
    rate: freelancer.freelancerProfile?.hourlyRate?.toString() || "",
    notes: "",
    endDate: "",
  });

  useEffect(() => {
    // Fetch user's active campaigns
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.campaigns || []).filter((c: CampaignItem) => c.status === "active");
        setCampaigns(active);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rate || !formData.notes || !formData.endDate) {
      setError("Please fill in rate, scope, and deadline.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/hires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerId: freelancer.user?._id,
          campaignId: formData.campaignId || undefined,
          rate: Number(formData.rate),
          notes: formData.notes,
          endDate: formData.endDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create hire request");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-[#1a1a24] border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="bb-display text-xl font-semibold">Hire Freelancer</h2>
            <p className="text-sm text-white/50 mt-1">Send a project request to {freelancer.user?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white/70" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form id="hire-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Linked Campaign (Optional)</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <select 
                  name="campaignId"
                  value={formData.campaignId}
                  onChange={handleChange}
                  className="bb-input w-full rounded-xl pl-10 pr-4 py-3 text-sm appearance-none"
                  disabled={loading}
                >
                  <option value="">No linked campaign (Stand-alone hire)</option>
                  {campaigns.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Agreed Rate ($/hr)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input 
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    className="bb-input w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Expected Deadline</label>
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
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Project Scope / Brief</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Describe what you need the freelancer to do..."
                className="bb-input w-full rounded-xl px-4 py-3 text-sm min-h-[120px]"
              />
            </div>

          </form>
        </div>
        
        <div className="p-6 border-t border-white/10 shrink-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button 
            type="submit"
            form="hire-form"
            disabled={submitting}
            className="bb-btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Hire Request"}
          </button>
        </div>

      </div>
    </div>
  );
}
