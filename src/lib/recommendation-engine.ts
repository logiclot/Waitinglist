import { prisma } from "@/lib/prisma";

export interface RecommendedSolution {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortSummary: string | null;
  outcome: string | null;
  implementationPriceCents: number;
  deliveryDays: number;
  integrations: string[];
  expertName: string;
  expertSlug: string | null;
  expertVerified: boolean;
  orderCount: number;
}

/**
 * Returns personalised solution recommendations for a business user.
 *
 * Scoring logic:
 *  1. Load the user's BusinessProfile (tools, industry).
 *  2. Exclude solutions the user has already ordered.
 *  3. Fetch published solutions, then score by tool overlap and popularity.
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit = 3
): Promise<RecommendedSolution[]> {
  // 1. Load user's BusinessProfile to get their tools and industry
  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { industry: true, companySize: true, tools: true },
  });

  // 2. Load user's past order solutionIds to exclude
  const pastOrders = await prisma.order.findMany({
    where: { buyerId: userId },
    select: { solutionId: true },
  });
  const purchasedIds = pastOrders
    .map((o) => o.solutionId)
    .filter((id): id is string => id !== null);

  // 3. Query published solutions, excluding previously purchased ones
  const solutions = await prisma.solution.findMany({
    where: {
      status: "published",
      ...(purchasedIds.length > 0 ? { id: { notIn: purchasedIds } } : {}),
    },
    include: {
      expert: { select: { displayName: true, slug: true, verified: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Fetch more than needed, then score & sort
  });

  // 4. Score solutions based on relevance
  const userTools = (profile?.tools as string[]) || [];

  const scored = solutions.map((s) => {
    let toolOverlap = 0;
    if (userTools.length > 0) {
      const solutionIntegrations = s.integrations || [];
      toolOverlap = solutionIntegrations.filter((t) =>
        userTools.some((ut) => ut.toLowerCase() === t.toLowerCase())
      ).length;
    }
    return { solution: s, toolOverlap };
  });

  // Primary: tool overlap (desc), secondary: popularity (desc)
  scored.sort((a, b) => {
    if (b.toolOverlap !== a.toolOverlap) return b.toolOverlap - a.toolOverlap;
    return (b.solution._count?.orders || 0) - (a.solution._count?.orders || 0);
  });

  return scored.slice(0, limit).map(({ solution: s }) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    category: s.category,
    shortSummary: s.shortSummary,
    outcome: s.outcome,
    implementationPriceCents: s.implementationPriceCents,
    deliveryDays: s.deliveryDays,
    integrations: s.integrations || [],
    expertName: s.expert?.displayName || "Expert",
    expertSlug: s.expert?.slug ?? null,
    expertVerified: s.expert?.verified || false,
    orderCount: s._count?.orders || 0,
  }));
}
