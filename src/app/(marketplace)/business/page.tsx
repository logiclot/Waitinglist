import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BusinessOverview } from "@/components/dashboard/BusinessOverview";
import { getReferralStats } from "@/actions/referral";
import { getActiveCoupons } from "@/actions/notifications";
import { prisma } from "@/lib/prisma";

function BusinessDashboardSkeleton() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero skeleton */}
      <section className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl w-full space-y-3">
          <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-5 w-full rounded bg-muted animate-pulse" />
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap pt-2">
            <div className="h-12 w-48 rounded-xl bg-muted animate-pulse" />
            <div className="h-12 w-48 rounded-xl bg-muted animate-pulse" />
            <div className="h-12 w-36 rounded-xl bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-52 rounded bg-muted animate-pulse mt-1" />
        </div>
        <div className="hidden md:block">
          <div className="w-36 h-36 bg-secondary/30 rounded-full border border-border/50 animate-pulse" />
        </div>
      </section>

      {/* Referral section skeleton */}
      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-muted animate-pulse" />
              <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-4 w-full max-w-md rounded bg-muted animate-pulse" />
            <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md p-2 w-72">
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-6 w-6 rounded bg-muted animate-pulse shrink-0" />
            </div>
          </div>
          <div className="flex gap-8 text-right">
            <div className="flex flex-col items-end gap-1">
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              <div className="h-9 w-12 rounded bg-muted animate-pulse" />
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works skeleton */}
      <section className="bg-secondary/20 rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 rounded bg-muted animate-pulse" />
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended solutions skeleton */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-muted animate-pulse" />
            <div className="h-5 w-44 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 space-y-3"
            >
              <div className="h-5 w-20 rounded bg-muted animate-pulse" />
              <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

async function BusinessDashboardContent({ userId }: { userId: string }) {
  const [referralStats, activeCoupons, activeOrdersRaw, completedProjectCount, businessProfile] = await Promise.all([
    getReferralStats(userId),
    getActiveCoupons(),
    prisma.order.findMany({
      where: {
        buyerId: userId,
        status: { in: ["in_progress", "delivered"] },
      },
      select: {
        id: true,
        status: true,
        solution: { select: { title: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.order.count({
      where: { buyerId: userId, status: "approved" },
    }),
    prisma.businessProfile.findUnique({
      where: { userId },
      select: { freeDiscoveryScansRemaining: true },
    }),
  ]);

  const activeOrders = activeOrdersRaw.map((o) => ({
    id: o.id,
    solutionTitle: o.solution?.title ?? "Unknown",
    status: o.status,
  }));

  return (
    <BusinessOverview
      referralStats={referralStats}
      activeOrders={activeOrders}
      activeCoupons={activeCoupons}
      completedProjectCount={completedProjectCount}
      freeDiscoveryScans={businessProfile?.freeDiscoveryScansRemaining ?? 0}
    />
  );
}

export default async function BusinessDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return (
    <Suspense fallback={<BusinessDashboardSkeleton />}>
      <BusinessDashboardContent userId={session.user.id} />
    </Suspense>
  );
}
