import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Solution } from "@/types";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

type SolutionWithExpertAndEcosystems = Prisma.SolutionGetPayload<{
  include: { expert: true; ecosystemItems: { select: { ecosystemId: true } } };
}>;

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
        expert: true,
        ecosystemItems: { select: { ecosystemId: true } }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    // Map Prisma solution to Client Solution type
    return dbSolutions.map((s: SolutionWithExpertAndEcosystems) => ({
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
        founding: s.expert.isFoundingExpert,
        completed_sales_count: s.expert.completedSalesCount,
        tier: s.expert.tier || "STANDARD",
      },
      ecosystemIds: s.ecosystemItems.map((i: { ecosystemId: string }) => i.ecosystemId),
    })) as unknown as Solution[];

  } catch (e) {
    log.error("solutions.fetch_published_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    // Return empty array instead of mock data on error
    return [];
  }
}
