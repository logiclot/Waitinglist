import { prisma } from "@/lib/prisma";
import { createRouter } from "../../init";
import { commonProcedure } from "../../procedures";
import { ModerationStatus, SolutionStatus } from "@/types";

const tierToLabel = {
    "FOUNDING": "founding",
    "ELITE": "elite",
    "PROVEN": "proven",
    "STANDARD": "standard"
}

type FAQ = Array<{ question: string; answer: string }>
type Skills = Array<{ name: string; description: string }>

export const favouritesRouter = createRouter({
    getSavedSolutionsFull: commonProcedure.query(async ({ ctx }) => {
        const { userId } = ctx

        const saved = await prisma.savedSolution.findMany({
            where: {
                userId,
                solution: {
                    status: "published",
                    moderationStatus: { in: ["auto_approved", "approved"] },
                },
            },
            include: {
                solution: {
                    include: {
                        expert: { include: { user: { select: { profileImageUrl: true } } } },
                        ecosystemItems: { select: { ecosystemId: true } },
                    },
                },
            },
        });

        return saved.map(({ solution: sol }) => {
            const { expert } = sol;
            return {
                ...sol,
                implementation_price: sol.implementationPriceCents / 100,
                implementation_price_cents: sol.implementationPriceCents,
                monthly_cost_min: (sol.monthlyCostMinCents ?? 0) / 100,
                monthly_cost_max: (sol.monthlyCostMaxCents ?? 0) / 100,
                delivery_days: sol.deliveryDays,
                support_days: sol.supportDays,
                outcome: sol.outcome ?? "",
                longDescription: sol.longDescription ?? "",
                status: sol.status as SolutionStatus,
                short_summary: sol.shortSummary ?? "",
                moderationStatus: sol.moderationStatus as ModerationStatus,
                faq: sol.faq as FAQ,
                proofType: sol.proofType ?? "",
                proofContent: sol.proofContent ?? "",
                paybackPeriod: sol.paybackPeriod ?? "",
                complexity: sol.complexity ?? "",
                measurableOutcome: sol.measurableOutcome ?? "",
                skills: sol.skills as Skills,
                changelog: sol.changelog ?? "",
                upgradePriceCents: sol.upgradePriceCents ?? 0,
                demoVideoUrl: sol.demoVideoUrl ?? "",
                demoVideoReviewedAt: sol.demoVideoReviewedAt?.toDateString() ?? undefined,
                expert: {
                    id: expert.id,
                    user_id: expert.userId,
                    slug: expert.slug ?? undefined,
                    name: expert.displayName || expert.legalFullName,
                    profile_image_url: expert.user?.profileImageUrl ?? undefined,
                    bio: expert.bio ?? undefined,
                    response_time: expert.responseTime ?? undefined,
                    verified: expert.verified,
                    business_verified: expert.businessVerified,
                    founding: expert.tier === "FOUNDING",
                    founding_rank: expert.foundingRank ?? null,
                    completed_sales_count: expert.completedSalesCount,
                    tools: expert.tools ?? [],
                    calendarUrl: expert.calendarUrl ?? undefined,
                    tier: expert.tier ?? "STANDARD",
                },
                ecosystemIds: sol.ecosystemItems.map((i) => i.ecosystemId),
                expertTier: tierToLabel[expert.tier],
            };
        });
    }),
    getPublishedSuites: commonProcedure.query(async ({ ctx }) => {
        return await prisma.ecosystem.findMany({
            where: { isPublished: true },
            include: {
                items: {
                    include: {
                        solution: {
                            select: {
                                id: true,
                                slug: true,
                                title: true,
                                shortSummary: true,
                                outcome: true,
                                category: true,
                                implementationPriceCents: true,
                                monthlyCostMinCents: true,
                                monthlyCostMaxCents: true,
                                deliveryDays: true,
                                supportDays: true,
                                integrations: true,
                                businessGoals: true,
                                expertId: true,
                                expert: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                        slug: true,
                                        isFoundingExpert: true,
                                        tier: true,
                                        user: { select: { profileImageUrl: true } },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { position: "asc" },
                },
                expert: {
                    select: {
                        id: true,
                        displayName: true,
                        slug: true,
                        isFoundingExpert: true,
                        tier: true,
                        user: { select: { profileImageUrl: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    })
})