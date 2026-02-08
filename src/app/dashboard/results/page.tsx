import { EmptyState } from "@/components/EmptyState";

export default function ResultsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Automation Results</h1>
      <EmptyState
        title="No data yet"
        description="Once you implement automations, track their ROI and efficiency gains here."
        primaryCtaLabel="Browse Solutions"
        primaryCtaHref="/solutions"
      />
    </div>
  );
}
