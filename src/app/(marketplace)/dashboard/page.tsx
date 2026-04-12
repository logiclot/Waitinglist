import { BusinessOverview } from "@/components/dashboard/BusinessOverview";
import { ExpertOverview } from "@/components/dashboard/ExpertOverview";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense, cache } from "react";

const getExpertProfile = cache((userId: string) =>
  prisma.specialistProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      slug: true,
      calendarUrl: true,
      isFoundingExpert: true,
      completedSalesCount: true,
      tier: true,
      stripeAccountId: true,
      stripeDetailsSubmitted: true,
      eliteApplicationStatus: true,
      eliteAppliedAt: true,
      eliteDeniedAt: true,
      eliteDeniedReason: true,
      eliteDemotedAt: true,
      eliteDemotedReason: true,
      newExpertBoostUntil: true,
      _count: { select: { solutions: { where: { status: "published" } } } },
    },
  }),
);

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const role = session.user.role;

  if (role === "BUSINESS") {
    redirect("/business");
  }

  if (role === "ADMIN") {
    redirect("/admin");
  }

  if (role === "EXPERT") {
    const expert = await getExpertProfile(session.user.id);
    if (!expert) redirect("/onboarding");

    return (
      <Suspense fallback={<ExpertDashboardSkeleton />}>
        <ExpertDashboardContent userId={session.user.id} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<BusinessDashboardSkeleton />}>
      <FallbackDashboardContent userId={session.user.id} />
    </Suspense>
  );
}

// ── Async content components (rendered inside Suspense) ─────────────────────

async function ExpertDashboardContent({ userId }: { userId: string }) {
  const expert = (await getExpertProfile(userId))!;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    earningsOrders,
    activeOrdersRaw,
    topSolution,
    recentJobs,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        sellerId: expert.id,
        status: { in: ["delivered", "approved"] },
        updatedAt: { gte: startOfMonth },
      },
      select: { priceCents: true },
    }),
    prisma.order.findMany({
      where: {
        sellerId: expert.id,
        status: {
          in: [
            "paid_pending_implementation",
            "in_progress",
            "delivered",
            "revision_requested",
          ],
        },
      },
      select: {
        id: true,
        status: true,
        priceCents: true,
        milestones: true,
        solution: { select: { title: true } },
        buyer: {
          select: {
            businessProfile: { select: { firstName: true, companyName: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.solution
      .findMany({
        where: { expertId: expert.id, status: "published" },
        select: {
          id: true,
          title: true,
          category: true,
          _count: {
            select: {
              orders: { where: { status: { in: ["delivered", "approved"] } } },
            },
          },
        },
        take: 20,
      })
      .then((solutions) => {
        if (!solutions.length) return null;
        const best = solutions.sort(
          (a, b) => b._count.orders - a._count.orders,
        )[0];
        return {
          id: best.id,
          title: best.title,
          category: best.category,
          completedSalesCount: best._count.orders,
        };
      }),
    prisma.jobPost.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, category: true, budgetRange: true },
    }),
  ]);

  const earningsThisMonthCents = earningsOrders.reduce(
    (sum, o) => sum + o.priceCents,
    0,
  );

  const inEscrowCents = activeOrdersRaw.reduce((sum, o) => {
    const milestones = (o.milestones as Record<string, unknown>[] | null) || [];
    return (
      sum +
      milestones.reduce((mSum, m) => {
        if ((m as { status?: string }).status === "in_escrow") {
          const rawCents = (m as { priceCents?: number }).priceCents;
          const rawPrice = (m as { price?: number }).price;
          const cents =
            typeof rawCents === "number"
              ? rawCents
              : Math.round((typeof rawPrice === "number" ? rawPrice : 0) * 100);
          return mSum + cents;
        }
        return mSum;
      }, 0)
    );
  }, 0);

  const activeOrders = activeOrdersRaw.map((o) => ({
    id: o.id,
    status: o.status,
    solutionTitle: o.solution?.title ?? "Unknown",
    buyerName:
      o.buyer?.businessProfile?.companyName ||
      o.buyer?.businessProfile?.firstName ||
      "Client",
  }));

  return (
    <ExpertOverview
      hasCalendarUrl={!!expert.calendarUrl}
      hasStripeConnected={
        !!expert.stripeAccountId && expert.stripeDetailsSubmitted
      }
      isFoundingExpert={!!(expert.tier === "FOUNDING")}
      tier={expert.tier}
      publishedSolutionCount={expert._count.solutions}
      earningsThisMonthCents={earningsThisMonthCents}
      inEscrowCents={inEscrowCents}
      activeOrders={activeOrders}
      topSolution={topSolution}
      recentJobs={recentJobs}
      totalCompletedSales={expert.completedSalesCount}
      portfolioSlug={expert.slug ?? null}
      eliteApplication={{
        status: expert.eliteApplicationStatus ?? null,
        appliedAt: expert.eliteAppliedAt?.toISOString() ?? null,
        deniedAt: expert.eliteDeniedAt?.toISOString() ?? null,
        deniedReason: expert.eliteDeniedReason ?? null,
        demotedAt: expert.eliteDemotedAt?.toISOString() ?? null,
        demotedReason: expert.eliteDemotedReason ?? null,
      }}
      newExpertBoostUntil={expert.newExpertBoostUntil?.toISOString() ?? null}
    />
  );
}

async function FallbackDashboardContent({ userId }: { userId: string }) {
  return (
    <BusinessOverview />
  );
}

// ── Skeletons ───────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-muted rounded ${className ?? ""}`} />;
}

