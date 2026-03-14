import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BusinessOverview } from "@/components/dashboard/BusinessOverview";
import { ExpertOverview } from "@/components/dashboard/ExpertOverview";
import { getReferralStats } from "@/actions/referral";
import { getActiveCoupons } from "@/actions/notifications";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const role = session.user.role;

  const [referralStats, activeCoupons] = await Promise.all([
    getReferralStats(session.user.id),
    getActiveCoupons(),
  ]);

  if (role === "EXPERT") {
    const expert = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        slug: true,
        calendarUrl: true,
        isFoundingExpert: true,
        completedSalesCount: true,
        tier: true,
        commissionOverridePercent: true,
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
    });

    if (!expert) redirect("/onboarding");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [earningsOrders, activeOrdersRaw, topSolution, recentJobs] = await Promise.all([
      // Delivered/approved orders this month — approximate earnings (before fees)
      prisma.order.findMany({
        where: {
          sellerId: expert.id,
          status: { in: ["delivered", "approved"] },
          updatedAt: { gte: startOfMonth },
        },
        select: { priceCents: true },
      }),
      // Active orders (all non-terminal states)
      prisma.order.findMany({
        where: { sellerId: expert.id, status: { in: ["paid_pending_implementation", "in_progress", "delivered", "revision_requested"] } },
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
      // Best-performing published solution (ranked by completed order count)
      prisma.solution.findMany({
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
      }).then((solutions) => {
        if (!solutions.length) return null;
        const best = solutions.sort((a, b) => b._count.orders - a._count.orders)[0];
        return { id: best.id, title: best.title, category: best.category, completedSalesCount: best._count.orders };
      }),
      // Latest open job posts from any business
      prisma.jobPost.findMany({
        where: { status: "open" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, title: true, category: true, budgetRange: true },
      }),
    ]);

    const earningsThisMonthCents = earningsOrders.reduce((sum, o) => sum + o.priceCents, 0);

    // In Escrow: only count milestones with status "in_escrow" (not released/pending)
    const inEscrowCents = activeOrdersRaw.reduce((sum, o) => {
      const milestones = (o.milestones as Record<string, unknown>[] | null) || [];
      return sum + milestones.reduce((mSum, m) => {
        if ((m as { status?: string }).status === "in_escrow") {
          const rawCents = (m as { priceCents?: number }).priceCents;
          const rawPrice = (m as { price?: number }).price;
          const cents = typeof rawCents === "number" ? rawCents : Math.round((typeof rawPrice === "number" ? rawPrice : 0) * 100);
          return mSum + cents;
        }
        return mSum;
      }, 0);
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
        referralStats={referralStats}
        activeCoupons={activeCoupons}
        hasCalendarUrl={!!expert.calendarUrl}
        hasStripeConnected={!!expert.stripeAccountId && expert.stripeDetailsSubmitted}
        isFoundingExpert={expert.isFoundingExpert ?? false}
        tier={expert.tier}
        commissionOverridePercent={expert.commissionOverridePercent ? Number(expert.commissionOverridePercent) : undefined}
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

  if (role === "BUSINESS") {
    redirect("/business");
  }

  if (role === "ADMIN") {
    redirect("/admin");
  }

  // Fallback (e.g. USER role before onboarding)
  const coupons = await getActiveCoupons();
  return <BusinessOverview referralStats={referralStats} activeCoupons={coupons} />;
}
