import { prisma } from "@/lib/prisma";
import { createRouter } from "../../init";
import { adminProcedure } from "../../procedures";
import z from "zod";



export const adminBusinessRouter = createRouter({
    getBusinesses: adminProcedure.query(async () => {
        return prisma.businessProfile.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: { select: { id: true, email: true, createdAt: true } } },
        })
    }),
    deleteBusinessById: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
        await prisma.businessProfile.delete({
            where: {
                id: input.id
            }
        })

        return {
            success: true
        }
    })
})