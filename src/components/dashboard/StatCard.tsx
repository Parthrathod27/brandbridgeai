import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface StatCardConfig {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href: string;
  emptyMessage?: string;
  emptyCta?: string;
}

interface StatCardProps extends StatCardConfig {}

function isEmptyValue(value: number | string): boolean {
  if (typeof value === "number") return value === 0;
  const n = parseFloat(value.replace(/[^0-9.-]/g, ""));
  return isNaN(n) || n === 0;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  href,
  emptyMessage,
  emptyCta,
}: StatCardProps) {
  const isEmpty = isEmptyValue(value);
  const display = typeof value === "number" ? String(value) : value;

  const className =
    "bb-glass bb-card-interactive block rounded-2xl p-5 transition-all duration-200";

  const inner = (
    <>
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200"
        style={{ background: "rgba(139,92,246,0.18)" }}
      >
        <Icon size={18} className="text-purple-200" />
      </div>

      {isEmpty && emptyMessage ? (
        <p className="mt-4 text-sm text-white/55">{emptyMessage}</p>
      ) : (
        <>
          <div className="bb-display mt-4 text-2xl font-semibold">{display}</div>
          <div className="mt-1 text-xs text-white/45">{label}</div>
        </>
      )}
    </>
  );

  if (isEmpty && emptyCta) {
    return (
      <div className={className}>
        <div className="text-xs text-white/45">{label}</div>
        {inner}
        <Link
          href={href}
          className="bb-btn-primary mt-3 inline-block rounded-xl px-3 py-1.5 text-xs font-medium"
        >
          {emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
