import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BusinessOverview } from "@/components/dashboard/BusinessOverview";
import { getReferralStats } from "@/actions/referral";
import { getActiveCoupons } from "@/actions/notifications";
import { prisma } from "@/lib/prisma";

export default async function BusinessDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const [referralStats, activeCoupons, activeOrdersRaw, recommendedSolutionsRaw] = await Promise.all([
    getReferralStats(session.user.id),
    getActiveCoupons(),
    // Orders that still need attention
    prisma.order.findMany({
      where: {
        buyerId: session.user.id,
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
    // Best-selling published solutions as recommendations (ranked by completed order count)
    prisma.solution.findMany({
      where: {
        status: "published",
        moderationStatus: { in: ["auto_approved", "approved"] },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        slug: true,
        title: true,
        shortSummary: true,
        category: true,
        implementationPriceCents: true,
        deliveryDays: true,
        _count: { select: { orders: { where: { status: { in: ["delivered", "approved"] } } } } },
      },
    }).then((solutions) =>
      solutions
        .sort((a, b) => b._count.orders - a._count.orders)
        .slice(0, 3)
    ),
  ]);

  const activeOrders = activeOrdersRaw.map((o) => ({
    id: o.id,
    solutionTitle: o.solution?.title ?? "Unknown",
    status: o.status,
  }));

  const recommendedSolutions = recommendedSolutionsRaw.map((soln) => {
    const { _count, ...s } = soln;
    void _count;
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.shortSummary || "",
      category: s.category,
      implementationPrice: s.implementationPriceCents / 100,
      deliveryDays: s.deliveryDays,
    };
  });

  return (
    <BusinessOverview
      referralStats={referralStats}
      activeOrders={activeOrders}
      recommendedSolutions={recommendedSolutions}
      activeCoupons={activeCoupons}
    />
  );
}
