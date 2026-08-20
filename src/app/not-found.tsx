import Link from "next/link";
import { Compass, Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bb-page flex min-h-screen items-center justify-center px-5 py-10">
      <div className="bb-glass w-full max-w-md rounded-3xl p-6 text-center sm:p-8">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(139,92,246,0.15)" }}
        >
          <Compass size={26} className="text-purple" />
        </div>

        <div className="bb-display bb-grad-text text-4xl font-semibold sm:text-5xl">
          404
        </div>
        <h1 className="bb-display mt-2 text-lg font-semibold sm:text-xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          The link may be outdated, or the collaboration you were looking for
          has moved.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="bb-btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-ink-soft transition hover:bg-[var(--surface-strong)] hover:text-ink"
          >
            <Home size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
