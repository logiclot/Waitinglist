import { prisma } from "@/lib/prisma";
import { Solution } from "@/types";

export async function getPublishedSolutions() {
  try {
    const dbSolutions = await prisma.solution.findMany({
      where: {
        status: "published",
        OR: [
          { moderationStatus: "auto_approved" },
          { moderationStatus: "approved" }
        ]
      },
      include: {
        expert: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    // Map Prisma solution to Client Solution type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dbSolutions.map((s: any) => ({
      ...s,
      // Map fields that might differ
      implementation_price: s.implementationPriceCents / 100,
      monthly_cost_min: s.monthlyCostMinCents ? s.monthlyCostMinCents / 100 : 0,
      monthly_cost_max: s.monthlyCostMaxCents ? s.monthlyCostMaxCents / 100 : 0,
      delivery_days: s.deliveryDays,
      support_days: s.supportDays,
      short_summary: s.shortSummary,
      // expert relationship is included, but we might need to map fields if expert type differs
      expert: {
        ...s.expert,
        id: s.expert.id,
        name: s.expert.displayName || s.expert.legalFullName,
        tools: s.expert.tools || [],
        verified: s.expert.verified,
        business_verified: s.expert.businessVerified,
        founding: s.expert.founding,
        completed_sales_count: s.expert.completedSalesCount,
        // Ensure other required expert fields exist
      }
    })) as Solution[];

  } catch (e) {
    console.error("Failed to fetch solutions from DB", e);
    // Return empty array instead of mock data on error
    return [];
  }
}
