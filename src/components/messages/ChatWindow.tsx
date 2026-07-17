import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { UserRole } from "@/models/types";
import AiAssistance from "./AiAssistance";

interface ChatWindowProps {
  conversation: any;
  role: UserRole;
  currentUserId: string;
  onBack: () => void;
  onToggleContext: () => void;
  onRefresh: () => void;
  onConversationCreated?: (newId: string) => void;
}

export default function ChatWindow({ conversation, role, currentUserId, onBack, onToggleContext, onRefresh, onConversationCreated }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (conversation?._id && !conversation.isTemp) {
      fetchMessages(conversation._id);
    } else {
      setMessages([]);
      setIsLoading(false);
    }
  }, [conversation?._id, conversation?.isTemp]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/messages?conversationId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.isTemp ? undefined : conversation._id,
          recipientId: conversation.isTemp ? conversation.otherUser?._id : undefined,
          text: newMessage || " ", // Fallback text in case it's just an attachment
          attachments,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        setAttachments([]);
        if (conversation.isTemp && onConversationCreated && data.conversationId) {
          onConversationCreated(data.conversationId);
        } else {
          onRefresh();
        }
      } else {
        setToast(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message", error);
      setToast("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", e.target.files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setAttachments(prev => [...prev, data.url]);
      } else {
        setToast("Failed to upload file");
      }
    } catch (err) {
      setToast("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleArchive = async () => {
    if (isArchiving) return;
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/conversations/${conversation._id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unarchive: conversation.isArchived }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        setToast("Failed to update archive status");
      }
    } catch (err) {
      setToast("Failed to update archive status");
    } finally {
      setIsArchiving(false);
    }
  };

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const handleMessageAction = async (msgId: string, action: "edit" | "delete" | "react", payload?: any) => {
    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      if (res.ok) {
        if (action === "edit") {
          setEditingMessageId(null);
          setEditingText("");
        }
        fetchMessages(conversation._id);
      } else {
        const data = await res.json();
        setToast(data.error || `Failed to ${action} message`);
      }
    } catch (err) {
      setToast(`Failed to ${action} message`);
    }
  };

  const handleBlock = async () => {
    if (isBlocking || !conversation.otherUser?._id) return;
    setIsBlocking(true);
    try {
      const res = await fetch(`/api/users/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIdToBlock: conversation.otherUser._id,
          unblock: conversation.isBlocked
        }),
      });
      if (res.ok) {
        onRefresh();
        setBlockModalOpen(false);
      } else {
        setToast("Failed to update block status");
      }
    } catch (err) {
      setToast("Failed to update block status");
    } finally {
      setIsBlocking(false);
    }
  };

  const showSummary = (summary: string) => {
    setSummaries(prev => ({ ...prev, [conversation._id]: summary }));
    setSummaryModalOpen(true);
  };

  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-surface">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-ink-soft hover:text-ink p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative">
            {conversation.otherUser?.image ? (
              <Image
                src={conversation.otherUser.image}
                alt={conversation.otherUser.name || "User"}
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
            ) : (
              <div className="w-10 h-10 bg-surface-strong rounded-full flex items-center justify-center text-lg font-medium">
                {conversation.otherUser?.name?.charAt(0) || "?"}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0F0F12] rounded-full" />
          </div>

          <div>
            <h3 className="font-semibold text-lg leading-tight">{conversation.otherUser?.name || "User"}</h3>
            <div className="flex items-center gap-1 text-xs text-purple">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Info toggle for mobile/tablet */}
          <button
            onClick={onToggleContext}
            className="p-2 text-ink-soft hover:text-ink rounded-full hover:bg-[var(--surface-strong)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Overflow Menu */}
          <div className="relative group">
            <button className="p-2 text-ink-soft hover:text-ink rounded-full hover:bg-[var(--surface-strong)] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-strong border border-[var(--border)] rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50 overflow-hidden text-sm">
              <button onClick={handleArchive} className="w-full text-left px-4 py-2 hover:bg-[var(--surface-strong)] transition-colors">
                {conversation.isArchived ? "Unarchive Conversation" : "Archive Conversation"}
              </button>
              <button
                onClick={() => {
                  if (conversation.isBlocked) handleBlock(); // directly unblock
                  else setBlockModalOpen(true); // confirm block
                }}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                {conversation.isBlocked ? "Unblock User" : "Block User"}
              </button>
              <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors">Report...</button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#FF4757]/90 text-ink px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Summary Modal */}
      {summaryModalOpen && (
        <div className="absolute inset-0 z-50 bg-[var(--bg)]/80 flex items-center justify-center p-4">
          <div className="bg-surface-strong border border-[var(--border)] rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-lg font-semibold mb-4 text-[#D1C4FF]">Conversation Summary</h3>
            <p className="text-ink whitespace-pre-wrap text-sm leading-relaxed mb-6">
              {summaries[conversation._id] || "No summary available."}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setSummaryModalOpen(false)}
                className="px-4 py-2 bg-[var(--surface-strong)] hover:bg-[var(--surface-strong)] border border-[var(--border)] rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockModalOpen && (
        <div className="absolute inset-0 z-50 bg-[var(--bg)]/80 flex items-center justify-center p-4">
          <div className="bg-surface-strong border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 relative">
            <h3 className="text-lg font-semibold mb-2">Block {conversation.otherUser?.name}?</h3>
            <p className="text-ink-soft text-sm mb-6">
              Are you sure you want to block this user? They won't be able to message you.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBlockModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={isBlocking}
                className="px-4 py-2 bg-[#FF4757] hover:bg-[#FF4757]/80 text-ink rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isBlocking ? "Blocking..." : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-ink">
            <p>No messages yet. Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId?._id
              ? msg.senderId._id !== conversation.otherUser?._id
              : msg.senderId !== conversation.otherUser?._id;

            return (
              <div key={msg._id || idx} className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}>
                {msg.isDeleted ? (
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 italic text-ink bg-[var(--surface-strong)] border border-[var(--border)]`}>
                    This message was unsent.
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Action Menu for ME */}
                    {isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={() => { setEditingMessageId(msg._id); setEditingText(msg.text); }}
                          className="p-1.5 text-ink-soft hover:text-ink bg-[var(--surface-strong)] rounded-full"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { if (confirm("Unsend message?")) handleMessageAction(msg._id, "delete") }}
                          className="p-1.5 text-ink-soft hover:text-red-400 bg-[var(--surface-strong)] rounded-full"
                          title="Unsend"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="relative flex flex-col">
                      <div className={`max-w-xs sm:max-w-md md:max-w-[75%] rounded-2xl px-4 py-2 relative ${isMe
                          ? "bg-purple text-ink rounded-br-sm"
                          : "bg-surface-strong text-ink rounded-bl-sm border border-[var(--border)]"
                        }`}>
                        {editingMessageId === msg._id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              className="bg-[var(--bg)]/20 rounded p-2 text-sm w-full outline-none resize-none min-w-[200px]"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingMessageId(null)} className="text-[10px] uppercase tracking-wider">Cancel</button>
                              <button onClick={() => handleMessageAction(msg._id, "edit", { text: editingText })} className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {msg.text && msg.text.trim() && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {msg.attachments.map((url: string, i: number) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                    <img src={url} alt="attachment" className="max-w-[200px] max-h-[200px] object-cover rounded-lg border border-[var(--border)]" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Reactions Overlay Menu Trigger */}
                      {!isMe && !editingMessageId && (
                        <div className="absolute top-1/2 -translate-y-1/2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="relative group/react">
                            <button className="p-1.5 text-ink-soft hover:text-ink bg-[var(--surface-strong)] rounded-full">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/react:flex bg-surface-strong border border-[var(--border)] rounded-full shadow-lg p-1 gap-1 z-10">
                              {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleMessageAction(msg._id, "react", { emoji })}
                                  className="hover:scale-125 transition-transform text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`absolute -bottom-3 flex gap-1 ${isMe ? 'right-2' : 'left-2'}`}>
                          {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map((emoji) => {
                            const count = msg.reactions.filter((r: any) => r.emoji === emoji).length;
                            const didIReact = msg.reactions.some((r: any) => r.emoji === emoji && r.userId === currentUserId);
                            return (
                              <button
                                key={emoji as string}
                                onClick={() => handleMessageAction(msg._id, "react", { emoji })}
                                className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${didIReact ? 'bg-purple/20 border-purple/50' : 'bg-surface-strong border-[var(--border)]'} shadow-sm`}
                              >
                                <span>{emoji as string}</span>
                                {count > 1 && <span className="text-ink-soft">{count}</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  </div>
                )}

                <div className={`flex items-center gap-1 mt-1.5 text-[10px] text-ink ${msg.reactions?.length > 0 ? 'mt-4' : ''}`}>
                  <span>{format(new Date(msg.createdAt), "h:mm a")}</span>
                  {msg.isEdited && <span>(edited)</span>}
                  {isMe && !msg.isDeleted && (
                    msg.readAt ? (
                      <span className="text-purple ml-1">Seen</span>
                    ) : (
                      <span className="ml-1">Sent</span>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Assistance and Input Area */}
      <div className="p-4 border-t border-[var(--border)] bg-surface">
        {!conversation.isBlocked && !conversation.blockedByOther && (
          <AiAssistance
            messages={messages}
            role={role}
            currentUserId={currentUserId}
            currentInput={newMessage}
            onDraft={(text) => setNewMessage(text)}
            onSend={(text) => {
              setNewMessage(text);
              // using a timeout so state updates, then trigger send
              setTimeout(() => {
                const form = document.getElementById("chat-form") as HTMLFormElement;
                if (form) form.requestSubmit();
              }, 50);
            }}
            onSummary={(sum) => showSummary(sum)}
            onError={(err) => setToast(err)}
          />
        )}

        <form id="chat-form" onSubmit={handleSendMessage} className="mt-3 flex flex-col gap-2 relative">

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2">
              {attachments.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt="attachment" className="h-16 w-16 object-cover rounded-xl border border-[var(--border)]" />
                  <button
                    type="button"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || conversation.isBlocked || conversation.blockedByOther}
              className="p-2 text-ink-soft hover:text-ink bg-surface-strong hover:bg-[var(--surface-strong)] rounded-xl transition-colors shrink-0 h-10 disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>

            <div className="flex-1 bg-surface-strong border border-[var(--border)] rounded-xl overflow-hidden focus-within:border-purple transition-colors">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={conversation.isBlocked || conversation.blockedByOther}
                placeholder={
                  conversation.isBlocked
                    ? "You have blocked this user."
                    : conversation.blockedByOther
                      ? "You have been blocked by this user."
                      : "Type a message..."
                }
                className="w-full max-h-32 bg-transparent resize-none outline-none p-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
              />
            </div>

            <button
              type="submit"
              disabled={(!newMessage.trim() && attachments.length === 0) || isSending || conversation.isBlocked || conversation.blockedByOther}
              className="bg-purple hover:bg-purple text-ink p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-10 w-10 flex items-center justify-center"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
