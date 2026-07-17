"use client";

import { Wallet, ArrowUpRight, Clock } from "lucide-react";

interface EscrowOverviewProps {
  inEscrow: number;
  released: number;
  pending: number;
}

export default function EscrowOverviewCard({
  inEscrow,
  released,
  pending,
}: EscrowOverviewProps) {
  const items = [
    { label: "Funds in Escrow", value: inEscrow, icon: Wallet },
    { label: "Funds Released", value: released, icon: ArrowUpRight },
    { label: "Pending Payments", value: pending, icon: Clock },
  ];

  return (
    <div className="bb-glass bb-card-interactive rounded-2xl p-5 transition-all duration-200">
      <h3 className="bb-display text-sm font-medium">Campaign Spend Overview</h3>
      <p className="mt-1 text-xs text-ink-faint">Escrow & payment tracking (coming soon)</p>
      <div className="mt-4 space-y-3">
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-ink-soft">
              <Icon size={14} className="text-purple" />
              {label}
            </div>
            <span className="text-sm font-medium">${value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
