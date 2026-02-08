import { EmptyState } from "@/components/EmptyState";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PerformancePage() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error: role is in session
  const role = session?.user?.role;
  const isExpert = role === "SPECIALIST";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Performance Analytics</h1>
      <EmptyState
        title="Not enough data"
        description="Performance metrics will appear once you have active projects or sales."
        primaryCtaLabel={isExpert ? "Optimize Profile" : "Browse Solutions"}
        primaryCtaHref={isExpert ? "/dashboard/profile" : "/solutions"}
      />
    </div>
  );
}
