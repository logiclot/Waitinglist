import { prisma } from "@/lib/prisma";
import { createRouter } from "../../init";
import { commonProcedure } from "../../procedures";
import { mapPrismaExpert } from "@/lib/solutions/data";
import { Solution } from "@/types";

const tierToLabel = {
    "FOUNDING": "founding",
    "ELITE": "elite",
    "PROVEN": "proven",
    "STANDARD": "standard"
}

export const solutionsRouter = createRouter({
    getPublishedSolutions: commonProcedure.query(async () => {
        const solutions = await prisma.solution.findMany({
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

        return solutions.map((solution) => ({
            ...solution,
            // Map fields that might differ
            implementation_price: solution.implementationPriceCents / 100,
            monthly_cost_min: solution.monthlyCostMinCents ? solution.monthlyCostMinCents / 100 : 0,
            monthly_cost_max: solution.monthlyCostMaxCents ? solution.monthlyCostMaxCents / 100 : 0,
            delivery_days: solution.deliveryDays,
            support_days: solution.supportDays,
            short_summary: solution.shortSummary,
            expert: mapPrismaExpert(solution.expert),
            ecosystemIds: solution.ecosystemItems.map((i: { ecosystemId: string }) => i.ecosystemId),
            expertTier: tierToLabel[solution.expert.tier]
        })) as unknown as Solution[]
    }),
})