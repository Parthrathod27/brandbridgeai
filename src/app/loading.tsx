import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="bb-page flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-purple" size={28} />
        <span className="text-xs text-ink-faint">Loading…</span>
      </div>
    </div>
  );
}
