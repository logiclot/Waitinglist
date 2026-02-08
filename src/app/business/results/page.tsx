import { EmptyState } from "@/components/EmptyState";

export default function BusinessResultsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Results & ROI</h1>
      <EmptyState
        title="No data yet"
        description="Track the performance and ROI of your implemented automations here."
        primaryCtaLabel="Browse Solutions"
        primaryCtaHref="/business/solutions"
      />
    </div>
  );
}
