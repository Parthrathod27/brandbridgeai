import React, { useState, useMemo } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { UserRole } from "@/models/types";

interface ConversationListProps {
  conversations: any[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  role: UserRole;
}

type FilterTab = "All" | "Unread" | "Requests" | "Hires" | "Archived";

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  isLoading,
  role,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const tabs: FilterTab[] = ["All", "Unread", "Requests", "Hires", "Archived"];

  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Filter by tab
    if (activeTab === "Unread") {
      result = result.filter(c => c.unreadCount && c.unreadCount > 0);
    } else if (activeTab === "Requests") {
      result = result.filter(c => 
        c.relatedEntityType === "collaboration" || 
        c.relatedEntityType === "product_promotion"
      );
    } else if (activeTab === "Hires") {
      result = result.filter(c => c.relatedEntityType === "freelancer_hire");
    } else if (activeTab === "Archived") {
      result = result.filter(c => c.isArchived);
    } else {
      result = result.filter(c => !c.isArchived); // 'All' usually excludes archived
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.otherUser?.name?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    }

    // Sort: pinned first, then by last message time
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime();
    });
  }, [conversations, activeTab, searchQuery]);

  const getContextTagLabel = (type: string) => {
    if (role === "brand") {
      if (type === "collaboration") return "Collaboration Request";
      if (type === "freelancer_hire") return "Freelancer Hire";
      if (type === "product_promotion") return "Product Owner Inquiry";
    }
    if (role === "freelancer") {
      if (type === "freelancer_hire") return "Hire Offer";
      return "Project Discussion";
    }
    if (role === "product_owner") {
      if (type === "product_promotion") return "Brand Outreach";
      return "Collaboration";
    }
    return "Message";
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0B]">
      {/* Header & Search */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="relative">
          <svg
            className="w-5 h-5 absolute left-3 top-2.5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#6C5CE7] transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto p-2 gap-2 border-b border-white/10 shrink-0 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-[#6C5CE7] text-white"
                : "bg-[#1A1A1D] text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // Skeleton loaders
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-white/5 flex gap-3 animate-pulse">
              <div className="w-12 h-12 bg-white/10 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => onSelect(conv._id)}
              className={`w-full text-left p-4 border-b border-white/5 flex gap-3 transition-colors hover:bg-white/5 relative ${
                activeId === conv._id ? "bg-[#1A1A1D]" : ""
              }`}
            >
              <div className="relative shrink-0">
                {conv.otherUser?.image ? (
                  <Image
                    src={conv.otherUser.image}
                    alt={conv.otherUser.name || "User"}
                    width={48}
                    height={48}
                    className="rounded-full object-cover w-12 h-12"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#2D2D35] rounded-full flex items-center justify-center text-lg font-medium">
                    {conv.otherUser?.name?.charAt(0) || "?"}
                  </div>
                )}
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0A0A0B]" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium truncate pr-2">{conv.otherUser?.name || "Unknown User"}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }) : ""}
                  </span>
                </div>
                
                <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-white font-medium" : "text-gray-400"}`}>
                  {conv.lastMessage || "No messages yet"}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  {conv.relatedEntityType && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-gray-300 font-medium">
                      {getContextTagLabel(conv.relatedEntityType)}
                    </span>
                  )}
                  {conv.isPinned && (
                    <svg className="w-3 h-3 text-[#6C5CE7]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
