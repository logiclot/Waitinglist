import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server"
import { createRouter } from "../../init";
import { expertProcedure } from "../../procedures";

export const expertProfileRouter = createRouter({
    getExpert: expertProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        const profile = await prisma.specialistProfile.findUnique({
            where: { userId },
            select: {
                id: true,
                slug: true,
                calendarUrl: true,
                completedSalesCount: true,
                tier: true,
                stripeAccountId: true,
                stripeDetailsSubmitted: true,
                eliteApplicationStatus: true,
                eliteAppliedAt: true,
                eliteDeniedAt: true,
                eliteDeniedReason: true,
                eliteDemotedAt: true,
                eliteDemotedReason: true,
                newExpertBoostUntil: true,
                _count: { select: { solutions: { where: { status: "published" } } } },
            },
        })

        return profile
    }),
    getStats: expertProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const expert = await prisma.specialistProfile.findFirst({
            where: {
                userId
            },
            select: {
                id: true
            }
        })

        if (!expert) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Expert not found"
            })
        }

        const [
            earningsOrders,
            activeOrdersRaw,
            topSolution,
            recentJobs,
        ] = await Promise.all([
            prisma.order.findMany({
                where: {
                    sellerId: expert.id,
                    status: { in: ["delivered", "approved"] },
                    updatedAt: { gte: startOfMonth },
                },
                select: { priceCents: true },
            }),
            prisma.order.findMany({
                where: {
                    sellerId: expert.id,
                    status: {
                        in: [
                            "paid_pending_implementation",
                            "in_progress",
                            "delivered",
                            "revision_requested",
                        ],
                    },
                },
                select: {
                    id: true,
                    status: true,
                    priceCents: true,
                    milestones: true,
                    solution: { select: { title: true } },
                    buyer: {
                        select: {
                            businessProfile: { select: { firstName: true, companyName: true } },
                        },
                    },
                },
                orderBy: { updatedAt: "desc" },
                take: 5,
            }),
            prisma.solution
                .findMany({
                    where: { expertId: expert.id, status: "published" },
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        _count: {
                            select: {
                                orders: { where: { status: { in: ["delivered", "approved"] } } },
                            },
                        },
                    },
                    take: 20,
                })
                .then((solutions) => {
                    if (!solutions.length) return null;
                    const best = solutions.sort(
                        (a, b) => b._count.orders - a._count.orders,
                    )[0];
                    return {
                        id: best.id,
                        title: best.title,
                        category: best.category,
                        completedSalesCount: best._count.orders,
                    };
                }),
            prisma.jobPost.findMany({
                where: { status: "open" },
                orderBy: { createdAt: "desc" },
                take: 3,
                select: { id: true, title: true, category: true, budgetRange: true },
            }),
        ]);

        const earningsThisMonthCents = earningsOrders.reduce(
            (sum, o) => sum + o.priceCents,
            0,
        );

        const inEscrowCents = activeOrdersRaw.reduce((sum, o) => {
            const milestones = (o.milestones as Record<string, unknown>[] | null) || [];
            return (
                sum +
                milestones.reduce((mSum, m) => {
                    if ((m as { status?: string }).status === "in_escrow") {
                        const rawCents = (m as { priceCents?: number }).priceCents;
                        const rawPrice = (m as { price?: number }).price;
                        const cents =
                            typeof rawCents === "number"
                                ? rawCents
                                : Math.round((typeof rawPrice === "number" ? rawPrice : 0) * 100);
                        return mSum + cents;
                    }
                    return mSum;
                }, 0)
            );
        }, 0);

        const activeOrders = activeOrdersRaw.map((o) => ({
            id: o.id,
            status: o.status,
            solutionTitle: o.solution?.title ?? "Unknown",
            buyerName:
                o.buyer?.businessProfile?.companyName ||
                o.buyer?.businessProfile?.firstName ||
                "Client",
        }));

        return {
            earningsThisMonthCents,
            activeOrders,
            inEscrowCents,
            topSolution,
            recentJobs
        }
    })
})