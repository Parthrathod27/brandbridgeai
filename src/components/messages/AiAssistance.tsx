import React, { useState, useEffect } from "react";
import { UserRole } from "@/models/types";

interface AiAssistanceProps {
  messages: any[];
  role: UserRole;
  currentUserId: string;
  currentInput: string;
  onDraft: (text: string) => void;
  onSend: (text: string) => void;
  onSummary: (summary: string) => void;
  onError: (error: string) => void;
}

export default function AiAssistance({ messages, role, currentUserId, currentInput, onDraft, onSend, onSummary, onError }: AiAssistanceProps) {
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);


  const handleGenerateReplies = async (msgsToUse = messages) => {
    setIsGeneratingReplies(true);
    try {
      const res = await fetch("/api/ai/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "smart_reply",
          role,
          messages: msgsToUse.slice(-5),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSmartReplies(data.replies || []);
      }
    } catch (err) {
      console.error(err);
      setSmartReplies([]);
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    
    // Clear replies if I sent the last message
    const isMe = lastMsg.senderId?._id 
      ? lastMsg.senderId._id === currentUserId
      : lastMsg.senderId === currentUserId;

    if (isMe) {
      setSmartReplies([]);
      return;
    }

    // Only auto-generate if it's a new message from the other user
    if (lastMsg._id && lastMsg._id !== lastMessageId) {
      setLastMessageId(lastMsg._id);
      handleGenerateReplies(messages);
    }
  }, [messages, currentUserId, lastMessageId]);

  const handleDraftProfessional = async () => {
    if (!currentInput.trim()) {
      onError("Type a rough draft first");
      return;
    }
    setIsDrafting(true);
    try {
      const res = await fetch("/api/ai/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "draft_reply",
          role,
          notes: currentInput,
          messages: messages.slice(-5),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onDraft(data.draft || "");
      } else {
        onError("Couldn't generate a draft — please try again.");
      }
    } catch (err) {
      console.error(err);
      onError("Couldn't generate a draft — please try again.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSummarize = async () => {
    if (messages.length < 3) {
      onError("Not enough messages to summarize yet.");
      return;
    }
    setIsSummarizing(true);
    try {
      const res = await fetch("/api/ai/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          role,
          messages,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onSummary(data.summary || "");
      } else {
        onError("Failed to generate summary.");
      }
    } catch (err) {
      console.error(err);
      onError("Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // We only show AI features if there are messages
  if (messages.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Smart Replies Output */}
      {(smartReplies.length > 0 || isGeneratingReplies) && (
        <div className="flex flex-wrap gap-2 mt-1">
          {isGeneratingReplies ? (
            <>
              <div className="h-8 w-24 bg-[var(--surface-strong)] animate-pulse rounded-lg" />
              <div className="h-8 w-32 bg-[var(--surface-strong)] animate-pulse rounded-lg" />
            </>
          ) : (
            <>
              {smartReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSend(reply);
                  }}
                  className="px-3 py-1.5 bg-purple/10 hover:bg-purple/20 border border-purple/30 rounded-lg text-sm text-left transition-colors"
                >
                  {reply}
                </button>
              ))}
              <button onClick={() => setSmartReplies([])} className="p-1.5 text-ink hover:text-ink">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button 
          onClick={handleDraftProfessional}
          disabled={isDrafting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-strong)] hover:bg-[var(--surface-strong)] border border-[var(--border)] rounded-full text-xs font-medium whitespace-nowrap transition-all disabled:opacity-50"
        >
          {isDrafting ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )}
          Draft Professional
        </button>
        <button 
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-strong)] hover:bg-[var(--surface-strong)] border border-[var(--border)] rounded-full text-xs font-medium whitespace-nowrap transition-all disabled:opacity-50"
        >
          {isSummarizing ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          )}
          Summarize
        </button>
      </div>
    </div>
  );
}
