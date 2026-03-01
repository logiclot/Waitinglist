"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { Clock, Zap } from "lucide-react";
import type { RecommendedSolution } from "@/lib/recommendation-engine";

// Order statuses by category
const ACTIVE_STATUSES = ["draft", "in_progress", "delivered", "disputed"];
const COMPLETED_STATUSES = ["approved", "refunded"];

interface SerializedOrder {
  id: string;
  status: string;
  solutionTitle: string | null;
  solutionSlug: string | null;
  solutionCategory: string | null;
  priceCents: number;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
}

interface BusinessProjectsClientProps {
  orders: SerializedOrder[];
  recommendations: RecommendedSolution[];
}

function formatPrice(cents: number): string {
  return `€${(cents / 100).toLocaleString("en-IE", { maximumFractionDigits: 0 })}`;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Draft",
    paid_pending_implementation: "Paid — Pending Start",
    in_progress: "In Progress",
    delivered: "Delivered — Awaiting Review",
    approved: "Completed",
    refunded: "Refunded",
    disputed: "Disputed",
  };
  return map[status] || status;
}

function statusColor(status: string): string {
  switch (status) {
    case "in_progress":
      return "text-blue-600";
    case "delivered":
      return "text-yellow-600";
    case "approved":
      return "text-green-600";
    case "refunded":
      return "text-muted-foreground";
    case "disputed":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
}

export function BusinessProjectsClient({
  orders,
  recommendations,
}: BusinessProjectsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab =
    searchParams.get("tab") === "completed" ? "completed" : "active";

  const activeOrders = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    COMPLETED_STATUSES.includes(o.status)
  );

  const setTab = (tab: "active" | "completed") => {
    if (tab === "active") {
      router.push("/business/projects");
    } else {
      router.push("/business/projects?tab=completed");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">My Projects</h1>

      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            currentTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            currentTab === "completed"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed ({completedOrders.length})
        </button>
      </div>

      {/* Tab content */}
      {currentTab === "active" ? (
        activeOrders.length > 0 ? (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">
                      {order.solutionTitle ?? "Untitled Project"}
                    </h3>
                    {order.solutionCategory && (
                      <span className="text-xs text-muted-foreground">
                        {order.solutionCategory}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-sm">
                    {formatPrice(order.priceCents)}
                  </span>
                </div>
                <p className={`text-sm mt-2 font-medium ${statusColor(order.status)}`}>
                  {statusLabel(order.status)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active projects"
            description="You don't have any projects in progress. Post a request or browse solutions to get started."
            primaryCtaLabel="Add Request"
            primaryCtaHref="/business/add-request"
            secondaryCtaLabel="Browse Solutions"
            secondaryCtaHref="/business/solutions"
          />
        )
      ) : (
        <div className="space-y-8">
          {completedOrders.length > 0 ? (
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">
                        {order.solutionTitle ?? "Untitled Project"}
                      </h3>
                      {order.solutionCategory && (
                        <span className="text-xs text-muted-foreground">
                          {order.solutionCategory}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-sm">
                      {formatPrice(order.priceCents)}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 font-medium ${statusColor(order.status)}`}>
                    {statusLabel(order.status)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No completed projects"
              description="Completed and refunded projects will appear here once you have finished work with an expert."
              primaryCtaLabel="Browse Solutions"
              primaryCtaHref="/business/solutions"
            />
          )}

          {/* What's Next? — recommendation section */}
          {recommendations.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-bold">What&apos;s Next?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Based on your profile, here are automations other businesses like you are using.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((r) => (
                  <Link
                    key={r.id}
                    href={`/solutions/${r.slug}`}
                    className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] uppercase font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded">
                        {r.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {r.shortSummary || r.outcome || "Ready-to-deploy automation solution."}
                    </p>
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm">
                      <span className="font-bold">
                        {formatPrice(r.implementationPriceCents)}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {r.deliveryDays} days
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
