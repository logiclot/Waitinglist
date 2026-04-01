function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

function InvoiceRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-4 min-w-0">
        <Pulse className="h-9 w-9 rounded-lg shrink-0" />
        <div className="min-w-0 space-y-1.5">
          <Pulse className="h-4 w-40" />
          <Pulse className="h-3 w-56" />
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Pulse className="h-5 w-16 rounded-full" />
        <Pulse className="h-4 w-20" />
        <Pulse className="h-4 w-4" />
      </div>
    </div>
  );
}

export function InvoicesPageSkeleton() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Pulse className="h-7 w-7 rounded" />
        <Pulse className="h-7 w-32" />
      </div>
      <Pulse className="h-4 w-72 mb-8" />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <InvoiceRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
