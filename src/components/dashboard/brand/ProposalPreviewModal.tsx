"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Send } from "lucide-react";

interface ProposalPreviewModalProps {
  open: boolean;
  loading: boolean;
  partnerName: string;
  proposal: string;
  emailDraft: string;
  onClose: () => void;
  onSend: (editedProposal: string) => void;
}

export default function ProposalPreviewModal({
  open,
  loading,
  partnerName,
  proposal,
  emailDraft,
  onClose,
  onSend,
}: ProposalPreviewModalProps) {
  const [edited, setEdited] = useState(proposal);
  const [tab, setTab] = useState<"proposal" | "email">("proposal");

  useEffect(() => {
    setEdited(proposal);
  }, [proposal]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bb-glass-strong relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl sm:max-w-xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="bb-display text-lg font-semibold">
            Collaboration Proposal — {partnerName}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-[var(--surface-strong)]">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="animate-spin text-purple" size={28} />
            <p className="mt-3 text-sm text-ink-faint">Generating AI proposal with Gemini...</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 border-b border-[var(--border)] px-6 pt-3">
              {(["proposal", "email"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 pb-3 text-xs capitalize transition ${
                    tab === t
                      ? "border-b-2 border-purple-500 text-purple"
                      : "text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  {t === "proposal" ? "Proposal" : "Email Draft"}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {tab === "proposal" ? (
                <textarea
                  value={edited}
                  onChange={(e) => setEdited(e.target.value)}
                  rows={12}
                  className="bb-input w-full resize-none text-sm leading-relaxed"
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-ink-soft">{emailDraft}</pre>
              )}
            </div>
            <div className="flex gap-3 border-t border-[var(--border)] px-6 py-4">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm text-ink-soft hover:bg-[var(--surface-strong)]"
              >
                Cancel
              </button>
              <button
                onClick={() => onSend(edited)}
                className="bb-btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
              >
                <Send size={16} />
                Send Request
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
