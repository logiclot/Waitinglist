import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Expert, Solution } from "@/types";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

type SolutionWithExpertAndEcosystems = Prisma.SolutionGetPayload<{
  include: { expert: { include: { user: { select: { profileImageUrl: true } } } }; ecosystemItems: { select: { ecosystemId: true } } };
}>;

type PrismaExpert = Prisma.SpecialistProfileGetPayload<{
  include: { user: { select: { profileImageUrl: true } } };
}>;

/** Also accept a bare SpecialistProfile (without user) for backward compat */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type PrismaExpertInput = PrismaExpert | Prisma.SpecialistProfileGetPayload<{}>;

/** Map a raw Prisma SpecialistProfile to the client-side Expert interface */
export function mapPrismaExpert(e: PrismaExpertInput): Expert {
  const user = "user" in e ? (e as PrismaExpert).user : null;
  return {
    id: e.id,
    user_id: e.userId,
    slug: e.slug ?? undefined,
    name: e.displayName || e.legalFullName,
    profile_image_url: user?.profileImageUrl ?? undefined,
    bio: e.bio ?? undefined,
    response_time: e.responseTime ?? undefined,
    verified: e.verified,
    business_verified: e.businessVerified,
    founding: e.isFoundingExpert,
    founding_rank: e.foundingRank ?? null,
    completed_sales_count: e.completedSalesCount,
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
        ],
        // Exclude solutions that have a newer published version
        // (i.e., a child solution that is also published & approved)
        children: {
          none: {
            status: "published",
            OR: [
              { moderationStatus: "auto_approved" },
              { moderationStatus: "approved" }
            ]
          }
        }
      },
      include: {
        expert: { include: { user: { select: { profileImageUrl: true } } } },
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
      // Derive expertTier from expert profile for filter sidebar
      expertTier: s.expert.isFoundingExpert ? "founding"
        : s.expert.tier === "ELITE" ? "elite"
          : s.expert.tier === "PROVEN" ? "proven"
            : "standard",
    })) as unknown as Solution[];

  } catch (e) {
    log.error("solutions.fetch_published_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    // Return empty array instead of mock data on error
    return [];
  }
}
