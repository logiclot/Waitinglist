import { prisma } from "@/lib/prisma";
import { createRouter } from "../../init";
import { businessProcedure } from "../../procedures";

export const businessOrdersRouter = createRouter({
    activeOrders: businessProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        const orders = await prisma.order.findMany({
            where: {
                buyerId: userId,
                status: { in: ["in_progress", "delivered"] },
            },
            select: {
                id: true,
                status: true,
                solution: { select: { title: true } },
            },
            orderBy: { updatedAt: "desc" },
            take: 5,
        })

        return orders.map((order) => ({
            id: order.id,
            solutionTitle: order.solution?.title ?? "Unknown",
            status: order.status,
        }))
    }),
    completedProjectCount: businessProcedure.query(async ({ ctx }) => {
        const { userId } = ctx

        const projects = await prisma.order.count({
            where: { buyerId: userId, status: "approved" },
        })

        return projects
    })
})