import { EmptyState } from "@/components/EmptyState";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error: role is in session
  const role = session?.user?.role;
  const isExpert = role === "SPECIALIST";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Projects</h1>
      <EmptyState
        title="No active projects"
        description="You don't have any projects in progress right now."
        primaryCtaLabel={isExpert ? "Find Work" : "Start a Project"}
        primaryCtaHref={isExpert ? "/jobs" : "/jobs/new"}
      />
    </div>
  );
}
