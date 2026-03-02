import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Expert, Solution } from "@/types";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

type SolutionWithExpertAndEcosystems = Prisma.SolutionGetPayload<{
  include: { expert: true; ecosystemItems: { select: { ecosystemId: true } } };
}>;

type PrismaExpert = Prisma.SpecialistProfileGetPayload<{}>;

/** Map a raw Prisma SpecialistProfile to the client-side Expert interface */
export function mapPrismaExpert(e: PrismaExpert): Expert {
  return {
    id: e.id,
    user_id: e.userId,
    slug: e.slug ?? undefined,
    name: e.displayName || e.legalFullName,
    bio: e.bio ?? undefined,
    response_time: e.responseTime ?? undefined,
    verified: e.verified,
    business_verified: e.businessVerified,
    founding: e.isFoundingExpert,
    founding_rank: e.foundingRank ?? null,
    completed_sales_count: e.completedSalesCount,
    commission_override_percent: e.commissionOverridePercent ? Number(e.commissionOverridePercent) : null,
    tools: e.tools || [],
    calendarUrl: e.calendarUrl ?? undefined,
    tier: e.tier || "STANDARD",
  };
}

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
      expert: mapPrismaExpert(s.expert),
      ecosystemIds: s.ecosystemItems.map((i: { ecosystemId: string }) => i.ecosystemId),
    })) as unknown as Solution[];

  } catch (e) {
    log.error("solutions.fetch_published_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    // Return empty array instead of mock data on error
    return [];
  }
}
