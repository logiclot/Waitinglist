import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getExpertProjectsData } from "@/actions/expert";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  paid_pending_implementation: { label: "Pending Start", className: "bg-yellow-500/10 text-yellow-600" },
  in_progress: { label: "In Progress", className: "bg-blue-500/10 text-blue-500" },
  delivered: { label: "Delivered", className: "bg-green-500/10 text-green-600" },
  disputed: { label: "Disputed", className: "bg-red-500/10 text-red-600" },
};

export default async function ExpertProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/sign-in");

  const result = await getExpertProjectsData();

  if ("error" in result) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Active Projects</h1>
        <EmptyState
          title="No active projects"
          description="You don't have any projects in progress right now."
          primaryCtaLabel="Find Work"
          primaryCtaHref="/expert/find-work"
        />
      </div>
    );
  }

  const { orders } = result;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Active Projects</h1>
        <p className="text-muted-foreground">Projects you&apos;ve won and are currently delivering.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No active projects"
          description="You don't have any projects in progress right now."
          primaryCtaLabel="Find Work"
          primaryCtaHref="/expert/find-work"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] || { label: order.status, className: "bg-secondary text-muted-foreground" };
            const funded = order.milestones.filter((m) => m.status === "in_escrow" || m.status === "released").length;
            const total = order.milestones.length;

            return (
              <div key={order.id} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.title}</h3>
                    <p className="text-sm text-muted-foreground">Client: {order.buyerEmail.split("@")[0]}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>Total: &euro;{(order.priceCents / 100).toLocaleString()}</span>
                  {total > 0 && <span>Milestones: {funded}/{total} funded</span>}
                  <span>Started: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    href="/expert/messages"
                    className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md font-bold transition-colors"
                  >
                    Message Client
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
