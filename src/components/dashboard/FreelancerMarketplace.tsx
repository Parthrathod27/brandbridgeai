"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { UserPlus, Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "./PageHeader";
import FreelancerCard from "./FreelancerCard";
import EmptyState from "./EmptyState";
import HireFormModal from "./HireFormModal";
import FreelancerDetailModal from "./FreelancerDetailModal";
import type { UserRole } from "@/lib/roles";
import type { FreelancerItem } from "@/lib/dashboard-types";

interface FreelancerMarketplaceProps {
  role: UserRole;
  title?: string;
  subtitle?: string;
}

function FreelancerMarketplaceContent({
  role,
  title = "Browse Freelancers",
  subtitle = "Find creative professionals for your campaigns",
}: FreelancerMarketplaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [freelancers, setFreelancers] = useState<FreelancerItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerItem | null>(null);
  const [hiringFreelancer, setHiringFreelancer] = useState<FreelancerItem | null>(null);

  // Filter state
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "rating_desc">("newest");
  const [showFilters, setShowFilters] = useState(false);

  function load() {
    fetch("/api/freelancers")
      .then((r) => r.json())
      .then((d) => setFreelancers(d.freelancers ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(freelancerId: string, saved: boolean) {
    if (saved) {
      await fetch(`/api/saved-freelancers?freelancerId=${freelancerId}`, { method: "DELETE" });
    } else {
      await fetch("/api/saved-freelancers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerId }),
      });
    }
    load(); // Refresh state
  }

  async function handleMessage(recipientId: string) {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId, text: "Hi! I'd like to discuss a project." }),
    });
    router.push(`/dashboard/${role}/messages`);
  }

  const categories = useMemo(() => {
    const cats = new Set<string>();
    freelancers.forEach((f) => {
      f.freelancerProfile?.categories?.forEach((c) => cats.add(c));
    });
    return Array.from(cats);
  }, [freelancers]);

  const filteredFreelancers = useMemo(() => {
    let result = freelancers;

    // Filter out truly incomplete profiles (api should do this, but double check)
    result = result.filter(f => f.freelancerProfile && f.freelancerProfile.hourlyRate != null);

    // Tab Filter
    if (activeTab === "saved") {
      result = result.filter(f => f.saved);
    }

    // Category
    if (category) {
      result = result.filter(f => f.freelancerProfile?.categories?.includes(category));
    }

    // Search query (name or skills)
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(f => {
        const nameMatch = f.user?.name?.toLowerCase().includes(q);
        const skillMatch = f.freelancerProfile?.skills?.some(s => s.toLowerCase().includes(q));
        const categoryMatch = f.freelancerProfile?.categories?.some(c => c.toLowerCase().includes(q));
        return nameMatch || skillMatch || categoryMatch;
      });
    }

    // Price
    if (minPrice) {
      result = result.filter(f => (f.freelancerProfile?.hourlyRate || 0) >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter(f => (f.freelancerProfile?.hourlyRate || 0) <= Number(maxPrice));
    }

    // Rating
    if (minRating) {
      result = result.filter(f => (f.freelancerProfile?.rating || 0) >= Number(minRating));
    }

    // Sorting
    result = [...result].sort((a, b) => {
      const rateA = a.freelancerProfile?.hourlyRate || 0;
      const rateB = b.freelancerProfile?.hourlyRate || 0;
      const ratingA = a.freelancerProfile?.rating || 0;
      const ratingB = b.freelancerProfile?.rating || 0;

      if (sortBy === "price_asc") return rateA - rateB;
      if (sortBy === "price_desc") return rateB - rateA;
      if (sortBy === "rating_desc") return ratingB - ratingA;
      return 0; // "newest" defaults to DB order since we don't have createdAt on FreelancerItem populated easily
    });

    return result;
  }, [freelancers, activeTab, category, query, minPrice, maxPrice, minRating, sortBy]);

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      
      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === "all" ? "bg-purple-500/20 text-purple-300" : "text-white/60 hover:text-white"}`}
        >
          All Freelancers
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === "saved" ? "bg-purple-500/20 text-purple-300" : "text-white/60 hover:text-white"}`}
        >
          Saved
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              placeholder="Search by name, skill, or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bb-input w-full pl-9 rounded-xl py-2.5 text-sm"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm transition-colors ${showFilters ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}
            >
              <Filter size={16} /> Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bb-input flex-1 sm:flex-none rounded-xl px-4 py-2.5 text-sm appearance-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Extended Filters Panel */}
        {showFilters && (
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in">
            <div>
              <label className="block text-xs text-white/40 uppercase mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bb-input w-full rounded-xl px-3 py-2 text-sm appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-white/40 uppercase mb-1.5">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="bb-input w-full rounded-xl px-3 py-2 text-sm appearance-none"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4.0+ Stars</option>
                <option value="3">3.0+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/40 uppercase mb-1.5">Min Price ($/hr)</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bb-input w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-white/40 uppercase mb-1.5">Max Price ($/hr)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bb-input w-full rounded-xl px-3 py-2 text-sm"
                />
                {(query || category || minPrice || maxPrice || minRating) && (
                  <button 
                    onClick={clearFilters}
                    className="p-2 shrink-0 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    title="Clear filters"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-white/50 animate-pulse">Loading marketplace...</div>
      ) : filteredFreelancers.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No freelancers found"
          description={activeTab === "saved" ? "You haven't saved any freelancers yet." : "Try adjusting your search or filters."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredFreelancers.map((f) => (
            <FreelancerCard
              key={f.user?._id}
              name={f.user?.name ?? "Freelancer"}
              avatar={f.profile?.avatar}
              skills={f.freelancerProfile?.skills}
              categories={f.freelancerProfile?.categories}
              hourlyRate={f.freelancerProfile?.hourlyRate}
              rating={f.freelancerProfile?.rating}
              portfolio={f.portfolio}
              saved={f.saved}
              onTagClick={(tag) => {
                setQuery(tag);
              }}
              onViewProfile={() => setSelectedFreelancer(f)}
              onHire={() => setHiringFreelancer(f)}
              onSave={() => handleSave(f.user!._id, !!f.saved)}
              onMessage={() => handleMessage(f.user!._id)}
            />
          ))}
        </div>
      )}

      {selectedFreelancer && (
        <FreelancerDetailModal 
          freelancer={selectedFreelancer}
          onClose={() => setSelectedFreelancer(null)}
          onHire={() => setHiringFreelancer(selectedFreelancer)}
          onMessage={() => {
            setSelectedFreelancer(null);
            handleMessage(selectedFreelancer.user!._id);
          }}
        />
      )}

      {hiringFreelancer && (
        <HireFormModal 
          freelancer={hiringFreelancer}
          onClose={() => setHiringFreelancer(null)}
          onSuccess={() => {
            setHiringFreelancer(null);
            router.push(`/dashboard/${role}/hires`);
          }}
        />
      )}

    </div>
  );
}

export default function FreelancerMarketplace(props: FreelancerMarketplaceProps) {
  return (
    <Suspense fallback={<div className="text-white/50 animate-pulse">Loading...</div>}>
      <FreelancerMarketplaceContent {...props} />
    </Suspense>
  );
}
