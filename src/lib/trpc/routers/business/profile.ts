import { prisma } from "@/lib/prisma";
import { createRouter } from "../../init";
import { businessProcedure } from "../../procedures";

export const businessProfileRouter = createRouter({
    getFreeScans: businessProcedure.query(async ({ ctx }) => {
        const { userId } = ctx

        const count = await prisma.businessProfile.findUnique({
            where: { userId },
            select: { freeDiscoveryScansRemaining: true },
        })

        return count?.freeDiscoveryScansRemaining ?? 0
    }),
    getFreeCustomProjects: businessProcedure.query(async ({ ctx }) => {
        const { userId } = ctx

        const count = await prisma.businessProfile.findUnique({
            where: { userId },
            select: { freeCustomProjects: true },
        })

        return count?.freeCustomProjects ?? 0
    })
})