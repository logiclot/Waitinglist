import { prisma } from "@/lib/prisma";
import { TIER_THRESHOLDS } from "@/lib/commission";
import { createNotification } from "@/lib/notifications";
import { BidStatus, SpecialistTier } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "../../init";
import { adminProcedure } from "../../procedures";

export const adminExpertRouter = createRouter({
    getExperts: adminProcedure.query(async () => {
        const profiles = await prisma.specialistProfile.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, email: true } },
                _count: {
                    select: {
                        bids: true,
                    },
                },
            },
        })

        return profiles
    }),

    getBids: adminProcedure.query(async () => {
        const bids = await prisma.bid.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                specialist: {
                    select: {
                        id: true,
                        displayName: true,
                        user: { select: { email: true } },
                    },
                },
                jobPost: { select: { id: true, title: true } },
                solution: { select: { id: true, title: true } },
            },
        });
        return bids;
    }),

    updateBidStatus: adminProcedure
        .input(z.object({ id: z.string(), status: z.enum(BidStatus) }))
        .mutation(async ({ input }) => {
            await prisma.bid.update({
                where: { id: input.id },
                data: { status: input.status },
            });
            return { success: true };
        }),

    getSolutions: adminProcedure.query(async () => {
        const solutions = await prisma.solution.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                expert: {
                    include: {
                        user: { select: { email: true } },
                    },
                },
            },
        })

        return solutions
    }),

    suspendExpert: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await prisma.specialistProfile.update({
                where: { id: input.id },
                data: { status: "SUSPENDED" },
            });
            return { success: true };
        }),

    deleteExpert: adminProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ input }) => {
            await prisma.user.delete({ where: { id: input.userId } });
            return { success: true };
        }),

    deleteSolution: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            const solution = await prisma.solution.findUnique({
                where: { id: input.id },
                select: { title: true, expert: { select: { userId: true } } },
            });

            await prisma.solution.delete({ where: { id: input.id } });

            if (solution) {
                await createNotification(
                    solution.expert.userId,
                    "🗑️ Solution removed",
                    `Your solution "${solution.title}" has been removed by an administrator. Contact support if you have questions.`,
                    "alert",
                    "/expert/my-solutions",
                );
            }

            return { success: true };
        }),

    updateSolution: adminProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                title: z.string().min(1).optional(),
                shortSummary: z.string().optional(),
                outcome: z.string().optional(),
                category: z.string().optional(),
                integrations: z.array(z.string()).optional(),
                included: z.array(z.string()).optional(),
                excluded: z.array(z.string()).optional(),
                requiredInputs: z.array(z.string()).optional(),
                supportDays: z.number().int().optional(),
                implementationPriceCents: z.number().int().min(0).optional(),
                monthlyCostMinCents: z.number().int().min(0).optional(),
                monthlyCostMaxCents: z.number().int().min(0).optional(),
                demoVideoUrl: z.string().nullable().optional(),
            }),
        }))
        .mutation(async ({ input }) => {
            const existing = await prisma.solution.findUnique({
                where: { id: input.id },
                select: { demoVideoUrl: true, status: true },
            });
            if (!existing) throw new Error("Solution not found");

            const updateData: Record<string, unknown> = { ...input.data };

            if (
                input.data.demoVideoUrl !== undefined &&
                input.data.demoVideoUrl !== existing.demoVideoUrl &&
                existing.status === "published"
            ) {
                updateData.demoVideoStatus = "pending";
                updateData.demoVideoReviewedAt = null;
            }

            await prisma.solution.update({
                where: { id: input.id },
                data: updateData,
            });

            return { success: true };
        }),

    updateVideoStatus: adminProcedure
        .input(z.object({
            id: z.string(),
            status: z.enum(["approved", "rejected"]),
            rejectionReason: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            const solution = await prisma.solution.findUnique({
                where: { id: input.id },
                select: { title: true, expert: { select: { userId: true } } },
            });
            if (!solution) throw new Error("Solution not found");

            await prisma.solution.update({
                where: { id: input.id },
                data: {
                    demoVideoStatus: input.status,
                    demoVideoReviewedAt: input.status === "approved" ? new Date() : null,
                },
            });

            const approved = input.status === "approved";
            const message = approved
                ? `Your demo video for "${solution.title}" has been approved and is now live on your listing.`
                : `Your demo video for "${solution.title}" was not approved.${input.rejectionReason ? ` Reason: ${input.rejectionReason}` : " Please review our guidelines and resubmit via the solution editor."}`;

            await createNotification(
                solution.expert.userId,
                approved ? "🎬 Demo video approved!" : "🎬 Demo video needs revision",
                message,
                approved ? "success" : "alert",
                `/expert/solutions/${input.id}/edit`,
            );

            return { success: true };
        }),

    setTier: adminProcedure
        .input(z.object({ id: z.string(), tier: z.enum(SpecialistTier) }))
        .mutation(async ({ input }) => {
            const feeForTier = TIER_THRESHOLDS[input.tier];

            let count: number | null = null;

            if (input.tier === "FOUNDING") {
                count = await prisma.specialistProfile.count({
                    where: { tier: "FOUNDING" }
                })

                count = count + 1
            }

            const specialist = await prisma.specialistProfile.update({
                where: { id: input.id },
                data: {
                    tier: input.tier,
                    platformFeePercentage: feeForTier,
                    isFoundingExpert: input.tier === "FOUNDING",
                    foundingRank: count,
                },
                select: { userId: true },
            });

            const tierLabels: Record<string, string> = {
                STANDARD: `Standard (${TIER_THRESHOLDS.STANDARD}% fee)`,
                PROVEN: `Proven (${TIER_THRESHOLDS.PROVEN}% fee)`,
                ELITE: `Elite (${TIER_THRESHOLDS.ELITE}% fee)`,
                FOUNDING: `Founding (${TIER_THRESHOLDS.FOUNDING}% fee)`,
            };

            if (input.tier === "FOUNDING") {
                await createNotification(
                    specialist.userId,
                    "🏅 Founding Expert status granted!",
                    `You are now Founding Expert. You'll enjoy an 11% platform fee for life and a permanent Founding Expert badge on your profile.`,
                    "success",
                    "/dashboard",
                );
            } else {
                await createNotification(
                    specialist.userId,
                    "📊 Expert tier updated",
                    `Your tier has been changed to ${tierLabels[input.tier] ?? input.tier}.`,
                    "info",
                    "/dashboard",
                );
            }

            return { success: true };
        }),
})