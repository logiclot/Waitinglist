import { EmptyState } from "@/components/EmptyState";

export default function BusinessProjectsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">My Projects</h1>
      <EmptyState
        title="No active projects"
        description="You don't have any projects in progress. Post a request or browse solutions to get started."
        primaryCtaLabel="Add Request"
        primaryCtaHref="/business/add-request"
        secondaryCtaLabel="Browse Solutions"
        secondaryCtaHref="/business/solutions"
      />
    </div>
  );
}
