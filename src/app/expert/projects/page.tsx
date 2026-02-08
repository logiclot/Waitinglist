import { EmptyState } from "@/components/EmptyState";

export default function ExpertProjectsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Active Projects</h1>
        <p className="text-muted-foreground">Projects you&apos;ve won and are currently delivering.</p>
      </div>
      
      <EmptyState
        title="No active projects"
        description="You don't have any projects in progress right now."
        primaryCtaLabel="Find Work"
        primaryCtaHref="/expert/find-work"
      />
    </div>
  );
}
