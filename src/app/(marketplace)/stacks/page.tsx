import { Suspense } from "react";
import { getPublishedEcosystemsFull } from "@/actions/ecosystems";
import { SuitesPageClient } from "@/components/ecosystems/SuitesPageClient";
import { BRAND_NAME } from "@/lib/branding";
import type { Metadata } from "next";
import type { SuiteCardData } from "@/types";

export const metadata: Metadata = {
  title: `Solution Suites | ${BRAND_NAME}`,
  description:
    "Curated suites of automation solutions that work better together. One team, one project, full results.",
  openGraph: {
    title: `Solution Suites | ${BRAND_NAME}`,
    description:
      "Curated suites of automation solutions that work better together.",
  },
};

export default function StacksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<SuitesPageSkeleton />}>
        <SuitesLoader />
      </Suspense>
    </div>
  );
}

async function SuitesLoader() {
  const ecosystems = (await getPublishedEcosystemsFull()) as unknown as SuiteCardData[];
  return <SuitesPageClient ecosystems={ecosystems} />;
}

/* ── Skeleton matching SuitesPageClient layout ─────────────────────────────── */

function SuitesPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-[260px] shrink-0 space-y-6">
        <div className="h-5 w-20 bg-muted rounded" />
        <div className="h-10 bg-muted rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded w-full" />
          ))}
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded w-3/4" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="h-9 w-48 bg-muted rounded-lg mb-3" />
            <div className="h-8 w-56 bg-muted rounded mb-1" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-28 bg-muted rounded-lg" />
            <div className="h-10 w-40 bg-muted rounded-md" />
          </div>
        </div>

        {/* Suite card skeletons */}
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SuiteCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SuiteCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Category + solution count badges */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="h-5 w-24 bg-muted rounded-full" />
          <div className="h-5 w-20 bg-muted rounded" />
        </div>

        {/* Title */}
        <div className="h-6 w-3/5 bg-muted rounded mb-3" />

        {/* Solution timeline dots */}
        <div className="flex items-center gap-0 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
                <div className="w-6 h-6 rounded-full bg-muted" />
                <div className="h-2 w-10 bg-muted rounded mt-1" />
              </div>
              {i < 2 && <div className="h-0.5 w-6 bg-muted shrink-0" />}
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-between mb-3">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-14 bg-muted rounded" />
          <div className="h-4 w-14 bg-muted rounded" />
        </div>

        {/* Outcome */}
        <div className="h-8 w-4/5 bg-muted rounded-md mb-3" />

        {/* Expert + CTA row */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="h-9 w-28 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}
