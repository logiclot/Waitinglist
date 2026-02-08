import { EmptyState } from "@/components/EmptyState";

export default function ExpertActiveBidsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Active Bids</h1>
      <EmptyState
        title="No active bids"
        description="You haven't placed any bids on projects yet."
        primaryCtaLabel="Find Work"
        primaryCtaHref="/expert/find-work"
      />
    </div>
  );
}
