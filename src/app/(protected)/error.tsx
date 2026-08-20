"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, LayoutDashboard } from "lucide-react";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BrandBridge] Dashboard error:", error);
  }, [error]);

  // Rendered inside the dashboard shell, so the sidebar and header stay usable.
  return (
    <div className="bb-glass flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "rgba(239,68,68,0.15)" }}
      >
        <AlertTriangle size={24} className="text-red-400" />
      </div>

      <h2 className="bb-display text-lg font-medium">
        This section could not be loaded
      </h2>
      <p className="mt-2 max-w-sm text-sm text-ink-faint">
        The request failed or timed out. Your account and data are unaffected —
        retrying usually works.
      </p>

      {error.digest && (
        <p className="bb-mono mt-4 rounded-xl bg-[var(--surface-strong)] px-3 py-2 text-[11px] break-all text-ink-faint">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="bb-btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
        >
          <RotateCw size={16} /> Retry
        </button>
        <Link
          href="/dashboard"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-ink-soft transition hover:bg-[var(--surface-strong)] hover:text-ink"
        >
          <LayoutDashboard size={16} /> Dashboard
        </Link>
      </div>
    </div>
  );
}
