import { EmptyState } from "@/components/EmptyState";

export default function SolutionPoolPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Solution Pool</h1>
      <EmptyState
        title="Solution Pool"
        description="Explore the library of expert solutions available for reference."
        primaryCtaLabel="Add Solution"
        primaryCtaHref="/solutions/new"
      />
    </div>
  );
}
