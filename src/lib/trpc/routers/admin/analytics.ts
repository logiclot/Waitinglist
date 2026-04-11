import { prisma } from "@/lib/prisma";
import { createRouter } from "../../init";
import { adminProcedure } from "../../procedures";
import { SpecialistTier } from "@prisma/client";

export const adminAnalyticsRouter = createRouter({
    getStats: adminProcedure.query(async ({ ctx }) => {
        const [users, experts, businesses, solutions] = await Promise.all([
            prisma.user.count(),
            prisma.specialistProfile.findMany({ select: { tier: true } }),
            prisma.businessProfile.count(),
            prisma.solution.count()
        ])

        return {
            users,
            experts: experts.length,
            expertsByTier: experts.reduce((acc, item) => {
                acc[item.tier] = (acc[item.tier] || 0) + 1;
                return acc
            }, {} as Record<SpecialistTier, number>),
            businesses,
            solutions
        }
    })
})