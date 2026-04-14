import { prisma } from "@/lib/prisma";
import { createRouter } from "../../init";
import { commonProcedure } from "../../procedures";
import { SuiteCardData } from "@/types";

export const suitesRouter = createRouter({
    getPublishedSuites: commonProcedure.query(async () => {
        return await prisma.ecosystem.findMany({
            where: { isPublished: true },
            include: {
                items: {
                    include: { solution: true },
                    take: 4 // Preview items
                },
                expert: true
            },
            orderBy: { createdAt: 'desc' }
        }) as unknown as SuiteCardData[];
    })
})