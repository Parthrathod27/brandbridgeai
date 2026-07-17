import BrandDashboard from "@/components/dashboard/brand/BrandDashboard";

export default function MatchesPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h1 className="bb-display text-2xl font-semibold sm:text-3xl">
          AI Brand Matching
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Discover compatible brand partners with AI.
        </p>
      </div>
      <BrandDashboard standaloneMatches={true} />
    </div>
  );
}
