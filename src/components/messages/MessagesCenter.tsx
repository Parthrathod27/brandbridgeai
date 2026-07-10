"use client";

import React, { useState, useEffect } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import ContextPanel from "./ContextPanel";
import { UserRole } from "@/models/types";

interface MessagesCenterProps {
  role: UserRole;
}

export default function MessagesCenter({ role }: MessagesCenterProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // For mobile layout flow
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?._id) setCurrentUserId(d.user._id);
      });
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowChatOnMobile(true);
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
    setActiveConversationId(null);
  };

  const activeConversation = conversations.find(c => c._id === activeConversationId);

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#0A0A0B] text-white">
      {/* Left Panel: Conversation List */}
      <div 
        className={`${showChatOnMobile ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col border-r border-white/10`}
      >
        <ConversationList 
          conversations={conversations} 
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          isLoading={isLoading}
          role={role}
        />
      </div>

      {/* Center Panel: Chat Window */}
      <div 
        className={`${showChatOnMobile ? "flex" : "hidden md:flex"} flex-1 flex-col relative`}
      >
        {activeConversation ? (
          <ChatWindow 
            conversation={activeConversation}
            role={role}
            currentUserId={currentUserId}
            onBack={handleBackToList}
            onToggleContext={() => setIsContextPanelOpen(!isContextPanelOpen)}
            onRefresh={fetchConversations}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-[#6C5CE7]/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#6C5CE7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
            <p className="text-gray-400 max-w-sm mb-6">
              Select a conversation from the left to start collaborating, or explore new connections.
            </p>
            <button className="px-6 py-2 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-full font-medium transition-colors">
              {role === "brand" ? "Explore AI Matches" : "Browse Projects"}
            </button>
          </div>
        )}
      </div>

      {/* Right Panel: Context Panel */}
      {activeConversation && isContextPanelOpen && (
        <div className="w-80 border-l border-white/10 hidden lg:flex flex-col bg-[#0F0F12]">
          <ContextPanel 
            conversation={activeConversation} 
            role={role} 
            onClose={() => setIsContextPanelOpen(false)}
          />
        </div>
      )}

      {/* Mobile Context Panel (Bottom Sheet) */}
      {activeConversation && isContextPanelOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsContextPanelOpen(false)} />
          <div className="bg-[#0F0F12] w-full max-h-[80vh] rounded-t-2xl relative flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Details</h3>
              <button onClick={() => setIsContextPanelOpen(false)} className="text-gray-400 p-2">
                Close
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <ContextPanel 
                conversation={activeConversation} 
                role={role} 
                onClose={() => setIsContextPanelOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
