"use client";

import { DollarSign, Clock, CheckCircle, Wallet } from "lucide-react";

interface EarningsOverviewCardProps {
  total: number;
  pending: number;
  active: number;
  completed: number;
}

export default function EarningsOverviewCard({
  total,
  pending,
  active,
  completed,
}: EarningsOverviewCardProps) {
  const items = [
    { label: "Total Earned", value: total, icon: Wallet },
    { label: "Pending Requests", value: pending, icon: Clock },
    { label: "Active Projects", value: active, icon: DollarSign },
    { label: "Completed Jobs", value: completed, icon: CheckCircle },
  ];

  return (
    <div className="bb-glass bb-card-interactive rounded-2xl p-5 transition-all duration-200">
      <h3 className="bb-display text-sm font-medium">Earnings Overview</h3>
      <p className="mt-1 text-xs text-ink-faint">Your project income at a glance</p>
      <div className="mt-4 space-y-3">
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-ink-soft">
              <Icon size={14} className="text-purple" />
              {label}
            </div>
            <span className="text-sm font-medium">
              {label === "Pending Requests" || label === "Active Projects" || label === "Completed Jobs"
                ? value
                : `$${value.toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
