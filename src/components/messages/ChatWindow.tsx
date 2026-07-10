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
}

export default function ChatWindow({ conversation, role, currentUserId, onBack, onToggleContext, onRefresh }: ChatWindowProps) {
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
    if (conversation?._id) {
      fetchMessages(conversation._id);
    }
  }, [conversation?._id]);

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
          conversationId: conversation._id,
          text: newMessage || " ", // Fallback text in case it's just an attachment
          attachments,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        setAttachments([]);
        onRefresh();
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
    <div className="flex flex-col h-full bg-[#0A0A0B]">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0F0F12]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white p-1">
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
              <div className="w-10 h-10 bg-[#2D2D35] rounded-full flex items-center justify-center text-lg font-medium">
                {conversation.otherUser?.name?.charAt(0) || "?"}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0F0F12] rounded-full" />
          </div>
          
          <div>
            <h3 className="font-semibold text-lg leading-tight">{conversation.otherUser?.name || "User"}</h3>
            <div className="flex items-center gap-1 text-xs text-[#6C5CE7]">
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
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {/* Overflow Menu */}
          <div className="relative group">
            <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#1A1A1D] border border-white/10 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50 overflow-hidden text-sm">
              <button onClick={handleArchive} className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors">
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
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#FF4757]/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Summary Modal */}
      {summaryModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1D] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-lg font-semibold mb-4 text-[#D1C4FF]">Conversation Summary</h3>
            <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed mb-6">
              {summaries[conversation._id] || "No summary available."}
            </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setSummaryModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1D] border border-white/10 rounded-2xl w-full max-w-sm p-6 relative">
            <h3 className="text-lg font-semibold mb-2">Block {conversation.otherUser?.name}?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to block this user? They won't be able to message you.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setBlockModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleBlock}
                disabled={isBlocking}
                className="px-4 py-2 bg-[#FF4757] hover:bg-[#FF4757]/80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet. Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId?._id 
              ? msg.senderId._id !== conversation.otherUser?._id
              : msg.senderId !== conversation.otherUser?._id;

            return (
              <div key={msg._id || idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe 
                    ? "bg-[#6C5CE7] text-white rounded-br-sm" 
                    : "bg-[#1A1A1D] text-gray-200 rounded-bl-sm border border-white/5"
                }`}>
                  {msg.text && msg.text.trim() && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.attachments.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={url} alt="attachment" className="max-w-[200px] max-h-[200px] object-cover rounded-lg border border-white/20" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                  <span>{format(new Date(msg.createdAt), "h:mm a")}</span>
                  {isMe && (
                    msg.readAt ? (
                      <span className="text-[#6C5CE7]">Seen</span>
                    ) : (
                      <span>Sent</span>
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
      <div className="p-4 border-t border-white/10 bg-[#0F0F12]">
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
                  <img src={url} alt="attachment" className="h-16 w-16 object-cover rounded-xl border border-white/10" />
                  <button 
                    type="button" 
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} 
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="p-2 text-gray-400 hover:text-white bg-[#1A1A1D] hover:bg-white/10 rounded-xl transition-colors shrink-0 h-10 disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>
          
          <div className="flex-1 bg-[#1A1A1D] border border-white/10 rounded-xl overflow-hidden focus-within:border-[#6C5CE7] transition-colors">
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
              className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-10 w-10 flex items-center justify-center"
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
