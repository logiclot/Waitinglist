"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function toggleSavedSolution(solutionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    const existing = await prisma.savedSolution.findUnique({
      where: {
        userId_solutionId: {
          userId,
          solutionId,
        },
      },
    });

    if (existing) {
      await prisma.savedSolution.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    } else {
      await prisma.savedSolution.create({
        data: {
          userId,
          solutionId,
        },
      });
      return { saved: true };
    }
  } catch (error) {
    log.error("saved.toggle_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
    return { error: "Failed to update" };
  }
}

export async function getSavedSolutions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
  }

  try {
    const saved = await prisma.savedSolution.findMany({
      where: { userId: session.user.id },
      select: { solutionId: true },
    });
    return saved.map((s) => s.solutionId);
  } catch (error) {
    log.error("saved.fetch_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
    return [];
  }
}

/**
 * Returns full Solution data for all saved solutions.
 * Used by the unified /favorites page.
 */
export async function getSavedSolutionsFull() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  try {
    const saved = await prisma.savedSolution.findMany({
      where: { userId: session.user.id },
      include: {
        solution: {
          include: {
            expert: { include: { user: { select: { profileImageUrl: true } } } },
            ecosystemItems: { select: { ecosystemId: true } },
          },
        },
      },
    });

    // Only include published + approved solutions
    return saved
      .filter(
        (s) =>
          s.solution.status === "published" &&
          (s.solution.moderationStatus === "auto_approved" ||
            s.solution.moderationStatus === "approved")
      )
      .map((s) => {
        const sol = s.solution;
        const expert = sol.expert;
        const user =
          "user" in expert
            ? (expert as unknown as { user?: { profileImageUrl: string | null } | null }).user
            : null;
        return {
          ...sol,
          implementation_price: sol.implementationPriceCents / 100,
          monthly_cost_min: sol.monthlyCostMinCents
            ? sol.monthlyCostMinCents / 100
            : 0,
          monthly_cost_max: sol.monthlyCostMaxCents
            ? sol.monthlyCostMaxCents / 100
            : 0,
          delivery_days: sol.deliveryDays,
          support_days: sol.supportDays,
          short_summary: sol.shortSummary,
          expert: {
            id: expert.id,
            user_id: expert.userId,
            slug: expert.slug ?? undefined,
            name: expert.displayName || expert.legalFullName,
            profile_image_url: user?.profileImageUrl ?? undefined,
            bio: expert.bio ?? undefined,
            response_time: expert.responseTime ?? undefined,
            verified: expert.verified,
            business_verified: expert.businessVerified,
            founding: expert.isFoundingExpert,
            founding_rank: expert.foundingRank ?? null,
            completed_sales_count: expert.completedSalesCount,
            commission_override_percent: expert.commissionOverridePercent
              ? Number(expert.commissionOverridePercent)
              : null,
            tools: expert.tools || [],
            calendarUrl: expert.calendarUrl ?? undefined,
            tier: expert.tier || "STANDARD",
          },
          ecosystemIds: sol.ecosystemItems.map(
            (i: { ecosystemId: string }) => i.ecosystemId
          ),
          expertTier: expert.isFoundingExpert
            ? "founding"
            : expert.tier === "ELITE"
            ? "elite"
            : expert.tier === "PROVEN"
            ? "proven"
            : "standard",
        };
      });
  } catch (error) {
    log.error("saved.fetch_full_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error);
    return [];
  }
}
