"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BrandBridge] Unhandled error:", error);
  }, [error]);

  return (
    <div className="bb-page flex min-h-screen items-center justify-center px-5 py-10">
      <div className="bb-glass w-full max-w-md rounded-3xl p-6 text-center sm:p-8">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(239,68,68,0.15)" }}
        >
          <AlertTriangle size={26} className="text-red-400" />
        </div>

        <h1 className="bb-display text-xl font-semibold sm:text-2xl">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          An unexpected error interrupted this page. You can retry, or head back
          to the dashboard.
        </p>

        {error.digest && (
          <p className="bb-mono mt-4 rounded-xl bg-[var(--surface-strong)] px-3 py-2 text-[11px] break-all text-ink-faint">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="bb-btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            <RotateCw size={16} /> Try again
          </button>
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-ink-soft transition hover:bg-[var(--surface-strong)] hover:text-ink"
          >
            <Home size={16} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
