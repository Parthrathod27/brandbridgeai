"use client";

import { useState, useEffect } from "react";
import { Handshake } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import CollaborationCard from "@/components/dashboard/CollaborationCard";
import EmptyState from "@/components/dashboard/EmptyState";
import type { CollaborationItem } from "@/lib/dashboard-types";

export default function BrandCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/collaborations")
      .then((r) => r.json())
      .then((collabData) => {
        setCollaborations(collabData.collaborations ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/collaborations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title="Collaborations" subtitle="Manage brand partnership requests" />
      {collaborations.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No collaborations yet"
          description="Use AI Brand Matching to find partners and send collaboration requests."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {collaborations.map((c) => (
              <CollaborationCard
                key={c._id}
                partnerName={c.partnerName ?? "Unknown brand"}
                status={c.status}
                message={c.message}
                proposal={c.proposal}
                compatibilityScore={c.compatibilityScore}
                isIncoming={c.isIncoming}
                onAccept={c.isIncoming && c.status === "pending" ? () => updateStatus(c._id, "accepted") : undefined}
                onDecline={c.isIncoming && c.status === "pending" ? () => updateStatus(c._id, "declined") : undefined}
              />
          ))}
        </div>
      )}
    </div>
  );
}
