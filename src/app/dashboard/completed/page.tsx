import { EmptyState } from "@/components/EmptyState";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CompletedProjectsPage() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error: role is in session
  const role = session?.user?.role;
  const isExpert = role === "SPECIALIST";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Completed Projects</h1>
      <EmptyState
        title="No completed history"
        description="Your completed project history will appear here."
        primaryCtaLabel={isExpert ? "Browse Jobs" : "Create New Request"}
        primaryCtaHref={isExpert ? "/jobs" : "/jobs/new"}
      />
    </div>
  );
}
