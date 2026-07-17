"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import type { HireItem } from "@/lib/dashboard-types";

interface ReviewFormModalProps {
  hire: HireItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewFormModal({ hire, onClose, onSuccess }: ReviewFormModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hireId: hire._id,
          freelancerId: hire.freelancerId?._id,
          rating,
          text,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
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
      <div className="bg-[#1a1a24] border border-[var(--border)] w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
        
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div>
            <h2 className="bb-display text-lg font-semibold">Leave a Review</h2>
            <p className="text-xs text-ink-faint mt-1">For {hire.freelancerId?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--surface-strong)] transition-colors">
            <X size={18} className="text-ink-soft" />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form id="review-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center py-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star 
                      size={32} 
                      fill={(hoverRating || rating) >= star ? "currentColor" : "none"} 
                      className={`${(hoverRating || rating) >= star ? "text-yellow-400" : "text-ink-faint"} transition-colors`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-ink-soft mb-2 uppercase tracking-wider">Written Review (Optional)</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience working with this freelancer..."
                className="bb-input w-full rounded-xl px-4 py-3 text-sm min-h-[100px]"
              />
            </div>
          </form>
        </div>
        
        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm hover:bg-[var(--surface-strong)] transition-colors">
            Cancel
          </button>
          <button 
            type="submit"
            form="review-form"
            disabled={submitting}
            className="bb-btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>

      </div>
    </div>
  );
}
