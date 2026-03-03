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
        stripeAccountId: true,
        stripeDetailsSubmitted: true,
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
      // In-progress orders (active work)
      prisma.order.findMany({
        where: { sellerId: expert.id, status: "in_progress" },
        select: {
          id: true,
          priceCents: true,
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
    const inEscrowCents = activeOrdersRaw.reduce((sum, o) => sum + o.priceCents, 0);

    const activeOrders = activeOrdersRaw.map((o) => ({
      id: o.id,
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
        publishedSolutionCount={expert._count.solutions}
        earningsThisMonthCents={earningsThisMonthCents}
        inEscrowCents={inEscrowCents}
        activeOrders={activeOrders}
        topSolution={topSolution}
        recentJobs={recentJobs}
        totalCompletedSales={expert.completedSalesCount}
        portfolioSlug={expert.slug ?? null}
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
