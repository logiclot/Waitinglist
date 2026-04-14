function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col h-full overflow-hidden">
      {/* Top Section */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Category + Badges row */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <Pulse className="h-5 w-16 rounded-full" />
          <div className="flex gap-1.5">
            <Pulse className="h-5 w-14 rounded-full" />
          </div>
        </div>

        {/* Title */}
        <div className="min-h-[3.5rem] mb-2 space-y-2">
          <Pulse className="h-5 w-full" />
          <Pulse className="h-5 w-3/4" />
        </div>

        {/* Description */}
        <div className="min-h-[2.5rem] mb-4 space-y-1.5">
          <Pulse className="h-3.5 w-full" />
          <Pulse className="h-3.5 w-5/6" />
        </div>

        {/* Tech stack pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Pulse className="h-6 w-16 rounded-md" />
          <Pulse className="h-6 w-20 rounded-md" />
          <Pulse className="h-6 w-14 rounded-md" />
        </div>

        {/* Proof strip */}
        <div className="mt-auto pt-3 border-t border-border">
          <Pulse className="h-3.5 w-48" />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-6 pt-0 bg-secondary/5">
        {/* Expert */}
        <div className="flex items-center gap-2 pb-3">
          <Pulse className="w-6 h-6 rounded-full" />
          <Pulse className="h-3 w-24" />
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between py-4 border-t border-border">
          <div className="space-y-2">
            <Pulse className="h-2.5 w-20" />
            <Pulse className="h-6 w-24" />
            <Pulse className="h-3 w-28 mt-1.5" />
          </div>
          <div className="text-right space-y-2">
            <Pulse className="h-2.5 w-20 ml-auto" />
            <Pulse className="h-4 w-16 ml-auto" />
          </div>
        </div>

        {/* CTA row */}
        <div className="flex items-center gap-3">
          <Pulse className="flex-1 h-10 rounded-xl" />
          <Pulse className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Pulse className="h-4 w-4" />
        <Pulse className="h-5 w-14" />
      </div>

      <div className="space-y-1 pr-2">
        {/* Search */}
        <div className="mb-6">
          <Pulse className="h-3 w-12 mb-2" />
          <Pulse className="h-9 w-full rounded-md" />
        </div>

        {/* Category dropdown */}
        <div className="mb-6">
          <Pulse className="h-3 w-16 mb-2" />
          <Pulse className="h-9 w-full rounded-md" />
        </div>

        {/* Collapsible sections */}
        {["Price", "Delivery", "Goals", "Tools", "Tier", "ROI"].map((s) => (
          <div key={s} className="border-b border-border py-4">
            <div className="flex items-center justify-between mb-2">
              <Pulse className="h-4 w-24" />
              <Pulse className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <Pulse className="h-3.5 w-full" />
              <Pulse className="h-3.5 w-5/6" />
              <Pulse className="h-3.5 w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="mb-3">
          <Pulse className="h-10 w-56 rounded-lg" />
        </div>
        <Pulse className="h-8 w-52 mb-1" />
        <Pulse className="h-4 w-32 mt-1" />
      </div>

      <div className="flex items-center gap-3">
        <Pulse className="h-9 w-28 rounded-lg" />
        <Pulse className="h-9 w-36 rounded-md" />
      </div>
    </div>
  );
}

export function SolutionsPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <SidebarSkeleton />
      <div className="flex-1 min-w-0">
        <HeaderSkeleton />
        <CardGridSkeleton />
      </div>
    </div>
  );
}
