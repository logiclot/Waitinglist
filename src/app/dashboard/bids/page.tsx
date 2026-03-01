import { EmptyState } from "@/components/EmptyState";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ActiveBidsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isExpert = role === "EXPERT";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Active Bids</h1>
      <EmptyState
        title="No active bids"
        description={isExpert ? "You haven't placed any bids on projects yet." : "You don't have any active bids."}
        primaryCtaLabel={isExpert ? "Browse Open Jobs" : "Browse Solutions"}
        primaryCtaHref={isExpert ? "/jobs" : "/solutions"}
      />
    </div>
  );
}