function ExpertDashboardSkeleton() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Priority Actions */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <SkeletonBlock className="w-5 h-5" />
          <SkeletonBlock className="h-5 w-36" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="min-w-[300px] flex-shrink-0 bg-muted/20 border border-border p-4 rounded-xl flex items-center gap-4"
            >
              <SkeletonBlock className="w-5 h-5 shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-40" />
              </div>
              <SkeletonBlock className="h-7 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </section>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* New Opportunities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="w-5 h-5" />
                <SkeletonBlock className="h-5 w-40" />
              </div>
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-4 flex justify-between items-center"
                >
                  <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-48" />
                    <div className="flex gap-2">
                      <SkeletonBlock className="h-5 w-20 rounded" />
                      <SkeletonBlock className="h-5 w-16 rounded" />
                    </div>
                  </div>
                  <SkeletonBlock className="h-5 w-10 rounded" />
                </div>
              ))}
            </div>
          </section>

          {/* Active Projects */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <SkeletonBlock className="w-5 h-5" />
              <SkeletonBlock className="h-5 w-32" />
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <SkeletonBlock className="h-4 w-64 mx-auto" />
            </div>
          </section>
        </div>

        {/* Right Col (1/3) */}
        <div className="space-y-6">
          {/* Top Solution */}
          <section className="bg-card border border-border rounded-xl p-5">
            <SkeletonBlock className="h-4 w-28 mb-4" />
            <div className="space-y-2 mb-4">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="text-center p-2 bg-secondary/30 rounded">
                <SkeletonBlock className="h-3 w-10 mx-auto mb-1" />
                <SkeletonBlock className="h-4 w-6 mx-auto" />
              </div>
              <div className="text-center p-2 bg-secondary/30 rounded">
                <SkeletonBlock className="h-3 w-10 mx-auto mb-1" />
                <SkeletonBlock className="h-4 w-6 mx-auto" />
              </div>
            </div>
            <SkeletonBlock className="h-8 w-full rounded-lg" />
          </section>

          {/* Stats */}
          <section className="bg-card border border-border rounded-xl p-5">
            <SkeletonBlock className="h-4 w-24 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-4 w-8" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function BusinessDashboardSkeleton() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Hero */}
      <section className="bg-card border border-border rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl w-full">
          <SkeletonBlock className="h-8 w-96 max-w-full mb-3" />
          <SkeletonBlock className="h-4 w-80 max-w-full mb-5" />
          <div className="flex flex-col sm:flex-row gap-3">
            <SkeletonBlock className="h-12 w-48 rounded-xl" />
            <SkeletonBlock className="h-12 w-48 rounded-xl" />
            <SkeletonBlock className="h-12 w-36 rounded-xl" />
          </div>
        </div>
        <div className="hidden md:block">
          <div className="w-36 h-36 bg-secondary/30 rounded-full" />
        </div>
      </section>

      {/* Referral */}
      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <SkeletonBlock className="h-5 w-40 mb-2" />
            <SkeletonBlock className="h-4 w-72 max-w-full mb-4" />
            <SkeletonBlock className="h-10 w-64 max-w-full rounded-md" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-8 w-10" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/20 rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-6">
          <SkeletonBlock className="w-5 h-5" />
          <SkeletonBlock className="h-5 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
              <div className="space-y-2 flex-1">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="w-5 h-5" />
            <SkeletonBlock className="h-5 w-40" />
          </div>
          <SkeletonBlock className="h-4 w-20" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <SkeletonBlock className="h-4 w-48 mx-auto" />
        </div>
      </section>
    </div>
  );
}
