function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4 gap-2">
          <Pulse className="h-5 w-16 rounded-full" />
          <div className="flex gap-1.5">
            <Pulse className="h-5 w-14 rounded-full" />
          </div>
        </div>
        <div className="min-h-[3.5rem] mb-2 space-y-2">
          <Pulse className="h-5 w-full" />
          <Pulse className="h-5 w-3/4" />
        </div>
        <div className="min-h-[2.5rem] mb-4 space-y-1.5">
          <Pulse className="h-3.5 w-full" />
          <Pulse className="h-3.5 w-5/6" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Pulse className="h-6 w-16 rounded-md" />
          <Pulse className="h-6 w-20 rounded-md" />
          <Pulse className="h-6 w-14 rounded-md" />
        </div>
        <div className="mt-auto pt-3 border-t border-border">
          <Pulse className="h-3.5 w-48" />
        </div>
      </div>
      <div className="p-6 pt-0 bg-secondary/5">
        <div className="flex items-center gap-2 pb-3">
          <Pulse className="w-6 h-6 rounded-full" />
          <Pulse className="h-3 w-24" />
        </div>
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
        <div className="flex items-center gap-3">
          <Pulse className="flex-1 h-10 rounded-xl" />
          <Pulse className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function FavoritesSkeleton() {
  return (
    <>
      {/* Count placeholder */}
      <Pulse className="h-4 w-24 -mt-6 mb-8" />

      {/* Tabs skeleton */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit mb-8">
        <div className="flex items-center gap-2 px-4 py-2 bg-card shadow-sm border border-border rounded-md">
          <Pulse className="h-4 w-4" />
          <Pulse className="h-4 w-16" />
          <Pulse className="h-5 w-6 rounded-full" />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-md">
          <Pulse className="h-4 w-4" />
          <Pulse className="h-4 w-12" />
          <Pulse className="h-5 w-6 rounded-full" />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
